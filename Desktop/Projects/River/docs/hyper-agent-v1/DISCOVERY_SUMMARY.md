# Hyper-Agent v1 — Discovery Summary

**Phase:** P0
**Date:** 15 April 2026
**Purpose:** Persistent reference for all subsequent phases. Source files should not be re-read unless being modified or a specific value must be confirmed.

---

## 1. Repository Structure

```
River/
  agent-instructions/          12 agent dirs x 4 files + company-missions.md = 49 files
    cbs-executive/             AGENTS.md, HEARTBEAT.md, SOUL.md, TOOLS.md
    tender-intelligence/       (same 4-file pattern for all agents)
    tender-coordination/
    technical-writing/
    compliance/
    pricing-commercial/
    governance-cbs/
    office-management-cbs/
    research-cbs/
    wr-executive/
    governance-wr/
    office-management-wr/
  skills/                      14 skill directories
    supabase-query/            KB semantic search (Voyage AI + Supabase)
    feedback-loop/             Correction retrieval
    ca-fill/                   Confidentiality agreement auto-fill
    tender-scorecard/          7-dimension qualification scorecard
    tender-workflow/           Bronze/Silver/Gold response tiers
    tender-portal-query/       AusTender query
    teams-notify/              Teams webhook notifications
    sharepoint-write/          SharePoint file upload
    cbs-capital-framework/     CAPITAL methodology
    xero-read/                 Xero read-only
    graph-mail-read/           M365 Graph mail read
    competitor-analysis/       Competitor profile lookup
    agent-recruitment/         CEO self-service agent creation
    token-efficiency/          Token budget management
  scripts/                     ~35 Python/SQL/Bash scripts
    env-setup.sh               CBS env vars
    tender-scan.py             Daily tender scan (extracted from AGENTS.md)
    tender-inbound-monitor.py  CA sent detection + doc filing
    cbs-kb-email-intake.py     CBS KB email intake pipeline
    wr-kb-email-intake.py      WR KB email intake pipeline
    wr-index-drive-content.py  WR Drive-to-Supabase indexer
    ingest-correction.py       Correction ingestion
    ingest-knowledge-base.py   KB ingestion with chunking
    scorecard-backfill.py      Backfill scorecards for existing tenders
    paperclip-*.py             Agent/company/routine management
    test-*.py                  Integration tests
    *.sql                      Schema migrations
  knowledge-base/              ~225 structured content files + Shipley + corrections + competitors
    corrections/               4 correction files
    competitors/               5 competitor profiles + template
    Shipley/                   Source Shipley files (xls, doc, potx)
    MANIFEST.md                225 entries, 1,308,775 words
    RETRIEVAL_EVAL.md          5 test queries
  monitoring/
    tender-dashboard.html      Lifecycle-aware tender pipeline view
    manager-dashboard.html     Agent activity dashboard (local-only — CORS)
    river-dashboard.html       Original simple dashboard
    api/supabase.js            Vercel edge serverless proxy
    vercel.json                Vercel config
  prompt-templates/            10 governance templates (6 CBS, 4 WR)
  docs/
    hyper-agent-v1/            This programme's specs + plan
    current-state-audit-v2/    7 audit artefacts (14 April 2026)
    session-restart-prompt.md  Most current operational state
  archive/                     Sprint 0 discovery + old plan versions
  adapters/                    2 adapter templates (Manus, OpenClaw)
  agent-config/                token-budgets.md
  day3-test-tender/            2 test brief files
  Root files: BACKLOG.md, RIVER-STATUS.md, TASK_LOG.md, operator-runbook.md,
              future-sprints.md, sprint-1-summary.md, docker-compose.yml,
              supabase-schema.sql, secrets-manifest.json, .gitignore
```

**File counts:**
| Category | Count |
|---|---|
| Agent instructions | 49 |
| Skills | 14 |
| Scripts | ~35 |
| KB content files | ~225+ |
| Governance templates | 10 |
| Monitoring/dashboard | 5 |
| Docs/audit | ~20 |
| **Total tracked files** | **~360** |

---

## 2. Current Tables

### CBS Supabase (`eptugqwlgsmwhnubbqsk`)

