# Project River — State Assessment Report (Post-Fix)

## Assessment Date: 10 April 2026 (second assessment)
## Assessed By: CC State Assessment (3 parallel agents)

---

### 1. Executive Summary

Project River is at **effective Sprint 3 complete** with Sprint 1 foundation fully operational. Overall health: **Healthy**. There are **2 critical issues** (down from 6 in the prior assessment), **5 warnings**, and **4 informational items**.

The platform is live at `org.cbslab.app` with 5 companies (2 active, 3 archived), 13 agents across CBS Group (10, including 1 disabled duplicate) and WaterRoads (3), plus 1 disabled legacy agent. Two E2E tender workflow tests have been executed. Knowledge base has 1,422 embedded documents with proper category mapping (tender: 1,016, ip: 170, governance: 154, financial: 57, methodology: 16). Semantic search correctly returns shared CAPITAL methodology documents alongside entity-specific results. All 12 agents pass all 7 instruction quality checks. All 3 hard stop layers verified.

Since the prior assessment: duplicate agents disabled, Daily Tender Scan trigger added, match_documents function fixed (shared entity search working), KB categories fixed (1,413 chunks updated), Paperclip goals created, 272 duplicate files cleaned, AusTender documented as WAF-blocked.

---

### 2. Repository Structure

| Item | Status | Size | Notes |
|---|---|---|---|
| docker-compose.yml | PRESENT | 1,751B / 52L | |
| supabase-schema.sql | PRESENT | 4,129B / 115L | |
| RIVER-STATUS.md | PRESENT | 4,809B / 127L | Understates progress (claims Sprint 1, actually Sprint 3) |
| operator-runbook.md | PRESENT | 33,491B / 881L | v1.1 |
| future-sprints.md | PRESENT | 12,357B / 287L | |
| sprint-1-summary.md | PRESENT | 7,939B / 178L | |
| TASK_LOG.md | PRESENT | 555L | |
| Dockerfile | MISSING | | Not required — uses pre-built image |
| day0-findings.md | MISSING | | Content in archive/DISCOVERY_SUMMARY.md |
| api-capabilities.json | MISSING | | Documented in DISCOVERY_SUMMARY.md instead |
| scripts/ | 22 .py + 1 .sh + 1 .txt + 2 .sql | | All compile clean |
| agent-instructions/ | 49 files (12×4 + missions) | | All present |
| skills/ | 8 SKILL.md files | | 6 planned + feedback-loop + tender-scorecard |
| prompt-templates/ | 10 templates | | 6 CBS + 4 WR |
| knowledge-base/ | 229 content + manifest + eval | | Categories fixed |
| adapters/ | 2 JSON templates | | |
| monitoring/ | river-dashboard.html | 17,815B | Cookie auth supported |
| docs/ | 2 briefings | | |

**No duplicate " 2" files remain** (272 cleaned in prior session).

---

### 3. Environment and Tooling

| Item | Status | Version |
|---|---|---|
| PAPERCLIP_URL | SET | https://org.cbslab.app |
| PAPERCLIP_API_KEY | UNSET | Empty — uses cookie auth |
| ANTHROPIC_API_KEY | SET | |
| SUPABASE_URL | SET | |
| SUPABASE_SERVICE_ROLE_KEY | SET | |
| VOYAGE_API_KEY | SET | |
| MICROSOFT_CLIENT_ID | SET | |
| MICROSOFT_CLIENT_SECRET | SET | |
| MICROSOFT_TENANT_ID | SET | |
| XERO_CLIENT_ID | SET | |
| XERO_CLIENT_SECRET | SET | |
| GITHUB_PAT | SET | |
| TEAMS_WEBHOOK_URL | SET | |
| PAPERCLIP_VERSION | NOT DEFINED | PAPERCLIP_IMAGE_DIGEST exists instead |
| Python | Installed | 3.14.2 |
| Node.js | Installed | 23.11.0 |
| Docker | Installed | 29.3.1 |
| Claude CLI | Installed | 2.1.100 |
| supabase (pip) | Installed | 2.28.3 |
| voyageai (pip) | Installed | 0.2.4 |
| msal (pip) | Installed | 1.36.0 |
| httpx (pip) | Installed | 0.28.1 |
| xero-python (pip) | NOT INSTALLED | Listed in requirements.txt |

---

### 4. Infrastructure Connectivity

