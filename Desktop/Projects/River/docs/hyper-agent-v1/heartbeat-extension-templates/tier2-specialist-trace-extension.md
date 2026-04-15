# Heartbeat Extension — Tier 2 (Specialist Agents)

**Applies to:** Tender Intelligence, Tender Coordination, Governance CBS, Governance WR, Office Management CBS, Office Management WR
**Insert after:** Output production step
**Insert before:** Final status update step

---

### Trace Capture (insert after output production, before status update)

After producing your substantive output, append a structured trace block using the trace-capture skill format.

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

**KB grounding requirement:** Your trace must accurately report `kb_queries`, `kb_results_count`, and `kb_top_similarity`. If you did not query the KB for this task, set `kb_queries` to an empty array and note in `self_check.flags` why KB retrieval was not applicable.

**Capability gap reporting:** If any skill, key, or service was unavailable, record it in the trace `error` field. Do not attempt to produce output that depends on the missing capability — instead, report the gap and set `confidence` to `low`.
