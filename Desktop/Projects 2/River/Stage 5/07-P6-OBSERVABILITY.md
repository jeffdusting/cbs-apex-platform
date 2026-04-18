# Phase 6: Observability + Cost

## Objective

Build per-agent cost reporting with anomaly detection, trace-to-issue reconciliation to catch missing traces, and an independent evaluator pass on sync-evaluation task types (replacing self-check as the sole pre-delivery signal for high-value outputs). Addresses IB.5, RA.5, CE.5/RA.4.

## Prerequisites

- S5-P2 complete (traces flowing in production — at least some `agent_traces` rows exist).

## Context

```bash
cat stage5/DISCOVERY_SUMMARY.md | grep -A3 "agent_traces\|cost\|reconcil"
```

## Tasks

### TASK 6.1: Per-Agent Cost Report (IB.5)

Create `scripts/agent-cost-report.py`:

1. Query the Paperclip API for token usage per agent (if the endpoint exists — check `/api/agents/{id}/usage` or similar). If no usage endpoint, calculate from `agent_traces.tokens_input + tokens_output` per agent per month.
2. Compare actual token usage against budgets from `agent-config/token-budgets.md`.
3. Flag agents at >80% of monthly budget (warning) and >120% (anomaly).
4. Output a formatted report and optionally send to Teams via webhook.

Arguments: `--month YYYY-MM` (default: current), `--alert` (send Teams notification for anomalies).

### TASK 6.2: Trace Reconciliation (RA.5)

Create `scripts/trace-reconciliation.py`:

1. Query `agent_traces` for the last 24 hours — count traces per agent.
2. Query the Paperclip API for issue comments per agent for the same period (if cookie is valid).
3. Compare: if an agent produced issue comments but has no corresponding `agent_traces` rows, it's emitting outputs without traces (the audit trail is incomplete).
4. Report: agents with traces, agents with comments but no traces, divergence percentage.
5. If divergence >5%, flag as a warning.

Fallback if Paperclip API unavailable: compare `agent_traces` count per agent against expected heartbeat frequency (from the agent config). An agent with a 2h heartbeat should produce ~12 traces per day; if it produced 0, flag it.

Add this check to the River Monitor agent's daily digest (update `agent-instructions/monitoring/AGENTS.md` to include "run trace reconciliation" as step 8 before the digest).

### TASK 6.3: Independent Evaluator for Sync Paths (CE.5 / RA.4)

The self-check (Layer B) has a structural conflict: the agent that produced the output also scores it. For sync-evaluation task types (`go-no-go`, `board-paper`, `ca-fill`, `executive-brief`, `white-paper`), add an independent evaluator call that runs separately from the self-check.

Update `scripts/sync-evaluate.py`:
1. When called for a sync task type, the script already calls Claude Sonnet 4 to score the output — this IS the independent evaluation (Layer A). Confirm this path works and the score is written with `evaluation_mode='sync'`.
2. Add a comparison: if the trace's `self_check_score` differs from the evaluator's `score_composite` by more than 1.0, log a warning: "Self-check divergence: agent reported {self_check_score}, evaluator scored {composite}." This catches the case where agents consistently over-rate themselves.
3. Add this divergence metric to the monitoring agent's daily digest.

Update `agent-instructions/monitoring/AGENTS.md` to include "self-check divergence" as a tracked metric.

### TASK 6.4: Dashboard Cost Panel

If the Vercel dashboard was integrated in S5-P0, add a "Cost" section to the evaluator tab showing:
- Per-agent monthly token usage (from agent_traces aggregation)
- Budget utilisation percentage
- Anomaly flags

If the dashboard integration is not yet live, produce the HTML component as `scripts/cost-dashboard-component.html` for future integration.

## Gate Verification

```bash
echo "=== S5-P6 Gate ==="
[ -f "scripts/agent-cost-report.py" ] && python3 -m py_compile scripts/agent-cost-report.py 2>&1 && echo "PASS: Cost report" || echo "FAIL"
[ -f "scripts/trace-reconciliation.py" ] && python3 -m py_compile scripts/trace-reconciliation.py 2>&1 && echo "PASS: Reconciliation" || echo "FAIL"

# Sync evaluator has divergence check
grep -q "divergence\|self_check_score" scripts/sync-evaluate.py 2>/dev/null && echo "PASS: Divergence check in sync-evaluate" || echo "FAIL"

# Monitoring agent updated
grep -q "reconcil\|divergence" agent-instructions/monitoring/AGENTS.md 2>/dev/null && echo "PASS: Monitor agent includes reconciliation" || echo "FAIL"
```

## Archive Point

```bash
git add -A && git commit -m "S5-P6: Observability — cost report, trace reconciliation, sync evaluator divergence"
git tag stage5-P6-observability
```

## TASK_LOG Entry

```markdown
## S5-P6: Observability + Cost
- **Status:** COMPLETE
- **Cost report:** created (scripts/agent-cost-report.py)
- **Trace reconciliation:** created + monitoring agent updated
- **Independent evaluator (sync):** divergence check added to sync-evaluate.py
- **Next phase:** P7 (DR + Resilience) if P3 done, else P7 blocked on P3
```
