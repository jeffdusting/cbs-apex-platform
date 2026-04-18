# Stage 5 — Discovery Summary

**Phase:** S5-P0
**Date:** 19 April 2026
**Auditor:** Claude Code (fresh session, no Stage 4 context carried)
**Source critique:** `Stage4/ADVERSARIAL_CRITIQUE.md` (40 issues) + `Stage4/INDEPENDENT_VERIFICATION.md` (10 numbered issues)
**Method:** Live inspection of repo, CBS Supabase, WR Supabase, and local environment as of 19 April 2026.

---

## 1. Issue Status Matrix (40 issues)

Status values: **PRESENT** — unchanged since critique; **FIXED** — remediated between 16 Apr and 19 Apr; **PARTIAL** — partly addressed; **DESIGN_ONLY** — requires design doc, not code fix.

### 1a. Verification issues (IV#1–10)

| # | Severity | Title | Status | Evidence |
|---|---|---|---|---|
| IV#1 | LOW | Empty " 2" placeholder skill dirs | **PRESENT** | 6 dirs still present: `cbs-capital-framework 2`, `teams-notify 2`, `sharepoint-write 2`, `xero-read 2`, `tender-portal-query 2`, `supabase-query 2` |
| IV#2 | LOW | Phase spec row-count range | **PRESENT** | `Stage4/10-P9-VERIFICATION-CRITIQUE.md` unchanged |
| IV#3 | MEDIUM | Evaluator tables empty in production | **PRESENT** | CBS `agent_traces=0`, `evaluation_scores=0`, `correction_proposals=0` |
| IV#4 | MEDIUM | WR `prompt_templates` empty | **PRESENT** | WR `prompt_templates=0` confirmed via REST count |
| IV#5 | HIGH | WR IVFFlat at lists=40 | **PRESENT** | No rebuild commit since 16 Apr; verify at SQL level in P2 |
| IV#6 | LOW | 98 legacy waterroads rows on CBS | **PRESENT** | CBS `documents WHERE entity='waterroads'` → 98 rows |
| IV#7 | HIGH | task_type vocabulary mismatch | **PRESENT** | Task 0.2 check: 10 MISMATCH + 3 MISSING out of 13 routing entries |
| IV#8 | LOW | P9 phase spec wording | **PRESENT** | `Stage4/10-P9-VERIFICATION-CRITIQUE.md` unchanged |
| IV#9 | MEDIUM | `ingest-traces.py` never run | **PRESENT** | Confirmed by IV#3 row counts |
| IV#10 | MEDIUM | No tender past `interest_passed` | **PRESENT** | 65 tenders: 39 `interest_failed` + 25 `interest_passed` + 1 `discovered`; 0 with `ca_send_approved=true`; latest tender created 2026-04-18 |

### 1b. Investment Banker (IB.1–9)

| Ref | Severity | Title | Status | Notes |
|---|---|---|---|---|
| IB.1 | CRITICAL | Bus factor of one | **PRESENT** | No runbook for 14-day absence; no second operator briefed |
| IB.2 | CRITICAL | No backup / DR posture | **PRESENT** | No automated `pg_dump` jobs; no drill log |
| IB.3 | HIGH | Cookie-based auth for prod scripts | **PRESENT** | `PAPERCLIP_SESSION_COOKIE` still the only path for deploy scripts |
| IB.4 | HIGH | Vendor concentration | **PRESENT** | Single supplier per layer unchanged |
| IB.5 | MEDIUM | Cost predictability | **PRESENT** | No per-agent cost dashboard; budgets only enforced by Paperclip soft-alerts |
| IB.6 | MEDIUM | IP surface | **PRESENT** | No pgcrypto on `documents.content`; no repository licence |
| IB.7 | MEDIUM | Scalability untested | **PRESENT** | No load test run |
| IB.8 | LOW | Governance docs missing | **PRESENT** | No formal data-handling, IR, retention, or access policies |
| IB.9 | LOW | No tenant export | **PRESENT** | No `scripts/export-tenant.py` exists |

### 1c. Competitor's Engineer (CE.1–10)

