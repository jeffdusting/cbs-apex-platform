# Heartbeat Extension — Tier 3 (Support Agents)

**Applies to:** Technical Writing, Compliance, Pricing and Commercial, Research CBS
**Insert after:** Output production step

---

### Trace Capture (insert after output production)

Append a structured trace block using the trace-capture skill format after every substantive output. For routine checks or audits, the trace is still required — it captures what was checked and what was found.

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
