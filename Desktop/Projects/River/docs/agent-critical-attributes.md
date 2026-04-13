# Agent Critical Attributes — Governance Standard

**Date:** 13 April 2026
**Authority:** Produced by CBS Executive on CBSA-43
**Enforcement:** `scripts/agent_standards.py` + `scripts/validate-agents.py`

This document defines every attribute that constitutes a correctly configured agent. Any agent missing a critical attribute should be considered non-compliant and remediated. Weekly audit catches drift.

## Severity Levels

- **Critical:** agent cannot perform core function; must be fixed immediately
- **Warning:** agent works but with degraded capability; fix within 7 days
- **Info:** advisory; fix at next governance cycle

## Category 1: Identity

| Attribute | Severity | Check | Remediation |
|---|---|---|---|
| `name` present and non-empty | Critical | `agent.name` length > 0 | Set via PATCH |
| `name` unique within company | Critical | No duplicates in company's agent list | Rename or disable duplicate |
| `role` matches Paperclip enum | Critical | One of: ceo, cto, cmo, cfo, engineer, designer, pm, qa, devops, researcher, general | Set valid role |
| `reportsTo` points to valid parent (or null for Tier 1) | Critical | Parent ID exists in same company | Set valid reportsTo |
| `title` describes the role | Warning | Length > 20 chars, includes "Agent" | Improve title |
| `capabilities` one-line summary | Warning | Length > 30 chars | Add capability statement |

## Category 2: Configuration

| Attribute | Severity | Check | Remediation |
|---|---|---|---|
| `adapterType` is claude_local | Critical | Exact match | Set correctly |
| `adapterConfig.model` is supported | Critical | Starts with `claude-` | Update model |
| `runtimeConfig.heartbeat.enabled` matches role | Warning | True for interval-based agents; on-demand agents must have `wakeOnDemand: true` | Fix heartbeat config |
| `runtimeConfig.heartbeat.intervalSec` reasonable | Info | 1800 (test) or 3600-86400 (production) | Adjust interval |
| `budgetMonthlyCents` non-zero for active agents | Critical | > 0 OR heartbeat disabled | Set budget or disable |
| `dangerouslySkipPermissions` true | Warning | Required for Bash tool use | Set to true |
| `maxTurnsPerRun` sufficient | Info | >= 100 (recommend 1000) | Increase |

## Category 3: Environment Variables

Required for ALL agents:

| Variable | Purpose | Severity |
|---|---|---|
| `SUPABASE_URL` | KB retrieval and tender_register | Critical |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase write access | Critical |
| `VOYAGE_API_KEY` | Query embeddings | Critical |
| `TEAMS_WEBHOOK_URL` | Notification delivery | Critical |
| `MICROSOFT_CLIENT_ID` | Graph API (email scanning, SharePoint) | Critical |
| `MICROSOFT_CLIENT_SECRET` | Graph API authentication | Critical |
| `MICROSOFT_TENANT_ID` | Azure AD tenant | Critical |

Role-specific:

| Variable | Required For | Severity |
|---|---|---|
| `XERO_CLIENT_ID` | governance-cbs, governance-wr, pricing-commercial | Critical for those roles |
| `XERO_CLIENT_SECRET` | Same as above | Critical for those roles |

## Category 4: Instructions (AGENTS.md / promptTemplate)

Every agent's promptTemplate (which is the AGENTS.md content) must contain:

| Section | Severity | Check Method |
|---|---|---|
| 6 hard stop prohibitions | Critical | Grep for: external comms, tender portal, Xero write, external publish, resolution execution, financial fabrication |
| Escalation path with mandatory Teams notification | Critical | Contains "Teams notification" in escalation section |
| Mandatory KB retrieval protocol | Critical | Contains "supabase-query" or "match_documents" |
| Correction retrieval (feedback-loop) | Warning | Contains "feedback-loop" reference |
| Output quality signal (source_file + similarity) | Critical | Contains "source_file" and "similarity" |
| Embedded heartbeat protocol (numbered steps) | Critical | Contains "## N. Get Assignments" or similar |
| Teams notification step with inline code | Critical | Contains `httpx.post(os.environ["TEAMS_WEBHOOK_URL"]` |

## Category 5: Skills Sync

Minimum skills for every agent:

| Skill | Severity | Purpose |
|---|---|---|
| paperclip (core) | Critical | Task management |
| supabase-query | Critical | KB retrieval |
| teams-notify | Critical | Notifications |
| feedback-loop | Warning | Correction retrieval |

Role-specific skills:

| Role | Additional Skills |
|---|---|
| Tender Intelligence | tender-portal-query, tender-scorecard, competitor-analysis, cbs-capital-framework |
| Tender Coordination | tender-workflow, cbs-capital-framework, sharepoint-write |
| Technical Writing | cbs-capital-framework, sharepoint-write |
| Compliance | cbs-capital-framework |
| Pricing and Commercial | cbs-capital-framework, xero-read |
| Governance CBS | xero-read, sharepoint-write |
| Governance WR | xero-read, sharepoint-write |
| CBS Executive / WR Executive | sharepoint-write, agent-recruitment |

## Category 6: Operational Health

| Attribute | Severity | Check | Remediation |
|---|---|---|---|
| Status is idle or running | Critical | NOT in [error, paused] | Investigate cause |
| lastHeartbeatAt within 2× interval | Warning | If interval is 6h, lastHB should be < 12h old | Invoke heartbeat, investigate if persistent |
| spentMonthlyCents < 80% of budget | Warning | Ratio check | Review activity or increase budget |
| No stuck checkout | Warning | checkoutRunId either null or recent | Release and reassign |
| pauseReason is null | Critical | Field check | Investigate pause reason |

## Usage

### For new agents

Use the agent-recruitment skill which imports from `scripts/agent_standards.py` via `build_agent_env()`. This guarantees all critical env vars are set at creation time.

### For existing agents

Run weekly: `python scripts/validate-agents.py` (or `validate-agent-env.py` for env-only checks). Use `--fix` to auto-remediate where possible.

### When adding a new attribute

1. Update this document with the new attribute, category, severity, check method
2. Update `scripts/agent_standards.py` if env/skills related
3. Update `scripts/validate-agents.py` to check the new attribute
4. Run validator with `--fix` to remediate any agents missing the new requirement

## Weekly Audit Routine

- Name: Weekly Agent Governance Audit
- Cron: `0 9 * * 1` (Monday 9am AEST)
- Assignee: CBS Executive
- Behaviour: runs full attribute audit, sends Teams notification on any non-compliance, creates remediation subtask if needed
- Next run: 2026-04-20
