# Project River — State Assessment Report

## Assessment Date: 10 April 2026
## Assessed By: CC State Assessment (4 parallel agents)

---

### 1. Executive Summary

Project River is at **effective Sprint Day 5 (Sprint 1 Complete)** with Sprints 2 and 3 also delivered. The overall health is **Partially Deployed** — core infrastructure is operational, all 12 agents are configured and running, but several implementation plan items remain unimplemented and operational issues need attention. There are **6 critical issues** and **12 warnings** identified.

The platform is live at `org.cbslab.app` with 5 companies (2 active, 3 archived), 14 agents across CBS Group (10, including 1 duplicate) and WaterRoads (3), plus 1 legacy agent on an archived company. Two end-to-end tender workflow tests have been executed (TfNSW AMSS and Sydney Metro West). Knowledge base has 1,422 embedded documents. All three hard stop layers have been validated.

Key gaps against the implementation plan: no secrets management (plaintext env vars), no goals configured, missing scripts (`paperclip-create-secrets.py`, `paperclip-create-goals-projects-routines.py`), Daily Tender Scan routine has no trigger, duplicate/legacy agents consuming budget, CAPITAL methodology documents not appearing in top semantic search results for their primary query, and the `match_documents` function has an overloaded signature issue.

---

### 2. Repository Structure

#### Root Files

| Expected File | Status | Lines | Bytes | Notes |
|---|---|---|---|---|
| docker-compose.yml | PRESENT | 52 | 1,751 | |
| supabase-schema.sql | PRESENT | 115 | 4,129 | |
| RIVER-STATUS.md | PRESENT | 127 | 4,809 | |
| operator-runbook.md | PRESENT | 881 | 33,491 | v1.1, updated Day 4 |
| future-sprints.md | PRESENT | 287 | 12,357 | |
| sprint-1-summary.md | PRESENT | 178 | 7,939 | |
| TASK_LOG.md | PRESENT | 555 | 24,420 | |
| Dockerfile | MISSING | - | - | Not required — Railway uses pre-built image |
| api-capabilities.json | MISSING | - | - | Referenced in plan but never created |
| day0-findings.md | MISSING | - | - | Content exists as archive/DISCOVERY_SUMMARY.md |
| secrets-manifest.json | MISSING | - | - | Referenced in plan, never created as file in root |

#### Scripts (22 files present)

| Script | Status | Lines | Notes |
|---|---|---|---|
| env-setup.sh | PRESENT | 20 | Contains plaintext credentials |
| ingest-knowledge-base.py | PRESENT | 179 | |
| test-graph-api.py | PRESENT | 129 | |
| test-xero-api.py | PRESENT | 181 | |
| tender-portal-query.py | PRESENT | 171 | |
| test-hard-stop-layer2.py | PRESENT | 234 | |
| paperclip-create-companies.py | PRESENT | 159 | |
| paperclip-hire-cbs-agents.py | PRESENT | 473 | |
| paperclip-hire-wr-agents.py | PRESENT | 336 | |
| paperclip-create-ticket.py | PRESENT | 120 | |
| paperclip-set-heartbeats.py | PRESENT | 180 | |
| paperclip-validate.py | PRESENT | 300 | |
| create-sharepoint-folders.py | PRESENT | 165 | |
| river-test-suite.py | PRESENT | 501 | |
| test-semantic-search.py | PRESENT | 200 | |
| insert-governance-templates.py | PRESENT | 192 | |
| ingest-wr-templates.py | PRESENT | 142 | |
| requirements.txt | PRESENT | 5 | |
| paperclip-create-projects-routines.py | PRESENT | 290 | |
| feedback-report.py | PRESENT | 148 | Sprint 2 |
| migrate-shared-knowledge.py | PRESENT | 115 | Sprint 2 |
| scorecard-backfill.py | PRESENT | 151 | Sprint 3 |

**Missing scripts from plan:**
- `paperclip-create-secrets.py` — MISSING (secrets managed via plaintext env vars instead)
- `paperclip-create-goals-projects-routines.py` — MISSING (projects/routines script exists but no goals support)

#### Agent Instructions (49 files — all present)

All 12 agent directories contain AGENTS.md, HEARTBEAT.md, SOUL.md, TOOLS.md. `company-missions.md` present.

