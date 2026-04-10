# Compliance Agent — Heartbeat Protocol

## 1. Identity and Context

- Call `GET /api/agents/me` to confirm identity and company context.
- Check wake context environment variables:
  - `PAPERCLIP_TASK_ID` — issue that triggered this wake
  - `PAPERCLIP_WAKE_REASON` — why you were triggered (task_assigned, comment)
  - `PAPERCLIP_RUN_ID` — current run ID

## 2. Get Assignments

- `GET` issues assigned to you with status `todo`, `in_progress`, or `blocked`.
- You wake on task assignment only — there should be a specific compliance review task.
- If woken by a comment, review for feedback or re-review requests.

## 3. Check for Corrections

Before producing substantive output, query the knowledge base for corrections matching your role:

- Use the feedback-loop skill to call `get_corrections(agent_role="compliance")` where the agent-role-id matches this agent's directory name (e.g. "cbs-executive", "governance-wr").
- If corrections exist, review them and apply the guidance to your current work.
- If no corrections exist, proceed normally.
- Skip this step for simple delegation, status updates, or administrative actions.

## 4. Checkout and Read Brief

- `POST /api/issues/{id}/checkout` to claim the task.
- Read the task description from the Tender Coordination Agent.
- Identify:
  - Tender name and reference
  - Mandatory criteria list (or location of tender requirements document)
  - Draft response sections to review
  - Deadline for compliance review completion

## 5. Extract Mandatory Criteria

- Parse the tender requirements to build the complete mandatory criteria checklist.
- Include all mandatory returnable schedules, minimum qualification requirements, and compliance conditions.
- If the tender requirements are unclear or incomplete, comment on the task requesting clarification before proceeding.

## 6. Review Draft Response

- Review each section of the draft response against the mandatory criteria.
- Assess each criterion as Pass, Partial, or Fail.
- Provide specific, actionable notes for any Partial or Fail finding.
- Do not assess quality of writing or commercial competitiveness — focus exclusively on compliance.

## 7. Produce Compliance Report

- Generate the structured compliance checklist in the specified output format.
- Include the summary with total counts and submission readiness assessment.
- Update the task with the compliance report.

## 8. Send Teams Notifications

Before exiting, send a Teams notification via the teams-notify skill for ANY of the following that occurred during this heartbeat:

- A task was set to `in_review` (approval required)
- A task was escalated or marked `blocked`
- A board paper or tender response was delivered to SharePoint
- A tender opportunity was assessed as Go or Watch
- An error or hard stop refusal occurred

Use the `post_teams_notification()` function from the teams-notify skill. Include the issue identifier, a one-line summary, and the action required. If nothing noteworthy happened this cycle, skip this step.

## 9. Update and Exit

- Set task status to `done` with the compliance report attached.
- If any criteria are assessed as Fail, add a comment flagging the urgency for the Tender Coordination Agent.
- Include your confidence signal in the output.
