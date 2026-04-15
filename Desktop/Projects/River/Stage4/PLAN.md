# Stage 4 — Strategic Plan

**Programme:** stage4
**Date:** 15 April 2026
**Authority:** Jeff Dusting (founder) + Claude chat (architecture)
**Purpose:** Completes the hyper-agent-v1 integration, rationalises both knowledge bases, reconfigures WR agents, calibrates the evaluator, and produces an independent verification with adversarial critique. This is a single programme with 10 phases covering all remaining work.

---

## 1. What Has Been Built (hyper-agent-v1 — COMPLETE)

The hyper-agent-v1 programme completed in a single CC session on 15 April 2026:

- 4 Supabase tables live: `agent_traces`, `evaluation_scores`, `rubric_versions`, `correction_proposals`
- `tender_register.ca_send_approved` column applied
- Rubric v1.0 seeded (6 dimensions, threshold 3.5)
- 13 agents with trace capture and self-check deployed
- River Monitor agent created (Haiku 4.5, 1h heartbeat)
- 2 new routines: Output Evaluation Pipeline (every 2h), Agent Trace Ingestion (every 2h offset)
- 32 files, ~3,500 lines of code/config
- E2E smoke test: 8/8 PASS

## 2. What This Programme Completes

| Phase | Objective | Methodology stage |
|---|---|---|
| P0 | Dashboard integration, calibration document, Teams wiring, Mail.ReadWrite instructions | EXECUTE (remaining integration) |
| P1 | WR KB duplicate and path analysis | ASSESS |
| P2 | CBS KB audit (15,655 rows, 11× expected) | ASSESS |
| P3 | WR KB dedup + Drive reorganisation | EXECUTE |
| P4 | CBS KB dedup, entity fix, match_threshold upgrade | EXECUTE |
| P5 | WR KB retrieval quality verification | VERIFY |
| P6 | CBS KB retrieval quality verification | VERIFY |
| P7 | WR agent reconfiguration (point to WR Supabase) | EXECUTE |
| P8 | Evaluator calibration (human vs evaluator comparison) | VERIFY |
| P9 | Independent verification + adversarial critique | VERIFY + CRITIQUE |

## 3. Founder Decisions (All Resolved)

| # | Decision | Resolution |
|---|---|---|
| 1 | Teams channel | Existing River Notifications webhook. WhatsApp/Slack to backlog. |
| 2 | Dashboard placement | New tab on existing Vercel dashboard |
| 3 | Correction review cadence | Weekly batch. Informational in daily digest. |
| 4 | Calibration approach | CC generates doc from 10 real outputs, Jeff scores, CC compares |
| 5 | CBS Drive migration | Decided by CBS-P0 discovery findings (CBS-P2). Recommendation: defer unless compelling. |
| 6 | Mail.ReadWrite | CC provides Azure AD upgrade instructions |

## 4. Dependency Map

```
P0 (Completion) ──────────────────────────────────────────────────────────┐
   │                                                                      │
   ├──→ P1 (WR Discovery) ──→ P3 (WR Dedup) ──→ P5 (WR Verify) ──→ P7 (WR Reconfig) ──┐
   │         ↕ parallel ↕                                                                │
   ├──→ P2 (CBS Discovery) ──→ P4 (CBS Cleanup) ──→ P6 (CBS Verify) ──────────────────┐ │
   │                                                                                    │ │
   │    [HUMAN: Jeff scores calibration doc from P0]                                    │ │
   │         │                                                                          │ │
   │         └──────────────────────────────────────→ P8 (Calibration) ←────────────────┘ │
   │                                                       │                              │
   │                                                       ├──────────────────────────────┘
   │                                                       │
   └───────────────────────────────────────────────→ P9 (Verification + Critique)
                                                           │
                                                    [ADVANCE: back to Claude chat]
```

**Parallel execution rules:**
- P1 and P2 are independent — run in either order after P0
- P3 and P4 are independent — run in either order after their respective discovery phases
- P5 and P6 are independent
- P7 requires P5 (WR track complete)
- P8 requires P6 (CBS track complete) AND Jeff's calibration scores
- P9 requires all prior phases

## 5. Risks

| Risk | Mitigation |
|---|---|
| CBS dedup removes content that agents depend on | Dedup preserves corrections (never deleted) and keeps earliest copy. Dry-run first. |
| WR Drive reorg breaks `drive_file_id` linkage | Drive API preserves IDs on parent change. Indexer treats moves as unchanged. |
| Evaluator calibration shows systematic divergence | Rubric weights adjustable. Threshold adjustable. P8 handles this explicitly. |
| Cookie expires mid-session for Paperclip API calls | Scripts degrade gracefully. Commands generated for manual execution. |
