---
title: Disaster Recovery Drill Plan
status: ACCEPTED
author: Stage 5 — P7 (DR + Resilience)
date: 2026-04-19
critique_ref: IB.2
---

# DR Drill Plan

## Purpose

Prove — under realistic conditions, on a recurring cadence — that we can
restore either Supabase project from a backup in a bounded time window
and that the restored data passes the same correctness checks we run in
CI.

## 1. Targets

| Metric | Target |
|---|---|
| RTO (Recovery Time Objective) | **2 hours**, manual, one operator |
| RPO (Recovery Point Objective) | **24 hours** (daily backups at 02:00 AEST) |
| Drill frequency | **Quarterly** (Mar, Jun, Sep, Dec) |
| Pass threshold | Retrieval regression queries within 0.05 cosine of baseline; evaluator E2E 8/8; all expected tables restored with row counts ≥ 95% of pre-incident snapshot |

## 2. Scenario

**Primary scenario:** CBS Supabase data loss — tables dropped, corrupted,
or the project itself is unavailable. The drill also serves WR by analogy
(alternate drill quarters between CBS and WR).

## 3. Pre-drill checks

1. Confirm today's backup exists and is non-empty:
   ```bash
   ls -lh "$HOME/river-backups/$(date +%Y-%m-%d)/cbs-dump.sql"
   ```
   If the file is 0 bytes or missing, the drill is aborted and the
   backup job is fixed first.
2. Confirm `op run` resolves required secrets:
   ```bash
   op run --env-file=scripts/env-op.env -- env | grep SUPABASE_URL
   ```

## 4. Drill steps

Order matters — each step is reversible up to step 5.

1. **Locate the latest dump.**
    ```bash
    DUMP="$HOME/river-backups/$(date +%Y-%m-%d)/cbs-dump.sql"
    ```
2. **Create a restore target.** Either a fresh Supabase project
   (preferred — nothing at stake) or an ephemeral local Postgres via
   `docker run postgres:15`. The fresh project path validates more
   of the real recovery path (pgvector, RLS, auth) at the cost of
   ~5 minutes provisioning.
3. **Apply the dump.**
    ```bash
    psql "$RESTORE_DB_URL" < "$DUMP"
    ```
4. **Wire the tooling at the restored project.** Update the 1Password
   items `River CBS Supabase` / `url` and `Service Role Key` to point
   at the restore target. This is the step most likely to go wrong
   under pressure — practice it.
5. **Run the correctness suite against the restored project.**
    - `python3 scripts/retrieval-regression.py` — all queries within
      0.05 cosine of the baseline stored in `config/retrieval-baselines.json`.
    - `python3 scripts/test-evaluator-e2e.py` — must pass 8/8.
    - `python3 scripts/check-blocked-work.py --since 1 --dry-run` —
      must complete without error.
6. **Row-count sanity.** For each table in `agent_traces`,
   `documents`, `tender_register`, `evaluation_scores`,
   `correction_proposals`: confirm the restored row count is ≥ 95% of
   the pre-drill snapshot (taken at step 0 of the drill runbook below).
7. **Record RTO.** From step 1 to step 6 inclusive — this is the
   measured RTO for the drill.
8. **Roll back.** Revert 1Password items to the original project. Do
   NOT delete the restored project until the post-drill write-up is
   complete — it is the primary evidence.

## 5. Success criteria

Drill is a **PASS** if all four hold:

- Retrieval regression: all queries within 0.05 cosine of baseline.
- Evaluator E2E: 8/8 passing.
- Row counts: ≥ 95% of pre-drill snapshot on every table checked.
- RTO: ≤ 2 hours (wall clock, step 1 → step 6).

A drill is a **PARTIAL** if 3 of 4 hold. Investigate the missing
criterion, file a corrective ticket, re-run the affected step within
30 days. Partial drills do not reset the quarterly cadence.

A drill is a **FAIL** if fewer than 3 hold, or if any step errors and
cannot be recovered. Failure triggers an incident in the IR plan
(`docs/policies/incident-response-plan.md`) and blocks the next release
until the underlying issue is resolved.

## 6. Post-drill write-up

A one-page note in `docs/dr-drill-log/YYYY-MM-DD.md` containing:

- Operator who ran the drill
- Start / end timestamps (RTO)
- Result of each of the four success criteria
- Verdict: PASS / PARTIAL / FAIL
- Anything surprising — backup size, restore speed, permissions that
  needed re-applying, env vars that were missing
- Follow-up tickets raised

## 7. Schedule

| Quarter | Target project | Operator | Notes |
|---|---|---|---|
| Q2 2026 (first drill) | CBS | Jeff | Practice run — document pain points |
| Q3 2026 | WR | Jeff + Reviewer observing | Hand-off rehearsal |
| Q4 2026 | CBS | Reviewer (Sarah) as primary | Validates second-operator path |
| Q1 2027 | WR | Jeff | Annual cycle continues |

Alternating CBS/WR means each project gets drilled twice a year and the
second-operator path is exercised annually.

## 8. Non-goals

- This plan does NOT cover Paperclip, Railway, or Vercel recovery —
  those are vendor-hosted and have separate runbooks
  (`docs/absence-runbook.md`).
- No automated failover. The drill is manual by design — automation is
  a future programme, costed in `docs/vendor-migration-costs.md`.
- No RPO tightening in this plan. Moving from 24h to 1h (PITR) is a
  separate design decision contingent on Supabase PITR licensing.
