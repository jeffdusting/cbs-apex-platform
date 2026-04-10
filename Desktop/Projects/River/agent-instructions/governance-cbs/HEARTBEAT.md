# Governance Agent CBS — Heartbeat Protocol

## 1. Identity and Context

- Call `GET /api/agents/me` to confirm identity and company context.
- Check wake context environment variables:
  - `PAPERCLIP_TASK_ID` — issue that triggered this wake (routine-created task)
  - `PAPERCLIP_WAKE_REASON` — why you were triggered (heartbeat, task_assigned, routine)
  - `PAPERCLIP_RUN_ID` — current run ID

## 2. Get Assignments

- `GET` issues assigned to you with status `todo`, `in_progress`, or `blocked`.
- If woken by a routine-created task (3-week board paper cadence), proceed to step 3.
- If woken by a specific task (ad hoc governance request), address that task directly.

## 3. Check for Corrections

Before producing substantive output, query the knowledge base for corrections matching your role:

- Use the feedback-loop skill to call `get_corrections(agent_role="governance-cbs")` where the agent-role-id matches this agent's directory name (e.g. "cbs-executive", "governance-wr").
- If corrections exist, review them and apply the guidance to your current work.
- If no corrections exist, proceed normally.
- Skip this step for simple delegation, status updates, or administrative actions.

## 4. Retrieve Financial Data

- Use the xero-read skill to retrieve current financial data:
  - Profit and loss summary for the current period
  - Cash position and bank balances
  - Accounts receivable aging
  - Budget versus actual comparison
  - Any outstanding invoices or overdue payments
- Record the data retrieval timestamp for the board paper.

## 5. Query Knowledge Base

- Use supabase-query to retrieve:
  - Previous board papers for format and content reference
  - Governance templates and resolution templates
  - Current risk register entries
  - Strategic initiative tracking documents
  - Any outstanding resolution items from previous board papers

## 6. Draft Board Paper

- `POST /api/issues/{id}/checkout` to claim the task.
- Draft the board paper following the 7-section template:
  1. Executive Summary
  2. Financial Report (from Xero data)
  3. Operations Update (from active issues and project status)
  4. Governance Matters
  5. Risk Register
  6. Strategic Initiatives
  7. Actions and Decisions Required
- Ensure all financial figures cite the Xero data retrieval timestamp.
- Ensure all operational updates reference specific Paperclip issue identifiers.

## 7. Approval Gate

- Create an approval request for Jeff Davidson.
- Mark the task as `in_review`.
- Comment: "Board paper for [period] ready for director review. Financial data as at [timestamp]."
- Do NOT proceed to SharePoint delivery until approval is received.

## 8. Deliver (Post-Approval)

- Once approved, write the board paper to SharePoint via sharepoint-write skill.
- Notify via teams-notify skill: "CBS Group board paper for [period] delivered to SharePoint."

## 9. Update and Exit

- Update the task status to `done` after delivery.
- Comment on any outstanding resolution items that require follow-up.
- Include your confidence signal in the board paper output.
