# Email-to-CEO Task Submission — Implementation Plan

**Date:** 13 April 2026
**Status:** FOR REVIEW

---

## 1. What This Enables

Jeff Dusting and Sarah Taylor can email a task to the CBS Executive or WR Executive agent by sending an email to a designated address. The agent assesses the task, determines what's needed, and either:
- **Under $10 estimated cost:** Executes and replies with the outcome
- **Over $10 estimated cost:** Sends a task plan back for approval before proceeding

The response comes back via Teams Adaptive Card + email with attachments/links to any generated files.

---

## 2. Architecture

```
Jeff/Sarah sends email
        ↓
Microsoft 365 mailbox (jeff@cbs.com.au)
        ↓
Power Automate flow monitors inbox for emails with subject tag [RIVER-CBS] or [RIVER-WR]
        ↓
Flow creates a Paperclip issue via API:
  - Title: email subject (minus the tag)
  - Description: email body
  - Attachments: saved to SharePoint, links included in description
  - Assigned to: CBS Executive or WR Executive (based on tag)
  - Priority: determined by tag ([URGENT] = high, default = medium)
  - Status: todo
        ↓
CEO agent wakes (heartbeat or wakeOnDemand), processes the task
        ↓
CEO assesses: what skills needed? Can existing agents handle it? Need a new agent?
        ↓
Cost estimate: will this exceed $10 in agent compute?
        ├── Under $10: Execute, respond with outcome
        └── Over $10: Send task plan to originator for approval
                ↓
        Jeff/Sarah approves via Teams card or email reply
                ↓
        CEO proceeds with execution
        ↓
Outcome delivered: Teams Adaptive Card + email with file links/attachments
```

---

## 3. Email Format

### Sending a Task

| Field | Format | Example |
|---|---|---|
| **To** | jeff@cbs.com.au (same mailbox — the flow picks it up) | jeff@cbs.com.au |
| **Subject** | `[RIVER-CBS] Your task title` or `[RIVER-WR] Your task title` | `[RIVER-CBS] Prepare a capability statement for the M6 AM panel` |
| **Body** | Free text describing the task | "We need a capability statement highlighting our M6 asset management experience..." |
| **Attachments** | Optional — tender docs, briefs, reference material | RFP.pdf, Scope.docx |

### Priority Tags (optional, in subject)

| Tag | Priority | Example |
|---|---|---|
| `[URGENT]` | high | `[RIVER-CBS] [URGENT] Respond to post-tender addendum by 5pm` |
| (no tag) | medium | `[RIVER-CBS] Research NZ tolling market for GETS opportunity` |

### Entity Routing

| Subject Tag | Routed To | Entity |
|---|---|---|
| `[RIVER-CBS]` | CBS Executive | CBS Group |
| `[RIVER-WR]` | WR Executive | WaterRoads |

---

## 4. CEO Agent Behaviour on Email Tasks

### Step 1: Assess the Task

When the CEO agent receives an email-originated task, it must:

1. Read the full description (email body)
2. Identify the task type (tender, governance, research, admin, other)
3. Determine which skills and agents are needed
4. Estimate the compute cost:
   - Simple KB query + response: ~$0.50-2.00 (under $10 → execute immediately)
   - Multi-agent workflow (tender response, board paper): ~$10-50 (over $10 → send plan)
   - New agent recruitment needed: always send plan

### Step 2: Cost Threshold Decision

**Under $10 estimated cost:**
- Execute the task directly or delegate to the appropriate agent
- When complete, send the outcome to the originator via:
  - Teams Adaptive Card with result summary and Paperclip link
  - Email with result summary and any file attachments/links

**Over $10 estimated cost:**
- Draft a task plan containing:
  - Task understanding (what was requested)
  - Proposed approach (which agents, what steps)
  - Estimated cost breakdown (agent × runs × cost/run)
  - Timeline estimate
  - Any risks or questions
- Send the plan to the originator for approval via Teams + email
- Set the task to `in_review` with the plan as a comment
- Wait for approval before proceeding

### Step 3: Agent Recruitment (if needed)

If the task requires skills not available in the current agent roster:
- CBS Executive can create new agents via the `paperclip-create-agent` skill
- New agent must follow the standard AGENTS.md template (hard stops, KB retrieval, Teams notifications, heartbeat protocol)
- New agent must have `TEAMS_WEBHOOK_URL` in env vars
- Cost of new agent must be included in the task plan sent for approval
- CBS Executive sets a specific `budgetMonthlyCents` for the new agent tied to the task scope

---

## 5. Response Delivery with Attachments

### Current Capability

Agents can write files to SharePoint via the `sharepoint-write` skill. The notification system now supports structured payloads with URLs.

### Enhanced Response Format

When delivering a task outcome, the agent sends:

```python
# Teams + Email notification with file links
post_notification(
    notification_type="TASK COMPLETE",
    entity="CBS Group",
    issue_id=issue["id"],
    issue_identifier=issue["identifier"],
    summary="Capability statement for M6 AM panel is ready.",
    action="Review the document on SharePoint.",
)
```

For file delivery, the agent:
1. Writes the document to SharePoint via `sharepoint-write`
2. Includes the SharePoint URL in the task completion comment
3. The Teams Adaptive Card links to the Paperclip issue (which contains the SharePoint link)

### Enhanced Notification with File Links

To include direct file links in notifications, we need to extend the `post_notification()` payload:

```python
payload = {
    "title": "TASK COMPLETE - CBS Group",
    "issue": "CBSA-30",
    "summary": "Capability statement for M6 AM panel ready.",
    "action": "Review on SharePoint.",
    "url": "https://org.cbslab.app/companies/.../issues/...",
    "file_url": "https://cbsaustralia.sharepoint.com/sites/.../M6-Capability-Statement.docx",
    "file_name": "M6 Capability Statement.docx",
}
```