#### Skills (8 directories — all present)

supabase-query, xero-read, sharepoint-write, teams-notify, cbs-capital-framework, tender-portal-query, feedback-loop (Sprint 2), tender-scorecard (Sprint 3).

#### Other Directories

| Directory | Status | Contents |
|---|---|---|
| knowledge-base/ | PRESENT | 229 content files + MANIFEST.md + RETRIEVAL_EVAL.md + competitors/ |
| prompt-templates/ | PRESENT | 10 templates (6 CBS + 4 WR) |
| adapters/ | PRESENT | 2 JSON templates |
| agent-config/ | PRESENT | token-budgets.md |
| monitoring/ | PRESENT | river-dashboard.html |
| docs/ | PRESENT | sarah-taylor-wr-briefing.md, jim-ellwood-cbs-briefing.md |
| day3-test-tender/ | PRESENT | test-brief.md, test-brief-2.md |
| archive/ | PRESENT | DISCOVERY_SUMMARY.md, older plan versions |

**Anomaly:** 231 duplicate " 2.md" files across knowledge-base/, agent-instructions/, skills/, adapters/, and prompt-templates/. These are macOS copy artifacts from 9 April and should be cleaned up.

---

### 3. Environment and Tooling

#### Credentials

| Variable | Status | Notes |
|---|---|---|
| PAPERCLIP_URL | SET | https://org.cbslab.app |
| PAPERCLIP_API_KEY | **UNSET** | Empty — board operator uses cookie auth |
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
| PAPERCLIP_VERSION | **NOT PRESENT** | PAPERCLIP_IMAGE_DIGEST exists instead |

**WARNING:** `env-setup.sh` contains plaintext credentials and is tracked in git. The file header says "do NOT commit to version control" but it is present in the repository.

#### Tooling

| Tool | Status | Version |
|---|---|---|
| Python | Installed | 3.14.2 |
| Node.js | Installed | 23.11.0 |
| npm | Installed | 10.9.2 |
| Docker | Installed | 29.3.1 |
| Docker Compose | Installed | 5.1.1 |
| Claude Code CLI | Installed | 2.1.100 |
| Railway CLI | Installed | 4.36.1 |

#### Python Packages

| Package | Status | Version |
|---|---|---|
| supabase | Installed | 2.28.3 |
| voyageai | Installed | 0.2.4 |
| requests | Installed | 2.33.1 |
| msal | Installed | 1.36.0 |
| httpx | Installed | 0.28.1 |
| xero-python | **NOT INSTALLED** | Listed in requirements.txt but missing |

---

### 4. Infrastructure Connectivity

| Service | Reachable | Authentication | Notes |
|---|---|---|---|
| Paperclip (org.cbslab.app) | YES (HTTP 200) | Cookie auth (session token) | Bearer auth not available — PAPERCLIP_API_KEY empty |
| Supabase | YES | Service role key | 3 tables confirmed (documents, prompt_templates, governance_register) |
| Microsoft Graph API | YES | Client credentials token acquired | SharePoint site accessible (cbsaustralia.sharepoint.com) |
| Voyage AI | YES | API key | 1024-dimension embeddings confirmed |
| GitHub API | YES | PAT authenticated | User: jeffdusting |
| AusTender RSS | **NO (HTTP 403)** | N/A | Access denied — may need User-Agent header or IP allowlist |
| Xero | Credentials SET | Browser OAuth required | Cannot validate automatically |

---

### 5. Paperclip Platform State

#### Companies (5)

| Company | Status | ID | Agents | Spend |
|---|---|---|---|---|
| CBS Group (active) | active | fafce870... | 10 | $41.99 |
| WaterRoads | active | 95a248d4... | 3 | $2.72 |
| CBS Group (old) | archived | f353f31a... | 1 (legacy) | $10.72 |
| Adventure Safety | archived | 9d3e3196... | 0 | $0 |
| MAF CobaltBlu | archived | 44f71a7a... | 0 | $0 |

#### CBS Group Agents (10 — includes 1 duplicate)

