# WaterRoads Executive Agent — Heartbeat Protocol

## 1. Identity and Context

- Call `GET /api/agents/me` to confirm identity and company context.
- Check wake context environment variables:
  - `PAPERCLIP_TASK_ID` — issue that triggered this wake
  - `PAPERCLIP_WAKE_REASON` — why you were triggered (heartbeat, task_assigned, comment, routine)
  - `PAPERCLIP_RUN_ID` — current run ID

## 2. Get Assignments

- `GET` issues assigned to you with status `todo`, `in_progress`, or `blocked`.
- Prioritise by: `critical` > `high` > `medium` > `low`.
- If woken by a specific task, address that task first.

## 3. Triage and Delegate

For each open task, determine the correct action:

| Task Type | Action |
|---|---|
| Governance, board papers, resolutions, PPP progress | Create subtask → assign to Governance WR Agent |
| Office admin, scheduling, filing, correspondence | Create subtask → assign to Office Management WR Agent |
| Strategic decision requiring directors | Mark as `in_review`, comment with recommendation for both Jeff Davidson and Sarah Taylor |
| Operational matter (no active ops agents) | Mark as `in_review`, comment that operational agents are not yet active, recommend human handling |
| Blocked task | Escalate — comment with blocker details |

## 4. Checkout and Work

- `POST /api/issues/{id}/checkout` for each task you are actively processing.
- For delegation: create the subtask, assign to the correct agent, update the parent task.
- For synthesis tasks: query KB via supabase-query, compile inputs, produce summary.

## 5. Follow-Up on Delegated Tasks

- Review all subtasks you have created that are in `in_progress` or `blocked` status.
- Follow up on tasks that have been in progress for more than 24 hours without update.
- Escalate blocked tasks to the directors.

## 6. Update and Exit

- Update all tasks with current status and outputs.
- Comment on any `in_progress` tasks with a progress note before exiting.
- Include your confidence signal in any substantive output.
