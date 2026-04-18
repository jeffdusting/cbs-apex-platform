-- Project River — Stage 5 P3 — pgcrypto field-level encryption for
-- sensitive document categories (IB.6)
--
-- STATUS: DESIGN ONLY. This SQL is NOT yet safe to apply against production
-- because the write and read paths across ~15 Python scripts must be
-- updated in the same change window. Execution is scoped as a follow-up
-- item in the Stage 5 P8 deferred-designs phase.
--
-- Sensitive categories (per IB.6 scope):
--   - correction
--   - competitor_profile
--   - board_paper
--
-- All other document types remain in plaintext — embedding and retrieval
-- performance matter more than encryption for public/industry content.

-- ---------- 0. Extensions ----------

-- pgcrypto is enabled by default on Supabase. Confirm before running.
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- 1. Key delivery ----------
--
-- Key is stored in 1Password at op://River/River Pgcrypto/key. Injected
-- into each DB session by the application layer as a GUC:
--
--   SET app.pgcrypto_key = '<operator-provided>';  -- per-connection
--
-- Never store the key in a table or function definition. Never log it.
-- Key rotation strategy: dual-key window (see §5 below).

-- ---------- 2. Ciphertext columns ----------

-- The `documents` table currently stores plaintext in `content` and
-- `summary`. The design is to ADD new columns for ciphertext versions,
-- migrate category-by-category, then drop the plaintext for those
-- categories only.

ALTER TABLE public.documents
    ADD COLUMN IF NOT EXISTS content_ciphertext bytea,
    ADD COLUMN IF NOT EXISTS summary_ciphertext bytea,
    ADD COLUMN IF NOT EXISTS encrypted_category text,       -- 'correction', 'competitor_profile', 'board_paper'
    ADD COLUMN IF NOT EXISTS encryption_key_id text;         -- 'v1', 'v2' (for rotation)

-- ---------- 3. Insert / update helper ----------
--
-- Application code should call this function rather than writing to
-- `content` / `content_ciphertext` directly. The function enforces the
-- invariant: encrypted rows have NULL `content` + populated `content_ciphertext`.

CREATE OR REPLACE FUNCTION public.insert_sensitive_document(
    p_document_type text,
    p_title text,
    p_content text,
    p_summary text,
    p_embedding vector,
    p_metadata jsonb DEFAULT '{}'::jsonb,
    p_key_id text DEFAULT 'v1'
) RETURNS bigint
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_id bigint;
    v_key text;
    v_sensitive_categories text[] := ARRAY['correction', 'competitor_profile', 'board_paper'];
BEGIN
    v_key := current_setting('app.pgcrypto_key', true);
    IF v_key IS NULL OR v_key = '' THEN
        RAISE EXCEPTION 'app.pgcrypto_key is not set on this session';
    END IF;

    IF p_document_type = ANY(v_sensitive_categories) THEN
        INSERT INTO public.documents (
            document_type, title, content, summary,
            content_ciphertext, summary_ciphertext,
            encrypted_category, encryption_key_id,
            embedding, metadata
        ) VALUES (
            p_document_type, p_title, NULL, NULL,
            pgp_sym_encrypt(p_content, v_key),
            CASE WHEN p_summary IS NULL THEN NULL
                 ELSE pgp_sym_encrypt(p_summary, v_key) END,
            p_document_type, p_key_id,
            p_embedding, p_metadata
        )
        RETURNING id INTO v_id;
    ELSE
        INSERT INTO public.documents (
            document_type, title, content, summary, embedding, metadata
        ) VALUES (
            p_document_type, p_title, p_content, p_summary, p_embedding, p_metadata
        )
        RETURNING id INTO v_id;
    END IF;

    RETURN v_id;
END
$$;

-- ---------- 4. Read helper ----------
--
-- Returns the plaintext content regardless of whether the row is encrypted.
-- Any read path that currently does `SELECT content FROM documents WHERE ...`
-- switches to `SELECT document_plaintext(id) FROM documents WHERE ...`.

CREATE OR REPLACE FUNCTION public.document_plaintext(p_id bigint)
RETURNS TABLE(content text, summary text)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_key text;
    v_row public.documents%ROWTYPE;
BEGIN
    SELECT * INTO v_row FROM public.documents WHERE id = p_id;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    IF v_row.encrypted_category IS NULL THEN
        content := v_row.content;
        summary := v_row.summary;
        RETURN NEXT;
        RETURN;
    END IF;

    v_key := current_setting('app.pgcrypto_key', true);
    IF v_key IS NULL OR v_key = '' THEN
        RAISE EXCEPTION 'app.pgcrypto_key is not set on this session';
    END IF;

    content := pgp_sym_decrypt(v_row.content_ciphertext, v_key);
    summary := CASE WHEN v_row.summary_ciphertext IS NULL THEN NULL
                    ELSE pgp_sym_decrypt(v_row.summary_ciphertext, v_key) END;
    RETURN NEXT;
END
$$;

-- ---------- 5. Key rotation strategy ----------
--
-- To rotate from key v1 → v2:
--   1. Add new key v2 to 1Password ('op://River/River Pgcrypto/key_v2').
--   2. Deploy a dual-key read helper that tries v2 then v1 on decrypt.
--   3. Run a background job that re-encrypts all rows with
--      encryption_key_id = 'v1' using v2, and updates encryption_key_id.
--   4. Once no row has key_id = 'v1', retire v1 from 1Password.
--
-- This is not implemented in this file — it is a runbook step tied to
-- key-rotation cadence (annual, or on suspected compromise).

-- ---------- 6. Migration sketch (NOT RUN HERE) ----------
--
-- Per-category migration (run ONE category at a time, during a
-- low-activity window):
--
-- BEGIN;
--   UPDATE public.documents
--   SET content_ciphertext = pgp_sym_encrypt(content, current_setting('app.pgcrypto_key')),
--       summary_ciphertext = CASE WHEN summary IS NULL THEN NULL
--                                 ELSE pgp_sym_encrypt(summary, current_setting('app.pgcrypto_key')) END,
--       encrypted_category = document_type,
--       encryption_key_id = 'v1',
--       content = NULL,
--       summary = NULL
--   WHERE document_type = 'correction'
--     AND encrypted_category IS NULL;
-- COMMIT;
--
-- Embedding generation is NOT affected: embeddings remain on plaintext
-- computed at write time. A later re-embedding after key rotation is not
-- required unless the embedding model itself changes.

-- ---------- 7. Gate notes ----------
--
-- Before this file is applied to prod:
--   - Every caller of INSERT INTO documents for the three sensitive
--     categories has been rewritten to call insert_sensitive_document(...).
--   - Every SELECT content FROM documents that may hit a sensitive
--     category has been rewritten to call document_plaintext(id).
--   - Supabase session-init hook injects app.pgcrypto_key from the
--     application's secret store.
--   - A dry-run migration has been exercised on a snapshot.
