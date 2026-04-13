-- Project River — WaterRoads Supabase Schema
-- Run this in the WR Supabase SQL Editor (https://supabase.com/dashboard/project/imbskgjkqvadnazzhbiw/sql/new)

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- documents — knowledge base with vector embeddings
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id              BIGSERIAL PRIMARY KEY,
    entity          TEXT NOT NULL DEFAULT 'waterroads',
    source_file     TEXT NOT NULL,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    embedding       VECTOR(1024),
    category        TEXT DEFAULT 'knowledge',
    drive_file_id   TEXT,                       -- Google Drive file ID for sync
    drive_modified  TIMESTAMPTZ,                -- Drive modifiedTime tracking
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_embedding
    ON documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 40);

CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents (entity);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_entity_category ON documents (entity, category);
CREATE INDEX IF NOT EXISTS idx_documents_drive_file_id ON documents (drive_file_id);

-- ============================================================================
-- prompt_templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS prompt_templates (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    template        TEXT NOT NULL,
    variables       JSONB DEFAULT '[]',
    entity          TEXT DEFAULT 'waterroads',
    category        TEXT,
    version         INTEGER DEFAULT 1,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- governance_register
-- ============================================================================
CREATE TABLE IF NOT EXISTS governance_register (
    id              BIGSERIAL PRIMARY KEY,
    entity          TEXT NOT NULL DEFAULT 'waterroads',
    document_type   TEXT NOT NULL,
    title           TEXT NOT NULL,
    status          TEXT DEFAULT 'draft',
    author_agent_id TEXT,
    approver        TEXT,
    drive_file_id   TEXT,
    sharepoint_url  TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gov_entity_type ON governance_register (entity, document_type);
CREATE INDEX IF NOT EXISTS idx_gov_status ON governance_register (status);

-- ============================================================================
-- tender_register (for any WR-specific tender tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tender_register (
    id              BIGSERIAL PRIMARY KEY,
    reference       TEXT NOT NULL,
    source          TEXT NOT NULL,
    title           TEXT NOT NULL,
    agency          TEXT,
    estimated_value TEXT,
    close_date      TEXT,
    url             TEXT,
    email_subject   TEXT,
    email_date      TIMESTAMPTZ,
    assessed_date   TIMESTAMPTZ,
    assessed_by     TEXT,
    scorecard       JSONB,
    weighted_score  FLOAT,
    decision        TEXT DEFAULT 'pending',
    decision_date   TIMESTAMPTZ,
    decision_by     TEXT,
    decision_notes  TEXT,
    issue_id        TEXT,
    issue_identifier TEXT,
    response_issue_id TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tender_register_ref_source
    ON tender_register (reference, source);
CREATE INDEX IF NOT EXISTS idx_tender_register_decision
    ON tender_register (decision);

-- ============================================================================
-- match_documents function — vector similarity search with entity scoping
-- WR is self-contained; no shared entity (CAPITAL stays CBS only)
-- ============================================================================
DROP FUNCTION IF EXISTS public.match_documents(vector, int, text, text);
DROP FUNCTION IF EXISTS public.match_documents(vector, int, float, text, text);

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
        (filter_entity IS NULL OR d.entity = filter_entity)
        AND (filter_category IS NULL OR d.category = filter_category)
        AND (1 - (d.embedding <=> query_embedding)) >= match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

NOTIFY pgrst, 'reload schema';
