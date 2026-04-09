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

## 3. Checkout and Read Brief

- `POST /api/issues/{id}/checkout` to claim the task.
- Read the task description from the Tender Coordination Agent.
- Identify:
  - Tender name and reference
  - Mandatory criteria list (or location of tender requirements document)
  - Draft response sections to review
  - Deadline for compliance review completion

## 4. Extract Mandatory Criteria

- Parse the tender requirements to build the complete mandatory criteria checklist.
- Include all mandatory returnable schedules, minimum qualification requirements, and compliance conditions.
- If the tender requirements are unclear or incomplete, comment on the task requesting clarification before proceeding.

## 5. Review Draft Response

- Review each section of the draft response against the mandatory criteria.
- Assess each criterion as Pass, Partial, or Fail.
- Provide specific, actionable notes for any Partial or Fail finding.
- Do not assess quality of writing or commercial competitiveness — focus exclusively on compliance.

## 6. Produce Compliance Report

- Generate the structured compliance checklist in the specified output format.
- Include the summary with total counts and submission readiness assessment.
- Update the task with the compliance report.

## 7. Update and Exit

- Set task status to `done` with the compliance report attached.
- If any criteria are assessed as Fail, add a comment flagging the urgency for the Tender Coordination Agent.
- Include your confidence signal in the output.
