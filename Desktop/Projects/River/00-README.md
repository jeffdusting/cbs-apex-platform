# Project River — CC Session Programme

**Session Model:** Claude Code (`claude` CLI or `--model sonnet` for most phases; `--model opus` for P2 agent instructions)
**Permissions:** `--dangerously-skip-permissions` (required for file writes and API calls)
**Working Directory:** `river-config` repository root

## Context Preamble

Project River is a multi-entity virtual organisation deployment on Paperclip AI (v2026.403.0, server @paperclipai/server@0.3.1). It spans four business entities — CBS Group (anchor, technical advisory), WaterRoads (maritime transport, governance only), Adventure Safety (provisioned inactive), and MAF/CobaltBlu (provisioned inactive).

The Paperclip instance is deployed on Railway as a Docker container (`ghcr.io/paperclipai/paperclip@sha256:791f3493d101154cb8a991a3895160297fae979f50cba657032ae4ce18132bff`) with Railway-managed PostgreSQL. The knowledge base is on Supabase with pgvector (Voyage AI voyage-3.5, 1024 dimensions). Integrations include M365 Graph API (application permissions, no Mail.Send), Xero (read-only OAuth), and GitHub.

Agents use the `claude_local` adapter exclusively in Sprint 1. HTTP and OpenClaw adapters are "Coming soon" in Paperclip and are deferred to Sprint 2+.

**Critical platform details (from Day 0 Discovery — 8 April 2026):**

1. Heartbeat intervals: `runtimeConfig.heartbeat.intervalSec` (integer, seconds). NOT `heartbeatInterval` or `schedule`.
2. Agent instructions: 4-file bundle at `~/.paperclip/.../agents/{agentId}/instructions/` — AGENTS.md (entry), HEARTBEAT.md, SOUL.md, TOOLS.md. `promptTemplate` in adapterConfig on create → written to AGENTS.md.
3. Budgets: `budgetMonthlyCents` (USD cents), not tokens.
4. Agent roles: enum only — `ceo`, `cto`, `cmo`, `cfo`, `engineer`, `designer`, `pm`, `qa`, `devops`, `researcher`, `general`.
5. Agent env vars: type-wrapped — `{ "KEY": { "type": "plain", "value": "..." } }`.
6. Skills: must be explicitly synced per agent via `POST /api/agents/{id}/skills/sync`.
7. Routines: cron-based recurring task creation via `POST /api/companies/{id}/routines` + triggers. Requires a `projectId`.
8. No native notifications — use agent skills or external polling.
9. `dangerouslySkipPermissions: true` required in adapterConfig for autonomous execution.
10. Direct agent creation via `POST /api/companies/{id}/agents` bypasses approval (board operator path).

## Phase Sequence

| Phase | File | Day | Objective | Depends On |
|-------|------|-----|-----------|------------|
| P0 | 01-P0-DISCOVERY.md | 0 | Platform discovery (COMPLETE) | — |
| P1 | 02-P1-INFRASTRUCTURE.md | 0 | Infrastructure scripts, Docker, schema, automation | P0 |
| P2 | 03-P2-AGENT-INSTRUCTIONS.md | 0 | 48 agent instruction files (4-file model × 12 agents) | P0 |
| P3 | 04-P3-SKILLS-TEMPLATES.md | 0 | Skills, governance templates, runbook, documentation | P0 |
| P4 | 05-P4-KB-STRUCTURE.md | 1 | Structure exported KB content, create manifest | P1 |
| P5 | 06-P5-DAY2-VALIDATION.md | 2 | Ingestion, agent creation, validation scripts, test prep | P4 + human credentials |
| P6 | 07-P6-DAY3-WR-PREP.md | 3 | WaterRoads preparation, test execution support | P5 |
| P7 | 08-P7-DAY4-ANALYSIS.md | 4 | WR deployment, token analysis, briefings, runbook | P6 |
| P8 | 09-P8-DAY5-HANDOVER.md | 5 | Final verification, sprint summary, commit | P7 |

## Context Management — CRITICAL

### Rule 1: Persistent Discovery Summary
Read `DISCOVERY_SUMMARY.md` in the repository root for all platform details. Do NOT re-discover API endpoints — they are documented there.

### Rule 2: Commit Before Capacity
If you estimate you are within 20% of context capacity, stop immediately:
1. `git add -A && git commit -m "[phase]: partial — [what completed]"`
2. Update TASK_LOG.md with progress and remaining work
3. Report: "Approaching context limit. Committed at [X]. Resume from TASK_LOG."

### Rule 3: One Phase per Session as Default
Complete gate verification before proceeding to the next phase. If a phase completes early and context allows, read the next phase file and continue.

### Rule 4: Targeted File Reading
Only read files you are modifying. Use DISCOVERY_SUMMARY.md and TASK_LOG.md for context. Do not read the full implementation plan in CC — it is for human reference.

### Rule 5: Australian Spelling
Use Australian spelling throughout all generated files (organisation, behaviour, colour, licence, programme, etc.).

## Constraints

- All scripts read credentials from environment variables (`os.environ`), never hardcoded.
- Python scripts include `--break-system-packages` for pip installs.
- All API calls to Paperclip use the correct field names from DISCOVERY_SUMMARY.md.
- Agent instruction files use the 4-file Paperclip model (AGENTS.md, HEARTBEAT.md, SOUL.md, TOOLS.md).
- Budgets are set in `budgetMonthlyCents` (USD cents).
- Agent roles use only the valid enum values.
- Custom skills are stored under `skills/{skill-name}/SKILL.md`.
- Generated files go in the `river-config` repository structure.
