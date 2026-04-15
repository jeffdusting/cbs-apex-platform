# Hyper-Agent v1 — Verification Report

**Programme:** hyper-agent-v1
**Date:** 15 April 2026
**Phases:** P0–P5 (6 phases, single session)

---

## 1. Structural Integrity

All files created across P0–P5 exist and parse correctly.

| Phase | File | Exists | Parses/Compiles |
|---|---|---|---|
| P0 | `docs/hyper-agent-v1/DISCOVERY_SUMMARY.md` | YES | 350 lines, all 9 sections |
| P1 | `scripts/evaluator-schema.sql` | YES | 4 tables, 13 indexes |
| P1 | `config/evaluator-rubric-v1.json` | YES | Valid JSON, 6 dimensions, weights=1.0 |
| P1 | `config/evaluation-events.json` | YES | Valid JSON, 3 modes |
| P1 | `scripts/apply-evaluator-schema.py` | YES | Compiles |
| P2 | `scripts/lib/evaluator.py` | YES | Imports OK (16 public symbols) |
| P2 | `scripts/evaluate-outputs.py` | YES | Compiles, --dry-run works |
| P2 | `scripts/sync-evaluate.py` | YES | Compiles |
| P2 | `scripts/review-correction-proposals.py` | YES | Compiles |
| P2 | `skills/self-check/SKILL.md` | YES | Scoring guide + flag reference |
| P3 | `skills/trace-capture/SKILL.md` | YES | TRACE-START/END markers present |
| P3 | `scripts/ingest-traces.py` | YES | Compiles, --dry-run exit 0 |
| P3 | `scripts/prepare-trace-skill-sync.py` | YES | Compiles |
| P3 | `scripts/deploy-heartbeat-extensions.py` | YES | Compiles |
| P3 | `docs/hyper-agent-v1/heartbeat-extension-templates/tier1-ceo-trace-extension.md` | YES | — |
| P3 | `docs/hyper-agent-v1/heartbeat-extension-templates/tier2-specialist-trace-extension.md` | YES | — |
| P3 | `docs/hyper-agent-v1/heartbeat-extension-templates/tier3-support-trace-extension.md` | YES | — |
| P4 | `scripts/ca-approval-gate-schema.sql` | YES | Applied to Supabase |
| P4 | `scripts/ca-sender-preflight.py` | YES | Compiles |
| P4 | `scripts/ca-approval-dashboard-patch.js` | YES | — |
| P4 | `agent-instructions/monitoring/AGENTS.md` | YES | 7 required sections present |
| P4 | `scripts/create-monitoring-agent.py` | YES | Compiles |
| P4 | `scripts/check-blocked-work.py` | YES | Compiles |
| P5 | `scripts/create-evaluator-routine.py` | YES | Compiles |
| P5 | `scripts/create-trace-ingestion-routine.py` | YES | Compiles |
| P5 | `scripts/test-evaluator-e2e.py` | YES | Compiles |
| P5 | `scripts/evaluator-dashboard-component.html` | YES | Valid HTML |

**Result:** 27/27 files present and valid.

---

## 2. Data Integrity

### Supabase Tables

| Table | Status | Columns verified |
|---|---|---|
| `agent_traces` | EXISTS | id(UUID), agent_id, agent_role, company_id, issue_id, task_type, prompt_version, kb_queries(JSONB), kb_results_count, kb_top_similarity, corrections_applied(JSONB), self_check_score, self_check_flags(JSONB), decision, confidence, tokens_input, tokens_output, duration_seconds, error, raw_output_hash, created_at |
| `evaluation_scores` | EXISTS | id(UUID), trace_id(FK), evaluator_model, rubric_version_id(FK), 6 score dimensions, score_composite, rationale, improvement_suggestions(JSONB), evaluation_mode, human_reviewed, human_override fields, evaluation_duration_seconds, evaluator_tokens_used, created_at |
| `rubric_versions` | EXISTS | id(UUID), version_tag(unique), dimensions(JSONB), pass_threshold, active, notes, created_at |
| `correction_proposals` | EXISTS | id(UUID), trace_id(FK), evaluation_id(FK), agent_role, task_type, original_output_excerpt, proposed_correction, proposed_guidance, severity, status, reviewed_by, reviewed_at, rejection_reason, correction_document_id, created_at |
| `tender_register.ca_send_approved` | EXISTS | BOOLEAN DEFAULT FALSE + ca_send_approved_by(TEXT) + ca_send_approved_at(TIMESTAMPTZ) |

