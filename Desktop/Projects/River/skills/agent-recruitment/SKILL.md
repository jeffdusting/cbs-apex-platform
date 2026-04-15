# Skill: agent-recruitment

## Purpose

Enable the CEO agent (CBS Executive or WR Executive) to assess whether the current agent roster can handle a task, and to create new specialist agents when skills are missing. Used during task planning — never during task execution.

## When to Use

Use this skill when:
- A task arrives that requires expertise not present in the current agent roster
- The task will recur (justifying a persistent agent rather than ad-hoc research)
- You've checked existing agents' capabilities and found a genuine gap

Do NOT use this skill when:
- An existing agent can handle it with a good brief
- The task is a one-off that Research CBS can address
- The task is under $10 estimated cost (scale mismatch — just execute with existing agents)

## Skill Assessment Protocol

Before recruiting, run this checklist:

### Step 1: Map task requirements to skills

Identify what skills the task actually requires:
- Writing (technical, commercial, governance, marketing)
- Analysis (financial, risk, compliance, market)
- Data retrieval (specific domains — rail, tunnelling, water, defence)
- External interaction (email drafting, calendar, file management)
- Specialised knowledge (NZ procurement, PPP structuring, environmental impact)

### Step 2: Match against current roster

The current roster (as of 13 April 2026):

| Agent | Model | Strengths | Limitations |
|---|---|---|---|
| CBS Executive | Opus 4.6 | Strategic delegation, synthesis, decisions | Not for individual contributor work |
| Tender Intelligence | Sonnet 4 | Opportunity scanning, qualification scorecards | Not for response drafting |
| Tender Coordination | Sonnet 4 | Workflow orchestration, Bronze/Silver/Gold | Not for content creation |
| Technical Writing | Sonnet 4 | Methodology, case studies, capability statements | Not for commercial or compliance |
| Compliance | Haiku 4.5 | Mandatory criteria mapping, checklists | Not for creative writing |
| Pricing and Commercial | Sonnet 4 | Fee schedules, value-based pricing | Not for technical content |
| Governance CBS | Sonnet 4 | Board papers, resolutions, minutes | CBS only, not general advisory |
| Office Management CBS | Haiku 4.5 | Filing, scheduling, correspondence | Admin only |
| Research CBS | Sonnet 4 | Deep research, market analysis | Not for content production |
| WR Executive | Sonnet 4 | WR strategic oversight | WR only |
| Governance WR | Sonnet 4 | WR board papers, joint authority resolutions | WR only |
| Office Management WR | Haiku 4.5 | WR admin | WR only |

### Step 3: Gap analysis

Is there genuinely no existing agent for this task? Consider:
- Could Research CBS produce the initial assessment, feeding into an existing agent for the delivery?
- Could Technical Writing handle it with additional KB context?
- Could the task be reframed to fit an existing specialist?

If yes to any, use the existing agent. No recruitment needed.

### Step 4: Recruitment decision

Only recruit when ALL of these are true:
1. No existing agent fits
2. Task will recur (or cluster of related tasks expected)
3. Expected usage justifies a monthly budget (minimum ~$5/month)
4. Clear role definition possible
5. Jeff approves the cost and scope in the task plan

## REQUIRED: Use the Agent Standards

Every new agent MUST be built with the complete env var set from `scripts/agent-standards.py`. Do NOT hand-craft env vars — use `build_agent_env(role_key)` which guarantees no env var is missed.

Required env vars (enforced by agent-standards.py):
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (KB retrieval + tender register)
- VOYAGE_API_KEY (query embeddings)
- TEAMS_WEBHOOK_URL (notifications)
- MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID (Graph API)

Role-specific additions (automatically included by build_agent_env):
- governance-cbs, governance-wr, pricing-commercial → + XERO_CLIENT_ID, XERO_CLIENT_SECRET

## Post-Creation Validation

After creating any agent, run:
```bash
python scripts/validate-agent-env.py
```

This audits all agents and reports any missing env vars. If any are missing:
```bash
python scripts/validate-agent-env.py --fix
```

## Recruitment API Pattern

Creating a new agent via the Paperclip API:

```python
import os, httpx, json

PAPERCLIP_URL = os.environ["PAPERCLIP_URL"]
COOKIE = os.environ["PAPERCLIP_API_KEY"]  # agent JWT, auto-injected during heartbeat


def create_agent(
    company_id: str,
    name: str,
    role: str,  # one of: ceo, cto, cmo, cfo, engineer, designer, pm, qa, devops, researcher, general
    title: str,
    capabilities: str,
    reports_to_id: str,
    model: str = "claude-sonnet-4-20250514",
    heartbeat_interval_sec: int = 86400,  # 24h default for new agents
    budget_monthly_cents: int = 1000,  # $10 default
    skills: list = None,
    prompt_template: str = None,
) -> dict:
    """
    Create a new agent via the Paperclip API.

    Args:
        company_id: UUID of the company (CBS or WR)
        name: Agent name (e.g. "Environmental Advisory")
        role: Paperclip role enum
        title: Full role title
        capabilities: One-line capability statement
        reports_to_id: UUID of the parent agent (Tier 2 reports to Tier 1, Tier 3 to Tier 2)
        model: Claude model ID
        heartbeat_interval_sec: Wake frequency (86400 = 24h on-demand)
        budget_monthly_cents: Monthly spending cap in cents
        skills: List of skill names to sync
        prompt_template: Full AGENTS.md content

    Returns:
        Created agent object or None on failure
    """
    from agent_standards import build_agent_env

    cwd_name = name.lower().replace(" ", "-")

    # CRITICAL: use build_agent_env() — do NOT hand-craft env
    # role_key is used for role-specific env vars (e.g. Xero credentials)
    role_key = name.lower().replace(" ", "-")  # or pass explicitly
    env = build_agent_env(role_key)

    payload = {
        "name": name,
        "role": role,
        "title": title,
        "capabilities": capabilities,
        "reportsTo": reports_to_id,
        "adapterType": "claude_local",
        "adapterConfig": {
            "cwd": f"/paperclip/workspaces/{cwd_name}",
            "model": model,
            "maxTurnsPerRun": 1000,
            "dangerouslySkipPermissions": True,
            "graceSec": 15,
            "timeoutSec": 0,
            "env": env,
            "promptTemplate": prompt_template or "",
        },
        "runtimeConfig": {
            "heartbeat": {
                "enabled": True,
                "intervalSec": heartbeat_interval_sec,
                "cooldownSec": 10,
                "wakeOnDemand": True,
                "maxConcurrentRuns": 1,
            }
        },
        "budgetMonthlyCents": budget_monthly_cents,
    }

    r = httpx.post(
        f"{PAPERCLIP_URL}/api/companies/{company_id}/agents",
        headers={"Authorization": f"Bearer {COOKIE}", "Content-Type": "application/json"},
        json=payload, timeout=30,
    )
    if r.status_code in (200, 201):
        agent = r.json()
        # Sync skills
        if skills:
            httpx.post(
                f"{PAPERCLIP_URL}/api/agents/{agent['id']}/skills/sync",
                headers={"Authorization": f"Bearer {COOKIE}", "Content-Type": "application/json"},
                json={"skills": skills}, timeout=30,
            )
        return agent
    return None
```

