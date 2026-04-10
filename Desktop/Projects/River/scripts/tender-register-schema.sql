-- Project River — Tender Register Schema
-- Tracks all assessed tender opportunities with deduplication and decision recording.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS tender_register (
    id              BIGSERIAL PRIMARY KEY,
    reference       TEXT NOT NULL,              -- tender reference (ATM-12345, RFT-67890, etc.)
    source          TEXT NOT NULL,              -- austender, tenders_nsw, buying_for_victoria, gets_nz, inland_rail, direct_invitation
    title           TEXT NOT NULL,
    agency          TEXT,                       -- procuring entity
    estimated_value TEXT,                       -- dollar range or specific value
    close_date      TEXT,                       -- submission deadline
    url             TEXT,                       -- link to tender portal listing
    email_subject   TEXT,                       -- original notification email subject
    email_date      TIMESTAMPTZ,               -- when the notification was received

    -- Assessment
    assessed_date   TIMESTAMPTZ,               -- when Tender Intelligence assessed it
    assessed_by     TEXT,                       -- agent ID or name
    scorecard       JSONB,                      -- full qualification scorecard JSON
    weighted_score  FLOAT,                      -- scorecard weighted score (1.0-5.0)

    -- Decision
    decision        TEXT DEFAULT 'pending',     -- pending, go, watch, pass, expired
    decision_date   TIMESTAMPTZ,
    decision_by     TEXT,                       -- CBS Executive or Jeff Dusting
    decision_notes  TEXT,

    -- Paperclip linkage
    issue_id        TEXT,                       -- Paperclip issue ID for the assessment
    issue_identifier TEXT,                      -- e.g. CBSA-25
    response_issue_id TEXT,                     -- Paperclip issue ID for the tender response (if Go)

    -- Metadata
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on reference + source to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_tender_register_ref_source
    ON tender_register (reference, source);

-- Index for decision queries
CREATE INDEX IF NOT EXISTS idx_tender_register_decision
    ON tender_register (decision);

-- Index for source + date queries (daily scan dedup)
CREATE INDEX IF NOT EXISTS idx_tender_register_source_date
    ON tender_register (source, created_at DESC);

-- Index for close date (expiry tracking)
CREATE INDEX IF NOT EXISTS idx_tender_register_close_date
    ON tender_register (close_date);
