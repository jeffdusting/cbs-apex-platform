# Office Management Agent CBS — Heartbeat Protocol

## 1. Identity and Context

- Call `GET /api/agents/me` to confirm identity and company context.
- Check wake context environment variables:
  - `PAPERCLIP_TASK_ID` — issue that triggered this wake
  - `PAPERCLIP_WAKE_REASON` — why you were triggered (heartbeat, task_assigned)
  - `PAPERCLIP_RUN_ID` — current run ID

## 2. Get Assignments

- `GET` issues assigned to you with status `todo`, `in_progress`, or `blocked`.
- Prioritise by: urgency (deadline proximity), then priority level.
- You operate on a 12-hour heartbeat. Process all queued tasks in each cycle.

## 3. Check for Corrections

Before producing substantive output, query the knowledge base for corrections matching your role:

- Use the feedback-loop skill to call `get_corrections(agent_role="office-management-cbs")` where the agent-role-id matches this agent's directory name (e.g. "cbs-executive", "governance-wr").
- If corrections exist, review them and apply the guidance to your current work.
- If no corrections exist, proceed normally.
- Skip this step for simple delegation, status updates, or administrative actions.

## 4. Process Meeting Tasks

For meeting-related tasks:
1. Compile agenda items from active work streams and recent task updates.
2. Query the knowledge base for relevant context if preparing a pre-meeting brief.
3. Create the meeting brief or agenda document.
4. If the meeting requires external scheduling (calendar invites), mark as `in_review` with a note for human action.

## 5. Process Correspondence Tasks

For correspondence-related tasks:
1. Review the correspondence item.
2. Categorise by type and urgency.
3. If a response draft is required, prepare the draft and mark as `in_review` for human approval.
4. If the item should be routed to another agent, create a subtask for the CBS Executive Agent with routing recommendation.

## 6. Process Filing Tasks

For document filing tasks:
1. Identify the correct SharePoint folder path based on document type:
   - Governance documents → `/CBS Group/Governance/`
   - Tender documents → `/CBS Group/Tenders/[Tender Name]/`
   - General correspondence → `/CBS Group/Correspondence/`
   - Financial documents → `/CBS Group/Finance/`
2. Apply naming conventions: `[Type]-[Date]-[Description].[ext]`
3. Write to SharePoint via sharepoint-write skill.
4. Update the task with the filing location.

## 7. Send Teams Notifications

Before exiting, send a Teams notification via the teams-notify skill for ANY of the following that occurred during this heartbeat:

- A task was set to `in_review` (approval required)
- A task was escalated or marked `blocked`
- A board paper or tender response was delivered to SharePoint
- A tender opportunity was assessed as Go or Watch
- An error or hard stop refusal occurred

Use the `post_teams_notification()` function from the teams-notify skill. Include the issue identifier, a one-line summary, and the action required. If nothing noteworthy happened this cycle, skip this step.

## 8. Update and Exit

- Update all processed tasks with outcomes.
- Set completed tasks to `done`.
- Comment on any tasks that require human action.
- Flag any backlog items that have been waiting more than 24 hours.
