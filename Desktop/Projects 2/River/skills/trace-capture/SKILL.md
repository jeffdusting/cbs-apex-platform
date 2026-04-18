# Skill: trace-capture

## Purpose

Every substantive agent output must include a structured trace block. The trace captures what the agent did, what KB content it retrieved, what corrections it applied, and how confident it is. Traces feed the evaluation pipeline and enable systematic quality improvement.

## When to Emit a Trace

Emit a trace with **every heartbeat that produces a substantive output**:
- Tender assessments, scorecards, lifecycle transitions
- Board papers, governance documents, resolutions
- Research briefs, capability statements
- CA fill operations
- Email triage and routing decisions
- Monitoring digests
- KB intake processing

**Do NOT emit a trace for:**
- Idle heartbeats (no work to do)
- Pure delegation routing (creating a subtask with no analysis)
- Simple status acknowledgements

## Trace Format

Append this block after your main output in the same issue comment. Use the exact markers:

```
---TRACE-START---
{
    "agent_role": "<your role from AGENTS.md>",
    "task_type": "<categorise from the list below>",
    "prompt_version": "<git commit hash if known, otherwise 'unknown'>",
    "kb_queries": ["<each KB query string used>"],
    "kb_results_count": <total documents returned across all queries>,
    "kb_top_similarity": <highest similarity score, or null if no KB query>,
    "corrections_applied": ["<correction document titles applied>"],
    "self_check": {
        "score": <1.0-5.0 self-assessment>,
        "flags": ["<any concerns from self-check skill>"],
        "escalation_recommended": <true or false>,
        "kb_documents_cited": <count of distinct KB docs referenced in output>
    },
    "decision": "<pursue | skip | escalate | go | no_go | approve | defer | null>",
    "confidence": "<high | medium | low>",
    "error": "<null or description of capability gap, missing key, or blocked dependency>"
}
---TRACE-END---
```

## Task Type Categories

Use one of these standard categories for the `task_type` field:

| Category | When to use |
|---|---|
| `tender-scan` | Daily tender opportunity scanning |
| `interest-test` | Binary interest pass/fail assessment |
| `go-no-go` | Full qualification scorecard assessment |
| `board-paper` | Governance board paper drafting |
| `ca-fill` | Confidentiality agreement auto-fill |
| `executive-brief` | Briefing document for directors or stakeholders |
| `email-triage` | Email classification and routing |
| `kb-intake` | Knowledge base content ingestion |
| `monitoring-digest` | System health and agent activity summary |
| `white-paper` | Published content representing the firm |
| `heartbeat-idle` | Heartbeat fired but no substantive output — no external evaluation |
| `tender-response` | Bronze/Silver/Gold tender response drafting |
| `compliance-check` | Compliance review or audit |
| `research-brief` | Research output or analysis |
| `governance-audit` | Weekly agent governance audit |
| `delegation-routing` | Pure routing — no trace needed |
| `status-update` | Brief acknowledgement — no trace needed |
| `other` | Fallback for uncategorised substantive work |

## Capability Gap Reporting

**Critical:** If you encounter ANY of the following during this heartbeat, record it in the `error` field:

- A skill you needed but could not find or invoke
- An API key or token that was missing or returned an auth error
- A KB query that returned zero results when you expected content
- A service (Supabase, Graph API, Drive, Xero) that was unreachable
- A dependency on another agent's output that was not available

Do NOT fabricate a workaround. Do NOT hallucinate results. Record the gap honestly and escalate.

## Self-Check Integration

The `self_check` sub-object captures the result of the self-check skill reasoning. Before finalising your output:

1. Run through the self-check protocol (completeness, KB grounding, confidence, escalation, correction compliance, factual discipline)
2. Calculate the self-check score (1.0–5.0)
3. List any flags
4. Set `escalation_recommended` if the output involves financial commitments, legal documents, client-facing communications, or board governance

The self-check result is embedded directly in the trace — do not produce a separate self-check output block.

## Example Trace

```
---TRACE-START---
{
    "agent_role": "tender-intelligence",
    "task_type": "tender-scan",
    "prompt_version": "unknown",
    "kb_queries": ["asset management tender NSW transport"],
    "kb_results_count": 5,
    "kb_top_similarity": 0.62,
    "corrections_applied": ["2026-04-14-tender-intel-emails-are-titles-only"],
    "self_check": {
        "score": 4.0,
        "flags": [],
        "escalation_recommended": false,
        "kb_documents_cited": 3
    },
    "decision": "skip",
    "confidence": "high",
    "error": null
}
---TRACE-END---
```

## How Traces Are Processed

1. **Ingestion:** `scripts/ingest-traces.py` scans Paperclip issue comments for `---TRACE-START---` / `---TRACE-END---` markers, parses the JSON, and inserts into the `agent_traces` Supabase table.
2. **Async evaluation:** `scripts/evaluate-outputs.py` picks up unscored traces and evaluates them against the active rubric.
3. **Sync evaluation:** For high-value task types, `scripts/sync-evaluate.py` evaluates immediately and blocks delivery if the score is below threshold.
4. **Monitoring:** The monitoring agent reads trace data to detect blocked workflows, capability gaps, and quality trends.
