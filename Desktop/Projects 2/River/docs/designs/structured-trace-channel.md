---
title: Structured Trace Channel — Design
status: DESIGN (deferred from Stage 5)
author: Claude chat + CC (Stage 5 P8)
date: 2026-04-19
critique_ref: CE.1
---

# Structured Trace Channel

## 1. Problem Statement

The current trace pipeline (`scripts/ingest-traces.py`) works by scraping
Paperclip issue comments for a JSON blob wrapped in literal markers:

```
---TRACE-START---
{ ... trace json ... }
---TRACE-END---
```

Parsing is a DOTALL regex:
`r"---TRACE-START---\s*(\{.*?\})\s*---TRACE-END---"`
(`scripts/ingest-traces.py:31-33`).

That approach has three failure modes, any of which causes **silent trace
loss** — the ingestion script reports zero traces for the affected
agent/comment, the downstream evaluator never fires, and the critique
feedback loop for that output is lost.

| # | Failure mode | Trigger | Impact |
|---|---|---|---|
| F1 | **Whitespace drift** | Agent emits a leading space, trailing blank line, or uses a different dash count (four dashes, em-dash auto-correction) | Regex no longer matches. Trace is in the comment but never ingested. |
| F2 | **Code-fence wrapping** | Agent wraps the block inside a triple-backtick fence (common when the model treats it as "code") | The wrapping itself is harmless, but if the fence language tag adds a leading `json\n`, early escape of the closing `---` can truncate the capture group. |
| F3 | **Paperclip format changes** | Paperclip rewrites issue comments (e.g. converts to HTML, escapes characters, adds header chrome, collapses empty lines) in a release update | Existing markers survive or not at the vendor's discretion. No contract — Paperclip is free to change how comment bodies are stored or returned by the API. |

Because the evaluator is the feedback signal that drives prompt-version
improvement and correction proposals, silent trace loss is
self-concealing: we notice only in the weekly reconciliation
(`scripts/trace-reconciliation.py`) or during independent verification.

## 2. Option A — Paperclip metadata field

**Premise:** Paperclip exposes a structured metadata field on issue
comments (e.g. `comment.metadata: Json`) that agents can populate
alongside the human-readable body. The ingestion script reads that
field directly.

| | |
|---|---|
| Pros | Zero parsing. Types enforced at write-time by Paperclip. Comment bodies stay clean for humans — no `---TRACE-START---` pollution. |
| Cons | Depends on a Paperclip capability we have not confirmed. Needs vendor API check. If Paperclip does not expose it, we cannot build it ourselves. |
| Agent changes | Agent prompt updated to set `comment.metadata.trace = {...}` instead of embedding a marker block. |
| Runtime changes | `ingest-traces.py` reads `metadata.trace` field. Marker regex removed. |
| Vendor risk | HIGH — single-vendor lock. If Paperclip removes or renames the field, we are back to text parsing. |
| Verification before adoption | `GET /api/issues/{id}/comments` → inspect response; check Paperclip API docs for any `metadata` or `data` field on `IssueComment`. |

## 3. Option B — Side-channel POST endpoint

**Premise:** Stand up a lightweight `/traces` service (Railway or
Vercel). Agents POST trace JSON directly to it; the service validates
against a JSON Schema and inserts into Supabase `agent_traces`.

| | |
|---|---|
| Pros | Decoupled from Paperclip. JSON Schema validation at the boundary. Bearer-auth protected — forgery is harder than editing a comment body. Allows future replay, dry-run, rate-limiting. |
| Cons | New service to run, monitor, and pay for. Adds a network dependency — if the endpoint is down, agents cannot emit traces. Requires agent instructions to perform authenticated HTTP POST — another skill to maintain. |
| Agent changes | New skill `trace-post` (uses `httpx`) with the endpoint URL and a bearer token from credential storage. Prompt updated to call this skill at the end of every substantive task. |
| Runtime changes | `ingest-traces.py` retired (or kept as a fallback mode). New service: `services/trace-collector/` — FastAPI app with one POST route, JSON Schema validation, Supabase insert. |
| Failure isolation | Service outage breaks trace ingestion; it does NOT break agent delivery, because the agent's primary output still goes to Paperclip. |
| Vendor risk | LOW — we own the endpoint. |