| Agent | Role | Model | Heartbeat | Budget | Spent | Status |
|---|---|---|---|---|---|---|
| CBS Executive | ceo | Opus 4.6 | 21,600s (6h) | $25.00 | $17.66 (71%) | idle |
| **CBS Executive 2** | ceo | Opus 4.6 | 3,600s (1h) | **$0** | **$18.00** | idle |
| Tender Intelligence | researcher | Sonnet 4 | 86,400s (24h) | $15.00 | $1.36 | idle |
| Tender Coordination | pm | Sonnet 4 | 14,400s (4h) | $20.00 | $1.56 | idle |
| Governance CBS | pm | Sonnet 4 | 86,400s (24h) | $15.00 | $0.28 | idle |
| Office Management CBS | general | Haiku 4.5 | 43,200s (12h) | $4.00 | $0.05 | idle |
| Research CBS | researcher | Sonnet 4 | 86,400s (24h) | $10.00 | $1.64 | idle |
| Technical Writing | engineer | Sonnet 4 | 86,400s (24h) | $25.00 | $0.55 | idle |
| Compliance | qa | Haiku 4.5 | 86,400s (24h) | $5.00 | $0.28 | idle |
| Pricing and Commercial | general | Sonnet 4 | 86,400s (24h) | $10.00 | $0.61 | idle |

**CBS Executive 2** is a duplicate agent with zero budget but $18 spent, running on a 1-hour heartbeat with Opus 4.6. This is the highest-spending agent on the platform.

**Legacy CEO agent** on the archived CBS Group company (f353f31a) has $10.72 spent with zero budget and is still heartbeating at 1-hour intervals.

#### WaterRoads Agents (3)

| Agent | Role | Model | Heartbeat | Budget | Spent | Status |
|---|---|---|---|---|---|---|
| WR Executive | ceo | Sonnet 4 | 21,600s (6h) | $15.00 | $1.58 | idle |
| Governance WR | pm | Sonnet 4 | 86,400s (24h) | $15.00 | $0.98 | idle |
| Office Management WR | general | Haiku 4.5 | 43,200s (12h) | $4.00 | $0.16 | idle |

#### Projects and Routines

| Entity | Projects | Routines | Notes |
|---|---|---|---|
| CBS Group | 4 (Onboarding, Tender Pipeline, Governance Cycle, Operations) | 2 | Daily Tender Scan has **NO schedule trigger** |
| WaterRoads | 2 (WR Governance, WR General Operations) | 1 | Board paper cycle active, next: 22 April |

#### Recent Issues (CBS Group — 18 total)

| Status | Count | Key Items |
|---|---|---|
| done | 7 | CBSA-9, 10, 13, 16, 17, 3, 4 |
| in_review | 4 | CBSA-6, 8, 11, 12 |
| blocked | 1 | CBSA-15 (E2E test, awaiting assembly) |
| todo | 1 | CBSA-18 (assembly for E2E test) |
| backlog | 1 | CBSA-14 |
| cancelled | 1 | CBSA-5 |

Two E2E tests executed:
1. **TfNSW AMSS (CBSA-6)** — full pipeline completed, in_review awaiting human review
2. **Sydney Metro West (CBSA-15)** — scorecard done (8.65/10 Go), response assembly delegated, blocked pending completion

---

### 6. Knowledge Base State

#### Local Content

- 229 unique content files with YAML front-matter (entity, category, title)
- 1,308,775 total words across all files
- MANIFEST.md accurately lists 225 entries (4 file difference due to meta files and competitors template)

#### Supabase Content

| Metric | Value |
|---|---|
| Total documents | 1,422 |
| Documents with embeddings | 1,422 (100%) |
| cbs-group documents | 1,298 |
| waterroads documents | 103 |
| shared documents | 16 (CAPITAL methodology, migrated Sprint 2) |
| general documents | 5 |
| Prompt templates | 10 |
| Governance register entries | 0 (empty) |

**All documents have category = "knowledge"** — no other category values exist. The `correction` category (Sprint 2) has no documents yet. The `competitor` category (Sprint 3) has no documents yet.

#### Semantic Search Test

Query: "CAPITAL framework whole-of-life asset management" (entity=cbs-group)

| Rank | Source File | Similarity |
|---|---|---|
| 1 | cbs-group-tender-tfnsw-amss-part12.md | 0.483 |
| 2 | cbs-group-tender-tfnsw-amss-part06.md | 0.457 |
| 3 | cbs-group-tender-tfnsw-amss-part12.md | 0.449 |
| 4 | cbs-group-tender-tfnsw-amss-part06.md | 0.449 |
| 5 | cbs-group-tender-tfnsw-amss-part12.md | 0.445 |

