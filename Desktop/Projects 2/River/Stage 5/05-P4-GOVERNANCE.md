# Phase 4: Governance Hardening

## Objective

Enforce the CA approval gate at the database level, define and implement data retention, add urgency-based correction proposal alerting, produce the incident response plan and governance policy documents. Addresses RA.1, RA.6, RA.7, RA.10, IB.8.

## Prerequisites

- S5-P2 complete.

## Context

```bash
cat stage5/DISCOVERY_SUMMARY.md | grep -A3 "CA\|retention\|correction"
```

## Tasks

### TASK 4.1: CA Approval Database Constraint (RA.6)

The CA preflight script checks `ca_send_approved` but can be bypassed if the sender script is called directly. Add a database-level enforcement:

Create `scripts/ca-approval-constraint.sql`:
```sql
-- Trigger: prevent ca_sent_at being set unless ca_send_approved is TRUE
CREATE OR REPLACE FUNCTION enforce_ca_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ca_sent_at IS NOT NULL AND (NEW.ca_send_approved IS NOT TRUE OR NEW.ca_send_approved_by IS NULL) THEN
        RAISE EXCEPTION 'CA send requires ca_send_approved=TRUE and ca_send_approved_by to be set';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_ca_approval
    BEFORE UPDATE ON tender_register
    FOR EACH ROW
    WHEN (NEW.ca_sent_at IS DISTINCT FROM OLD.ca_sent_at)
    EXECUTE FUNCTION enforce_ca_approval();
```

Apply via Supabase CLI. Test by attempting to set `ca_sent_at` without `ca_send_approved=TRUE` — should raise exception.

### TASK 4.2: Data Retention Policy + Scheduled Purge (RA.1)

Create `docs/policies/data-retention-policy.md`:
- `agent_traces`: 90 days (operational debugging data; older traces summarised in evaluation_scores)
- `evaluation_scores`: 365 days (quality trend data; needed for rubric calibration and regression detection)
- `correction_proposals` (status=ingested or rejected): 90 days (actioned proposals; the correction itself persists in `documents`)
- `correction_proposals` (status=pending): no auto-purge (awaiting review)
- `documents`: no auto-purge (core knowledge base)
- `tender_register` + `tender_lifecycle_log`: no auto-purge (business records)

Create `scripts/retention-purge.py` — scheduled purge script:
```python
# Run weekly or monthly. Deletes rows beyond retention window.
# --dry-run to preview. --table to limit to one table.
```

Register as a Paperclip routine (monthly, off-hours) or document as a manual cron.

### TASK 4.3: Critical Correction Proposal Alerting (RA.7)

Weekly batch review is acceptable for `severity=minor` and `severity=major`. For `severity=critical`, the evaluator should alert immediately.

Update `scripts/evaluate-outputs.py`: when a correction proposal is generated with `severity=critical`:
1. Send an immediate Teams notification via the Power Automate webhook: "CRITICAL correction proposal: {agent_role} / {task_type} — review required before agent produces more outputs of this type."
2. Optionally: block the originating agent's outputs of the same `task_type` by inserting a hold record (design the hold mechanism — could be a `holds` table or a flag on the agent_traces).

If the hold mechanism is too complex for this phase, produce the design and defer execution. The Teams alert is the minimum viable fix.

### TASK 4.4: Incident Response Plan (RA.10)

Create `docs/policies/incident-response-plan.md` covering four scenarios:

1. **Leaked service-role key** — detection (unexpected Supabase activity), containment (rotate key immediately via dashboard), eradication (check for data exfiltration, audit recent queries), recovery (update 1Password, re-deploy all scripts), lessons learned.

2. **Unauthorised external action** (agent sends email, posts to LinkedIn, etc.) — detection (monitoring agent alerts, human observation), containment (disable the agent via Paperclip API), investigation (check activity log, trace output), recovery (revoke any external tokens, notify affected parties if needed).

3. **Evaluator systematic drift** (evaluator consistently over- or under-scoring) — detection (calibration comparison shows >0.5 bias), containment (disable sync evaluation gates, revert to human review), investigation (compare rubric versions, check model behaviour), recovery (recalibrate rubric, re-score recent outputs).

4. **Unauthorised CA send** (CA sent without approval) — detection (monitoring agent checks `ca_sent_at IS NOT NULL AND ca_send_approved = FALSE`), containment (immediately contact recipient to retract), investigation (check if trigger/preflight was bypassed), recovery (add the DB constraint from TASK 4.1 if not already applied).

### TASK 4.5: Governance Policy Documents (IB.8)

Create `docs/policies/` directory with:

1. **`data-handling-policy.md`** — what data is collected, where it is stored, who has access, how it is protected. Reference the secrets audit from P3 and the retention policy from TASK 4.2.

2. **`access-control-policy.md`** — roles (operator, agent-read, service-role, dashboard-user), what each can access, how access is granted/revoked. Reference the limited Supabase role from P3.

3. **`change-management-policy.md`** — how agent instructions are changed (git commit + API PATCH), how schema is changed (SQL reviewed + applied via CLI), how evaluator rubrics are changed (new version + activation), how routines are created (guarded scripts with `--execute` flag).

## Gate Verification

```bash
echo "=== S5-P4 Gate ==="
[ -f "scripts/ca-approval-constraint.sql" ] && echo "PASS: CA constraint SQL" || echo "FAIL"
[ -f "docs/policies/data-retention-policy.md" ] && echo "PASS: Retention policy" || echo "FAIL"
[ -f "scripts/retention-purge.py" ] && python3 -m py_compile scripts/retention-purge.py 2>&1 && echo "PASS: Purge script" || echo "FAIL"
[ -f "docs/policies/incident-response-plan.md" ] && echo "PASS: IR plan" || echo "FAIL"
[ -f "docs/policies/data-handling-policy.md" ] && echo "PASS: Data handling policy" || echo "FAIL"
[ -f "docs/policies/access-control-policy.md" ] && echo "PASS: Access control policy" || echo "FAIL"
[ -f "docs/policies/change-management-policy.md" ] && echo "PASS: Change management policy" || echo "FAIL"

# Test CA constraint
python3 -c "
import os, httpx
url = os.environ['SUPABASE_URL']; key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
h = {'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}
# This should fail — ca_send_approved is FALSE by default
r = httpx.patch(f'{url}/rest/v1/tender_register?id=eq.nonexistent', headers=h, json={'ca_sent_at': '2026-04-16T00:00:00Z'})
# A 404 (no matching row) is fine; a 200 means the trigger didn't fire
print(f'CA constraint test: status {r.status_code} (expected 404 or trigger error)')
" 2>&1
```

## Archive Point

```bash
git add -A && git commit -m "S5-P4: Governance — CA constraint, retention, IR plan, policies"
git tag stage5-P4-governance
```

## TASK_LOG Entry

```markdown
## S5-P4: Governance Hardening
- **Status:** COMPLETE
- **CA DB constraint:** [applied / SQL produced]
- **Retention policy:** defined (90d traces, 365d scores)
- **Purge script:** created [--dry-run tested / not tested]
- **Critical correction alerting:** [implemented / design produced]
- **IR plan:** 4 scenarios documented
- **Policy docs:** [N] documents created
- **Next phase:** P3 (Secrets), P5 (CI), P6 (Observability), or P8 (Deferred) — based on what's done
```
