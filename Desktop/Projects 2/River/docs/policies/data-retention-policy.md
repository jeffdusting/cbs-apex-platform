# Data Retention Policy

**Owner:** Jeff Dusting
**Effective:** 2026-04-19 (S5-P4)
**Review cadence:** quarterly, or on material schema change.

## Scope

Covers all data stored in the Project River Supabase instances — CBS (`fafce870-b862-4754-831e-2cd10e8b203c`) and WaterRoads (`95a248d4-08e7-4879-8e66-5d1ff948e005`). Secrets (1Password) and file storage (SharePoint / Drive) are governed separately by the data-handling and access-control policies.

## Retention windows

| Table | Retention | Rationale |
|---|---|---|
| `agent_traces` | 90 days | Operational debugging data. Summary statistics persist in `evaluation_scores`; raw traces are only needed for recent incident investigation. |
| `evaluation_scores` | 365 days | Quality trend data. Required for rubric calibration and regression detection across a full annual cycle of tender work. |
| `correction_proposals` (status=`ingested`/`rejected`) | 90 days | Actioned proposals. The correction itself persists in the `documents` table; the proposal row is audit metadata. |
| `correction_proposals` (status=`pending`) | no auto-purge | Awaiting human review — must never be deleted by the purge job. |
| `documents` | no auto-purge | Core knowledge base. Deletions are manual and tracked in git via the ingestion scripts. |
| `tender_register` | no auto-purge | Business records. Archive policy to be set separately when the register reaches maturity. |
| `tender_lifecycle_log` | no auto-purge | Audit trail for regulated tender workflows. |

## Enforcement

Purge is executed by `scripts/retention-purge.py`. The script is expected to run **monthly** (off-hours). Two execution modes:

1. **Paperclip routine** — register as a monthly scheduled routine on the River Monitor agent with `--execute` flag.
2. **Manual cron** — run from an operator workstation when the routine is not yet deployed. Example: `python3 scripts/retention-purge.py --execute` on the first of each month.

The script always logs the number of rows deleted per table. Defaults to `--dry-run`; operators must pass `--execute` explicitly to delete.

## Exceptions

- **Legal hold:** if a regulator, counterparty, or Jeff issues a written hold, the operator must pause the purge routine and document the hold in `docs/policies/incident-response-plan.md` under an active incident record. Resume only after the hold is lifted.
- **Forensic retention:** if a trace or evaluation row is implicated in a security incident, tag it with a `legal_hold=true` metadata flag before the next purge window; the purge script skips rows where metadata contains `legal_hold=true`.

## Related documents

- [`docs/policies/data-handling-policy.md`](data-handling-policy.md)
- [`docs/policies/access-control-policy.md`](access-control-policy.md)
- [`docs/policies/incident-response-plan.md`](incident-response-plan.md)
- `scripts/retention-purge.py`
