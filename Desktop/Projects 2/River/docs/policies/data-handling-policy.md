# Data Handling Policy

**Owner:** Jeff Dusting
**Effective:** 2026-04-19 (S5-P4)
**Review cadence:** annually, or on material schema / infrastructure change.

## Scope

Covers all data generated, stored, or processed by the Project River agent workforce across CBS Group and WaterRoads.

## Data classes and stores

| Data class | Primary store | Secondary / derived | Sensitivity |
|---|---|---|---|
| Knowledge base documents | `documents` (Supabase, per-entity) | Voyage embeddings (`content_embedding`) | Mostly CBS / WR internal; some commercially sensitive tender content |
| Agent operational traces | `agent_traces` (CBS Supabase) | `evaluation_scores` summaries | Internal operational data |
| Evaluator outputs | `evaluation_scores`, `correction_proposals` | — | Internal quality data |
| Tender register | `tender_register`, `tender_lifecycle_log` | — | Business-sensitive |
| Secrets / keys | 1Password | `.env` files excluded from git | **Highly sensitive** |
| Source files for KB | SharePoint (CBS), Google Drive (WR) | Ingested into `documents` | Per source document |

See [`docs/secrets-audit.md`](../secrets-audit.md) for the full list of secrets and their 1Password item references.

## Collection

- Agents only write data to tables they are authorised to via the Supabase role (see access-control-policy.md).
- `agent_traces` are captured per the `skills/trace-capture/SKILL.md` contract; no trace is written without an issue ID and task type.
- Knowledge base ingestion runs only through scripts committed to git (`scripts/ingest-knowledge-base.py`, `scripts/wr-index-drive-content.py`, `scripts/cbs-kb-email-intake.py`, `scripts/wr-kb-email-intake.py`). Ad-hoc ingestion is not permitted.

## Storage and protection

- All Supabase instances use TLS in transit. At-rest encryption is provided by Supabase-managed storage.
- Secrets are never committed to git. The `.gitignore` excludes `.env`, `secrets-manifest.json` values, and 1Password stubs. `env-setup.sh.op-stub` is the committed template; the populated `env-setup.sh` is never committed.
- Sensitive KB documents flagged for encryption are stored via the `pgcrypto` design in `scripts/pgcrypto-sensitive-docs.sql`; access requires the `river_operator` role.

## Access

- See [`docs/policies/access-control-policy.md`](access-control-policy.md) for the full role matrix.
- Service-role keys are held in 1Password only; no raw key is pasted into chat, docs, or issues.
- Read-only diagnostic access is provided via the `river_operator` Supabase role (see `scripts/supabase-limited-role.sql`).

## Retention

- See [`docs/policies/data-retention-policy.md`](data-retention-policy.md).

## Sharing and egress

- No data leaves Supabase / SharePoint / Drive without a documented business purpose.
- External sends (email, tender portal uploads, LinkedIn) are always gated by a pre-flight approval script (`ca-sender-preflight.py` for CAs; equivalent preflights must exist for every external action).
- Token usage and cost reports may be shared with Jeff only; no third-party cost analytics tools receive raw trace data.

## Incident handling

- See [`docs/policies/incident-response-plan.md`](incident-response-plan.md).

## Related documents

- [`docs/secrets-audit.md`](../secrets-audit.md)
- [`docs/policies/access-control-policy.md`](access-control-policy.md)
- [`docs/policies/change-management-policy.md`](change-management-policy.md)
- [`docs/policies/data-retention-policy.md`](data-retention-policy.md)
- [`docs/policies/incident-response-plan.md`](incident-response-plan.md)