| Service | Reachable | Auth | Notes |
|---|---|---|---|
| Paperclip (org.cbslab.app) | YES (200) | Cookie auth | v0.3.1, authenticated mode, authReady=true |
| Supabase | YES | Service role key | 3 tables confirmed |
| Microsoft Graph API | YES (200) | Client credentials token | SharePoint: cbsaustralia.sharepoint.com |
| Voyage AI | YES | API key | 1024-dim embeddings confirmed |
| GitHub API | YES | PAT | User: jeffdusting |
| Xero | Credentials SET | Browser OAuth required | Cannot auto-test |
| AusTender RSS | **BLOCKED (403)** | N/A | WAF/bot protection |
| AusTender OCDS API | **BLOCKED (403)** | N/A | WAF/bot protection |

---

### 5. Paperclip Platform State

#### Companies

| Company | Status | Agents | Spent | Notes |
|---|---|---|---|---|
| CBS Group (CBSA) | active | 10 (9 active + 1 disabled) | $42.21 | 20 issues, 3 goals |
| WaterRoads (WAT) | active | 3 | $2.72 | 3 issues, 1 goal |
| CBS Group (old) | archived | 1 (disabled) | $10.72 | Legacy, heartbeat disabled |
| Adventure Safety | archived | 0 | $0 | Deferred Sprint 4 |
| MAF CobaltBlu | archived | 0 | $0 | Deferred Sprint 5 |

#### CBS Agents (10)

| Agent | Model | Heartbeat | Budget | Spent | Status |
|---|---|---|---|---|---|
| CBS Executive | Opus 4.6 | 21,600s (6h) | $25 | $17.88 (72%) | idle |
| CBS Executive 2 | Opus 4.6 | **disabled** | **$0** | $18.00 | idle (disabled) |
| Tender Intelligence | Sonnet 4 | 86,400s (24h) | $15 | $1.36 | idle |
| Tender Coordination | Sonnet 4 | 14,400s (4h) | $20 | $1.56 | idle |
| Governance CBS | Sonnet 4 | 86,400s (24h) | $15 | $0.28 | idle |
| Office Management CBS | Haiku 4.5 | 43,200s (12h) | $4 | $0.05 | idle |
| Research CBS | Sonnet 4 | 86,400s (24h) | $10 | $1.64 | idle |
| Technical Writing | Sonnet 4 | 86,400s (24h) | $25 | $0.55 | idle |
| Compliance | Haiku 4.5 | 86,400s (24h) | $5 | $0.28 | idle |
| Pricing and Commercial | Sonnet 4 | 86,400s (24h) | $10 | $0.61 | idle |

#### WR Agents (3)

| Agent | Model | Heartbeat | Budget | Spent | Status |
|---|---|---|---|---|---|
| WR Executive | Sonnet 4 | 21,600s (6h) | $15 | $1.58 | idle |
| Governance WR | Sonnet 4 | 86,400s (24h) | $15 | $0.98 | idle |
| Office Management WR | Haiku 4.5 | 43,200s (12h) | $4 | $0.16 | idle |

#### Routines

| Entity | Routine | Agent | Next Run | Ever Triggered |
|---|---|---|---|---|
| CBS | 3-Week Governance Cycle | Governance CBS | 2026-04-13T09:00 | No |
| CBS | Daily Tender Scan | Tender Intelligence | 2026-04-11T07:00 | No |
| WR | Board paper preparation | Governance WR | 2026-04-22T08:00 | No |

**Note:** No routine has ever fired. The Daily Tender Scan trigger was added during this session. First fire expected 11 April 07:00.

#### Goals

| Entity | Goal | Status |
|---|---|---|
| CBS | Tender Excellence | planned |
| CBS | Governance Compliance | planned |
| CBS | Company mission (auto-generated) | active |
| WR | Governance Compliance and PPP Readiness | planned |

**Note:** Duplicate CBS goals exist (two "Tender Excellence" and two "Governance Compliance" — first pair from 09 April, second from 10 April).

---

### 6. Knowledge Base State

| Metric | Value |
|---|---|
| Local content files | 229 |
| Supabase documents | 1,422 (100% with embeddings) |
| By entity | cbs-group: 1,298 / waterroads: 103 / shared: 16 / general: 5 |
| By category | tender: 1,016 / ip: 170 / governance: 154 / financial: 57 / methodology: 16 / knowledge: 9 |
| Prompt templates | 10 |
| Governance register | 0 (empty) |

#### Semantic Search Test

Query: "CAPITAL framework whole-of-life asset management" (entity=cbs-group, count=15)