| Table | Row count | Key columns |
|---|---|---|
| `documents` | **15,655** | id, entity, source_file, title, content, embedding(1024), category, metadata(JSONB), created_at |
| `tender_register` | 23 | id, reference, source, title, agency, decision, lifecycle_stage + 21 lifecycle columns (see below) |
| `tender_lifecycle_log` | 23 | id, tender_id(FK), from_stage, to_stage, actor, rationale, metadata, created_at |
| `governance_register` | 0 | id, entity, document_type, title, status, author_agent_id, approver, content, metadata |
| `prompt_templates` | 10 | id, name(unique), template, variables(JSONB), entity, category, version |

**Tender lifecycle columns on `tender_register`:** lifecycle_stage (11 valid states: discovered, interest_passed, interest_failed, pursue, ca_drafted, ca_sent, docs_received, go_no_go_pending, go, no_go, withdrawn), interest_score, interest_reasons, interest_assessed_at, pursue_decided_by/at, tender_contact_name/email, ca_template_drive_id, ca_filled_drive_id, ca_drafted_at, ca_sent_at/via/message_id, docs_received_at, drive_folder_id/url, doc_count, go_no_go_scorecard/recommendation/assessed_at.

**`documents` entity distribution:** entity values include `cbs-group`, `shared`, `waterroads` (41 rows from initial ingest), and possibly more from email intake. The 15,655 count is significantly higher than the baseline 1,422 chunks from initial KB ingest — likely from CBS KB Email Intake routine running repeatedly, plus Shipley docs, competitor profiles, and corrections.

**Functions:**
- `match_documents(query_embedding, match_count, filter_entity, filter_category)` — vector cosine similarity search. Note: CBS version does NOT have `match_threshold` parameter (WR version does).

### WR Supabase (`imbskgjkqvadnazzhbiw`)

| Table | Key details |
|---|---|
| `documents` | 3,021 files → 19,301 chunks. entity default `waterroads`. Has `drive_file_id` and `drive_modified` columns (CBS does not). |
| `tender_register` | Exists but separate from CBS. Same lifecycle columns not applied. |
| `governance_register` | Exists with `drive_file_id` and `sharepoint_url` columns (CBS does not). |
| `prompt_templates` | Exists. |

**Functions:**
- `match_documents(query_embedding, match_count, match_threshold, filter_entity, filter_category)` — has `match_threshold` parameter (default 0.0).

**Schema differences between CBS and WR:**
1. WR `documents` has `drive_file_id` + `drive_modified` columns; CBS does not.
2. WR `match_documents` has `match_threshold` parameter; CBS does not.
3. WR `governance_register` has `drive_file_id` + `sharepoint_url`; CBS has `content` TEXT.
4. WR IVFFlat index uses `lists=40`; CBS uses `lists=100`.

---

## 3. Agent Configuration

### CBS Group (company ID: `fafce870-b862-4754-831e-2cd10e8b203c`)

| Agent | ID | Tier | Model | Heartbeat | Budget |
|---|---|---|---|---|---|
| CBS Executive | `01273fb5` | 1 (CEO) | Opus 4.6 | 2h (updated from 6h) | $100/mo (updated from $25) |
| Tender Intelligence | `1dcabe74` | 2 | Sonnet 4 | 24h | $15/mo |
| Tender Coordination | `69aa7cc8` | 2 | Sonnet 4 | 2h (updated from 4h) | $90/mo (updated from $20) |
| Technical Writing | `31230e7a` | 3 | Sonnet 4 | disabled | $25/mo |
| Compliance | `9f649467` | 3 | Sonnet 4 | disabled | $5/mo |
| Pricing and Commercial | `43468bee` | 3 | Sonnet 4 | disabled | $10/mo |
| Governance CBS | `beb7d905` | 2 | Sonnet 4 | disabled (routine) | $15/mo |
| Office Management CBS | `d5df66da` | 2 | Haiku 4.5 | 12h | $4/mo |
| Research CBS | `a0bb2e2a` | 3 | Sonnet 4 | disabled | $10/mo |

