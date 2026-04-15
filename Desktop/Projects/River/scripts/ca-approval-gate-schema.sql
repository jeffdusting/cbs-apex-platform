-- ============================================================================
-- CA Sender Approval Gate — Schema Extension
-- ============================================================================
-- Adds architectural hard stop: CA cannot be sent unless ca_send_approved = TRUE
-- Apply to CBS Supabase (eptugqwlgsmwhnubbqsk)
-- ============================================================================

ALTER TABLE tender_register
    ADD COLUMN IF NOT EXISTS ca_send_approved BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ca_send_approved_by TEXT,
    ADD COLUMN IF NOT EXISTS ca_send_approved_at TIMESTAMPTZ;

COMMENT ON COLUMN tender_register.ca_send_approved IS 'Human must set TRUE before CA sender will dispatch. Architectural hard stop.';

NOTIFY pgrst, 'reload schema';
