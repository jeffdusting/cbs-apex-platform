# Programme: stage5

## Context

Project River completed Stage 4 (hyper-agent-v1 build + KB rationalisation) on 16 April 2026. The Stage 4 adversarial critique (`stage4/ADVERSARIAL_CRITIQUE.md`) identified 40 issues across three perspectives: investment banker (IB.1–9), competitor's engineer (CE.1–10), and regulator/auditor (RA.1–11), plus 10 verification issues (IV#1–10). This programme remediates all of them — either through direct fixes or by producing design documents that scope deferred work.

**Strategic decisions are in `stage5/PLAN.md`.** CC reads but does not override.

## Phase Sequence

| Phase | File | Objective | Depends on |
|---|---|---|---|
| P0 | `01-P0-DISCOVERY.md` | Verify current state post-Stage 4 | — |
| P1 | `02-P1-CRITICAL-FIXES.md` | task_type vocab fix, repo hygiene, WR templates, legacy rows | P0 |
| P2 | `03-P2-ACTIVATION.md` | Trace ingestion live, IVFFlat rebuild, first production eval, tender exercise | P1 |
| P3 | `04-P3-SECRETS.md` | 1Password CLI, limited Supabase role, credential rotation | P2 |
| P4 | `05-P4-GOVERNANCE.md` | CA DB constraint, retention policy, correction alerts, IR plan, policy docs | P2 |
| P5 | `06-P5-CI-QUALITY.md` | GitHub Actions, lockfile, embedding model verify, shingling, retrieval regression | P2 |
| P6 | `07-P6-OBSERVABILITY.md` | Cost reporting, trace reconciliation, independent evaluator on sync paths | P2 |
| P7 | `08-P7-DR-RESILIENCE.md` | Backups, DR drill, runbook, vendor abstraction, failover plan | P3 |
| P8 | `09-P8-DEFERRED-DESIGNS.md` | Trace channel design, load test spec, separation of duties, tenant export | P1 |
| P9 | `10-P9-VERIFICATION.md` | Independent verification of all Stage 5 work | All |

**Parallel execution:** P3, P4, P5, P8 can run in any order after P2. P6 needs P2 (traces flowing). P7 needs P3 (secrets sorted). P9 runs last.

**Discovery confirmation stop:** P0 only.

## Session Rules

Same rules as Stage 4. In summary:

1. TASK_LOG is the instruction pointer — read the "Next phase" field.
2. One phase per session. May proceed to next if context permits and no dependency blocks.
3. Read phase file in full before writing code.
4. No manual steps — CC installs, runs, commits.
5. Australian spelling.
6. Commit: `git add -A && git commit -m "S5-P{N}: {description}"`
7. Tag: `git tag stage5-P{N}-{name}`
8. Gate verification at end of every phase. All PASS before proceeding.
9. Read discovery summary, not source files (after P0).

## Key IDs

| Entity | ID |
|---|---|
| CBS Group company | `fafce870-b862-4754-831e-2cd10e8b203c` |
| WaterRoads company | `95a248d4-08e7-4879-8e66-5d1ff948e005` |
| CBS Supabase | `eptugqwlgsmwhnubbqsk` |
| WR Supabase | `imbskgjkqvadnazzhbiw` |
| River Monitor agent | `ebb2bbf3-6cdc-40c4-9ad0-0a1c46104b93` |

## Credentials

```bash
source scripts/env-setup.sh
source .secrets/wr-env.sh
```

All Paperclip mutations require `Origin: https://org.cbslab.app`.

## Reference Documents

- `stage5/PLAN.md` — strategic decisions and full issue-to-phase mapping
- `stage4/ADVERSARIAL_CRITIQUE.md` — source critique (40 issues)
- `stage4/INDEPENDENT_VERIFICATION.md` — companion verification report
- `docs/hyper-agent-v1/DISCOVERY_SUMMARY.md` — repo assessment
- `docs/session-restart-prompt.md` — operational state