Note: RIVER-STATUS.md table shows original budget/heartbeat values. Post-Sprint 3 enhancements (top of RIVER-STATUS.md) updated CBS Executive to $100/2h and Tender Coordination to $90/2h. The actual running values need confirmation via Paperclip API (cookie expired — see section 6).

### WaterRoads (company ID: `95a248d4-08e7-4879-8e66-5d1ff948e005`)

| Agent | ID | Tier | Model | Heartbeat | Budget |
|---|---|---|---|---|---|
| WR Executive | `00fb11a2` | 1 (CEO) | Sonnet 4 | 6h | $15/mo |
| Governance WR | `10adea58` | 2 | Sonnet 4 | disabled (routine) | $15/mo |
| Office Management WR | `9594ef21` | 2 | Haiku 4.5 | 12h | $4/mo |

### Agent instruction structure (all 12 agents)

Each agent directory has 4 files:
- `AGENTS.md` — full instructions, hard stops, delegation rules, heartbeat protocol
- `HEARTBEAT.md` — step-by-step heartbeat execution protocol
- `SOUL.md` — identity and personality context
- `TOOLS.md` — available tools and skills reference

All 12 `AGENTS.md` files include:
- 6 hard stop prohibitions (no send, no submit, no Xero write, no publish, no approve, no fabricate financials)
- Named human escalation paths (Jeff for CBS, Jeff + Sarah for WR)
- Mandatory KB retrieval protocol
- Correction retrieval step (feedback-loop skill)
- Output quality signal block
- Confidence signalling

---

## 4. Active Routines

Seven Paperclip routines are active (from restart prompt — RIVER-STATUS.md only shows 3):

| # | Routine | Schedule | Agent | Entity |
|---|---|---|---|---|
| 1 | Daily Tender Scan | 7am AEST (0 21 * * * UTC) | Tender Intelligence | CBS |
| 2 | Daily Tender Inbound Monitor | 8am UTC | Tender Coordination | CBS |
| 3 | CBS KB Email Intake | Every 2h AEST business hours | CBS Executive | CBS |
| 4 | WR KB Email Intake | Every 2h AEST business hours | WR Executive | WR |
| 5 | 3-Week Governance Cycle | 8am 1st & 22nd (0 8 1,22 * *) | Governance CBS | CBS |
| 6 | Weekly Agent Governance Audit | Weekly | Unknown agent | CBS |
| 7 | Board Paper Prep | Periodic | Unknown agent | CBS/WR |

Additionally, WR has its own Board Paper Preparation Cycle routine (Governance WR, same cron as CBS).

Note: A duplicate Daily Tender Scan routine exists and cannot be deleted via API. Fires twice; agent processes once (idempotent).

---

## 5. Existing Patterns

### 5.1 Script Extraction Pattern

Agent instructions reference external Python scripts rather than embedding inline code. The script is stored in `scripts/`, called by the agent during heartbeat, and uses environment variables for credentials. Examples:
- `scripts/tender-scan.py` — called by Tender Intelligence during daily scan
- `scripts/tender-inbound-monitor.py` — called by Tender Coordination for inbound monitoring
- `scripts/cbs-kb-email-intake.py` / `scripts/wr-kb-email-intake.py` — email intake pipelines

### 5.2 Correction Ingestion Pattern

1. Operator writes a correction file in `knowledge-base/corrections/` with YAML front-matter (`category: correction`, `agent_role`, `task_type`, `correction_date`)
2. Ingested via `scripts/ingest-knowledge-base.py --file <path> --entity <entity> --category correction` (or `scripts/ingest-correction.py`)
3. Stored in `documents` table with `category='correction'`
4. Agents retrieve via `feedback-loop` skill: query `documents` where `category=eq.correction` and `metadata->>agent_role=eq.{role}`, plus universal corrections (`agent_role='all'`)
5. Applied before producing substantive output

### 5.3 Lifecycle State Machine Pattern

`tender_register.lifecycle_stage` with 11 valid states enforced by CHECK constraint:
```
discovered → interest_passed → pursue → ca_drafted → ca_sent → docs_received → go_no_go_pending → go
           → interest_failed                                                                      → no_go
                              → withdrawn (from any active state)
```
All transitions logged to `tender_lifecycle_log` (tender_id, from_stage, to_stage, actor, rationale, metadata, created_at).

