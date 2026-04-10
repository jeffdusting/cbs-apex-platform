# Phase 1: Infrastructure and Tooling (CC-0A)

**Prerequisites:** DISCOVERY_SUMMARY.md exists. Phase 0 complete.
**Context:** Read `DISCOVERY_SUMMARY.md` for all API field names and endpoint details.

---

## Objective

Generate all infrastructure, automation, and validation scripts for Project River. Every script uses the confirmed Paperclip API surface from the discovery audit — no assumptions, no conditional logic.

## Tasks

### Task 1.0. Record Platform Version

Create `day0-findings.md` with the confirmed platform details from DISCOVERY_SUMMARY.md:

```markdown
# Project River — Day 0 Findings

## Paperclip Version
- Docker image: ghcr.io/paperclipai/paperclip:latest
- Pinned digest: ghcr.io/paperclipai/paperclip@sha256:791f3493d101154cb8a991a3895160297fae979f50cba657032ae4ce18132bff
- Server: @paperclipai/server@0.3.1
- CLI: 2026.403.0
- Claude Code CLI: 2.1.94
- Codex CLI: 0.118.0
- Base image: node:lts-trixie-slim (Debian)
- No custom Dockerfile required

## Key Discovery Outcomes
(Reference DISCOVERY_SUMMARY.md for full details)
```

### Task 1.1. Environment Setup Script

Create `scripts/env-setup.sh`:
```bash
#!/bin/bash
# Project River — Environment Variables
# Jeff fills values once. Every script reads from these.
export PAPERCLIP_URL="https://org.cbslab.app"
export PAPERCLIP_API_KEY=""       # board operator session token or API key
export ANTHROPIC_API_KEY=""       # from Anthropic console
export SUPABASE_URL=""            # from Supabase project dashboard
export SUPABASE_SERVICE_ROLE_KEY="" # from Supabase project dashboard
export VOYAGE_API_KEY=""          # from voyageai.com
export MICROSOFT_CLIENT_ID=""     # from Azure AD
export MICROSOFT_CLIENT_SECRET="" # from Azure AD
export MICROSOFT_TENANT_ID=""     # from Azure AD
export XERO_CLIENT_ID=""          # from Xero developer portal
export XERO_CLIENT_SECRET=""      # from Xero developer portal
export GITHUB_PAT=""              # GitHub fine-grained token
export PAPERCLIP_IMAGE_DIGEST="ghcr.io/paperclipai/paperclip@sha256:791f3493d101154cb8a991a3895160297fae979f50cba657032ae4ce18132bff"
```

### Task 1.2. Docker Compose (Production)

Create `docker-compose.yml` based on the confirmed Paperclip production template from DISCOVERY_SUMMARY.md. Use the pinned image digest. Set `PAPERCLIP_DEPLOYMENT_MODE=authenticated`, `PAPERCLIP_DEPLOYMENT_EXPOSURE=public`, `PAPERCLIP_PUBLIC_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_TRUSTED_ORIGINS`, and `ANTHROPIC_API_KEY`.

For Railway deployment: this compose file is reference only — Railway uses the Docker image directly with Railway-managed PostgreSQL. Document this in a comment at the top.

### Task 1.3. Supabase Schema

Create `supabase-schema.sql` with pgvector extension, all three tables (documents, prompt_templates, governance_register), match_documents function using `VECTOR(1024)`, and all indexes. This is unchanged from the reference document Section B.7 except the embedding dimension is confirmed as 1024.

### Task 1.4. Knowledge Base Ingest Script

