# Independent Verification — Project River

**Phase:** S4-P9
**Date:** 16 April 2026
**Auditor:** Fresh-session Claude Code (no prior context from build sessions)
**Scope:** Everything built across hyper-agent-v1 (P0–P5) and stage4 (P0–P8). Two programmes, 14 phases, ~3,500 LOC across scripts/skills/agent-instructions, two Supabase projects, three Vercel/Railway services, 13 Paperclip agents.

This report records what was tested, what passed, what failed, and what is unverifiable from this session. Issues are numbered and cross-referenced to `ADVERSARIAL_CRITIQUE.md`.

---

## 1. Structural Integrity

### 1.1 File existence

All deliverables enumerated in the phase specs are present on disk.

| Class | Result |
|---|---|
| Stage 4 phase specs (`Stage4/0[0-9]-*.md`, `10-*.md`) | 11 / 11 PASS |
| Stage 4 discovery summaries (`WR-DISCOVERY-SUMMARY.md`, `CBS-DISCOVERY-SUMMARY.md`) | 2 / 2 PASS |
| Stage 4 supporting docs (`PLAN.md`, `TARGET-KB-STRUCTURE.md`, `P7-OPERATOR-DEPLOY.md`, `BOOTSTRAP-PROMPT.md`) | 4 / 4 PASS |
| Stage 4 data artefacts (`Stage4/data/*.json`) | 21 / 21 PASS — all valid JSON |
| Hyper-agent-v1 schema (`scripts/evaluator-schema.sql`, `scripts/ca-approval-gate-schema.sql`) | 2 / 2 PASS |
| Stage 4 schema (`scripts/cbs-ivfflat-rebuild.sql`, `scripts/wr-ivfflat-rebuild.sql`, `scripts/cbs-match-documents-upgrade.sql`) | 3 / 3 PASS |
| Evaluator config (`config/evaluator-rubric-v1.json`, `evaluator-rubric-v1.1.json`, `evaluation-events.json`, `calibration-comparison.json`, `calibration-scores.json`) | 5 / 5 PASS — all valid JSON |
| Skills new in this programme (`skills/self-check`, `skills/trace-capture`, `skills/wr-drive-read`) | 3 / 3 PASS |
| Monitoring agent (`agent-instructions/monitoring/AGENTS.md`) | PASS |
| Calibration deliverables (`docs/hyper-agent-v1/EVALUATOR_CALIBRATION.md`, `EVALUATOR_CALIBRATION_SCORING.xlsx`, `CALIBRATION_REPORT.md`, `MAIL_READWRITE_UPGRADE.md`) | 4 / 4 PASS |
| Heartbeat extension templates (`docs/hyper-agent-v1/heartbeat-extension-templates/tier{1,2,3}*.md`) | 3 / 3 PASS |
| Dashboard fragments (`monitoring/tender-dashboard.html`, `scripts/evaluator-dashboard-component.html`, `scripts/ca-approval-dashboard-patch.js`) | 3 / 3 PASS |

### 1.2 Python syntax

All 31 Python files newer than `Stage4/PLAN.md` compile with `py_compile` cleanly:

- `scripts/`: 25 files (evaluator pipeline, ingestion, CA preflight, dedup tools, WR reconfig, retrieval tests, calibration, lib/evaluator.py)
- `Stage4/scripts/`: 6 files (fetch + analyse + retrieval + drive folder list)

Zero `SyntaxError` / `ImportError` failures.

### 1.3 SQL files

`scripts/*.sql`: 11 files present (evaluator-schema, ca-approval-gate-schema, cbs/wr ivfflat rebuilds, cbs match-documents upgrade, fix-match-documents v1/v2, shared-knowledge-migration, tender-lifecycle-schema, tender-register-schema, wr-supabase-schema). Not executed in this session — applied state verified via live queries in §2 and §3.

### 1.4 Issues found in §1

- **Issue #1 (LOW):** Six empty placeholder skill directories exist with macOS-Finder " 2" suffix (`skills/cbs-capital-framework 2/`, `sharepoint-write 2/`, `supabase-query 2/`, `teams-notify 2/`, `tender-portal-query 2/`, `xero-read 2/`). All zero-byte. Cosmetic — they should be removed to keep the skills tree clean and avoid confusion in future tooling that walks the directory.

---

## 2. CBS Supabase Data Integrity (`eptugqwlgsmwhnubbqsk`)

All checks executed live against the project via service-role REST API.

### 2.1 Tables

