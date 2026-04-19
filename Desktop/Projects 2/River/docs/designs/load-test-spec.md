---
title: Synthetic Load Test Specification
status: DESIGN (deferred from Stage 5)
author: Claude chat + CC (Stage 5 P8)
date: 2026-04-19
critique_ref: IB.7
---

# Synthetic Load Test Specification

## 1. Objective

Measure platform behaviour at 10× current steady-state. The current
workforce produces low traffic; we have no evidence that the stack
(Paperclip heartbeats, Supabase queries, Voyage AI embeddings, Anthropic
API calls, Railway containers) survives a plausible 12-month growth
scenario without latency blowout, rate-limit exhaustion, or cost
surprises.

Out-of-scope: proving peak-surge capacity (100×+). This spec concerns
steady-state at 10× and identifies the first bottleneck.

## 2. Scenarios

All scenarios run against a **staging** Supabase project (not production),
with a staging Paperclip org if one can be arranged, or a mocked
Paperclip API otherwise. Every scenario runs for one hour unless noted.

| # | Scenario | Target load | Current baseline | Expected first failure |
|---|---|---|---|---|
| S1 | Trace ingestion | 1,000 traces / hour | ~0 / hour (P6 activation underway) | Supabase connection pool saturation, or Voyage embedding rate limit if we attach embeddings to traces |
| S2 | Evaluations | 100 evaluations / hour | 0 (P6 cost path live but unused) | Anthropic rate limits (Sonnet 4), evaluator latency spikes |
| S3 | Tender register scale | 200 tenders in `tender_register` | 23 | Dashboard query latency, `tender-scan` agent's pagination logic |
| S4 | Simultaneous heartbeats | 13 agents, all heartbeat within the same 60 s window | Staggered today | Paperclip queue depth, Claude API concurrency limits |
| S5 | Document scale (CBS) | 50,000 rows in `documents` | ~1,300 | IVFFlat recall degradation, query latency as `lists` parameter drifts off ideal |
| S6 | Document scale (WR) | 50,000 rows in `documents` | ~16,800 | Same as S5 — this is closer to threshold, run first |

### Scenario notes

- **S1 and S2 combined** — in production, traces produce evaluations.
  After S1 and S2 pass independently, run them combined for 1 hour to
  catch back-pressure interactions (e.g., evaluator falling behind).
- **S5 and S6** — require the IVFFlat rebuild decision from P2 to be
  locked in first. The `lists` parameter ideal moves with row count; the
  load test is the right place to validate the formula.

## 3. Metrics to Capture

Capture metrics to a single CSV per scenario (`load-results/S{n}-{date}.csv`)
so analysis is trivial.

### Latency

- Trace ingestion end-to-end (post → row in `agent_traces`): p50, p95, p99.
- Evaluation end-to-end (trace id → `evaluation_scores` row): p50, p95.
- Supabase query latency for the hottest two queries:
  - `match_documents` RPC (the embedding search)
  - `SELECT ... FROM tender_register WHERE company_id=? ORDER BY ...`
- Paperclip heartbeat round-trip (trigger → agent's first comment): p50, p95.

### Throughput

- Traces ingested per minute (rolling 1-minute and 5-minute averages).
- Evaluations completed per minute.
- Claude API calls per minute.
- Voyage AI API calls per minute.

### Errors and rate limits

- Count of Anthropic 429 responses.
- Count of Voyage AI 429 responses.
- Count of Supabase connection errors.
- Count of Paperclip 5xx responses.

### Resource

- Railway container CPU (per-container average and peak).
- Railway container memory (RSS).
- Supabase CPU (from dashboard, manually noted — no API).
- Supabase connection count (from `pg_stat_activity` sampled every 30 s).

### Cost (proxies — actual billing arrives later)

- Token totals: input / output per Claude model.
- Voyage embedding token totals.
- Estimated spend for the 1-hour window, for both S1 and S2.

## 4. Infrastructure

Three pieces of code are required.

### 4.1 Synthetic trace generator

`tests/load/gen_traces.py`

- Generates valid `agent-trace-v1` JSON (see
  `docs/designs/structured-trace-channel.md §7`).
- Randomises `agent_id` across a fixed pool of 13 synthetic agents.
- Randomises `task_type` with a distribution that mirrors observed
  ratios in `agent_traces` at the time of the test (query baseline
  first).
- Posts to the trace channel (marker comment, POST endpoint, or direct
  Supabase — whichever is active).
- Arg: `--rate TRACES_PER_MINUTE`, `--duration MINUTES`,
  `--company-id UUID`.

### 4.2 Evaluation batch runner

`tests/load/run_evaluations.py`

- Selects N unscored traces from the last hour.
- Calls the evaluator (same path as production: `scripts/lib/evaluator.py`).
- Runs in a configurable concurrency (start at 4, ramp to 16).
- Logs each call's latency, token counts, and error state.

### 4.3 Test data seeder

`tests/load/seed_data.py`

- Generates N plausible `documents` rows (title + synthetic body of
  500–2,000 tokens) and inserts in batches of 500.
- Runs Voyage embeddings for each row at insert time so index behaviour
  matches production.
- Arg: `--count`, `--company-id`, `--category` (so we exercise
  category-filtered search paths).
- **Idempotency:** uses a synthetic hash prefix (`loadtest-`) so seeded
  rows can be bulk-deleted at the end: `DELETE FROM documents WHERE
  title LIKE 'loadtest-%'`.

### Pre-requisites

- Staging Supabase project provisioned with the same schema.
- IVFFlat index rebuilt at the new row count BEFORE S5/S6.
- Voyage AI staging API key (separate from prod so rate-limit interference
  is isolated).
- Claude API key with a higher-tier rate limit if possible for the
  duration of S2.

## 5. Pass Criteria

Per scenario:

| Scenario | Pass criterion |
|---|---|
| S1 | p95 trace ingestion < 5 s; 0 lost traces; <1% Supabase errors |
| S2 | p95 evaluation < 30 s; <5% evaluator errors; no Anthropic 429 burst longer than 60 s |
| S3 | Dashboard tender-register page loads < 3 s; pagination works through to page 10 |
| S4 | All 13 heartbeats produce at least one trace; no agent times out |
| S5 | p95 `match_documents` < 500 ms at 50k rows; recall@10 within 5 points of baseline |
| S6 | Same as S5 |

Any scenario that falls outside these thresholds is a documented finding,
not a fail — the first run's purpose is to discover first bottleneck,
not to prove the system passes.

## 6. Estimated Effort

**Total: L (1–2 weeks)**, broken down:

| Task | Effort |
|---|---|
| Stand up staging Supabase + schema parity | 1 day |
| Write the three infra scripts (§4.1–4.3) | 2 days |
| Seed initial data for S3/S5/S6 | 0.5 day |
| Dry-run each scenario at 1× rate | 1 day |
| Execute S1–S6 at full rate, capture metrics | 2 days |
| Analyse, write up findings, file tickets per bottleneck | 2 days |

## 7. Reporting

A single `docs/load-test-results/YYYY-MM-DD.md` with:

- Scenarios executed and duration.
- Metrics table per scenario (raw CSVs attached).
- Bottlenecks observed, ranked by earliest-manifestation.
- Proposed fixes per bottleneck (ticket titles + effort estimate).
- Cost of the test run itself (Claude + Voyage spend).

This feeds directly into the next programme's scope.

## 8. Non-goals

- Not a benchmark suite. We are not publishing numbers.
- Not a chaos test. Injecting failures is a separate exercise.
- Not a regression harness. Run this on demand, not in CI.