Create `scripts/ingest-knowledge-base.py`. Reads all .md files from `knowledge-base/`, infers entity from filename prefix, generates embeddings via Voyage AI `voyage-3.5` (1024 dimensions) using the `voyageai` Python package, inserts into Supabase documents table. Reads `VOYAGE_API_KEY` and `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from environment variables. Include `requirements.txt` (supabase, voyageai, requests).

### Task 1.5. Graph API Smoke Test

Create `scripts/test-graph-api.py`. Authenticates to Microsoft Graph using client credentials (MSAL library), lists the root SharePoint site, creates `river-integration-test.txt`, reads it back, deletes it. Uses `os.environ` for all credentials.

### Task 1.6. Xero API Smoke Test

Create `scripts/test-xero-api.py`. Prints an OAuth authorisation URL for the user to open in a browser. Accepts the callback code. Exchanges for token. Retrieves P&L summary. Includes clear instructions for the browser-based OAuth step.

### Task 1.7. Tender Portal Query

Create `scripts/tender-portal-query.py`. Queries AusTender RSS feed from data.gov.au. Filters by CBS Group sector keywords (infrastructure, asset management, systems engineering, transport, tunnels, professional engineering, advisory). Outputs structured JSON. Includes fallback mode without API auth token.

### Task 1.8. Hard Stop Layer 2 Test

Create `scripts/test-hard-stop-layer2.py`. Attempts `Mail.Send` via Graph API (should fail — permission not granted). Attempts Xero invoice creation (should fail — read-only). Reports pass/fail. Does NOT modify any agent configuration. Uses `os.environ` for credentials.

### Task 1.9. Company Creation Script

Create `scripts/paperclip-create-companies.py`. Uses the confirmed Paperclip API:

```python
POST {PAPERCLIP_URL}/api/companies
{
  "name": "CBS Group",
  "description": "CBS Group is a technical advisory firm that improves client asset performance..."
}
```

Creates four companies. Archives Adventure Safety and MAF via `POST /api/companies/{id}/archive`. Reports company IDs.

**IMPORTANT:** The API field is `description`, not `mission`. Use the full mission statement text from the Reference Document Section A.2 as the `description` value.

### Task 1.9b. Secrets Creation Script

Create `scripts/paperclip-create-secrets.py`. For each active company (CBS Group, WaterRoads), creates encrypted secrets via the Paperclip Secrets API. This must run BEFORE agent hiring, because the agent hiring scripts reference secret IDs.

```python
# For each company, create secrets for sensitive credentials:
POST {PAPERCLIP_URL}/api/companies/{companyId}/secrets
{ "name": "supabase-service-role-key", "value": "<from SUPABASE_SERVICE_ROLE_KEY env>" }
# → returns { "id": "secret-uuid-1", ... }

POST {PAPERCLIP_URL}/api/companies/{companyId}/secrets
{ "name": "microsoft-client-secret", "value": "<from MICROSOFT_CLIENT_SECRET env>" }
# → returns { "id": "secret-uuid-2", ... }

POST {PAPERCLIP_URL}/api/companies/{companyId}/secrets
{ "name": "xero-client-secret", "value": "<from XERO_CLIENT_SECRET env>" }
# → returns { "id": "secret-uuid-3", ... }

POST {PAPERCLIP_URL}/api/companies/{companyId}/secrets
{ "name": "voyage-api-key", "value": "<from VOYAGE_API_KEY env>" }
# → returns { "id": "secret-uuid-4", ... }
```

The script reads credential values from environment variables (os.environ), creates secrets per company, and writes the returned secret IDs to a JSON file (`secrets-manifest.json`) that the agent hiring scripts read. This ensures credentials are encrypted at rest in Paperclip and agents receive them via `secret_ref` — not inline plain text.

Output: `secrets-manifest.json` mapping company IDs to secret IDs by name.

### Task 1.9c. Goals and Projects Creator Script

Create `scripts/paperclip-create-goals-projects-routines.py` (replaces the previous Task 1.16 scope). This script creates company-level goals, links projects to goals, and creates routines. Goals give agents full context ancestry from company mission through to the specific task.

```python
# CBS Group Goals
POST {PAPERCLIP_URL}/api/companies/{companyId}/goals
{
  "title": "Deliver high-quality tender responses leveraging CAPITAL framework IP",
  "description": "Win work by producing technically rigorous, evidence-based tender responses that reflect CBS Group's CAPITAL methodology and value-based pricing approach",
  "level": "company",
  "status": "active"
}
# → returns goalId for tender goal

POST {PAPERCLIP_URL}/api/companies/{companyId}/goals
{
  "title": "Maintain governance compliance and investor-ready board reporting",
  "description": "Produce board papers, manage meeting cadence, and maintain the resolution register to a standard that satisfies director obligations and investor requirements",
  "level": "company",
  "status": "active"
}
# → returns goalId for governance goal

# CBS Projects — linked to goals
POST {PAPERCLIP_URL}/api/companies/{companyId}/projects
{
  "name": "CBS Tender Operations",
  "description": "Tender identification, response, and submission workflow",
  "goalIds": ["<tender-goal-id>"],
  "status": "in_progress"
}

POST {PAPERCLIP_URL}/api/companies/{companyId}/projects
{
  "name": "CBS Governance",
  "description": "Board papers, meeting management, and governance compliance",
  "goalIds": ["<governance-goal-id>"],
  "status": "in_progress"
}

