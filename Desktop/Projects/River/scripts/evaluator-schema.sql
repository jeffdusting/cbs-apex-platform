-- ============================================================================
-- Evaluator Schema Migration — hyper-agent-v1 P1
-- ============================================================================
--
-- TARGET DATABASE: CBS Group Supabase project
--   Project ref:  eptugqwlgsmwhnubbqsk
--   URL:          https://eptugqwlgsmwhnubbqsk.supabase.co
--   SQL editor:   https://supabase.com/dashboard/project/eptugqwlgsmwhnubbqsk/sql/new
--
-- Creates 4 tables: agent_traces, evaluation_scores, rubric_versions,
-- correction_proposals. Safe to re-run (IF NOT EXISTS on all objects).
-- ============================================================================

-- ============================================================================
-- 1. agent_traces — one row per substantive agent output
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_traces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL,
    agent_role TEXT NOT NULL,
    company_id UUID NOT NULL,
    issue_id TEXT,
    task_type TEXT NOT NULL,
    prompt_version TEXT,                    -- git commit hash of AGENTS.md
    kb_queries JSONB DEFAULT '[]'::jsonb,   -- array of query strings
    kb_results_count INTEGER DEFAULT 0,
    kb_top_similarity REAL,
    corrections_applied JSONB DEFAULT '[]'::jsonb,
    self_check_score REAL,
    self_check_flags JSONB DEFAULT '[]'::jsonb,
    decision TEXT,
    confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
    tokens_input INTEGER,
    tokens_output INTEGER,
    duration_seconds REAL,
    error TEXT,
    raw_output_hash TEXT,                   -- SHA-256 of the full output for dedup
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_traces_agent_role ON agent_traces(agent_role);
CREATE INDEX IF NOT EXISTS idx_agent_traces_task_type ON agent_traces(task_type);
CREATE INDEX IF NOT EXISTS idx_agent_traces_created_at ON agent_traces(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_traces_company_id ON agent_traces(company_id);

-- ============================================================================
-- 2. rubric_versions — immutable record of scoring rubrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS rubric_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version_tag TEXT NOT NULL UNIQUE,       -- e.g. 'v1.0', 'v1.1'
    dimensions JSONB NOT NULL,              -- array of {name, weight, description, scoring_guide}
    pass_threshold REAL NOT NULL DEFAULT 3.5,
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rubric_versions_active ON rubric_versions(active) WHERE active = TRUE;

-- ============================================================================
-- 3. evaluation_scores — one row per evaluated output
-- ============================================================================
CREATE TABLE IF NOT EXISTS evaluation_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trace_id UUID REFERENCES agent_traces(id) ON DELETE CASCADE,
    evaluator_model TEXT NOT NULL DEFAULT 'claude-sonnet-4',
    rubric_version_id UUID REFERENCES rubric_versions(id),

    -- Dimension scores (1.0–5.0)
    score_kb_grounding REAL CHECK (score_kb_grounding BETWEEN 1.0 AND 5.0),
    score_instruction_adherence REAL CHECK (score_instruction_adherence BETWEEN 1.0 AND 5.0),
    score_completeness REAL CHECK (score_completeness BETWEEN 1.0 AND 5.0),
    score_actionability REAL CHECK (score_actionability BETWEEN 1.0 AND 5.0),
    score_factual_discipline REAL CHECK (score_factual_discipline BETWEEN 1.0 AND 5.0),
    score_risk_handling REAL CHECK (score_risk_handling BETWEEN 1.0 AND 5.0),

    -- Composite
    score_composite REAL CHECK (score_composite BETWEEN 1.0 AND 5.0),

    -- Evaluator rationale
    rationale TEXT,
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,

    -- Sync vs async
    evaluation_mode TEXT NOT NULL CHECK (evaluation_mode IN ('sync', 'async', 'self_check')),

    -- Human review
    human_reviewed BOOLEAN DEFAULT FALSE,
    human_override_score REAL,
    human_override_reason TEXT,
    human_reviewer TEXT,
    human_reviewed_at TIMESTAMPTZ,

    -- Metadata
    evaluation_duration_seconds REAL,
    evaluator_tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evaluation_scores_trace_id ON evaluation_scores(trace_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_composite ON evaluation_scores(score_composite);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_mode ON evaluation_scores(evaluation_mode);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_created_at ON evaluation_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_not_reviewed ON evaluation_scores(human_reviewed) WHERE human_reviewed = FALSE;

-- ============================================================================
-- 4. correction_proposals — generated by evaluator when score < threshold
-- ============================================================================
CREATE TABLE IF NOT EXISTS correction_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trace_id UUID REFERENCES agent_traces(id),
    evaluation_id UUID REFERENCES evaluation_scores(id),
    agent_role TEXT NOT NULL,
    task_type TEXT NOT NULL,

    -- Proposal content
    original_output_excerpt TEXT,
    proposed_correction TEXT NOT NULL,
    proposed_guidance TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('critical', 'major', 'minor')),

    -- Review state
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ingested')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- If approved and ingested, link to the correction document
    correction_document_id BIGINT,          -- FK to documents.id after ingestion

    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_correction_proposals_status ON correction_proposals(status);
CREATE INDEX IF NOT EXISTS idx_correction_proposals_agent_role ON correction_proposals(agent_role);
CREATE INDEX IF NOT EXISTS idx_correction_proposals_created_at ON correction_proposals(created_at DESC);

-- ============================================================================
-- Tell PostgREST to reload its schema cache
-- ============================================================================
NOTIFY pgrst, 'reload schema';