### 5.4 Idempotent Sync Pattern

- **Email intake:** Uses `metadata.email_message_id` tracking. Each processed email ID stored in metadata to prevent re-processing.
- **WR Drive indexer:** Uses `drive_file_id` + `drive_modified` check. If file already indexed and modification time unchanged, skip.
- **Tender scan:** Uses `(reference, source)` unique index on `tender_register`. Duplicate inserts fail gracefully.

### 5.5 Vercel Serverless Proxy Pattern

`monitoring/api/supabase.js` is a Vercel Edge Function that:
1. Reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Vercel environment variables (server-side only)
2. Dashboard calls `/api/supabase?path=/rest/v1/tender_register&select=*&...`
3. Proxy extracts `path` parameter, builds destination URL to Supabase REST API
4. Forwards all other query parameters and request body
5. Injects `apikey` and `Authorization` headers with the service role key
6. Returns response with `Access-Control-Allow-Origin: *`

**Key design points:**
- Service role key never reaches the browser
- Supports GET and POST (for RPC calls)
- Forwards `Prefer` header (needed for count queries)
- Forwards `Content-Range` header (needed for pagination)
- Any new dashboard panel (evaluator scores, CA approval toggle) must follow this same proxy pattern

### 5.6 Agent Instruction Deployment Pattern

Local AGENTS.md edits are necessary for version control but do NOT reach the Paperclip runtime. To deploy:
```python
httpx.patch(f"{PAPERCLIP_API_URL}/api/agents/{AGENT_ID}",
    headers={"Cookie": f"__Secure-better-auth.session_token={COOKIE}", "Content-Type": "application/json"},
    json={"adapterConfig": {**current_config, "promptTemplate": new_content}})
```
Always verify by reading back the agent and checking key strings in promptTemplate.

---

## 6. Credential Status

| Variable | Status | Notes |
|---|---|---|
| `SUPABASE_URL` | SET, WORKING | CBS Supabase responds |
| `SUPABASE_SERVICE_ROLE_KEY` | SET, WORKING | Authenticated requests succeed |
| `VOYAGE_API_KEY` | SET, WORKING | Embedding dim 1024 confirmed |
| `PAPERCLIP_API_URL` | SET | Default `https://org.cbslab.app` |
| `PAPERCLIP_SESSION_COOKIE` | SET, **EXPIRED** | API call returned error — cookie needs refresh |
| `ANTHROPIC_API_KEY` | NOT CHECKED | Required for evaluator scoring calls in P2 |
| `WR_SUPABASE_URL` | NOT CHECKED | In `.secrets/wr-env.sh` |
| `WR_SUPABASE_SERVICE_ROLE_KEY` | NOT CHECKED | In `.secrets/wr-env.sh` |
| `MICROSOFT_CLIENT_ID/SECRET/TENANT_ID` | NOT CHECKED | Azure AD app registration |
| `XERO_CLIENT_ID/SECRET` | NOT CHECKED | Xero developer app |
| `TEAMS_WEBHOOK_URL` | NOT CHECKED | Power Automate workflow |

**Critical for this programme:**
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — needed for all phases (schema changes, data queries). WORKING.
- `ANTHROPIC_API_KEY` — needed for P2 evaluator scoring calls. Must be verified before P2.
- `PAPERCLIP_SESSION_COOKIE` — needed for P3 (heartbeat extension deployment) and P4 (monitoring agent creation). Must be refreshed before those phases.

---

## 7. Post-Audit Changes

**No commits since the v2 audit on 14 April 2026.** `git log --oneline --since="2026-04-14"` returned empty.

The most recent commits are:
```
787f175 WR Phase 2: rclone instructions for 31GB bulk migration
4bd36d8 WR Phase 1: Supabase schema for waterroads-kb project
298d63a WR Phase 1: created folder structure in Google Drive
4d25790 Phase 1 WR migration: step-by-step instructions for Google Cloud + Supabase setup
de51714 Agent governance framework: critical attributes + audit + weekly routine
```