POST {PAPERCLIP_URL}/api/companies/{companyId}/projects
{ "name": "CBS General Operations", "description": "Office management and ad-hoc tasks", "status": "in_progress" }

# WaterRoads Goals
POST {PAPERCLIP_URL}/api/companies/{wrCompanyId}/goals
{
  "title": "Maintain governance compliance and PPP investment readiness",
  "description": "Produce board papers tracking PPP progress, investor matters, regulatory compliance, ferry route development, and funding position to a standard that satisfies joint director obligations",
  "level": "company",
  "status": "active"
}

# WR Projects — linked to goals
POST {PAPERCLIP_URL}/api/companies/{wrCompanyId}/projects
{
  "name": "WR Governance",
  "description": "Board papers, meeting management, and governance compliance",
  "goalIds": ["<wr-governance-goal-id>"],
  "status": "in_progress"
}

# Routines (same as before)
# ... daily tender scan, 3-week governance cycle for CBS and WR
```

Accepts `--entity` flag for CBS or WR. Reports goal IDs, project IDs, and routine IDs.

### Task 1.10. CBS Agent Hiring Script

Create `scripts/paperclip-hire-cbs-agents.py`. Reads `secrets-manifest.json` (from Task 1.9b) for secret IDs. Uses the **direct creation endpoint** (board operator path):

```python
POST {PAPERCLIP_URL}/api/companies/{companyId}/agents
{
  "name": "CBS Executive",
  "role": "ceo",
  "title": "CBS Group Executive Agent",
  "capabilities": "Strategic oversight, delegation, board reporting, tender Go/No-Go decisions",
  "adapterType": "claude_local",
  "adapterConfig": {
    "cwd": "/paperclip/workspaces/cbs-executive",
    "model": "claude-sonnet-4-20250514",
    "maxTurnsPerRun": 1000,
    "dangerouslySkipPermissions": true,
    "graceSec": 15,
    "timeoutSec": 0,
    "env": {
      "SUPABASE_URL": { "type": "plain", "value": "<from env>" },
      "SUPABASE_SERVICE_ROLE_KEY": { "type": "secret_ref", "secretId": "<from secrets-manifest>", "version": "latest" },
      "MICROSOFT_CLIENT_ID": { "type": "plain", "value": "<from env>" },
      "MICROSOFT_CLIENT_SECRET": { "type": "secret_ref", "secretId": "<from secrets-manifest>", "version": "latest" },
      "MICROSOFT_TENANT_ID": { "type": "plain", "value": "<from env>" }
    }
  },
  "runtimeConfig": {
    "heartbeat": {
      "enabled": true,
      "intervalSec": 21600,
      "cooldownSec": 10,
      "wakeOnDemand": true,
      "maxConcurrentRuns": 1
    }
  },
  "budgetMonthlyCents": 2500
}
```

Create all 9 CBS agents using the role mapping, heartbeat intervals, budget table, and model assignments from the implementation plan. Set `reportsTo` for the correct org chart hierarchy (all Tier 2 agents report to CBS Executive, all Tier 3 agents report to their respective Tier 2 manager).

After creation, write the 4-file instruction bundles to each agent's `instructionsRootPath` (read from the GET response's `adapterConfig.instructionsRootPath`).

Then sync skills to each agent via `POST /api/agents/{agentId}/skills/sync` with the correct skill set per agent.

Output a summary table of all hired agents with their IDs, roles, and heartbeat config.

### Task 1.11. WaterRoads Agent Hiring Script

Create `scripts/paperclip-hire-wr-agents.py`. Same pattern as 1.10 for 3 WR agents.

### Task 1.12. Ticket Creation Utility

Create `scripts/paperclip-create-ticket.py`. Accepts `--company-id`, `--title`, `--description` (or `--file`), `--assignee-agent-id`, `--project-id`, `--priority`. Creates an issue via `POST /api/companies/{companyId}/issues`.

### Task 1.13. Heartbeat Interval Setter

Create `scripts/paperclip-set-heartbeats.py`. Accepts `--company-id` and `--mode` (`test` or `production`). For `test`: sets all agents in the company to `runtimeConfig.heartbeat.intervalSec: 1800`. For `production`: restores to configured intervals from a stored config file. Uses `PATCH /api/agents/{agentId}` with `runtimeConfig.heartbeat`.

### Task 1.14. Validation Script

Create `scripts/paperclip-validate.py`. Accepts `--check` flag with options: `companies` (confirms 4 exist), `agents-cbs` (confirms 9 agents with correct roles), `agents-wr` (confirms 3 agents), `kb-count` (reports document count in Supabase), `heartbeat-log` (checks recent activity entries). Outputs pass/fail per check.

### Task 1.15. SharePoint Folder Creator

Create `scripts/create-sharepoint-folders.py`. Uses Graph API to create: CBS Group (Board Papers/, Minutes/, Resolutions/, Tender Documents/) and WaterRoads (Board Papers/, Minutes/, Resolutions/, Tender Documents/).

### Task 1.16. (Merged into Task 1.9c)

Goals, projects, and routines are now created by `scripts/paperclip-create-goals-projects-routines.py` (Task 1.9c above), which handles the full hierarchy: goals → projects (linked to goals) → routines (linked to projects).

### Task 1.17. Monitoring Dashboard

Create `monitoring/river-dashboard.html`. A single-file HTML dashboard (Tailwind CSS via CDN, Chart.js via CDN, vanilla JS) that:
- Polls `{PAPERCLIP_URL}/api/companies/{id}/costs/by-agent` and `/api/companies/{id}/agents` every 60 seconds
- Displays company overview, agent cards with status/budget/last-heartbeat
- Colour codes: green (<80% budget), amber (80-99%), red (100%+/paused)
- **Anomaly detection:** Flags if any agent's per-heartbeat token consumption exceeds 20% of monthly budget (compares current `spentMonthlyCents` delta vs `budgetMonthlyCents`)
- Includes manual refresh button
- Configuration block at top for PAPERCLIP_URL

### Task 1.18. Automated Test Suite

Create `scripts/river-test-suite.py` with three modes:
- `--mode poc`: Runs against localhost:3100. Tests company CRUD, agent creation, heartbeat invoke, issue lifecycle, checkout/release, activity log, budget query, org chart, session persistence.
- `--mode regression`: Runs against production (PAPERCLIP_URL from env). Non-destructive checks only.
- `--mode monitor`: JSON status snapshot for the dashboard.

### Task 1.19. Requirements File

Create `scripts/requirements.txt`: supabase, voyageai, requests, msal, xero-python.

---

## Gate Verification

```bash
# 1. All scripts exist
ls scripts/env-setup.sh scripts/ingest-knowledge-base.py scripts/test-graph-api.py \
   scripts/test-xero-api.py scripts/tender-portal-query.py scripts/test-hard-stop-layer2.py \
   scripts/paperclip-create-companies.py scripts/paperclip-create-secrets.py \
   scripts/paperclip-create-goals-projects-routines.py \
   scripts/paperclip-hire-cbs-agents.py \
   scripts/paperclip-hire-wr-agents.py scripts/paperclip-create-ticket.py \
   scripts/paperclip-set-heartbeats.py scripts/paperclip-validate.py \
   scripts/create-sharepoint-folders.py \
   scripts/river-test-suite.py scripts/requirements.txt \
   monitoring/river-dashboard.html docker-compose.yml supabase-schema.sql