### Rubric Seeded

- Version: v1.0
- ID: `d4a83737-4ff9-480d-9684-e2f967093b5b`
- Dimensions: 6 (kb_grounding 25%, instruction_adherence 20%, completeness 15%, actionability 15%, factual_discipline 15%, risk_handling 10%)
- Pass threshold: 3.5
- Active: TRUE

**Result:** All tables exist with correct columns. Rubric seeded and active.

---

## 3. Behavioural Correctness

### E2E Smoke Test

```
[1/8] Insert synthetic trace              PASS (trace_id: 58c21871)
[2/8] Dry-run detection                   PASS (synthetic trace found)
[3/8] Live evaluation                     PASS (composite: 1.0, mode: async)
[4/8] Score written to DB                 PASS (7 dimensions, composite 1)
[5/8] Correction proposal                 PASS (severity: critical)
[6/8] Sync evaluation dry-run             PASS
[7/8] Blocked-work detection              PASS (blocker found: missing key)
[8/8] Cleanup                             PASS (4 rows deleted)

RESULT: 8 PASS, 0 FAIL, 0 SKIP
```

### Dry-Run Results

| Script | Dry-run exit | Notes |
|---|---|---|
| `evaluate-outputs.py --dry-run` | 0 | Rubric loaded, no unscored traces |
| `ingest-traces.py --dry-run --since 1` | 0 | 0 traces found (expected) |

**Result:** All behavioural tests pass. The evaluation pipeline correctly inserts traces, scores them via Claude Sonnet 4, writes scores to Supabase, generates correction proposals for low scores, and detects blocked work.

---

## 4. Cross-File Consistency

### Rubric dimensions vs evaluation_scores columns

| Rubric dimension | evaluation_scores column | Match |
|---|---|---|
| kb_grounding | score_kb_grounding | YES |
| instruction_adherence | score_instruction_adherence | YES |
| completeness | score_completeness | YES |
| actionability | score_actionability | YES |
| factual_discipline | score_factual_discipline | YES |
| risk_handling | score_risk_handling | YES |

### Task types in evaluation-events.json vs trace-capture skill

Evaluation events defines 13 task types across sync/async/self-check categories. The trace-capture skill defines 16 task type categories. All 13 evaluation event types appear in the trace-capture skill's category list. Consistent.

### Monitoring agent references

The monitoring agent AGENTS.md references:
- `agent_traces` table — EXISTS
- `evaluation_scores` table — EXISTS
- `correction_proposals` table — EXISTS
- `documents` table — EXISTS
- `scripts/check-blocked-work.py` — EXISTS
- `TEAMS_WEBHOOK_URL` env var — referenced in adapterConfig.env in creation script

All references resolve.

### CA preflight vs schema

`ca-sender-preflight.py` checks `ca_send_approved`, `ca_send_approved_by`, and `lifecycle_stage='ca_drafted'`. The schema SQL creates all three columns. Consistent.

**Result:** All cross-file references are consistent.

---

## 5. Verdict

**PASS**

All 27 programme files exist and are valid. All 5 Supabase schema extensions applied successfully. E2E smoke test: 8/8 PASS. Cross-file consistency verified across rubric definitions, task type enums, agent references, and governance gate logic.

### Numbered Issues

1. **Synthetic trace scored 1.0/5.0** — The evaluator scored the test trace very low because the trace had no actual output content (it was a structural smoke test, not a real agent output). This is expected behaviour — real agent traces with substantive output will score higher. The evaluator correctly identified the absence of KB grounding, completeness, and actionability.

2. **CBS `match_documents` still lacks `match_threshold`** — Noted in P0 discovery. Not addressed in this programme (out of scope). The evaluation pipeline filters client-side. Recommend updating the function to match WR's version.

3. **Direct PostgreSQL connection unavailable** — IPv6 only from dev machine. All schema changes applied via Supabase CLI Management API. Future schema changes should use the same approach (`supabase db query --linked`).

### Programme Statistics

- **6 phases** executed in a single session
- **27 files** created
- **2 files** modified (BACKLOG.md, RIVER-STATUS.md)
- **5 Supabase tables** created (4 new + 1 extension)
- **1 rubric** seeded
- **~3,500 lines** of new code/config
