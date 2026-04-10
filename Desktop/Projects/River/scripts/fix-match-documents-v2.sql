-- Project River — Fix match_documents v2
-- The previous fix may not have dropped the old overloaded signature.
-- This version drops by exact parameter types and recreates.
-- Run in Supabase SQL Editor.

-- Check what exists first (for diagnostics)
SELECT p.proname, pg_get_function_arguments(p.oid) as args
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_documents' AND n.nspname = 'public';

-- Drop ALL versions by casting to exact types
DROP FUNCTION IF EXISTS public.match_documents(vector(1024), int, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector(1024), int, float, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, int, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, int, float, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, integer, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, integer, double precision, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, integer, real, text, text);

-- Verify all dropped
SELECT p.proname, pg_get_function_arguments(p.oid) as args
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_documents' AND n.nspname = 'public';

-- Recreate single clean version with shared entity support
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

-- Verify only one version exists
SELECT p.proname, pg_get_function_arguments(p.oid) as args
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_documents' AND n.nspname = 'public';
