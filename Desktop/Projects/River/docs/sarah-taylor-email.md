# Email to Sarah Taylor — River System Introduction

**From:** Jeff Dusting
**To:** Sarah Taylor (sarah@cbs.com.au)
**Subject:** Introducing River — your new AI assistants for CBS Group and WaterRoads

---

Hi Sarah,

I've been building something I want to introduce you to. It's called **River**, and it's a system of AI agents that can handle tender assessments, governance cycles, research tasks, and general office work across CBS Group and WaterRoads. You can now ask it to do things by email, and it will respond with completed work — or come back to you for approval first if the task is significant.

## What River can do for you

Nine AI agents work on CBS Group tasks and three on WaterRoads. They can:

- **Assess tender opportunities** — scan AusTender, Tenders.NSW, Buying for Victoria, GETS NZ, and Inland Rail daily, score them against our capability profile, and recommend Go/Watch/Pass
- **Draft tender responses** — full Bronze/Silver/Gold quality tiers following Shipley methodology, with CAPITAL framework positioning, competitor analysis, and compliance matrices
- **Prepare board papers** — pull financial data from Xero, produce the 3-week governance cycle documents (including WaterRoads joint-authority resolutions)
- **Research anything** — query our knowledge base (1,400+ documents of CBS history, tenders, methodology) and produce briefings
- **File and schedule** — handle correspondence routing, document filing to SharePoint, meeting preparation

Everything they produce requires human approval before leaving the system. They cannot send emails, submit to tender portals, or make financial commitments on our behalf. Those are hard-coded prohibitions.

## How to submit a task by email

Send an email to **rivertasks@cbs.com.au** with:

- **Subject:** `[RIVER-CBS] Your task title` (for CBS Group tasks) or `[RIVER-WR] Your task title` (for WaterRoads tasks)
- Add `[URGENT]` anywhere in the subject for high-priority tasks
- **Body:** describe what you need in plain English
- **Attachments:** optional — any documents relevant to the task (RFPs, briefs, reference material)

### Examples

**CBS Group research task:**
> To: rivertasks@cbs.com.au
> Subject: [RIVER-CBS] Summarise recent tunnelling tenders in NSW
> Body: Can you pull together a summary of tunnelling advisory tenders issued by TfNSW, Sydney Metro, and related NSW agencies over the last 6 months? Focus on contract values, CBS involvement, and outcomes.

**WaterRoads governance task:**
> To: rivertasks@cbs.com.au
> Subject: [RIVER-WR] Draft agenda for next month's board meeting
> Body: Please prepare the agenda for the 22 May 2026 WaterRoads board meeting. Include standard items plus a review of Rhodes to Barangaroo PPP progress and Q3 investor position.

**Urgent CBS task with attachments:**
> To: rivertasks@cbs.com.au
> Subject: [RIVER-CBS] [URGENT] Review attached RFP and advise on bid decision
> Body: This just landed — closing date is 15 May. Please assess and recommend Go/Watch/Pass by tomorrow. Full RFP attached.
> Attachments: tender-rfp.pdf

## What happens after you send a task

Within 2-4 hours:

1. **You'll get an email reply** confirming your task was received, with a reference number (like CBSA-31 or WAT-5) and a link to view it in the system
2. **The CEO agent assesses what's needed** — which skills, which other agents, how long it will take, how much it will cost
3. **For small tasks (under ~$10 in agent compute):** the CEO executes immediately. You'll get a Teams notification and an email with the result when it's done, typically within a few hours.
4. **For larger tasks (over $10):** the CEO sends you a task plan first — what it proposes to do, which agents will be involved, estimated cost, timeline, any risks. You approve the plan before work starts.
5. **If the task needs a new type of agent** that doesn't exist yet (e.g., a specialist for an unusual sector), the CEO will propose creating one as part of the plan for your approval.

## How you'll receive results

Two channels, same content:

- **Microsoft Teams:** a card in the River channel with a summary and an "Open in Paperclip" button that takes you to the full task and any generated documents
- **Email (to sarah@cbs.com.au):** HTML email with the same information, plus links to any documents generated on SharePoint

For WaterRoads tasks, anything requiring a board resolution will come to both of us — no resolution proceeds without both our approvals.

## What to do if something goes wrong

- **Task response looks wrong:** reply to the email with your feedback. The agent will pick it up on its next cycle and revise.
- **No response after 4 hours:** something's stuck. Let me know and I'll check.
- **Content looks hallucinated or unsupported:** reply asking the agent to cite its sources from the knowledge base. It should be able to show you the exact documents it used.

## A few things worth knowing

- **Everything is logged.** Every decision, every delegation, every output is recorded and auditable.
- **Budgets are enforced.** Each agent has a monthly spending cap. If an agent hits it, it stops until I review.
- **The knowledge base is the source of truth.** Agents are instructed not to rely on their training data for CBS or WaterRoads specifics — they must query our actual files.
- **Both of us have full visibility.** Anything the agents produce for you or me is visible to both. You'll get a full picture of CBS and WaterRoads activity.

If you want to see the full dashboard (tasks in progress, agents active, recent activity), it's at **https://org.cbslab.app** — I'll set up your access separately. There's also a cleaner review-focused view I've built at `monitoring/manager-dashboard.html` in our shared drive that just shows things needing your attention.

Have a think about what you'd like to try first. I'd suggest a simple test task — ask it to summarise something you'd find useful. You'll see how it works without committing to anything significant.

Let me know if you have questions.

Cheers,
Jeff

---

*Behind the scenes: the system runs on Paperclip AI deployed on Railway, with Supabase for the knowledge base, Microsoft Graph for SharePoint integration, Xero read-only for financials, and Google Apps Script for the email intake. Full technical documentation is in the river-config repository.*