## 4. Option C — Supabase direct insert

**Premise:** Agents INSERT rows directly into Supabase `agent_traces`
via the REST API, using the existing `supabase-query` skill.

| | |
|---|---|
| Pros | Simplest — no new service. Reuses a skill that agents already have. Immediate — no deploy. |
| Cons | Agents need INSERT permission on `agent_traces`. Today service-role is the only path that can write; giving agents service-role credentials re-opens the RLS scope issue (RA.3). The limited `river_agent_read` role introduced in P3 is read-only by design — granting INSERT on one table would require a second limited role with narrower write grants. No validation layer: a malformed row lands in the table and breaks downstream joins. |
| Agent changes | Agent prompt updated to call `supabase-query` with an INSERT statement against `agent_traces`. |
| Runtime changes | `ingest-traces.py` retired. Must add DB-level CHECK constraints to make up for the missing validation layer. |
| Vendor risk | LOW (Supabase is already foundational). |
| Security risk | MEDIUM — broader credential surface on agent side. |

## 5. Recommendation

**Preferred: Option B (side-channel POST endpoint).**

Rationale — in order of weight:

1. **Validation at the boundary.** The collector is the only place where
   a JSON Schema check can reject a malformed trace before it corrupts
   the downstream evaluator. Neither A nor C gives us that.
2. **Vendor independence.** Option A chains us to a Paperclip capability
   we do not control. B runs on our own infrastructure.
3. **Failure isolation.** If the collector is down, agent deliveries to
   Paperclip still succeed. Only trace ingestion pauses — and we can
   drain a buffer on recovery.
4. **Security posture.** The collector accepts a scoped bearer token per
   agent (rotatable, revocable). Option C requires widening Supabase
   write permission, which we just narrowed in P3.

**Fallback: Option A, only if** Paperclip exposes a structured metadata
field on comments. Worth the vendor call before committing to B.

**Rejected: Option C.** Directly weakens the RLS scope that P3 tightened.

### Migration path (from markers to Option B)

1. **Phase M1 — Parallel write.** Agent prompts updated to call BOTH
   the marker-block emit (current path) AND the new `trace-post` skill.
   Ingest script deduplicates by `raw_output_hash`.
2. **Phase M2 — Reconciliation window.** 14 days of dual writes. Every
   day, `trace-reconciliation.py` compares issue-count vs trace-count
   and flags any divergence per channel. Expected: POST channel should
   match or exceed marker channel (because it is more robust).
3. **Phase M3 — Marker removal.** Once POST channel has ≥99% parity
   for 7 consecutive days, remove marker emit from agent prompts. Keep
   `ingest-traces.py` on ice for one release for emergency rollback.
4. **Phase M4 — Marker parser retirement.** Delete
   `scripts/ingest-traces.py` and the regex. Archive the task_type
   compatibility notes.

Backward compatibility during M1/M2: yes — both run in parallel. The
trace hash dedups.

## 6. Implementation estimate

| Option | Effort | Files/services affected |
|---|---|---|
| A (Paperclip metadata) | S (3–5 days) — prompt update, ingest-traces read path swap, one agent instruction deploy per role, reconciliation run | `scripts/ingest-traces.py`, all agent `promptTemplate` values, no new service |
| B (POST endpoint) | M (2–3 weeks) — new service, JSON Schema, auth token issuance, agent skill, Railway/Vercel deploy, parallel-write migration, monitoring | `services/trace-collector/` (new), `scripts/skills/trace-post/` (new), Paperclip agent prompts, Railway env, 1Password items |
| C (Supabase direct) | S (1 week) — DB role, CHECK constraints, agent prompt update | `scripts/supabase-limited-role.sql` (new role), `evaluator-schema.sql` (CHECK constraints), agent prompts |

Recommend B at M.

### Rollout plan (B — detail)

1. Write JSON Schema (`schemas/agent-trace-v1.json`).
2. Scaffold `services/trace-collector/` (FastAPI on Railway, no state of
   its own).