echo "PASS: All files present"

# 2. No hardcoded credentials
grep -r "sk-ant\|sk-proj\|Bearer " scripts/ && echo "FAIL: Hardcoded credentials found" || echo "PASS: No hardcoded credentials"

# 3. Correct API field names used
grep -r "heartbeatInterval\b" scripts/ && echo "FAIL: Old heartbeatInterval field used" || echo "PASS: Correct heartbeat field"
grep -r "NEXT_PUBLIC_APP_URL" scripts/ docker-compose.yml && echo "FAIL: Wrong env var name" || echo "PASS: Correct env var names"

# 4. Secret refs used (not inline secrets)
grep -r '"type": "secret"' scripts/paperclip-hire-*.py && echo "FAIL: Inline secrets — should use secret_ref" || echo "PASS: Using secret_ref"

# 5. Python syntax check
python3 -m py_compile scripts/paperclip-create-companies.py && echo "PASS: Syntax OK" || echo "FAIL: Syntax error"
```

**Archive point:** `git add -A && git commit -m "P1: Infrastructure — all scripts, Docker, schema, monitoring" && git tag river-p1-infrastructure`

## Phase 1 Completion

Update TASK_LOG.md:
```markdown
## Project River — Phase 1 (Infrastructure)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** river-p1-infrastructure

### Files Created
- scripts/ (21 files including secrets creation and goals/projects/routines)
- docker-compose.yml
- supabase-schema.sql
- monitoring/river-dashboard.html

### Next Phase
- Read `docs/river-sprint/03-P2-AGENT-INSTRUCTIONS.md`
- Prerequisites: None (can run in parallel with P1)
```