| Table | Row count | Status |
|---|---:|---|
| `documents` | 1,273 | PASS |
| `tender_register` | 30 | PASS |
| `tender_lifecycle_log` | 23 | PASS |
| `governance_register` | 0 | PASS (table exists; empty) |
| `prompt_templates` | 10 | PASS |
| `agent_traces` | 0 | PASS (table exists; empty) |
| `evaluation_scores` | 0 | PASS (table exists; empty) |
| `rubric_versions` | 2 | PASS |
| `correction_proposals` | 0 | PASS (table exists; empty) |

All 9 expected tables exist with correct PostgREST permissions.

### 2.2 ca_send_approved column

`tender_register.ca_send_approved`, `ca_send_approved_by`, `ca_send_approved_at` all present and selectable. The CA approval gate column from hyper-agent-v1 P4 is live.

### 2.3 match_documents RPC

POST to `/rest/v1/rpc/match_documents` with `match_threshold=-1.0` → 200 OK. The CBS RPC accepts `match_threshold` (the gap originally flagged in the PLAN.md was already closed before stage4 began — confirmed in S4-P2 and re-confirmed here).

### 2.4 Active rubric

`SELECT * FROM rubric_versions WHERE active=true` → exactly one row, `version_tag='v1.0'`, `pass_threshold=3.5`. v1.1 is also present (`pass_threshold=3.8`) with `active=false`. This matches the deliberate P8 decision to defer activation pending a re-calibration with ≥80% agreement.

### 2.5 NULL entity check

`documents` rows with `entity IS NULL`: **0** of 1,273. PASS.

### 2.6 Post-dedup row count

The phase spec anticipated "1,500–5,000". Actual is **1,273**, below that range but matching the discovery projection exactly. The gap reflects a more aggressive collapse than estimated — not a failure. The 1,273 figure equals the unique-content-hash count from S4-P2, which is the natural floor.

### 2.7 Issues found in §2

- **Issue #2 (LOW):** Phase spec range (1,500–5,000) does not match actual (1,273). The discovery summary's projection (1,273) is correct. The phase spec range should be updated, or a note added that the lower bound is informational, not a gate.
- **Issue #3 (MEDIUM):** `agent_traces`, `evaluation_scores`, and `correction_proposals` all have **0 rows in production**. The evaluation layer has never ingested a real production trace. Calibration in P8 was performed against output text taken manually from Paperclip issue comments (`docs/hyper-agent-v1/EVALUATOR_CALIBRATION.md`), not against traces flowing through `ingest-traces.py` → `agent_traces` → `evaluate-outputs.py`. This means the trace-parsing path, the trace-ingestion routine, and the async evaluator routine have not been exercised end-to-end with real agent traffic. The smoke test (§5.1) covers a synthetic trace and proves the path works in isolation, but it is not equivalent to a 24-hour live run.

---

## 3. WR Supabase Data Integrity (`imbskgjkqvadnazzhbiw`)

All checks executed live.

### 3.1 Tables

| Table | Row count | Status |
|---|---:|---|
| `documents` | 16,786 | PASS |
| `tender_register` | 0 | PASS (table exists; intentional — WR has no tender pipeline) |
| `governance_register` | 0 | PASS (table exists; empty) |
| `prompt_templates` | 0 | PASS structurally — but see Issue #4 |

### 3.2 source_file paths

`documents` rows where `source_file ILIKE '%Imported%'`: **0**. The WR Drive reorganisation (P3) fully drained the staging prefixes. Canonical taxonomy adoption is 100%.

### 3.3 drive_file_id coverage

`documents` rows with `drive_file_id IS NULL`: **0**. Every row links back to a Drive object — incremental delta sync (BACKLOG.md §A Phase 7) has the integrity foundation it needs.

### 3.4 match_documents RPC

POST with `match_threshold=-1.0` → 200 OK. WR's RPC accepts `match_threshold`, consistent with the spec.

### 3.5 Entity distribution

waterroads = 16,786; cbs-group / shared / general = 0. Single-entity isolation at the data layer. PASS.

### 3.6 Issues found in §3

