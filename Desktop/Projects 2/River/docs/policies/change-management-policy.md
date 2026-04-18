# Change Management Policy

**Owner:** Jeff Dusting
**Effective:** 2026-04-19 (S5-P4)
**Review cadence:** annually, or on material tooling change.

## Purpose

Defines how each category of change to Project River is proposed, reviewed, applied, and auditable after the fact.

## Change categories

### 1. Agent instructions

- **Artefact:** `agent-instructions/<role>/AGENTS.md`
- **Proposal:** git commit on the `main` branch with a message describing the instructional change.
- **Review:** Jeff reviews the diff before commit. If the change alters a Hard Stop Prohibition, recalibrate any affected sync-eval task types.
- **Apply:** push via Paperclip API (`scripts/create-*-routine.py` or equivalent `PATCH /api/agents/{id}`). Agent picks up the new instructions on next heartbeat.
- **Audit:** git log + Paperclip activity log.

### 2. Database schema

- **Artefact:** `.sql` file in `scripts/` (e.g. `tender-register-schema.sql`, `ca-approval-constraint.sql`).
- **Proposal:** git commit with the new or updated schema. Idempotent by default (`CREATE IF NOT EXISTS`, `DROP TRIGGER IF EXISTS`).
- **Review:** Jeff (or a designated reviewer) reads the SQL and sanity-checks that it won't drop data. If the change is destructive (`DROP COLUMN`, `TRUNCATE`), pair with a backup plan documented in the commit message.
- **Apply:** via Supabase SQL editor or CLI (`supabase db push` / `psql "$DATABASE_URL" -f file.sql`). Record the applied-on date in the commit message or in `TASK_LOG.md`.
- **Audit:** git log of the `.sql` file + Supabase migrations table.

### 3. Evaluator rubrics

- **Artefact:** `config/evaluator-rubric-vN.json` and the `evaluation_rubrics` Supabase table.
- **Proposal:** create a new rubric file with an incremented version tag (e.g. `v1.2`). The previous rubric file stays in git for audit.
- **Review:** Jeff reviews the diff. Any rubric change must be accompanied by a calibration comparison against the canonical calibration set.
- **Apply:** insert the new rubric row with `active=FALSE`, run calibration, then `UPDATE evaluation_rubrics SET active=TRUE` when approved.
- **Audit:** `evaluation_rubrics` table + git history of rubric files.

### 4. Paperclip routines

- **Artefact:** scripts in `scripts/create-*-routine.py` that POST to the routine endpoint, plus the resulting routine JSON saved under `agent-config/` or `scripts/`.
- **Proposal:** script with a `--dry-run` flag by default; actually creating the routine requires `--execute`.
- **Review:** Jeff reviews the dry-run output before authorising `--execute`.
- **Apply:** run with `--execute`. The script prints the routine ID; commit the manifest update that records the routine.
- **Audit:** Paperclip routines endpoint + git log of the manifest.

### 5. Skill definitions

- **Artefact:** `skills/<skill-name>/SKILL.md` and the skills-lock manifest.
- **Proposal:** git commit. Breaking changes to an existing skill must bump a version string inside the SKILL.md front matter so agents know to re-fetch.
- **Review:** Jeff reviews. If the skill changes how agents interact with Supabase or external services, include a plan to verify no agent breaks mid-heartbeat.
- **Apply:** run `scripts/prepare-trace-skill-sync.py` (or the skill-specific sync) to push the updated skill to agents.
- **Audit:** `skills-lock.json` + git log.

### 6. Secrets and environment

- **Artefact:** 1Password items, `env-setup.sh.op-stub`, `secrets-manifest.json`.
- **Proposal:** update `env-setup.sh.op-stub` and `secrets-manifest.json` (the stub, not the populated file). Never commit the populated `env-setup.sh`.
- **Review:** Jeff applies the real secret values in 1Password directly.
- **Apply:** each operator re-runs `scripts/env-setup.sh` to refresh their local environment. Routines are re-deployed if they read the secret from environment at creation time.
- **Audit:** 1Password access log + git log of the stub and manifest.

## Rollback

- **Agent instructions / skills:** `git revert` the offending commit, then re-push to Paperclip.
- **Schema:** write a reverse migration `.sql` file and apply via the same CLI path.
- **Rubric:** `UPDATE evaluation_rubrics SET active=TRUE WHERE version_tag = '<prior>'` and `active=FALSE` on the failed version.
- **Routine:** disable via the Paperclip API; commit the manifest change.

## Related documents

- [`docs/policies/data-handling-policy.md`](data-handling-policy.md)
- [`docs/policies/access-control-policy.md`](access-control-policy.md)
- [`docs/policies/incident-response-plan.md`](incident-response-plan.md)
- [`docs/architecture-decisions/`](../architecture-decisions/)
