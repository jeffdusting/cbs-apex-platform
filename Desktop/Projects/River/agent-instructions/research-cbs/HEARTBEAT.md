# Research Agent CBS — Heartbeat Protocol

## 1. Identity and Context

- Call `GET /api/agents/me` to confirm identity and company context.
- Check wake context environment variables:
  - `PAPERCLIP_TASK_ID` — issue that triggered this wake
  - `PAPERCLIP_WAKE_REASON` — why you were triggered (task_assigned, comment)
  - `PAPERCLIP_RUN_ID` — current run ID

## 2. Get Assignments

- `GET` issues assigned to you with status `todo`, `in_progress`, or `blocked`.
- You wake on task assignment only — there should be a specific research task.
- If woken by a comment, review for additional questions or scope clarification.

## 3. Check for Corrections

Before producing substantive output, query the knowledge base for corrections matching your role:

- Use the feedback-loop skill to call `get_corrections(agent_role="research-cbs")` where the agent-role-id matches this agent's directory name (e.g. "cbs-executive", "governance-wr").
- If corrections exist, review them and apply the guidance to your current work.
- If no corrections exist, proceed normally.
- Skip this step for simple delegation, status updates, or administrative actions.

## 4. Checkout and Read Brief

- `POST /api/issues/{id}/checkout` to claim the task.
- Read the research brief from the assigning agent (Tender Intelligence or CBS Executive).
- Identify:
  - The specific research question(s)
  - Context for why this research is needed
  - Deadline for completion
  - Any specific sources or angles to investigate

## 5. Query Internal Knowledge Base

- Use supabase-query to check if relevant information already exists in the CBS Group knowledge base.
- Search for:
  - Previous research on the same topic or client
  - CBS Group capability documents relevant to the research area
  - Case studies or project history related to the research question

## 6. Conduct External Research

- Use web search to investigate the research question.
- Follow the research standards:
  - Prioritise authoritative sources
  - Note dates on all sources
  - Use multiple search strategies if initial queries are insufficient
- Cross-reference external findings with internal KB content.

## 7. Analyse and Structure Findings

- Synthesise internal and external research into the structured report format.
- Distinguish clearly between facts, analysis, and speculation.
- Flag any contradictions between sources.
- Note limitations and gaps.

## 8. Send Teams Notifications

Before exiting, send a Teams notification via the teams-notify skill for ANY of the following that occurred during this heartbeat:

- A task was set to `in_review` (approval required)
- A task was escalated or marked `blocked`
- A board paper or tender response was delivered to SharePoint
- A tender opportunity was assessed as Go or Watch
- An error or hard stop refusal occurred

Use the `post_teams_notification()` function from the teams-notify skill. Include the issue identifier, a one-line summary, and the action required. If nothing noteworthy happened this cycle, skip this step.

## 9. Update and Exit

- Update the task with the completed research report.
- Set task status to `done`.
- If the research is incomplete or requires follow-up, note the outstanding items and set status to `in_review`.
- Include your confidence signal in the output.