Power Automate would need a minor update to render the file link:
- Teams: second action button "Open Document" alongside "Open in Paperclip"
- Email: second clickable link in the HTML body

---

## 6. Power Automate Flow — Email Monitoring

### New Flow: "River Email Task Intake"

**Trigger:** When a new email arrives in jeff@cbs.com.au with subject containing `[RIVER-CBS]` or `[RIVER-WR]`

**Actions:**

1. **Condition:** Check subject for `[RIVER-CBS]` or `[RIVER-WR]`
   - CBS → company_id = `fafce870-b862-4754-831e-2cd10e8b203c`, agent = CBS Executive
   - WR → company_id = `95a248d4-08e7-4879-8e66-5d1ff948e005`, agent = WR Executive

2. **Condition:** Check subject for `[URGENT]`
   - Yes → priority = "high"
   - No → priority = "medium"

3. **If attachments exist:**
   - Save each attachment to SharePoint: `/River/Email Attachments/{issue_date}/{filename}`
   - Build a list of SharePoint URLs

4. **Clean the subject:** Remove `[RIVER-CBS]`, `[RIVER-WR]`, `[URGENT]` tags

5. **Create Paperclip issue via HTTP action:**
   ```
   POST https://org.cbslab.app/api/companies/{company_id}/issues
   Cookie: __Secure-better-auth.session_token={stored_token}
   Origin: https://org.cbslab.app
   
   {
     "title": "{cleaned_subject}",
     "description": "{email_body}\n\n---\nSubmitted by: {sender_email}\nDate: {received_date}\nAttachments: {sharepoint_urls}",
     "priority": "{priority}",
     "assigneeAgentId": "{ceo_agent_id}"
   }
   ```

6. **Set issue to todo:**
   ```
   PATCH https://org.cbslab.app/api/issues/{issue_id}
   {"status": "todo"}
   ```

7. **Reply to sender:** "Your task has been submitted to River. Reference: {issue_identifier}. You will receive a Teams notification and email when the agent responds."

### Authentication Note

The Power Automate flow needs to authenticate with the Paperclip API. Options:
- Store the session cookie in a Power Automate variable (expires — needs refresh)
- Use the Paperclip board operator API key if one becomes available
- Use an HTTP action with cookie from a secure variable

---

## 7. Authorised Senders

Only authorised senders can submit tasks:

| Sender | Email | Can Submit To |
|---|---|---|
| Jeff Dusting | jeff@cbs.com.au | CBS Executive, WR Executive |
| Sarah Taylor | sarah@cbs.com.au (or her email) | WR Executive, CBS Executive |

The Power Automate flow should check the sender address before creating an issue. Unauthorised senders are ignored (or receive a "not authorised" auto-reply).

---

## 8. Implementation Components

| Component | Owner | Effort | Dependencies |
|---|---|---|---|
| Power Automate flow: Email Task Intake | Jeff (with CC guidance) | 30 min | SharePoint folder, Paperclip auth |
| CBS Executive AGENTS.md: email task handling | CC | 15 min | — |
| WR Executive AGENTS.md: email task handling | CC | 15 min | — |
| teams-notify skill: file_url support | CC | 10 min | — |
| Power Automate: update notification flow for file links | Jeff | 10 min | teams-notify update |
| SharePoint folder: `/River/Email Attachments/` | Jeff | 5 min | — |
| Test: send test email, verify full round-trip | Both | 15 min | All above |

### Implementation Order

1. CC updates CEO agent instructions with email task handling protocol
2. CC updates teams-notify skill with file_url support
3. Jeff creates SharePoint folder for attachments
4. Jeff builds Power Automate Email Task Intake flow (CC provides step-by-step)
5. Jeff updates notification flow with file link support
6. Both: test end-to-end

---

## 9. Cost Control

### Estimation Heuristics (for CEO agent)

| Task Type | Typical Agents Involved | Estimated Cost | Threshold |
|---|---|---|---|
| Simple KB query/response | CEO only | $0.50-1.50 | Under $10 → execute |
| Research brief | CEO + Research CBS | $1.50-5.00 | Under $10 → execute |
| Capability statement | CEO + Technical Writing | $3.00-8.00 | Under $10 → execute |
| Board paper section | CEO + Governance | $5.00-15.00 | May exceed → check |
| Tender response (Bronze) | CEO + 4 agents | $15.00-30.00 | Over $10 → plan first |
| Tender response (full B/S/G) | CEO + 5 agents | $30.00-80.00 | Over $10 → plan first |
| New agent recruitment | CEO + new agent setup | $10.00+ | Always plan first |

### Task Plan Format

When cost exceeds $10, the CEO agent sends:

```
TASK PLAN - APPROVAL REQUIRED
Issue: CBSA-XX
Requested by: Jeff Dusting
Task: [one-line summary]

Proposed approach:
1. [Step 1] — [Agent] — est. [cost]
2. [Step 2] — [Agent] — est. [cost]
3. [Step 3] — [Agent] — est. [cost]

Total estimated cost: $XX.XX
Timeline: X heartbeat cycles (~X hours)

Risks:
- [Any risks or dependencies]

Approve this plan to proceed, or reply with modifications.
```

---

## 10. Rollback

If the email intake doesn't work:
- Disable the Power Automate email monitoring flow
- Tasks revert to manual creation via the Paperclip dashboard
- No agent changes needed — the email handling in AGENTS.md is additive, not a replacement

---

*Awaiting your review. Once approved, CC will implement the agent-side changes and provide step-by-step Power Automate instructions.*
