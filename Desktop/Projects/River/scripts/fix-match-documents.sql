-- Project River — Fix: match_documents function
-- Drops ALL existing versions and creates the correct single version
-- that includes shared entity documents alongside entity-filtered queries.
--
-- Run this in the Supabase SQL Editor.

-- Drop ALL overloaded versions
DROP FUNCTION IF EXISTS match_documents(vector, int, text, text);
DROP FUNCTION IF EXISTS match_documents(vector, int, float, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, int, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, int, float, text, text);

-- Create the single correct version
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