These are all pre-audit. The working tree has unstaged changes:
- Modified: `agent-instructions/tender-coordination/AGENTS.md`, `agent-instructions/tender-intelligence/AGENTS.md`, `monitoring/manager-dashboard.html`, `skills/feedback-loop/SKILL.md`
- Deleted (from root, staged): several old phase spec files that were moved to `archive/`

The uncommitted modifications likely represent the post-Sprint 3 enhancements and audit follow-ups that were applied to the running agents via Paperclip API PATCH but not yet committed to git.

---

## 8. Known Operational Issues

1. **Manager dashboard CORS blocker.** Paperclip API calls with `credentials: include` fail cross-origin from Vercel. Manager dashboard (`manager-dashboard.html`) is local-only. Any new UI for evaluator/CA approval must use the Supabase serverless proxy (`api/supabase.js`), not the Paperclip API.

2. **ARTC tender notifications not arriving.** Registered at `portal.tenderlink.com/artc` but zero emails received. Needs manual portal verification of notification settings and registered email address.

3. **Duplicate Daily Tender Scan routine.** Cannot be deleted via API. Fires twice; agent processes once (idempotent). Harmless.

4. **Mail.ReadWrite not enabled.** Microsoft Graph has Mail.Read only. Email intake uses `metadata.email_message_id` tracking for idempotency instead of `isRead` flag. Upgrading to Mail.ReadWrite recommended for improved reliability.

5. **Paperclip session cookie fragility.** `__Secure-better-auth.session_token` expires after a few hours. No API key support. Cookie rotation is manual. Apps Script email intake (rivertasks@cbs.com.au) has alerting on 401/403.

6. **3 archived Paperclip companies.** Adventure Safety, MAF CobaltBlu, orphan CBS Group — soft-deleted but cannot be hard-deleted via API (500 error, likely FK constraints).

7. **CBS Executive 2 terminated.** Duplicate agent (`117c536c`) terminated on 14 April 2026. Soft-deleted; won't run heartbeat.

---

## 9. Conflicts or Surprises

### 9.1 Documents count discrepancy
PLAN.md states "1,422+ documents" in CBS Supabase. Actual count is **15,655 rows**. This is ~11x the baseline. Likely sources: CBS KB Email Intake routine running every 2 hours since mid-April, Shipley document ingestion, competitor profiles, corrections, and potential re-ingestion. The evaluator pipeline design should account for this larger dataset.

### 9.2 RIVER-STATUS.md not current
RIVER-STATUS.md shows only 3 routines; restart prompt lists 7. Budget/heartbeat values in the agent table are stale (pre-enhancement). The restart prompt (`docs/session-restart-prompt.md`) is the more authoritative source for current operational state.

### 9.3 CBS `match_documents` lacks `match_threshold`
WR's `match_documents` function has a `match_threshold` parameter; CBS's does not. This means CBS semantic search returns all results regardless of similarity score. The evaluator pipeline must filter results client-side or the function should be updated.

### 9.4 No conflicts with PLAN.md architecture decisions
All PLAN.md decisions (hybrid evaluator model, trajectory capture, prompt versioning via git hash, governance gates, monitoring agent, Hermes deferral, tender lifecycle as benchmark domain) are consistent with the current codebase. No contradictions found.

---

## 10. Tables to Create

All four evaluator-related tables do **not yet exist** in CBS Supabase and must be created in P1:

| Table | Purpose | Status |
|---|---|---|
| `evaluation_scores` | System-of-record quality scores per agent output | NOT FOUND |
| `agent_traces` | Structured JSON traces from agent heartbeat outputs | NOT FOUND |
| `rubric_versions` | Rubric configuration with dimension weights and thresholds | NOT FOUND |
| `correction_proposals` | Evaluator-generated correction proposals awaiting human review | NOT FOUND |

The existing `documents` table (with `category='correction'`) already supports correction storage. The `correction_proposals` table is a new queue for auto-generated proposals that need human approval before being ingested as corrections.

Additionally, the `tender_register` table may need a `ca_send_approved` boolean column (per PLAN.md section 3.5, governance gate #1) — to be confirmed in P4.