- **Issue #4 (MEDIUM):** WR `prompt_templates` is **empty** (0 rows). The four WR governance templates (board paper, board agenda, board minutes, board resolution) were ingested by `scripts/ingest-wr-templates.py` (per Day 3 task 6.5 / 7.1) into the **CBS** prompt_templates table when WR had no Supabase project. They never migrated when WR Supabase was created. WR governance routines that pull from `prompt_templates` will hit an empty table on this project — they must either fetch from CBS (entity-isolation breach) or be re-ingested into WR. P7 task 7.1 recorded "prompt_templates table exists but empty (no WR templates seeded — not a P7 concern)" but did not produce a follow-up phase to remediate.
- **Issue #5 (HIGH):** WR `documents` IVFFlat index is at `lists=40`. With 16,786 rows the optimal `lists` is ~130. Recall is visibly degraded — narrow queries return 0 hits even at `match_threshold=-1.0` (documented in P5 and again in P7 surprises). The rebuild SQL is prepared (`scripts/wr-ivfflat-rebuild.sql`) but **not applied** in either Supabase. P5 and P7 both flagged this for operator action; it remains outstanding. P9 retrieval spot checks (§5.3) all pass because they use phrases that semantically land in well-populated clusters; verbatim filename queries and short technical phrases still fail.
- **Issue #6 (LOW):** CBS Supabase contains 98 legacy waterroads rows (pre-WR-Supabase seed). They do not cause runtime leakage (WR agents now query WR Supabase exclusively) but represent a data-hygiene tail and a passive risk if any future code adds a `WHERE entity='waterroads'` filter to a CBS query. Recorded in P7 as a future cleanup; no scheduled phase owns it.

---

## 4. Cross-File Consistency

### 4.1 Rubric ↔ schema column alignment

`config/evaluator-rubric-v1.json` dimensions: `kb_grounding`, `instruction_adherence`, `completeness`, `actionability`, `factual_discipline`, `risk_handling`.

`scripts/evaluator-schema.sql` `evaluation_scores` columns: `score_kb_grounding`, `score_instruction_adherence`, `score_completeness`, `score_actionability`, `score_factual_discipline`, `score_risk_handling`.

Six dimensions, six matching columns, identical names with `score_` prefix. PASS.

### 4.2 Rubric weights sum

- v1.0: 0.25 + 0.20 + 0.15 + 0.15 + 0.15 + 0.10 = **1.00** PASS
- v1.1: 0.30 + 0.20 + 0.15 + 0.10 + 0.20 + 0.05 = **1.00** PASS

### 4.3 Task-type vocabulary

This is the largest cross-file inconsistency in the repo.

| File | Task type for "tender scan" | Task type for "go/no-go" | Task type for "monitoring digest" |
|---|---|---|---|
| `config/evaluation-events.json` | `tender_scan` (snake_case) | `go_no_go_assessment` | `monitoring_digest` |
| `skills/trace-capture/SKILL.md` | `tender-scan` (kebab-case) | `go-no-go` | `monitoring-digest` |
| `agent-instructions/monitoring/AGENTS.md` | n/a | n/a | `monitoring-digest` (kebab-case, matches trace-capture) |

