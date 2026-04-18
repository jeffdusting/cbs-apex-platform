# Incident Response Plan

**Owner:** Jeff Dusting
**Effective:** 2026-04-19 (S5-P4)
**Review cadence:** annually, after every material incident, or on material control change.

## Purpose

Defines containment, investigation, and recovery steps for the four highest-likelihood incident classes across Project River.

## Common response pattern

Every incident follows four steps: **detect → contain → investigate → recover**, followed by a **lessons learned** entry that must be appended to this document under "Incident log" within 7 days.

## Scenario 1 — Leaked service-role key

**Detection**
- Unexpected Supabase activity (writes from unknown IPs, off-hours traffic, or queries against tables the expected callers never touch).
- A service-role key appears in a git commit, chat message, or screenshot.
- 1Password audit log shows an unauthorised item view.

**Containment**
- Rotate the key immediately via the Supabase dashboard (Project Settings → API → roll service role key). This invalidates the leaked key.
- Temporarily pause the River Monitor agent and any Paperclip routines that rely on the key, to avoid cascading failures while the new key is rolled out.

**Investigation**
- Pull the Supabase query log for the past 24h. Look for SELECTs on `documents`, `correction_proposals`, `evaluation_scores`, or `tender_register`.
- Check for data-exfiltration patterns: large result sets, sequential ID scans, queries filtering on sensitive fields.
- Check `pgcrypto`-protected tables for decrypt attempts.

**Recovery**
- Update the 1Password `SUPABASE_SERVICE_ROLE_KEY` item with the new key.
- Re-deploy any script, routine, or agent that references the key (env-setup, sync-eval, Paperclip routines).
- Notify any counterparty whose data may have been exposed.

**Lessons learned**
- Confirm the audit role (`river_operator`) is used for interactive queries; the service-role key should only be in 1Password and loaded via `env-setup.sh`.

## Scenario 2 — Unauthorised external action

Applies when an agent sends an email, posts to LinkedIn, submits a tender response, or otherwise communicates externally without human approval.

**Detection**
- River Monitor flags `ca_sent_at IS NOT NULL AND ca_send_approved = FALSE`.
- External recipient reports unexpected message.
- Activity log shows `tender_portal_submit` or similar external action without a preceding approval step.

**Containment**
- Disable the offending agent via the Paperclip API (`PATCH /api/agents/{id}` with `status=disabled`).
- Revoke the agent's SharePoint / Drive / Xero / Outlook tokens if the action used one.
- If an email was sent, contact the recipient to retract; note retraction in `tender_lifecycle_log` if tender-related.

**Investigation**
- Pull the agent's trace history for the past 24h.
- Identify which skill or prompt-template caused the action. Review for prompt-injection vectors.
- Check whether the Hard Stop Prohibitions in the agent's `AGENTS.md` explicitly forbade the action. If not, the prohibition set is incomplete.

**Recovery**
- Add or strengthen the Hard Stop Prohibition in the agent's `AGENTS.md` and commit.
- Re-enable the agent only after a supervised dry-run proves the prohibition holds.
- If the action was CA-related, verify that the DB trigger from `scripts/ca-approval-constraint.sql` is in place.

**Lessons learned**
- Every external action must have a pre-flight script with an approval gate. Log a separate remediation task if any action path is missing one.

## Scenario 3 — Evaluator systematic drift

Applies when the async / sync evaluator is consistently over- or under-scoring relative to human calibration scores.

**Detection**
- Calibration comparison job shows bias > 0.5 composite points against the human calibration set.
- Pass rate swings abruptly (>15 percentage points week-over-week) without a corresponding rubric change.
- Multiple agents simultaneously trip evaluator gates on outputs that prior passes accepted.

**Containment**
- Disable sync evaluation gates by setting the relevant `evaluation_events.json` modes to `self_check` for the affected task types. This stops false-positive blocking.
- Revert to human review for any in-flight outputs pending a sync gate.
- Leave async evaluation running — the data is still useful for post-hoc analysis even if biased.

**Investigation**
- Compare the active rubric version against the last known-good version.
- Check the evaluator model version (Claude Sonnet 4, etc.) — a model upgrade can shift scoring.
- Run the calibration suite against both the suspect rubric and the prior rubric.

**Recovery**
- Recalibrate the rubric using the standard calibration set and activate a new version.
- Re-score recent outputs (last 7 days) with the recalibrated rubric. Overwrite `evaluation_scores` rows where appropriate.
- Re-enable sync gates once bias < 0.3.

**Lessons learned**
- Treat rubric activation as a change-management event. Record the activation reason and calibration delta in `correction_proposals` as a single `status=ingested` row for the audit trail.

## Scenario 4 — Unauthorised CA send

**Detection**
- Monitoring agent flags `tender_register` rows where `ca_sent_at IS NOT NULL AND ca_send_approved = FALSE`.
- CA recipient reports receiving a CA without a preceding approval email trail.

**Containment**
- Immediately contact the recipient to retract. Use the existing counterparty liaison email for consistency.
- Lock the originating tender row: set `status='on_hold'` with a reason in `tender_lifecycle_log`.
- Disable the sender script and the `river-ca-sender` app script trigger.

**Investigation**
- Check whether the DB trigger `check_ca_approval` (see `scripts/ca-approval-constraint.sql`) is present on `tender_register`. If not, it was bypassed.
- Review the sender script's log for that tender. Confirm whether `ca-sender-preflight.py` was called at all.
- Check git history on the sender path for any recent commits that may have removed the pre-flight invocation.

**Recovery**
- Apply `scripts/ca-approval-constraint.sql` if not already present.
- Restore the pre-flight invocation in the sender script; add a unit test that asserts the pre-flight is called.
- Re-enable the sender only after the trigger is verified to reject bypass attempts.

**Lessons learned**
- Log every CA send as an immutable row in `tender_lifecycle_log` with `event_type='ca_sent'`, signed by the approving operator.

## Incident log

_No incidents recorded to date. New incidents are appended as dated H3 sub-sections with the four-step response summary and the lesson learned._