3. Issue a per-agent bearer token (new 1Password item `River Trace Collector Tokens`).
4. Deploy collector to a preview URL. Smoke test: POST a valid trace,
   confirm it lands in `agent_traces`; POST a malformed trace, confirm
   422.
5. Update one agent (pick `river-monitor`) to dual-write. Observe for 48
   hours.
6. Roll dual-write out to remaining agents one role at a time.
7. Begin 14-day reconciliation window (M2).
8. Remove marker path per M3/M4 above.

## 7. JSON Schema — agent-trace-v1

Authoritative trace shape. Mirrors the `agent_traces` table
(`scripts/evaluator-schema.sql:17-39`). All `task_type` enum values come
from `config/evaluation-events.json` (the post-P1 kebab-case vocabulary).

```json
{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://river.cbslab.app/schemas/agent-trace-v1.json",
    "title": "Agent Trace (v1)",
    "type": "object",
    "required": [
        "agent_id",
        "agent_role",
        "company_id",
        "task_type",
        "decision",
        "confidence",
        "raw_output_hash",
        "schema_version"
    ],
    "additionalProperties": false,
    "properties": {
        "schema_version": {
            "const": "agent-trace-v1"
        },
        "agent_id": {
            "type": "string",
            "format": "uuid"
        },
        "agent_role": {
            "type": "string",
            "minLength": 1,
            "maxLength": 64
        },
        "company_id": {
            "type": "string",
            "enum": [
                "fafce870-b862-4754-831e-2cd10e8b203c",
                "95a248d4-08e7-4879-8e66-5d1ff948e005"
            ]
        },
        "issue_id": {
            "type": ["string", "null"]
        },
        "task_type": {
            "type": "string",
            "enum": [
                "go-no-go",
                "board-paper",
                "ca-fill",
                "executive-brief",
                "white-paper",
                "tender-scan",
                "email-triage",
                "interest-test",
                "kb-intake",
                "monitoring-digest",
                "heartbeat-idle",
                "delegation-routing",
                "status-update"
            ]
        },
        "prompt_version": {
            "type": ["string", "null"],
            "pattern": "^[0-9a-f]{7,40}$"
        },
        "kb_queries": {
            "type": "array",
            "items": {"type": "string"},
            "maxItems": 50
        },
        "kb_results_count": {
            "type": "integer",
            "minimum": 0
        },
        "kb_top_similarity": {
            "type": ["number", "null"],
            "minimum": 0,
            "maximum": 1
        },
        "corrections_applied": {
            "type": "array",
            "items": {"type": "string", "format": "uuid"}
        },
        "self_check_score": {
            "type": ["number", "null"],
            "minimum": 1.0,
            "maximum": 5.0
        },
        "self_check_flags": {
            "type": "array",
            "items": {"type": "string"}
        },
        "decision": {
            "type": "string",
            "minLength": 1,
            "maxLength": 2048
        },
        "confidence": {
            "type": "string",
            "enum": ["high", "medium", "low"]
        },
        "tokens_input": {"type": ["integer", "null"], "minimum": 0},
        "tokens_output": {"type": ["integer", "null"], "minimum": 0},
        "duration_seconds": {"type": ["number", "null"], "minimum": 0},
        "error": {"type": ["string", "null"]},
        "raw_output_hash": {
            "type": "string",
            "pattern": "^[0-9a-f]{64}$"
        }
    }
}
```

### Collector-side validation rules (beyond schema)

- **Idempotency** — `(agent_id, raw_output_hash)` is a soft-unique key.
  On duplicate, return `200 {"status":"duplicate"}` rather than 409; the
  agent must not retry-loop on duplicate.
- **Clock skew** — collector stamps `created_at` server-side. Clients
  cannot backdate traces.
- **Token scope** — each bearer token is bound to a single `agent_id`.
  Reject if the token's agent does not match the payload's `agent_id`.
- **Rate limit** — 60 traces / minute / agent. Heartbeat agents should
  not exceed 1/min under normal operation.

### Non-goals (explicit)

- Not a general-purpose event bus. Traces only.
- No backfill from Paperclip comments — historical traces stay under the
  marker regex until M4. No migration of old rows.
- Not a public endpoint. Always fronted by bearer auth; no anonymous POST.
