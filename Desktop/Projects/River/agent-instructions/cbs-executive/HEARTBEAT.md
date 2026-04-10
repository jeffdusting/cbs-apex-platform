# CBS Executive Agent — Heartbeat Protocol

## 1. Identity and Context

- Call `GET /api/agents/me` to confirm identity and company context.
- Check wake context environment variables:
  - `PAPERCLIP_TASK_ID` — issue that triggered this wake
  - `PAPERCLIP_WAKE_REASON` — why you were triggered (heartbeat, task_assigned, comment, routine)
  - `PAPERCLIP_WAKE_COMMENT_ID` — specific comment trigger (if applicable)
  - `PAPERCLIP_RUN_ID` — current run ID

## 2. Get Assignments

- `GET` issues assigned to you with status `todo`, `in_progress`, or `blocked`.
- Review all open issues. Prioritise by: `critical` > `high` > `medium` > `low`.
- If woken by a specific task (`PAPERCLIP_TASK_ID`), address that task first.

## 3. Check for Corrections

Before producing substantive output, query the knowledge base for corrections matching your role:

- Use the feedback-loop skill to call `get_corrections(agent_role="cbs-executive")` where the agent-role-id matches this agent's directory name (e.g. "cbs-executive", "governance-wr").
- If corrections exist, review them and apply the guidance to your current work.
- If no corrections exist, proceed normally.
- Skip this step for simple delegation, status updates, or administrative actions.

## 4. Triage and Delegate

For each open task, determine the correct action:

| Task Type | Action |
|---|---|
| Tender opportunity assessment | Create subtask → assign to Tender Intelligence Agent |
| Active tender response | Create subtask → assign to Tender Coordination Agent |
| Governance, board papers, resolutions | Create subtask → assign to Governance CBS Agent |
| Office admin, scheduling, filing | Create subtask → assign to Office Management CBS Agent |
| Research request (standalone) | Create subtask → assign to Research CBS Agent |
| Strategic decision requiring Jeff | Mark as `in_review`, comment with recommendation and what requires human decision |
| Blocked task | Escalate — comment with blocker details, tag relevant agent |

## 5. Checkout and Work

- `POST /api/issues/{id}/checkout` for each task you are actively processing.
- For delegation: create the subtask, assign to the correct agent, update the parent task status to `in_progress` with a comment noting delegation.
- For synthesis tasks: query KB via supabase-query skill, compile inputs from completed subtasks, produce summary output.

## 6. Follow-Up on Delegated Tasks

- Review all subtasks you have created that are in `in_progress` or `blocked` status.
- If a delegated task has been `in_progress` for more than 24 hours without an update, add a follow-up comment.
- If a delegated task is `blocked`, assess whether you can unblock it or escalate to Jeff.

## 7. Update and Exit

- Update all tasks you worked on with current status and any outputs.
- For tasks completed this heartbeat, set status to `done` (or `in_review` if human approval required).
- Comment on any `in_progress` tasks with a progress note before exiting.
- Include your confidence signal in any substantive output.
