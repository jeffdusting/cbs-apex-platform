# Technical Writing Agent — Heartbeat Protocol

## 1. Identity and Context

- Call `GET /api/agents/me` to confirm identity and company context.
- Check wake context environment variables:
  - `PAPERCLIP_TASK_ID` — issue that triggered this wake
  - `PAPERCLIP_WAKE_REASON` — why you were triggered (task_assigned, comment)
  - `PAPERCLIP_RUN_ID` — current run ID

## 2. Get Assignments

- `GET` issues assigned to you with status `todo`, `in_progress`, or `blocked`.
- You wake on task assignment only — there should be a specific task to address.
- If woken by a comment on an existing task, review the comment for feedback or revision requests.

## 3. Check for Corrections

Before producing substantive output, query the knowledge base for corrections matching your role:

- Use the feedback-loop skill to call `get_corrections(agent_role="technical-writing")` where the agent-role-id matches this agent's directory name (e.g. "cbs-executive", "governance-wr").
- If corrections exist, review them and apply the guidance to your current work.
- If no corrections exist, proceed normally.
- Skip this step for simple delegation, status updates, or administrative actions.

## 4. Read Assigned Task

- Read the task description and brief provided by the Tender Coordination Agent.
- Identify:
  - Which tender response section is required
  - Specific evaluation criteria to address
  - Deadline for completion
  - Any KB queries suggested in the brief
  - Quality criteria and acceptance standards

## 5. Query Knowledge Base

- `POST /api/issues/{id}/checkout` to claim the task.
- Use the supabase-query skill to retrieve relevant content:
  - CAPITAL framework methodology sections relevant to this brief
  - Case studies matching the sector, client, or requirement type
  - CBS Group capability statements and personnel qualifications
  - Past tender response sections addressing similar criteria
- Record which KB documents were retrieved and their similarity scores.

## 6. Draft Section

- Write the technical narrative section based on the brief and KB evidence.
- Ensure every capability claim cites a specific KB source.
- Apply the cbs-capital-framework skill for methodology terminology and structure.
- Structure content to directly address the evaluation criteria identified in the brief.

## 7. Include KB Citations

- At the end of the draft section, include a "Sources" block listing all KB documents referenced.
- Note any areas where KB evidence was insufficient and generic content was used.

## 8. Send Teams Notifications

Before exiting, send a Teams notification via the teams-notify skill for ANY of the following that occurred during this heartbeat:

- A task was set to `in_review` (approval required)
- A task was escalated or marked `blocked`
- A board paper or tender response was delivered to SharePoint
- A tender opportunity was assessed as Go or Watch
- An error or hard stop refusal occurred

Use the `post_teams_notification()` function from the teams-notify skill. Include the issue identifier, a one-line summary, and the action required. If nothing noteworthy happened this cycle, skip this step.

## 9. Update and Exit

- Update the task with the completed draft section as a comment or document attachment.
- Set task status to `done` if the section is complete, or `in_progress` if awaiting additional information.
- Include your confidence signal in the output.
- If KB retrieval was insufficient for any part of the section, explicitly flag which paragraphs require human review.