**Concern:** The CAPITAL methodology source files (`cbs-group-capital-methodology-part01/02/03.md`) are now entity=`shared` (migrated in Sprint 2) but the query filtered by entity=`cbs-group`. The `match_documents` function was updated to include `shared` alongside entity-filtered queries, but the function has an **overloaded signature issue** (two versions with different parameter counts) that may be causing the shared documents to not appear. The similarity scores (0.44–0.48) are moderate — below the original 0.7 threshold but above the adjusted 0.5 threshold.

---

### 7. Agent Instruction and Skill Quality

#### Hard Stop Compliance

**12/12 agents have all 4 mandatory prohibitions. Full compliance.** All agents also include two additional prohibitions (no resolution execution, no financial figure fabrication).

#### Instruction Completeness

| Section | Present | Missing |
|---|---|---|
| A. Identity/mission | 12/12 | — |
| B. Hard stop prohibitions | 12/12 | — |
| C. Delegation rules/limits | 10/12 | governance-cbs, governance-wr lack explicit delegation section |
| D. KB retrieval directive | 12/12 | — |
| E. Output quality signal | 12/12 | — |
| F. Correction retrieval | 12/12 | — |

#### Skill Files

All 8 skill files present and pass their checks:
- supabase-query: references VECTOR(1024), voyage-3.5, includes Voyage AI embedding step
- xero-read: contains read-only restriction
- All others: non-empty, properly structured

#### Governance Templates

All 10 templates present (6 CBS + 4 WR). WR resolution template has full joint authority language for Jeff Dusting and Sarah Taylor.

---

### 8. Script Integrity

- **Compilation:** 22/22 Python scripts compile cleanly (zero failures)
- **Hardcoded credentials:** Zero found across all scripts
- **Dependencies:** 4/5 required packages installed. `xero-python` missing (but codebase uses `httpx` directly for Xero calls)

---

### 9. Plan Alignment

#### Declared Status
- RIVER-STATUS.md: "Current Day: Complete (Sprint 1 finished 10 April 2026)"
- TASK_LOG.md: Sprint 1 complete, Sprint 2 complete, Sprint 3 complete

#### Effective Status
- **Sprint 1 (Days 0–5):** Substantially complete with gaps
- **Sprint 2:** Complete (feedback loop, shared knowledge)
- **Sprint 3:** Complete (scorecard, pursuit workflow, competitor intelligence)

#### Implementation Plan Gaps

**CRITICAL (must resolve):**

1. **CBS Executive 2 (duplicate agent)** — Running Opus 4.6 on 1-hour heartbeat, $18 spent with zero budget. DELETE returns 500. Must be disabled immediately.

2. **Legacy CEO agent on archived CBS Group** — Running 1-hour heartbeat, $10.72 spent. Must be disabled.

3. **Daily Tender Scan routine has no schedule trigger** — The routine exists but its triggers array is empty. It will never fire automatically. A cron trigger (`0 7 * * *`) must be added.

4. **AusTender RSS returns 403** — The `tender-portal-query` skill depends on RSS feed access. Currently blocked.

5. **`match_documents` function overloaded signature** — Two function versions exist (with and without `match_threshold`). This may cause ambiguous function calls and prevent the shared entity filter from working correctly. The Sprint 2 migration SQL may not have fully replaced the original function.

6. **Agents may not be performing actual KB retrieval** — Despite instructions requiring Voyage AI embedding + Supabase query, there is no way to verify from run logs whether agents actually call the API. CAPITAL methodology documents (now entity=`shared`) did not appear in a semantic search for "CAPITAL framework" when filtering by entity=`cbs-group`, suggesting the shared entity inclusion may not be working.

**NON-BLOCKING (should resolve):**

7. **No secrets management** — `paperclip-create-secrets.py` was never created. Agent env vars use plaintext values instead of `secret_ref` encrypted references. `env-setup.sh` contains plaintext credentials in git.

8. **No goals configured in Paperclip** — The plan specifies goals (tender excellence, governance compliance, PPP readiness) linked to projects. Goals were never created; no `paperclip-create-goals-projects-routines.py` with goals support exists.

