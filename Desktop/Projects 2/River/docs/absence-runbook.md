---
title: 14-Day Absence Runbook
status: ACCEPTED
author: Stage 5 — P7 (DR + Resilience)
date: 2026-04-19
critique_ref: IB.1
---

# 14-Day Absence Runbook

## Purpose

If Jeff is unavailable for up to 14 days (travel, illness, leave), this
runbook tells a second operator what will break, when, and what to do
about each failure. It is deliberately conservative — the aim is not
business-as-usual, but *no data loss, no accidental outbound email, no
client-facing incident*.

## 1. What continues without intervention

These systems are stable for ≥ 2 weeks with no operator action:

- **Supabase** (both projects) — stable for weeks unless a key rotation
  happens during the absence window.
- **Railway** — Paperclip container runs continuously.
- **Vercel dashboards** — static front-ends, no operator action needed.
- **Evaluator batch job** — scheduled; runs independently.
- **Monitoring digest** — scheduled; delivered via Teams webhook.
- **Backup job** — `scripts/backup-supabase.sh` via cron; check the logs
  if backups stop arriving.

## 2. What breaks, and when

| System | Failure mode | Time to failure | Remediation |
|---|---|---|---|
| Paperclip session cookie | Expires | ~4 hours after last refresh | §3 — refresh cookie |
| Apps Script email intake | Uses a session token property that can expire | ~4 hours | §4 — refresh Apps Script token |
| Trace ingestion | Depends on Paperclip cookie | Same as above | Fixes itself when cookie is refreshed |
| Correction review | Queue grows; no one clicks approve/reject | Immediate (every new proposal) | §5 — Reviewer can run the dashboard |
| CA send approvals | No human in the loop | Immediate | §6 — Reviewer can approve via dashboard |
| Tender go/no-go decisions | Require operator judgement | Immediate (per tender) | Deferred until return — tenders wait in `go_no_go_pending` |
| Cookie-dependent deploy scripts | Cannot run Paperclip mutations | After cookie expiry | Not needed for steady-state — only for deploys |

**Non-cookie-dependent paths keep working:** KB queries, evaluator,
retention purge, retrieval regression, cost report, backup script, Teams
webhook alerts.

## 3. Paperclip session cookie refresh (≤ 5 minutes)

The cookie is the single most frequent operator task. Do this first
when arriving at the handoff.

1. In a browser, sign in to `https://org.cbslab.app/` as the operator
   account (ask Jeff to add the second operator if not already done).
2. Open DevTools → Application → Cookies → `https://org.cbslab.app`.
3. Copy the value of `__Secure-better-auth.session_token`.
4. Update the 1Password item:
   ```bash
   op item edit "River Paperclip" "Session Cookie=<paste value>" --vault River
   ```
5. Verify:
   ```bash
   op run --env-file=scripts/env-op.env -- \
     python3 scripts/paperclip-validate.py
   ```
   Expected: a successful list of agents for CBS and WR companies.

The cookie prefix **must** be `__Secure-better-auth.session_token=` —
using `better-auth.session_token=` will return 403.

## 4. Apps Script email intake token refresh

Separate from the Paperclip cookie. The email intake is Google
Apps Script code that polls `jeff@cbsaustralia.com.au` and files tender
inbound mail into Paperclip.

1. Open `https://script.google.com` signed in to
   `jeff@cbsaustralia.com.au`.
2. Locate project `River Email Intake`.
3. Project Settings → Script Properties → update
   `PAPERCLIP_SESSION_COOKIE` with the same value from §3 step 3.
4. Re-deploy (Deploy → New Deployment → Web App with the same access
   level as before).
5. Trigger the scheduled function once manually to confirm it runs.

## 5. Correction review (Reviewer role)

Correction proposals land in `correction_proposals` with status
`pending`. Critical-severity proposals page the operator immediately via
Teams webhook and block the originating agent's same `task_type` until
resolved.

To work the queue:

```bash
op run --env-file=scripts/env-op.env -- \
  python3 scripts/review-correction-proposals.py --pending
```

The script prints each pending proposal with the agent's suggested
correction. Reviewer approves or rejects in-place. Both CBS and WR
proposals land in this queue — filter with `--company-id`.

Escalation rule: if a proposal claims to change an agent's `AGENTS.md`
or any file in `agent-instructions/`, do not approve without Jeff's
explicit sign-off. Those are Developer-role changes.

## 6. CA send approvals (Reviewer role)

CA sends require `ca_send_approved = true` on the `tender_register` row.
The DB trigger from P4 (`scripts/ca-approval-constraint.sql`) blocks any
path that tries to bypass this.

To approve:

1. Open the dashboard → Tenders → filter "Awaiting CA approval".
2. Open the tender, review the auto-drafted CA (linked in the row).
3. Click "Approve CA send". The dashboard path flips the flag using
   the service-role context, which is the only context allowed to
   write `ca_send_approved`.

If the dashboard is unavailable, do NOT approve by direct SQL —
escalate to Jeff.

## 7. Tender decisions

Tenders in `lifecycle_stage = 'go_no_go_pending'` require a human
go/no-go decision. Reviewer does not have authority for this. These
tenders wait until Jeff's return. If a tender deadline arrives before
return, Reviewer emails the tender issuer to request an extension (not
to submit).

## 8. Minimum viable handoff checklist

Before a planned absence, cover these in one sitting (≈ 20 minutes):

- [ ] Share 1Password vault access with the second operator (vault
      `River`, as Reviewer — grants item read; full operator access is
      separate and requires explicit vault transfer).
- [ ] Share Paperclip login (or set up the second operator's own
      account and grant them org access).
- [ ] Walk through cookie refresh (§3) — have them do it once.
- [ ] Walk through Apps Script token refresh (§4) — have them do it
      once.
- [ ] Walk through correction review (§5) — have them approve one
      proposal.
- [ ] Walk through CA approval dashboard (§6) — have them view a
      pending approval (do not approve).
- [ ] Confirm Teams webhook has their email on the operator digest
      distribution list.
- [ ] Confirm they can receive the critical correction alert (send a
      test via `scripts/check-blocked-work.py --alert` in dry-run mode).

Post-return: deactivate the temporary dashboard role claim. Do not
leave elevated access in place longer than the absence.

## 9. What to do if something is actually on fire

If the second operator sees something that looks like a genuine incident
(data loss, unauthorised email sent, agent escalation storm), follow
the IR plan: `docs/policies/incident-response-plan.md`. That plan covers
contact paths and what can wait vs. what needs immediate action. This
runbook is only for steady-state operations.