## New Agent AGENTS.md Template

Every new agent MUST be created with AGENTS.md content that includes:

1. **Identity and mission** — agent name, tier, entity, role
2. **Hard stop prohibitions** (all 6):
   - No external communications
   - No tender portal submissions
   - No Xero writes
   - No external publishing
   - No approval/execution of resolutions
   - No financial fabrication
3. **Escalation path** — to parent agent, with mandatory Teams notification
4. **Mandatory KB retrieval protocol** — Voyage AI embedding + Supabase match_documents
5. **Output quality signal** — source_file names and similarity scores required
6. **Correction retrieval** — feedback-loop skill reference
7. **Embedded heartbeat protocol** — full step-by-step wake protocol
8. **Teams notification step** — structured payload with url field

Template AGENTS.md for a new specialist agent:

```markdown
# {Agent Name} Agent

You are the {Agent Name} Agent. {Tier}. {Entity}. {One-paragraph role description}.

## Hard Stop Prohibitions — Read These First

You must not send any email, message, or communication to any external party.
You must not submit any document to any tender portal or external system.
You must not create, modify, or delete any financial record in Xero.
You must not publish any content to any external channel.
You must not approve or execute any resolution, contract, or commitment.
You must not fabricate, invent, or estimate financial figures — use only verified data.

All outputs intended for external parties must be flagged for human approval.

Escalate to {parent agent} for matters requiring their input. When setting any task to in_review or escalating, you MUST also send a Teams notification.

## Reporting Structure

You report to {parent agent}. You are a {Tier X} specialist for {domain}.

## Core Function

{Detailed description of what this agent does and when it's called}

## Delegation Limits

{Does this agent delegate? To whom? Or is it a leaf node?}

## Correction Retrieval

Before producing substantive output, use the feedback-loop skill to check for corrections matching your role (`{agent-role-id}`).

## Mandatory KB Retrieval Protocol

You MUST query Supabase KB via supabase-query skill before any substantive output.
Include raw source_file names and similarity scores in outputs.

## Output Quality Signal

At the end of every substantive output, include:
- KB query: [exact query terms]
- Documents retrieved: [source_files with similarity scores]
- Source material: [sufficient/limited/insufficient]
- Recommendation: [proceed/review specific sections]

## Heartbeat Protocol — EXECUTE EVERY WAKE

Every time you wake, execute these steps IN ORDER:

1. **Get Assignments** — GET issues assigned to you
2. **Check for Corrections** — query feedback-loop for role `{agent-role-id}`
3. **Work** — checkout issue, query KB, produce output
4. **Send Teams Notifications** — for in_review, blocked, completed:
   ```python
   import os, httpx
   httpx.post(os.environ["TEAMS_WEBHOOK_URL"], json={
       "title": "NOTIFICATION TYPE - Entity",
       "issue": "CBSA-XX",
       "summary": "One sentence",
       "action": "What Jeff needs to do",
       "url": f"https://org.cbslab.app/CBSA/issues/{issue_identifier}"
   }, timeout=30)
   ```
5. **Update and Exit** — set task status, comment progress
```

## Recruitment Proposal Format

When recommending a new agent in a task plan:

```
PROPOSED AGENT: {name}
Entity: {CBS Group | WaterRoads}
Role: {role enum}
Tier: {1 | 2 | 3}
Reports to: {existing agent}
Model: {recommended}
Heartbeat: {frequency or on-demand}
Budget: ${X}/month
Skills: {list}

Justification:
- Current roster cannot handle because: {specific gap}
- This role will be used for: {recurring use cases}
- Expected monthly usage: {X tasks/month}
- Alternative considered: {why it doesn't work}

Example first task:
- {The current task this agent would handle}
```

Present this to Jeff Dusting for approval before creating the agent.

## Post-Recruitment Verification

After creating a new agent, verify:
1. Agent appears in the org chart
2. Instruction bundle is loaded (promptTemplate set)
3. Skills synced (check `skills.desired` field)
4. Env vars set (TEAMS_WEBHOOK_URL present)
5. Budget non-zero
6. Heartbeat enabled
7. Test ticket sent, agent responds correctly on first wake

Document the new agent in `agent-instructions/{agent-name}/AGENTS.md` and commit to the repository.