9. **Governance register table empty** — No entries despite governance cycle running. Agents may not be writing to this table.

10. **All KB documents have category="knowledge"** — No category diversity (tender, governance, methodology, etc.) despite front-matter specifying categories. The ingest script may not be mapping front-matter categories to the Supabase `category` column.

11. **`xero-python` package not installed** — Listed in requirements.txt but absent. Codebase uses `httpx` directly, so this is cosmetic.

12. **231 duplicate " 2" files** — macOS copy artifacts throughout the repository. Should be cleaned up.

**INFORMATIONAL:**

13. **Compliance agent model mismatch** — Plan specifies Haiku 4.5 but Paperclip shows `claude-haiku-4-5-20251001` which IS Haiku 4.5 (correct).

14. **WR Governance routine interval** — Plan says routine-driven with disabled heartbeat, but agent now has 86,400s (24h) enabled heartbeat (changed for wakeOnDemand fix). Functionally equivalent.

15. **`day0-findings.md` missing** — Content exists as `archive/DISCOVERY_SUMMARY.md`. Filename mismatch with plan.

16. **`api-capabilities.json` missing** — Referenced in plan but never created. API capabilities documented in DISCOVERY_SUMMARY.md instead.

17. **No concurrent load test executed** — Day 4 plan calls for simultaneous CBS tender + CBS board paper + WR board paper. Not performed.

18. **No WR Xero OAuth connection** — Day 4 plan calls for connecting WR to Xero. Not performed.

19. **No WR joint authority test** — Day 4 plan specifies testing single-director approval rejection. Not performed.

20. **Director briefings not delivered** — Documents created but not confirmed as delivered to Sarah Taylor or Jim Ellwood.

---

### 10. Recommended Next Actions

1. **CRITICAL — Disable duplicate/legacy agents.** Disable CBS Executive 2 (set heartbeat enabled=false, budget=0) and the legacy CEO on archived CBS Group. These are burning ~$28/month on Opus at 1-hour intervals with no purpose. *[Day 2, agent configuration]*

2. **CRITICAL — Add Daily Tender Scan trigger.** The routine exists but has no cron trigger. Add `0 7 * * *` schedule trigger to activate daily AusTender monitoring. *[Day 2, routine configuration]*

3. **CRITICAL — Fix `match_documents` function.** Drop the old function signature and ensure only the 5-parameter version (with `match_threshold` and shared entity support) exists. Test that querying entity=`cbs-group` returns shared documents alongside entity-specific ones. *[Sprint 2, shared knowledge]*

4. **CRITICAL — Fix KB category mapping.** All 1,422 documents have category=`knowledge`. The ingest script should map YAML front-matter `category` values (methodology, tender, governance, capability, financial) to the Supabase `category` column. Re-ingest or update existing rows. *[Day 2, KB ingestion]*

5. **CRITICAL — Verify agent KB retrieval.** Create a test ticket that explicitly requires citing source_file names and similarity scores from a Supabase query. Verify the output contains real document references that match actual KB content. *[Day 3, workflow testing]*

6. **CRITICAL — Investigate AusTender 403.** Test with User-Agent header, check if IP allowlisting is required, or if the RSS endpoint URL has changed. The Tender Intelligence agent's daily scan depends on this. *[Day 1, AusTender registration]*

7. **NON-BLOCKING — Implement secrets management.** Create `paperclip-create-secrets.py` and migrate agent env vars from plaintext to `secret_ref` encrypted references. Remove plaintext credentials from `env-setup.sh` in git. *[Day 2, security]*

8. **NON-BLOCKING — Clean up duplicate files.** Remove all 231 " 2" files (macOS copy artifacts) from the repository. *[Housekeeping]*

9. **NON-BLOCKING — Create Paperclip goals.** Add goals (tender excellence, governance compliance, PPP readiness) and link existing projects to them per the implementation plan. *[Day 2, platform configuration]*

10. **NON-BLOCKING — Execute remaining Day 4 tests.** Perform concurrent load test, connect WR Xero OAuth, and run WR joint authority rejection test to complete the validation matrix. *[Day 4, hardening]*

---

*Assessment complete. Report generated from 4 parallel investigation agents covering repository structure, environment, infrastructure connectivity, Paperclip platform state, knowledge base content, agent instruction quality, and script integrity.*