| Ref | Severity | Title | Status | Notes |
|---|---|---|---|---|
| CE.1 | CRITICAL | Trace pipeline on free-text parsing | **PRESENT** | `scripts/ingest-traces.py` marker-based unchanged |
| CE.2 | CRITICAL | Single Railway deployment | **PRESENT** | One Railway service, no health-check-driven restart automation |
| CE.3 | HIGH | Embedding model unverified | **PRESENT** | No `embedding_model` column/metadata enforced on insert |
| CE.4 | HIGH | No CI | **PRESENT** | `.github/` directory does not exist |
| CE.5 | HIGH | Self-evaluation conflict | **PRESENT** | No independent evaluator pass on sync paths yet |
| CE.6 | MEDIUM | Byte-identical dedup only | **PRESENT** | No shingling check implemented |
| CE.7 | MEDIUM | Routine-level concurrency | **PRESENT** | Duplicate routine still unreachable via API delete |
| CE.8 | MEDIUM | No lockfile / SBOM | **PRESENT** | `scripts/requirements.txt` exists (5 lines), no lockfile, no SBOM |
| CE.9 | LOW | Divergent retrieval schemas | **PRESENT** | Intentional; documented only in discovery summaries |
| CE.10 | LOW | No retrieval regression in CI | **PRESENT** | Scripts exist, not CI-wired |

### 1d. Regulator / Auditor (RA.1–11)

| Ref | Severity | Title | Status | Notes |
|---|---|---|---|---|
| RA.1 | HIGH | No retention policy | **PRESENT** | No purge schedule on `agent_traces`, `evaluation_scores`, `correction_proposals` |
| RA.2 | HIGH | Service-role key plaintext | **PRESENT** (worse than critique) | `scripts/env-setup.sh` perms = **755 (world-readable)**; 8 secret exports; 1Password CLI v2.33.1 IS installed but unused |
| RA.3 | HIGH | Service role bypasses RLS | **PRESENT** | No limited role defined; all scripts use service-role |
| RA.4 | HIGH | Self-evaluation bypass | **PRESENT** | Same as CE.5 |
| RA.5 | MEDIUM | Audit-trail completeness not enforced | **PRESENT** | No reconciliation routine |
| RA.6 | MEDIUM | CA approval gate bypassable | **PRESENT** | No DB constraint/trigger; preflight still separate script |
| RA.7 | MEDIUM | Weekly correction review | **PRESENT** | No critical-severity alert path |
| RA.8 | MEDIUM | No separation of duties | **PRESENT** | Single operator (Jeff) for all roles |
| RA.9 | MEDIUM | Mail.ReadWrite gate | **PRESENT** | No adversarial test plan logged |
| RA.10 | LOW | No IR plan | **PRESENT** | No `docs/IR_PLAN.md` exists |
| RA.11 | HIGH | Sync-eval gate bypassed by IV#7 | **PRESENT** | Same root cause as IV#7 |

**Summary:** **40/40 issues PRESENT.** Zero issues have been remediated between Stage 4 close (16 Apr) and Stage 5 P0 (19 Apr). This is the expected state — Stage 5 is the remediation programme.

---

## 2. Supabase State (live counts, 19 Apr 2026)

### CBS (`eptugqwlgsmwhnubbqsk`)

| Table | Rows |
|---|---|
| `documents` | 1,273 |
| `agent_traces` | **0** |
| `evaluation_scores` | **0** |
| `rubric_versions` | 2 (v1.0 active, v1.1 inactive) |
| `correction_proposals` | 0 |
| `tender_register` | 65 |

