-- Project River — S4-P5 TASK 5.1
-- Rebuild IVFFlat index for WR Supabase (imbskgjkqvadnazzhbiw) after dedup+reorg.
--
-- Reasoning (WR-DISCOVERY-SUMMARY §7 and S4-P3 results):
--   Pre-P3 row_count:  19,301  → index built with lists=40.
--   Post-P3 row_count: 16,786  → optimal lists ≈ sqrt(16,786) ≈ 130.
--   Delta (90) far exceeds the 10-list rebuild threshold in the P5 spec.
--
-- Run via Supabase SQL Editor (WR project: imbskgjkqvadnazzhbiw) OR:
--   psql "$WR_SUPABASE_DB_URL" -f scripts/wr-ivfflat-rebuild.sql
--
-- Manual apply is required because WR_SUPABASE_DB_URL / direct psql access
-- is not available from the local env (same constraint observed in P4).

BEGIN;

-- Drop the old vector index so we can rebuild it with a new `lists` parameter.
DROP INDEX IF EXISTS public.idx_documents_embedding;

-- Recreate with lists=130 (matches post-P3 row count of 16,786).
CREATE INDEX idx_documents_embedding
    ON public.documents
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 130);

-- Refresh statistics so the planner picks the rebuilt index.
ANALYZE public.documents;

COMMIT;

-- Verify index metadata (expect lists=130).
SELECT i.indexname,
       i.indexdef
FROM pg_indexes i
WHERE i.schemaname = 'public'
  AND i.tablename  = 'documents'
  AND i.indexname  = 'idx_documents_embedding';
