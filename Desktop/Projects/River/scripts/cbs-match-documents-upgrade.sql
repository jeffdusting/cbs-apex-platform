-- Project River — S4-P4 TASK 4.3
-- match_documents upgrade for CBS Supabase (eptugqwlgsmwhnubbqsk)
--
-- Status: ALREADY APPLIED.
--
-- Discovery (stage4/CBS-DISCOVERY-SUMMARY.md §5) confirmed that the
-- match_threshold parameter is live on CBS Supabase and behaves correctly
-- under live tests:
--
--   POST /rest/v1/rpc/match_documents { match_threshold: 0.99 }
--     → 200 OK, filters at >= 0.99.
--   POST /rest/v1/rpc/match_documents { match_threshold: 0.3 }
--     → 200 OK, default-style result set (all rows already > 0.3).
--   POST /rest/v1/rpc/match_documents { } (no threshold)
--     → 200 OK, uses default 0.0.
--
-- Source of truth that already produced the live state:
--   scripts/fix-match-documents.sql
--   scripts/fix-match-documents-v2.sql
--
-- This file captures the canonical signature for S4-P4 traceability and
-- is re-runnable (idempotent) against CBS Supabase should the function
-- ever be dropped or overloaded again.
--
-- Run via Supabase SQL Editor OR:
--   psql "$SUPABASE_DB_URL" -f scripts/cbs-match-documents-upgrade.sql

-- Drop every known overload signature (types are explicit so the
-- DROP ... IF EXISTS does not error if none of them are present).
DROP FUNCTION IF EXISTS public.match_documents(vector(1024), int, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector(1024), int, float, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, int, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, int, float, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, integer, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, integer, double precision, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, integer, real, text, text);

-- Canonical match_documents with match_threshold support.
CREATE FUNCTION public.match_documents(
    query_embedding VECTOR(1024),
    match_count     INT DEFAULT 5,
    match_threshold FLOAT DEFAULT 0.0,
    filter_entity   TEXT DEFAULT NULL,
    filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
    id          BIGINT,
    entity      TEXT,
    title       TEXT,
    content     TEXT,
    source_file TEXT,
    similarity  FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.entity,
        d.title,
        d.content,
        d.source_file,
        1 - (d.embedding <=> query_embedding) AS similarity
    FROM documents d
    WHERE
        (filter_entity IS NULL OR d.entity = filter_entity OR d.entity = 'shared')
        AND (filter_category IS NULL OR d.category = filter_category)
        AND (1 - (d.embedding <=> query_embedding)) >= match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Verify exactly one signature remains.
SELECT p.proname, pg_get_function_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_documents' AND n.nspname = 'public';