| Rank | Similarity | Source File | Entity |
|---|---|---|---|
| 1 | **0.592** | cbs-group-capital-methodology-part03.md | **shared** |
| 2 | **0.559** | cbs-group-capital-methodology-part01.md | **shared** |
| 3 | **0.558** | cbs-group-capital-methodology-part01.md | **shared** |
| 4 | **0.556** | cbs-group-capital-methodology-part01.md | **shared** |
| 5 | **0.548** | cbs-group-capital-methodology-part03.md | **shared** |
| 6 | 0.539 | cbs-group-tender-dhs-vic-kpi-part19.md | cbs-group |
| 7 | 0.528 | cbs-group-capital-methodology-part03.md | shared |
| 8 | 0.512 | cbs-group-tender-dhs-vic-kpi-part13.md | cbs-group |

**Shared entity inclusion: CONFIRMED WORKING.** CAPITAL methodology documents rank #1–#5.

---

### 7. Agent Instruction and Skill Quality

#### Hard Stop Compliance: 12/12 PASS (all 4 prohibitions + 2 additional)

#### Instruction Completeness: 12/12 PASS on all 7 checks

| Check | Result |
|---|---|
| A. Identity/mission | 12/12 |
| B. Hard stop prohibitions | 12/12 |
| C. Delegation rules | 12/12 |
| D. Mandatory KB retrieval protocol | 12/12 |
| E. Output quality signal (source_files + scores) | 12/12 |
| F. Correction retrieval | 12/12 |
| G. Teams notification on escalation | 12/12 |

#### Skills: 8/8 PASS

supabase-query (includes Voyage AI embedding step), xero-read (read-only restriction), sharepoint-write, teams-notify, cbs-capital-framework, tender-portal-query (AusTender blocked documented), feedback-loop, tender-scorecard.

#### Governance Templates: 10/10 PASS

WR resolution template: Jeff Dusting + Sarah Taylor joint authority confirmed.

---

### 8. Script Integrity

- **Compilation:** 22/22 PASS
- **Hardcoded credentials:** 0 found
- **Requirements:** 4/5 installed (xero-python missing; httpx used but unlisted)

---

### 9. Plan Alignment

**Declared:** Sprint 1 Complete
**Effective:** Sprint 3 Complete (Sprint 2 feedback loop + shared knowledge, Sprint 3 scorecard + workflow + competitor intelligence all delivered)

**RIVER-STATUS.md understates progress** — should be updated to reflect Sprint 3 completion.

---

### 10. Recommended Next Actions

1. **CRITICAL — Implement AusTender email scanning.** The Daily Tender Scan routine fires but has no working data source. Implement email-based tender scanning via Graph API Mail.Read to parse AusTender notification emails. *[Blocks tender intelligence functionality]*

2. **CRITICAL — Verify CBSA-20 KB retrieval test results.** Check CBS Executive's response to the mandatory KB query test to confirm agents actually call Voyage AI + Supabase (not training data). *[Blocks confidence in agent KB compliance]*

3. **NON-BLOCKING — Update RIVER-STATUS.md.** Currently claims Sprint 1 complete but Sprint 2 and 3 are also delivered. Update to reflect actual state.

4. **NON-BLOCKING — Remove duplicate Paperclip goals.** CBS has two pairs of "Tender Excellence" and "Governance Compliance" goals (created 09 Apr and 10 Apr). Delete the older pair.

5. **NON-BLOCKING — Add httpx to requirements.txt.** Used by feedback-report.py, scorecard-backfill.py, and referenced in skill documentation but not listed.

6. **NON-BLOCKING — Install xero-python or remove from requirements.txt.** Listed but not installed; codebase uses httpx directly for Xero calls.

7. **NON-BLOCKING — Commit uncommitted changes.** DISCOVERY_SUMMARY.md deletion not staged. Several tracked files modified.

8. **INFORMATIONAL — No routine has ever fired.** Daily Tender Scan, 3-Week Governance Cycle, and WR Board Paper routines all show `lastTriggeredAt: null`. First fires expected 11–22 April.

9. **INFORMATIONAL — Governance register table empty.** May not be in active use yet.

10. **INFORMATIONAL — env-setup.sh contains plaintext credentials in git.** Should migrate to secrets management in a future sprint.

---

*Assessment complete. 3 parallel agents covered repository structure, environment, infrastructure connectivity, Paperclip platform state, knowledge base content, agent instruction quality, script integrity, and plan alignment.*
