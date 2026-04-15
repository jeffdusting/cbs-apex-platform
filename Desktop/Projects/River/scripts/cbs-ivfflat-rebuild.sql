-- Project River — S4-P4 TASK 4.4
-- Rebuild IVFFlat index for CBS Supabase (eptugqwlgsmwhnubbqsk) after dedup.
--
-- Reasoning (CBS-DISCOVERY-SUMMARY §8.3):
--   After P4 dedup, row_count dropped from 15,655 → 1,273.
--   Optimal IVFFlat lists ≈ sqrt(1,273) ≈ 36.
--   Previous lists = 100 (sized for the inflated row count).
--   Delta (64) exceeds the 20-list rebuild threshold defined in PLAN.md, so
--   rebuild now.
--
-- Run via Supabase SQL Editor OR:
--   psql "$SUPABASE_DB_URL" -f scripts/cbs-ivfflat-rebuild.sql

BEGIN;

-- Drop the old vector index so we can rebuild it with a new `lists` parameter.
DROP INDEX IF EXISTS public.idx_documents_embedding;

-- Recreate with lists=36 (matches post-dedup row count of ~1,273).
CREATE INDEX idx_documents_embedding
    ON public.documents
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 36);

-- Refresh statistics so the planner picks the rebuilt index.
ANALYZE public.documents;

COMMIT;

-- Verify index metadata (expect lists=36).
SELECT i.indexname,
       i.indexdef
FROM pg_indexes i
WHERE i.schemaname = 'public'
  AND i.tablename  = 'documents'
  AND i.indexname  = 'idx_documents_embedding';
