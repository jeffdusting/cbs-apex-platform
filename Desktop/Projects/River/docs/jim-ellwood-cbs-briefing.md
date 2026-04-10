# CBS Group — Director Briefing for Jim Ellwood

**Prepared:** 10 April 2026
**Classification:** CONFIDENTIAL — DIRECTOR USE ONLY

---

## What This Is

Project River has deployed nine AI agents to handle CBS Group's tender workflow, governance cycle, and office administration. These agents run inside a platform called Paperclip on cloud infrastructure. They cannot send emails, submit tenders, create financial records, or make any external commitment. All outputs intended for external parties require human approval.

---

## CBS Group Agent Roster

### Tier 1 — Executive

| Agent | Role | Heartbeat | Model |
|-------|------|-----------|-------|
| **CBS Executive** | Strategic oversight, delegation, board reporting | Every 6 hours | Opus 4.6 |

### Tier 2 — Functional Leads

| Agent | Role | Heartbeat | Reports To |
|-------|------|-----------|------------|
| **Tender Intelligence** | Opportunity identification, AusTender monitoring | Daily (24h) | CBS Executive |
| **Tender Coordination** | Tender response workflow management | Every 4 hours | CBS Executive |
| **Governance CBS** | Board papers, governance cycle, resolutions | Routine-driven (3-week) | CBS Executive |
| **Office Management CBS** | Admin coordination, filing, scheduling | Every 12 hours | CBS Executive |

### Tier 3 — Specialists

| Agent | Role | Heartbeat | Reports To |
|-------|------|-----------|------------|
| **Technical Writing** | Tender document drafting | On-demand | Tender Coordination |
| **Compliance** | Conditions of participation, ISSRA | On-demand | Tender Coordination |
| **Pricing and Commercial** | Fee schedules, value-based pricing | On-demand | Tender Coordination |
| **Research CBS** | Deep research, KB queries | On-demand | Tender Intelligence |

---

## Tender Workflow

When a new tender opportunity is identified:

1. **Tender Intelligence** scans AusTender daily and assesses opportunities against CBS Group's capabilities
2. **CBS Executive** receives the assessment and makes a Go/Watch/Pass recommendation
3. If Go → **Tender Coordination** creates the response workflow, delegating to Technical Writing, Compliance, and Pricing
4. Each specialist agent drafts their section, querying the CBS knowledge base for CAPITAL framework methodology, past tender content, and personnel CVs
5. **Tender Coordination** assembles the response and marks it **in_review**
6. You and Jeff review, provide feedback, and approve
7. The final document is delivered to SharePoint — **human submission to the tender portal is required**

---

## Governance Cycle

Every three weeks (1st and 22nd of each month):

1. **Governance CBS** wakes and pulls financial data from Xero (read-only)
2. Drafts a board paper following the CBS template structure
3. Marks as **in_review** and sends a Teams notification
4. Board reviews and approves
5. Approved paper is delivered to SharePoint

---

## Co-Director Transition Pathway

As CBS Group's governance evolves, the agent system supports a structured transition:

- Currently, Jeff Davidson is the sole CBS Group director with dashboard operator access
- When a co-director is appointed, the system can be updated to require joint approval (matching the WaterRoads model)
- Agent instructions, resolution templates, and approval gates can be modified to reflect the new governance structure
- No agent or infrastructure changes are required — only instruction file updates

---

## How to Review Work

1. Open `https://org.cbslab.app` and log in
2. Select **CBS Group** from the company switcher
3. Go to **Issues** → filter by `status: in_review`
4. Review the agent's output and confidence signal
5. Approve (set to **done**), request revision (comment), or reject (set to **todo** with comment)

---

## What the Agents Cannot Do

Hard-coded prohibitions in every agent:

- Send emails or external communications
- Submit documents to tender portals
- Create, modify, or delete Xero financial records
- Approve or execute contracts or commitments
- Fabricate financial figures

All external-facing outputs require human approval before action.

---

## Dashboard Access

- **URL:** `https://org.cbslab.app`
- **Login:** Board operator credentials (to be configured for your access)
- **Key views:** Issues (task queue), Activity (audit log), Costs (budget tracking), Org Chart (agent hierarchy)

---

## Monthly Budget

| Agent | Budget |
|-------|--------|
| CBS Executive | $25.00/mo |
| Tender Intelligence | $15.00/mo |
| Tender Coordination | $20.00/mo |
| Technical Writing | $25.00/mo |
| Compliance | $5.00/mo |
| Pricing and Commercial | $10.00/mo |
| Governance CBS | $15.00/mo |
| Office Management CBS | $4.00/mo |
| Research CBS | $10.00/mo |
| **Total** | **$129.00/mo** |

Budget adjustments may be made based on the token consumption analysis from Sprint 1 testing.

---

*This briefing was prepared as part of Project River Sprint 1. For questions, contact Jeff Davidson.*