Tender lifecycle distribution: `interest_failed=39, interest_passed=25, discovered=1`. **No tender past `interest_passed`** (IV#10). **No tender with `ca_send_approved=true`**. Latest tender created 2026-04-18 → the pipeline is producing new records.

Legacy `entity='waterroads'` rows on CBS: **98** (IV#6).

### WR (`imbskgjkqvadnazzhbiw`)

| Table | Rows |
|---|---|
| `documents` | 16,786 |
| `prompt_templates` | **0** (IV#4) |
| `agent_traces` | n/a (table not present on WR — 404) |
| `evaluation_scores` | n/a (table not present on WR — 404) |

The evaluator schema was only deployed to CBS. WR does not have evaluator tables — this is not a regression; it matches the Stage 4 design (evaluator is a CBS-side capability). Noted here in case P6 observability needs WR-side traces later.

---

## 3. Repository State

- **CI:** MISSING — no `.github/` directory exists.
- **Dependencies:** `scripts/requirements.txt` exists (5 lines); no lockfile (no `requirements.lock`, no `poetry.lock`, no `uv.lock`, no `Pipfile.lock`).
- **Placeholder skill dirs:** 6 present (IV#1).
- **Uncommitted changes:** The working tree shows a large set of deletions under `Desktop/Projects/River/*`. These are historical — the project folder was moved from `/Users/jeffdusting/Desktop/Projects/River` to `/Users/jeffdusting/Desktop/Projects 2/River`, and those paths are still tracked in git. These are **not Stage 5 work** and should be cleaned up in a separate commit (probably a repo-wide `git rm` of the old path tree after confirming nothing useful lives there).

---

## 4. Secrets Posture

| Check | Value |
|---|---|
| Plaintext secrets in `scripts/env-setup.sh` | 8 exports match KEY/SECRET/TOKEN/PASSWORD/PAT/WEBHOOK/DIGEST pattern (14 exports total) |
| File permissions | **755 (world-readable)** — auditor finding RA.2 understated the problem |
| 1Password CLI | **Installed** at v2.33.1 — unblocks P3 remediation |
| Secret categories present | Paperclip API key, Anthropic, Supabase service role, Voyage, Microsoft (client id/secret/tenant), Xero (client id/secret), GitHub PAT, Teams webhook, Paperclip image digest |

The 1Password CLI being already installed is the key enabler for P3 — no tool selection needed. The world-readable permission is a finding that should be remediated immediately (file perm change is a one-liner; full migration to `op run` is the P3 task).

---

## 5. Operational State

| Surface | Status | Evidence |
|---|---|---|
| CBS KB ingestion | Operational — 1,273 rows, tender pipeline active (newest 2026-04-18) | CBS `documents` count + `tender_register` latest timestamp |
| WR KB ingestion | Operational — 16,786 rows across canonical folders | WR `documents` count |
| Evaluator routines | **Dark** — 0 traces ingested, 0 evaluation scores | CBS `agent_traces`, `evaluation_scores` counts |
| Correction proposals | **Dark** — 0 rows, no critical-severity path wired | CBS `correction_proposals` count |
| CA approval gate | Never triggered — 0 tenders with `ca_send_approved=true`, 0 past `interest_passed` | Lifecycle stage distribution |
| WR governance | **Dark** — 0 prompt_templates on WR Supabase | WR `prompt_templates` count |

**The evaluator layer is built but unobserved.** This dominates the Stage 5 sequence: P1 fixes the `task_type` bug that would silently break sync-evaluation the moment traces arrived; P2 activates the pipeline; only then do P4 (governance on real data) and P6 (observability on real data) become meaningful.

---

## 6. Conflicts with PLAN.md

None material. Points worth noting:

1. **1Password CLI already installed** — PLAN.md §4 records the decision to use `op run`. Confirmed viable; no tool-selection work needed in P3.
2. **`scripts/env-setup.sh` is world-readable (755).** PLAN.md describes the file as gitignored plaintext; it is also mode 755 locally. Immediate `chmod 600` should be added to P3 as the first step before the full migration.
3. **No evaluator tables on WR Supabase.** PLAN.md's P6 observability phase should clarify whether WR sync-evaluation is in scope (requires deploying evaluator schema to WR) or out of scope (CBS-only quality layer, WR only has retrieval).
4. **Tender pipeline is producing new rows** (latest 2026-04-18). This is encouraging for IV#10 — when P2 drives one tender through the full lifecycle, there is fresh interest-stage material to work with rather than stale records.
5. **Uncommitted pre-move deletions in working tree** — housekeeping item, not a PLAN conflict. Flag separately from the S5-P0 commit.

No plan amendments required. Proceed with P1 as sequenced.

---

## 7. Next Phase

**P1 — Critical Fixes + Repo Hygiene** (`Stage 5/02-P1-CRITICAL-FIXES.md`).

P1 is the single mandatory gate before P2: it closes IV#7 (task_type mismatch) so the sync-evaluation routing works when P2 activates trace ingestion. Other P1 items (IV#1, IV#2, IV#4, IV#6, IV#8, CE.7, CE.9) are repo hygiene that can complete in the same session.

---

## Confirmation Stop

Per `01-P0-DISCOVERY.md`, P0 stops here for operator confirmation before commit/tag. Awaiting go-ahead to:
- Gate verify this summary
- Commit `S5-P0: Discovery — post-Stage 4 state assessment`
- Tag `stage5-P0-discovery`
- Append TASK_LOG entry with "Next phase: P1 (Critical Fixes)"
