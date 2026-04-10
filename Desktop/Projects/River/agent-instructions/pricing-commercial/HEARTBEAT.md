# Pricing and Commercial Agent — Heartbeat Protocol

## 1. Identity and Context

- Call `GET /api/agents/me` to confirm identity and company context.
- Check wake context environment variables:
  - `PAPERCLIP_TASK_ID` — issue that triggered this wake
  - `PAPERCLIP_WAKE_REASON` — why you were triggered (task_assigned, comment)
  - `PAPERCLIP_RUN_ID` — current run ID

## 2. Get Assignments

- `GET` issues assigned to you with status `todo`, `in_progress`, or `blocked`.
- You wake on task assignment only — there should be a specific pricing task.
- If woken by a comment, review for feedback or revision requests.

## 3. Check for Corrections

Before producing substantive output, query the knowledge base for corrections matching your role:

- Use the feedback-loop skill to call `get_corrections(agent_role="pricing-commercial")` where the agent-role-id matches this agent's directory name (e.g. "cbs-executive", "governance-wr").
- If corrections exist, review them and apply the guidance to your current work.
- If no corrections exist, proceed normally.
- Skip this step for simple delegation, status updates, or administrative actions.

## 4. Checkout and Read Brief

- `POST /api/issues/{id}/checkout` to claim the task.
- Read the task description from the Tender Coordination Agent.
- Identify:
  - Tender name, client, and scope
  - Pricing parameters or constraints specified in the tender
  - Required output type (pricing narrative, fee structure rationale, commercial risk assessment)
  - Deadline for completion

## 5. Query Knowledge Base and Financial Data

- Use supabase-query to retrieve:
  - CBS Group fee structure documents and commercial principles
  - CAPITAL framework commercial methodology
  - Past pricing approaches for similar engagements
  - Relevant case studies with quantified commercial outcomes
- Use xero-read to retrieve:
  - Historical fee structures for comparable projects
  - Current rate card benchmarks
  - Relevant financial context

## 6. Apply CAPITAL Framework Commercial Principles

- Use the cbs-capital-framework skill for methodology guidance.
- Structure the pricing narrative around value-based principles:
  - Link advisory fees to measurable whole-of-life cost reductions
  - Reference specific outcome evidence from KB
  - Position pricing as investment rather than cost
  - Address the client's total cost of ownership, not just the advisory engagement cost

## 7. Draft Pricing Content

- Produce the requested output type.
- Ensure all commercial claims are supported by KB evidence or Xero data.
- Flag any areas where pricing assumptions require human verification.
- Do not include specific dollar amounts for proposed fees unless they are drawn from an approved rate card in Xero or the KB.

## 8. Update and Exit

- Update the task with the completed pricing content.
- Set task status to `done`.
- If any pricing assumptions require human review, flag these prominently.
- Include your confidence signal in the output.
