# Programme: stage4

## Context

Project River is a 13-agent AI workforce on Paperclip AI v0.3.1 (Railway) with Supabase + pgvector + Voyage AI for retrieval. The hyper-agent-v1 programme completed on 15 April 2026, delivering the evaluation layer (4 new Supabase tables, evaluation pipeline, trace capture, monitoring agent, governance gates). This programme completes the remaining integration, rationalises both knowledge bases, reconfigures WR agents, calibrates the evaluator, and produces an independent verification with adversarial critique.

**All strategic decisions are in `stage4/PLAN.md`.** CC reads it but does not override.

## Phase Sequence

| Phase | File | Objective | Depends on |
|---|---|---|---|
| P0 | `01-P0-COMPLETION.md` | Dashboard integration, calibration doc, Teams wiring, Mail.ReadWrite instructions | — |
| P1 | `02-P1-WR-DISCOVERY.md` | WR KB duplicate and path analysis | P0 |
| P2 | `03-P2-CBS-DISCOVERY.md` | CBS KB audit (15,655 rows) | P0 |
| P3 | `04-P3-WR-DEDUP-REORG.md` | WR dedup + Drive reorganisation | P1 |
| P4 | `05-P4-CBS-CLEANUP.md` | CBS dedup, entity fix, match_threshold | P2 |
| P5 | `06-P5-WR-VERIFY.md` | WR retrieval quality verification | P3 |
| P6 | `07-P6-CBS-VERIFY.md` | CBS retrieval quality verification | P4 |
| P7 | `08-P7-WR-RECONFIG.md` | WR agent reconfiguration | P5 |
| P8 | `09-P8-CALIBRATION.md` | Evaluator calibration comparison | P6 + Jeff's scores |
| P9 | `10-P9-VERIFICATION-CRITIQUE.md` | Independent verification + adversarial critique | All prior |

**Parallel execution:** P1/P2 can run in either order. P3/P4 can run in either order. P5/P6 can run in either order. P7 requires P5. P8 requires P6 + human scoring. P9 requires all.

**Discovery confirmation stops:** P1 and P2 are discovery phases — CC waits for operator confirmation before proceeding.

## Session Rules

1. **Read the TASK_LOG first.** The "Next phase" field in the most recent entry tells CC which phase to run. If the log lists multiple available phases (parallel tracks), CC runs the first one listed.
2. **One phase per session as default.** If a phase completes with context to spare and all gates pass, CC may proceed to the next phase only if it has no dependency on an incomplete phase.
3. **Read the phase file in full before writing any code.**
4. **Read `stage4/PLAN.md` for strategic context.** Do not override decisions.
5. **No manual steps.** CC installs dependencies, runs scripts, commits. Exception: P1 and P2 have discovery confirmation stops.
6. **Australian spelling throughout.**
7. **Commit per phase:** `git add -A && git commit -m "S4-P{N}: {description}"`
8. **Tag per phase:** `git tag stage4-P{N}-{name}`
9. **Gate verification at end of every phase.** All checks must PASS before proceeding.
10. **Context management:** Read the discovery summary (written by P1/P2), not source files. Source files only read when being modified.
11. **Commit before capacity.** If within 20% of context, stop, commit, update TASK_LOG with partial status.

## Key IDs

| Entity | ID |
|---|---|
| CBS Group company | `fafce870-b862-4754-831e-2cd10e8b203c` |
| WaterRoads company | `95a248d4-08e7-4879-8e66-5d1ff948e005` |
| CBS Supabase | `eptugqwlgsmwhnubbqsk` |
| WR Supabase | `imbskgjkqvadnazzhbiw` |
| WR Shared Drive | `0AFIfqhhhv9HjUk9PVA` |
| Vercel dashboard | `https://monitoring-virid.vercel.app` |
| River Monitor agent | `ebb2bbf3-6cdc-40c4-9ad0-0a1c46104b93` |

## Credentials

```bash
source scripts/env-setup.sh        # CBS Supabase, Voyage AI, Paperclip
source .secrets/wr-env.sh           # WR Supabase
```

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — CBS Supabase
- `WR_SUPABASE_URL` / `WR_SUPABASE_SERVICE_ROLE_KEY` — WR Supabase
- `VOYAGE_API_KEY` — embeddings
- `PAPERCLIP_SESSION_COOKIE` — Paperclip API (expires after hours; `__Secure-` prefix required)
- `ANTHROPIC_API_KEY` — evaluator scoring
- WR service account: `.secrets/wr-service-account.json`

All Paperclip API mutations require `Origin: https://org.cbslab.app` header.

## TASK_LOG

`TASK_LOG.md` at project root (shared with hyper-agent-v1 entries). Each entry must include status, key metrics, known issues, and "Next phase" as the instruction pointer.

## Reference Documents

- `stage4/PLAN.md` — strategic decisions
- `stage4/TARGET-KB-STRUCTURE.md` — expected KB structure after rationalisation
- `docs/hyper-agent-v1/DISCOVERY_SUMMARY.md` — repo assessment from hyper-agent-v1 P0
- `docs/session-restart-prompt.md` — most current operational state
