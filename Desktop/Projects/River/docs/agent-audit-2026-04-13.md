# Agent Audit — 13 April 2026

**Executed by:** CBS Executive (CBSA-43)
**Framework:** `docs/agent-critical-attributes.md`

## Summary

| Metric | Value |
|---|---|
| Active agents audited | 12 (9 CBS + 3 WR) + 1 disabled duplicate |
| Critical findings (pre-remediation) | 14 (9 missing env vars, 5 missing teams-notify skill) |
| Critical findings (post-remediation) | 0 |
| Warnings | 2 (known missing company skills: xero-read, cbs-capital-framework) |
| Pending decisions | 1 (CBS Executive 2 decommission) |

## Pre-Remediation State (Discovered)

### Env Var Gaps (now fixed)

Missing `MICROSOFT_*`:
- Technical Writing
- Compliance

Missing `SUPABASE_*`, `VOYAGE_API_KEY`, `MICROSOFT_*`:
- Pricing and Commercial
- Office Management CBS
- Research CBS
- WR Executive
- Governance WR
- Office Management WR

Missing `XERO_*` (role-specific):
- Pricing and Commercial
- Governance WR

### Skills Sync Gaps (now fixed)

`teams-notify` missing from:
- Research CBS
- Technical Writing
- Compliance
- Pricing and Commercial
- Office Management CBS

### Legacy / Decommission

**CBS Executive 2** (`117c536c-497a-4889-9cd1-1b828808dc05`):
- Duplicate agent created during Day 2 setup
- 15 critical attribute failures
- Heartbeat disabled, budget $0, but $18.00 already spent this month
- No promptTemplate, no env vars, no skills
- **Recommendation:** Decommission (flagged via Teams)

## Post-Remediation State

All 12 active agents pass critical attribute checks:

### CBS Group (9 agents)

| Agent | Identity | Config | Env | Instructions | Skills | Operational |
|---|---|---|---|---|---|---|
| CBS Executive | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tender Intelligence | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tender Coordination | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Technical Writing | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Compliance | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pricing and Commercial | ✓ | ✓ | ✓ | ✓ | Warning: xero-read skill not registered at company level (env vars present) | ✓ |
| Governance CBS | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Office Management CBS | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Research CBS | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### WaterRoads (3 agents)

| Agent | Identity | Config | Env | Instructions | Skills | Operational |
|---|---|---|---|---|---|---|
| WR Executive | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Governance WR | ✓ | ✓ | ✓ | ✓ | Warning: xero-read skill not registered (env vars present) | ✓ |
| Office Management WR | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Warnings (Non-Blocking)

1. **xero-read skill** not discoverable as a company-level registered skill. Agents still have XERO_CLIENT_ID/SECRET env vars and can call Xero API directly via Python. The skill file exists at `skills/xero-read/SKILL.md` but isn't registered in Paperclip's company-level skill registry.

2. **cbs-capital-framework skill** similarly exists as a file but isn't in the company registry.

Resolution: these skills work as reference documentation for agents that need them. Can formally register via `POST /api/companies/{id}/skills/import` with local path — deferred to next sprint.

## Actions Taken During This Audit

1. Added MICROSOFT_* env vars to 2 agents (Technical Writing, Compliance)
2. Added SUPABASE_*, VOYAGE_API_KEY, MICROSOFT_* to 6 agents (Pricing, OMCBS, Research, WR Exec, Gov WR, OMWR)
3. Added XERO_* to 2 agents (Pricing and Commercial, Governance WR)
4. Synced teams-notify skill to 5 agents

## Pending Decision

**CBS Executive 2** decommission awaiting human approval. See Teams notification of 13 April 2026 07:41 AEST.

## Next Audit

Monday 2026-04-20, 9am AEST — automated via Weekly Agent Governance Audit routine.
