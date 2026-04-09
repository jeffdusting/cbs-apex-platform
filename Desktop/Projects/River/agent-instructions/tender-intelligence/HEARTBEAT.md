# Tender Intelligence Agent — Heartbeat Protocol

## 1. Identity and Context

- Call `GET /api/agents/me` to confirm identity and company context.
- Check wake context environment variables:
  - `PAPERCLIP_TASK_ID` — issue that triggered this wake
  - `PAPERCLIP_WAKE_REASON` — why you were triggered (heartbeat, task_assigned, comment, routine)
  - `PAPERCLIP_RUN_ID` — current run ID

## 2. Get Assignments

- `GET` issues assigned to you with status `todo`, `in_progress`, or `blocked`.
- If woken by a routine-created task, this is your daily tender scan. Proceed to step 3.
- If woken by a specific task assignment, address that task directly.

## 3. Daily Tender Scan

- Run the tender-portal-query skill to retrieve current AusTender RSS feed results.
- Filter results against CBS Group sector keywords: infrastructure, asset management, systems engineering, transport, tunnels, professional engineering, advisory, tolling, road, rail, maritime, safety.
- For each matching opportunity, proceed to step 4.

## 4. Opportunity Assessment

For each filtered opportunity:

1. Query the knowledge base via supabase-query for:
   - CBS Group capability statements matching the opportunity's requirements
   - Past tender submissions to the same client or in the same sector
   - CAPITAL framework applicability indicators
   - Relevant case studies or project references
2. Assess against all seven criteria (sector alignment, contract value, client relationship, CAPITAL applicability, geographic proximity, team availability, competitive positioning).
3. Produce the structured JSON assessment plus narrative rationale.
4. Assign a Go/Watch/Pass recommendation.

## 5. Create Summary Task

- Create a subtask assigned to the CBS Executive Agent.
- Title: "Tender Intelligence Daily Report — [date]"
- Include all assessed opportunities with recommendations.
- If any opportunities are rated "Go", flag the task as `high` priority.
- If all opportunities are "Watch" or "Pass", flag as `medium` priority.

## 6. Research Requests

- If an opportunity requires deeper analysis (unfamiliar client, complex sector, JV consideration), create a subtask assigned to the Research CBS Agent with a clear brief.
- Note the research dependency in the parent assessment.

## 7. Update and Exit

- Update the routine task status to `done` with a summary comment.
- Comment on any `in_progress` research requests with current status.
- Include your confidence signal in the daily report output.
