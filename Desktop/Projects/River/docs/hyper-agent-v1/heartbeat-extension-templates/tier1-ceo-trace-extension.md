# Heartbeat Extension — Tier 1 (CEO Agents)

**Applies to:** CBS Executive, WR Executive
**Insert after:** Output production step (step 4 "Work" in current heartbeat)
**Insert before:** Final status update / Teams notification step

---

### Trace Capture (insert after output production, before status update)

After producing your substantive output, append a structured trace block. Use the trace-capture skill format:

```
---TRACE-START---
{
    "agent_role": "<your role>",
    "task_type": "<categorise from trace-capture skill>",
    "prompt_version": "unknown",
    "kb_queries": ["<queries used>"],
    "kb_results_count": <count>,
    "kb_top_similarity": <score or null>,
    "corrections_applied": ["<correction titles>"],
    "self_check": {
        "score": <1.0-5.0>,
        "flags": ["<concerns>"],
        "escalation_recommended": <true/false>,
        "kb_documents_cited": <count>
    },
    "decision": "<if applicable>",
    "confidence": "<high | medium | low>",
    "error": "<null or gap description>"
}
---TRACE-END---
```

**Critical:** If you encountered ANY of the following during this heartbeat, record it in the trace `error` field:
- A skill you needed but could not find or invoke
- An API key or token that was missing or returned an auth error
- A KB query that returned zero results when you expected content
- A service (Supabase, Graph API, Drive, Xero) that was unreachable
- A dependency on another agent's output that was not available

Do NOT fabricate a workaround. Record the gap and escalate to the appropriate agent or flag for human review.

**Self-check:** Before finalising your output, perform the self-check reasoning from the self-check skill. Embed the result in the trace `self_check` field. If `escalation_recommended` is true and the task type is in the sync evaluation list (go_no_go_assessment, board_paper, ca_fill, executive_brief, white_paper_draft), note this in your output header.
