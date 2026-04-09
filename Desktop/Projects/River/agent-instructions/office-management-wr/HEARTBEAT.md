# Office Management Agent WR — Heartbeat Protocol

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

## 3. Process Meeting Tasks

For meeting-related tasks:
1. Compile agenda items from active work streams and recent task updates.
2. Query the knowledge base for relevant WaterRoads context if preparing a pre-meeting brief.
3. Create the meeting brief or agenda document.
4. Ensure both directors (Jeff Davidson and Sarah Taylor) are noted as attendees for board and governance meetings.
5. If the meeting requires external scheduling (calendar invites), mark as `in_review` with a note for human action.

## 4. Process Correspondence Tasks

For correspondence-related tasks:
1. Review the correspondence item.
2. Categorise by type and urgency (PPP, governance, investor, regulatory, general).
3. If a response draft is required, prepare the draft and mark as `in_review` for human approval.
4. If the item should be routed to another agent, create a subtask for the WR Executive Agent with routing recommendation.

## 5. Process Filing Tasks

For document filing tasks:
1. Identify the correct SharePoint folder path based on document type:
   - Governance documents → `/WaterRoads/Governance/`
   - PPP documents → `/WaterRoads/PPP/`
   - Investor documents → `/WaterRoads/Investor Relations/`
   - Regulatory documents → `/WaterRoads/Regulatory/`
   - General correspondence → `/WaterRoads/Correspondence/`
2. Apply naming conventions: `[Type]-[Date]-[Description].[ext]`
3. Write to SharePoint via sharepoint-write skill.
4. Update the task with the filing location.

## 6. Update and Exit

- Update all processed tasks with outcomes.
- Set completed tasks to `done`.
- Comment on any tasks that require human action.
- Flag any backlog items that have been waiting more than 24 hours.
