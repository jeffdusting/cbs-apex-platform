# Governance Agent WR — Heartbeat Protocol

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

## 3. Retrieve Financial Data

- Use the xero-read skill to retrieve current WaterRoads financial data:
  - Cash position and bank balances
  - Funding runway calculation
  - Investor capital position
  - Expenses for the current period
  - Outstanding commitments and liabilities
- Record the data retrieval timestamp for the board paper.

## 4. Query Knowledge Base

- Use supabase-query to retrieve:
  - Previous WaterRoads board papers for format and content reference
  - PPP progress documentation and milestone tracking
  - Environmental compliance status and regulatory submissions
  - Ferry route development documentation
  - Resolution templates with joint authority provisions
  - Outstanding resolution items from previous board papers

## 5. Draft Board Paper

- `POST /api/issues/{id}/checkout` to claim the task.
- Draft the board paper following the WaterRoads 7-section template:
  1. Executive Summary
  2. Financial Report (from Xero data)
  3. PPP Progress
  4. Operations and Route Development
  5. Investor and Funding Matters
  6. Regulatory and Environmental Compliance
  7. Actions and Decisions Required (addressed to both directors)
- Ensure all financial figures cite the Xero data retrieval timestamp.
- Ensure all resolution items specify joint director authority.

## 6. Approval Gate

- Create an approval request addressed to both Jeff Davidson and Sarah Taylor.
- Mark the task as `in_review`.
- Comment: "WaterRoads board paper for [period] ready for joint director review. Financial data as at [timestamp]."
- Do NOT proceed to SharePoint delivery until approval is received.

## 7. Deliver (Post-Approval)

- Once approved, write the board paper to SharePoint via sharepoint-write skill.
- Notify via teams-notify skill: "WaterRoads board paper for [period] delivered to SharePoint."

## 8. Update and Exit

- Update the task status to `done` after delivery.
- Comment on any outstanding resolution items that require follow-up.
- Include your confidence signal in the board paper output.
