-- Project River — Supabase Schema
-- pgvector extension with VECTOR(1024) for Voyage AI voyage-3.5 embeddings
-- Run this in the Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- Documents table — knowledge base with vector embeddings
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id              BIGSERIAL PRIMARY KEY,
    entity          TEXT NOT NULL,           -- e.g. 'cbs-group', 'waterroads'
    source_file     TEXT NOT NULL,           -- original filename
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    embedding       VECTOR(1024),            -- Voyage AI voyage-3.5 dimension
    category        TEXT DEFAULT 'knowledge',-- 'knowledge', 'correction', etc.
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_documents_embedding
    ON documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Index for entity filtering
CREATE INDEX IF NOT EXISTS idx_documents_entity
    ON documents (entity);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_documents_category
    ON documents (category);

-- Composite index for entity + category queries
CREATE INDEX IF NOT EXISTS idx_documents_entity_category
    ON documents (entity, category);

-- ============================================================================
-- Prompt templates table
-- ============================================================================
CREATE TABLE IF NOT EXISTS prompt_templates (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    template        TEXT NOT NULL,
    variables       JSONB DEFAULT '[]',
    entity          TEXT,
    category        TEXT,
    version         INTEGER DEFAULT 1,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Governance register table
-- ============================================================================
CREATE TABLE IF NOT EXISTS governance_register (
    id              BIGSERIAL PRIMARY KEY,
    entity          TEXT NOT NULL,
    document_type   TEXT NOT NULL,           -- 'board-paper', 'resolution', 'minutes'
    title           TEXT NOT NULL,
    status          TEXT DEFAULT 'draft',    -- 'draft', 'review', 'approved', 'archived'
    author_agent_id TEXT,
    approver        TEXT,
    content         TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for governance queries
CREATE INDEX IF NOT EXISTS idx_governance_entity_type
    ON governance_register (entity, document_type);

CREATE INDEX IF NOT EXISTS idx_governance_status
    ON governance_register (status);

-- ============================================================================
-- match_documents function — vector similarity search
-- ============================================================================
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1024),
    match_count     INT DEFAULT 5,
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
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