The evaluation-events router is keyed by task_type. Agents emit task_types in the trace-capture vocabulary (kebab-case). At runtime, `evaluation-events.json` lookups will all miss and fall through to the implicit default (async). This is masked today because zero traces exist in production (Issue #3), but the moment ingestion goes live every "go/no-go" output that should sync-block becomes async (silent loss of the sync gate). High-impact, easy fix: pick one convention and rewrite the other file. Captured as **Issue #7 (HIGH)**.

Additionally, task-type names diverge between files:

- `evaluation-events.json` uses `go_no_go_assessment`, `white_paper_draft`, `heartbeat_idle`.
- `trace-capture/SKILL.md` uses `go-no-go`, no `white_paper_draft`, no `heartbeat_idle` (uses `delegation-routing` and `status-update` instead).
- `trace-capture` adds task types not in evaluation-events: `tender-response`, `compliance-check`, `research-brief`, `governance-audit`, `other`.

These additional types will all fall through to async by default. Unless that is the intentional default it should be made explicit.

### 4.4 Monitoring agent table references

`agent-instructions/monitoring/AGENTS.md` references `agent_traces`, `evaluation_scores`, `correction_proposals`, `documents`, plus `skills/trace-capture/SKILL.md` and `TEAMS_WEBHOOK_URL` env. All exist. PASS.

### 4.5 WR agents reference WR Supabase

P9 phase spec wording "WR agents reference `WR_SUPABASE_URL` not `SUPABASE_URL`" requires interpretation. In the actual deployed pattern, the agent runtime injects `SUPABASE_URL` via `adapterConfig.env` — the literal env var name is `SUPABASE_URL`, but the value is the WR project URL. All three WR agents' AGENTS.md explain this dual naming explicitly:

> "The `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables injected via `adapterConfig.env` point to WR Supabase (also referred to as `WR_SUPABASE_URL` / `WR_SUPABASE_SERVICE_ROLE_KEY` in shell environments that export both entities' credentials)."

P7 deploy verification confirmed `SUPABASE_URL=https://imbskgjkqvadnazzhbiw.supabase.co` on all three live agents. Live re-verification this session was not possible without a fresh Paperclip session cookie. Treated as PASS at the local-file layer; deferred to operator for next-session live spot-check.

### 4.6 CA preflight ↔ schema

`scripts/ca-sender-preflight.py` checks `tender.ca_send_approved`, `tender.ca_send_approved_by`, `tender.ca_send_approved_at`. `scripts/ca-approval-gate-schema.sql` creates exactly those three columns. Live test against tender id 11 ("buy_nsw-2026-04-13-8404") returned `BLOCKED: lifecycle_stage is 'interest_passed', expected 'ca_drafted'` — the preflight short-circuited correctly on lifecycle_stage before reaching the approval check. PASS.

### 4.7 Issues found in §4

- **Issue #7 (HIGH):** Task-type vocabulary mismatch between `config/evaluation-events.json` (snake_case) and `skills/trace-capture/SKILL.md` (kebab-case). Causes every sync-evaluation routing decision to silently fail once traces start flowing.
- **Issue #8 (LOW):** P9 phase spec wording about "WR_SUPABASE_URL not SUPABASE_URL" is misleading — the deployed pattern correctly uses `SUPABASE_URL` injected per-agent. Update the phase spec or accept the AGENTS.md explanatory text as the definitive interpretation.

---

## 5. Behavioural Verification

### 5.1 E2E smoke test

`scripts/test-evaluator-e2e.py` end-to-end run:

```
[1/8] Insert synthetic trace              PASS
[2/8] Dry-run detection                   PASS
[3/8] Live evaluation                     PASS (composite: 1.0, mode: async)
[4/8] Score written to DB                 PASS
[5/8] Correction proposal                 PASS (severity: critical)
[6/8] Sync evaluation dry-run             PASS
[7/8] Blocked-work detection              PASS
[8/8] Cleanup                             PASS
RESULT: 8 PASS, 0 FAIL, 0 SKIP
```

The synthetic-trace path through `ingest-traces` → `agent_traces` → `evaluate-outputs` → `evaluation_scores` → `correction_proposals` works. All four evaluator tables wrote and cleaned correctly.

### 5.2 Pipeline dry-runs

| Script | Result |
|---|---|
| `scripts/evaluate-outputs.py --dry-run` | PASS — "Rubric: v1.0 (threshold: 3.5) / No unscored traces to evaluate." |
| `scripts/check-blocked-work.py` | PASS — "No blocked work detected in the last 24 hours." |
| `scripts/ca-sender-preflight.py --tender-id 11` | PASS — correctly BLOCKED on lifecycle_stage |
| `scripts/ingest-traces.py --dry-run` | EXPECTED FAIL — requires `PAPERCLIP_SESSION_COOKIE` (operator-supplied) |

### 5.3 Retrieval spot checks

CBS (`Stage4/scripts/cbs-retrieval-test.py`, 10 queries, threshold=0.3):

```
queries=10  content_dupes=0  src_dupes=5  low_sim=0  empty=0  under_two_above_0.4=2
```

All 10 queries return 5 hits each. 0 content-hash duplicates (the metric that matters post-dedup). Two queries (`CA approval process for outbound communications`, `competitor analysis Aurecon WSP Jacobs`) return below-0.4 — known content-coverage gaps documented in BACKLOG §J.

WR (`scripts/wr-retrieval-test.py`, 5 queries):

```
queries: 5  dupes: 0  empty: 0  below_threshold: 0  imported_paths: 0
```

Top similarities 0.38 – 0.58. Three of five queries surface `Archive/Unclassified/` files as top hits — known issue from P5 (high-value IR docs that should be re-homed; tracked but not actioned).

### 5.4 Entity isolation

`scripts/wr-entity-isolation-test.py`:

- WR Supabase: cbs-group=0, waterroads=16,786 (clean)
- CBS Supabase: cbs-group=1,149, waterroads=98 (legacy seed; no runtime path queries this)
- Cross-entity semantic test: CBS-shaped query against WR → 0 cbs-group rows. PASS.

### 5.5 Issues found in §5

- **Issue #9 (MEDIUM):** No live trace ingestion has ever run end-to-end (Issue #3 restated from a behavioural angle). The smoke test's synthetic trace is not equivalent to a real Paperclip-issue-comment parse. Until `ingest-traces.py` runs against real comments and produces non-zero `agent_traces` rows, the entire trace-ingestion-routine half of the evaluation layer is unverified in production.
- **Issue #10 (MEDIUM):** No tender has progressed past `interest_passed` in the live `tender_register` (15 `interest_failed`, 14 `interest_passed`, 1 `discovered`, 0 in any later stage). The CA approval gate, ca-fill, sync-evaluation on `go_no_go_assessment`, and the entire downstream tender lifecycle are unexercised in production. The system has been built for a workload it has not yet served.

---

## 6. Numbered Issue List

| # | Severity | Title | Found in §  | Owning area |
|---|---|---|---|---|
| 1 | LOW | Empty " 2" placeholder skill directories | §1.4 | Repo hygiene |
| 2 | LOW | Phase spec row-count range (1,500–5,000) does not match actual (1,273) | §2.7 | Phase spec doc |
| 3 | MEDIUM | Evaluator tables empty in production — pipeline never ingested a real trace | §2.7 | Evaluation layer |
| 4 | MEDIUM | WR `prompt_templates` empty — governance templates live on CBS instead | §3.6 | WR governance |
| 5 | HIGH | WR IVFFlat index at `lists=40` — recall degraded for narrow queries | §3.6 | WR Supabase |
| 6 | LOW | 98 legacy waterroads rows still on CBS Supabase | §3.6 | Data hygiene |
| 7 | HIGH | task_type vocabulary mismatch (snake_case vs kebab-case) silently breaks sync-evaluation routing | §4.7 | Cross-file consistency |
| 8 | LOW | P9 phase spec wording on `WR_SUPABASE_URL` is misleading | §4.7 | Phase spec doc |
| 9 | MEDIUM | `ingest-traces.py` never run against real Paperclip comments | §5.5 | Evaluation layer |
| 10 | MEDIUM | No tender has reached `pursue` / `ca_drafted` / `go` — full lifecycle unexercised | §5.5 | End-to-end |

(Also relevant: Issue #11 — IVFFlat rebuild outstanding for CBS as well per S4-P4 and S4-P6 records, though P6 retrieval spot checks all PASS at current `lists=100`. Lower urgency than WR. Tracked as part of Issue #5.)

---

## 7. Verdict

**PASS WITH CAVEATS.**

Every shipped component exists, compiles, and behaves correctly under the synthetic and unit-style tests run in this audit. The CBS knowledge base has been rationalised from 15,655 to 1,273 rows with no integrity loss. The WR knowledge base has been deduplicated, reorganised, and isolated to its own Supabase project with full canonical-taxonomy adoption (0 `Imported from` rows remaining). The CA approval gate is wired end-to-end. The evaluator schema, rubric, and pipeline all work in smoke testing.

The caveats are operational, not structural:

1. **The evaluation layer has never seen a real production trace** (Issues #3 and #9). The smoke test exercises the path; the routines that would feed it in production have either not been registered (`ingest-traces` requires the `PAPERCLIP_SESSION_COOKIE`-only registration script) or have not produced output during the audit window. Calibration was done against manually-extracted Paperclip comments rather than via the live ingestion path. **The evaluator works in lab conditions; it has not been proven in production.**
2. **The task-type vocabulary mismatch (Issue #7) is a latent bug**: today it has no impact because no traces exist; the moment trace ingestion goes live, every `sync_evaluation` routing rule will silently fail. This is the single highest-priority pre-production fix.
3. **The WR retrieval index needs the `lists=130` rebuild** (Issue #5). Spot checks pass because the chosen queries land in well-populated clusters; narrow queries fail.
4. **No tender has been driven through the full lifecycle** (Issue #10). The CA approval gate, sync evaluation, and downstream lifecycle stages exist in code but have not run against a real "go" decision.

These do not invalidate the build — they are the next operating-readiness gap. Recommend: fix Issue #7 immediately (a one-file rewrite), apply the WR IVFFlat rebuild manually in Supabase SQL Editor, run `ingest-traces.py` once with a fresh cookie to populate `agent_traces` from a 24-hour Paperclip comment window, and either re-seed WR `prompt_templates` or document the cross-project lookup.

The adversarial critique in `ADVERSARIAL_CRITIQUE.md` examines the build from three hostile perspectives and produces a remediation backlog with priorities.
