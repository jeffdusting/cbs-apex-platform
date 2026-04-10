-- Project River — Sprint 2: Shared Knowledge Category Migration
-- Adds support for 'shared' entity documents accessible to all agents.
--
-- Run this in the Supabase SQL Editor.

-- ============================================================================
-- Update match_documents to support shared entity retrieval
-- When filter_entity is provided, also return 'shared' entity documents.
-- ============================================================================
CREATE OR REPLACE FUNCTION match_documents(
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

-- ============================================================================
-- Add index for shared entity queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_entity_shared
    ON documents (entity) WHERE entity = 'shared';
