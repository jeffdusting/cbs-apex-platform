# WaterRoads — Director Briefing for Sarah Taylor

**Prepared:** 10 April 2026
**Classification:** CONFIDENTIAL — DIRECTOR USE ONLY

---

## What This Is

Project River has deployed three AI agents to handle WaterRoads governance and administration. These agents work inside a platform called Paperclip, running on cloud infrastructure. They do not have access to external systems beyond what has been explicitly configured, and they cannot send emails, create financial records, or execute any commitment on your behalf.

Everything they produce requires your review and approval before it leaves the system.

---

## Your Agents

| Agent | What It Does | How Often |
|-------|-------------|-----------|
| **WR Executive** | Triages incoming work, delegates to the other two agents, synthesises reporting | Every 6 hours |
| **Governance WR** | Drafts board papers, tracks resolutions, manages the governance cycle | Every 3 weeks (routine-triggered) |
| **Office Management WR** | Filing, meeting prep, correspondence flagging | Every 12 hours |

---

## The 3-Week Board Paper Cycle

Every three weeks (1st and 22nd of each month at 8am AEST), the Governance agent wakes up and:

1. Pulls financial data from Xero (read-only — it cannot modify anything)
2. Queries the knowledge base for WaterRoads context (PPP progress, regulatory status, route development)
3. Drafts a board paper following the standard 7-section template:
   - Executive Summary
   - Financial Report
   - PPP Progress
   - Operations and Route Development
   - Investor and Funding Matters
   - Regulatory and Environmental Compliance
   - Actions and Decisions Required
4. Marks the task as **"in review"** and sends a Teams notification
5. Waits for your approval — it will not deliver the paper to SharePoint until both you and Jeff have reviewed it

---

## How to Review and Approve

1. Open `https://org.cbslab.app` in your browser and log in
2. Click on **WaterRoads** in the company list
3. Go to **Issues** and filter by `status: in_review`
4. Open the issue — the agent's draft will be in the comments
5. Check the **confidence signal** at the bottom:
   - **High confidence** — the agent found strong KB matches. Review for accuracy.
   - **Medium confidence** — some data gaps. Check the cited sources.
   - **Low confidence** — the agent flagged it can't find enough information. Supplement before approving.
6. To approve: change status to **done**
7. To request changes: add a comment with your feedback, keep status as **in_review**
8. To reject: change status to **todo** with a comment explaining why

---

## Joint Director Authority

All WaterRoads resolutions require both your signature and Jeff's. The agents know this — every resolution template includes signature blocks for both directors, and the agents will not proceed without joint approval.

The wet signature process:
1. Agent drafts the resolution and uploads to SharePoint
2. You receive a Teams notification
3. Print, both directors sign, scan at 300 DPI
4. Upload the signed PDF to SharePoint as `WR-RES-[YYYY]-[NNN]-SIGNED.pdf`

---

## What the Agents Cannot Do

These are hard-coded prohibitions that the agents will refuse to override:

- Send any email or external communication
- Submit documents to any external system
- Create, modify, or delete financial records in Xero
- Approve or execute any resolution, contract, or commitment
- Fabricate financial figures — they only use verified data from Xero or the knowledge base

If an agent encounters a request that crosses these boundaries, it will refuse and escalate to the dashboard for human action.

---

## If Something Looks Wrong

1. **Agent produces unexpected output:** Add a comment on the issue with your feedback. The agent will pick it up on its next cycle. If it's urgent, change the status to **blocked** — this flags it for immediate attention.
2. **Agent seems stuck:** Check the agent's status on the dashboard. If it shows **error**, Jeff can investigate. If it shows **paused**, the budget may have been exceeded.
3. **You're unsure about something:** Leave it in **in_review** status. Nothing moves forward until you and Jeff approve it.

---

## Dashboard Access

- **URL:** `https://org.cbslab.app`
- **Login:** Your board operator credentials (configured during setup)
- **Your company:** WaterRoads (click the company name in the top-left switcher)

---

*This briefing was prepared as part of Project River Sprint 1. For questions, contact Jeff Davidson.*
