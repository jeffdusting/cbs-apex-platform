# Skill: feedback-loop

## Purpose

Query the knowledge base for correction documents matching your role and task type before producing substantive output. This allows you to learn from operator feedback on prior outputs without retraining.

## When to Use

Before producing any substantive output (board papers, tender sections, research briefs, governance documents), query for corrections. Skip this step for:
- Simple status updates or progress comments
- Delegation actions (creating/assigning subtasks)
- Administrative tasks (filing, scheduling)

## How It Works

Corrections are stored in the Supabase `documents` table with:
- `category: 'correction'`
- `metadata.agent_role`: the role of the agent whose output was corrected (e.g. `cbs-executive`, `technical-writing`, `governance-wr`)
- `metadata.task_type`: the type of task (e.g. `tender-response`, `board-paper`, `research-brief`)
- `metadata.correction_date`: when the correction was made

The correction document contains the original output and the operator's correction with annotations.

## Retrieval Protocol

### Python Example

```python
import os
import httpx

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


def get_corrections(agent_role: str, task_type: str = None, limit: int = 5) -> list[dict]:
    """
    Retrieve recent corrections for a specific agent role.

    Args:
        agent_role: The agent role identifier (e.g. "cbs-executive", "governance-wr").
        task_type: Optional task type filter (e.g. "tender-response", "board-paper").
        limit: Maximum corrections to retrieve.

    Returns:
        List of correction documents, most recent first.
    """
    params = {
        "category": "eq.correction",
        "metadata->>agent_role": f"eq.{agent_role}",
        "order": "created_at.desc",
        "limit": limit,
    }
    if task_type:
        params["metadata->>task_type"] = f"eq.{task_type}"

    response = httpx.get(
        f"{SUPABASE_URL}/rest/v1/documents",
        headers=headers,
        params=params,
    )
    response.raise_for_status()
    return response.json()
```

## Integration into Heartbeat

Before producing output for a task:

1. Identify your agent role (from your identity context).
2. Identify the task type from the issue title and description.
3. Call `get_corrections(agent_role, task_type)`.
4. If corrections exist, review them and adjust your approach:
   - Note what was wrong in the original output.
   - Apply the correction pattern to your current task.
   - Reference the correction in your confidence signal: "Applied correction from [date]: [brief description]".
5. If no corrections exist, proceed normally.

## Correction Document Format

Each correction document follows this structure:

```markdown
---
category: correction
agent_role: technical-writing
task_type: tender-response
correction_date: 2026-04-25
issue_ref: CBSA-15
---

## Original Output (excerpt)
[The section of the agent's output that was corrected]

## Correction
[The operator's corrected version]

## Guidance
[What the agent should do differently in future — e.g. "Use specific project names
rather than generic capability statements when citing CBS Group experience"]
```

## Ingesting a Correction

Corrections are ingested by the operator using:

```bash
python scripts/ingest-knowledge-base.py \
  --file knowledge-base/corrections/{filename}.md \
  --entity {entity} \
  --category correction
```

The correction file must include the YAML front-matter with `agent_role` and `task_type` fields for targeted retrieval.

## Best Practices

1. Check for corrections at the start of substantive work, not on every heartbeat.
2. Apply the most recent corrections first — older corrections may have been superseded.
3. If a correction conflicts with your AGENTS.md instructions, follow AGENTS.md (instructions take precedence).
4. Do not fabricate corrections or assume what feedback would be — only use actual correction documents.
5. Report correction application in your output quality signal.
