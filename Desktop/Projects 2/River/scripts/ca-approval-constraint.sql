-- S5-P4 (RA.6): Database-level enforcement of the CA approval gate.
--
-- The ca-sender-preflight.py script checks ca_send_approved before dispatch,
-- but a misbehaving or hand-invoked sender could bypass that check. This
-- trigger prevents ca_sent_at from being stamped unless ca_send_approved is
-- TRUE and ca_send_approved_by is non-null.
--
-- Apply:
--   psql "$DATABASE_URL" -f scripts/ca-approval-constraint.sql
--   OR via Supabase SQL editor.
--
-- Idempotent: safe to re-run.

CREATE OR REPLACE FUNCTION enforce_ca_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ca_sent_at IS NOT NULL
       AND (NEW.ca_send_approved IS NOT TRUE OR NEW.ca_send_approved_by IS NULL) THEN
        RAISE EXCEPTION
            'CA send requires ca_send_approved=TRUE and ca_send_approved_by to be set (tender %, attempted ca_sent_at=%)',
            NEW.id, NEW.ca_sent_at;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_ca_approval ON tender_register;

CREATE TRIGGER check_ca_approval
    BEFORE UPDATE ON tender_register
    FOR EACH ROW
    WHEN (NEW.ca_sent_at IS DISTINCT FROM OLD.ca_sent_at)
    EXECUTE FUNCTION enforce_ca_approval();

COMMENT ON FUNCTION enforce_ca_approval IS
    'S5-P4 RA.6 hard stop: refuses ca_sent_at updates unless ca_send_approved=TRUE and approver recorded.';
