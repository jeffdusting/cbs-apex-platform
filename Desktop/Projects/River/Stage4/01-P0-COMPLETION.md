# Phase 0: hyper-agent-v1 Completion

## Objective

Complete the remaining integration from hyper-agent-v1: integrate dashboard components into Vercel, generate the evaluator calibration document, wire the monitoring agent to the existing Teams webhook, and produce Mail.ReadWrite upgrade instructions.

## Prerequisites

- hyper-agent-v1 programme complete (all 6 phases, 32 files)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` set
- Vercel dashboard live at `https://monitoring-virid.vercel.app`

## Context

```bash
cat docs/hyper-agent-v1/DISCOVERY_SUMMARY.md
cat TASK_LOG.md | tail -20
cat docs/session-restart-prompt.md | head -60
```

## Tasks

### TASK 0.1: Integrate CA Approval Toggle into Dashboard

1. Read the existing dashboard: `cat monitoring/tender-dashboard.html | head -80` and `cat monitoring/api/supabase.js`
2. Read the patch: `cat scripts/ca-approval-dashboard-patch.js`
3. Integrate the CA approval button into `monitoring/tender-dashboard.html` for tenders where `lifecycle_stage = 'ca_drafted'` and `ca_send_approved = false`.
4. Use the existing Supabase proxy at `api/supabase.js`. If the proxy doesn't support PATCH, extend it.
5. Button: "Approve CA Send" → confirmation dialog → PATCH `tender_register` via proxy → button changes to "Approved ✓".

### TASK 0.2: Integrate Evaluator Tab into Dashboard

1. Read: `cat scripts/evaluator-dashboard-component.html`
2. Add an "Evaluator" tab to the dashboard navigation alongside existing tabs.
3. The tab shows: summary bar (evaluations, pass rate, avg score, pending proposals), score distribution chart, recent evaluations table (last 20), blocked work panel.
4. All data via the existing `api/supabase.js` proxy reading `evaluation_scores`, `agent_traces`, `correction_proposals`.
5. Style consistently with existing dashboard.

### TASK 0.3: Generate Evaluator Calibration Document

1. If `PAPERCLIP_SESSION_COOKIE` is valid, query Paperclip API for 10 recent completed issues from CBS Group spanning different agent roles and task types (3 tender, 2 governance, 2 executive, 3 mixed). Extract full agent response text.
2. If cookie is expired, query `agent_traces` in Supabase for 10 recent traces with diverse `agent_role` values. Use available output text.
3. If neither produces 10 outputs, create the structure with placeholder slots and instructions for Jeff to paste outputs from the Paperclip dashboard.

Create `docs/hyper-agent-v1/EVALUATOR_CALIBRATION.md`:
- Rubric scoring guide at top (from `config/evaluator-rubric-v1.json`, formatted as readable table with 1–5 descriptions)
- 10 output sections, each with: agent role, task type, date, full output text, scoring table with `| Dimension | Your score | Notes |` columns

Create `scripts/parse-calibration-scores.py`:
- Reads the completed calibration doc, parses Jeff's scores from the markdown tables
- Outputs `config/calibration-scores.json`
- Prints summary: average scores per dimension, overall average

### TASK 0.4: Wire Monitoring Agent to Teams Webhook

1. Read `agent-instructions/monitoring/AGENTS.md` and `skills/teams-notify/SKILL.md`.
2. Confirm the monitoring agent's daily digest step uses the same Teams notification mechanism as other agents. If the `teams-notify` skill isn't assigned to River Monitor, assign it via the Paperclip API.
3. Verify by reading back the agent's skill list.

### TASK 0.5: Create Mail.ReadWrite Upgrade Instructions

Create `docs/hyper-agent-v1/MAIL_READWRITE_UPGRADE.md`:
1. Read `secrets-manifest.json` for Azure AD app details.
2. Step-by-step Azure Portal instructions: App registrations → API permissions → Add Mail.ReadWrite → Grant admin consent.
3. Graph API endpoint for marking emails read: `PATCH /v1.0/users/{id}/messages/{id}` with `{"isRead": true}`.
4. Python function template for the email intake scripts.
5. List files to update: `cbs-kb-email-intake.py`, `wr-kb-email-intake.py`.

### TASK 0.6: Update BACKLOG.md

Add future notification channels to BACKLOG.md:
```markdown
### Future Notification Channels
- 🔵 WhatsApp group chat integration for monitoring digest
- 🔵 Slack channel integration as alternative notification pathway
```

## Gate Verification

```bash
echo "=== S4-P0 Gate Verification ==="

# Dashboard integration
grep -q "evaluator\|Evaluator" monitoring/tender-dashboard.html 2>/dev/null && echo "PASS: Evaluator tab in dashboard" || echo "FAIL: Evaluator tab missing"
grep -q "ca_send_approved\|caApproval" monitoring/tender-dashboard.html 2>/dev/null && echo "PASS: CA approval toggle in dashboard" || echo "FAIL: CA approval toggle missing"

# Calibration document
if [ -f "docs/hyper-agent-v1/EVALUATOR_CALIBRATION.md" ]; then
    outputs=$(grep -c "## Output" docs/hyper-agent-v1/EVALUATOR_CALIBRATION.md)
    echo "PASS: Calibration doc exists ($outputs outputs)"
else echo "FAIL: Calibration doc missing"; fi

# Parser
[ -f "scripts/parse-calibration-scores.py" ] && python3 -m py_compile scripts/parse-calibration-scores.py 2>&1 && echo "PASS: Parser compiles" || echo "FAIL: Parser issue"

# Mail.ReadWrite instructions
[ -f "docs/hyper-agent-v1/MAIL_READWRITE_UPGRADE.md" ] && echo "PASS: Mail.ReadWrite instructions exist" || echo "FAIL: Missing"

# Backlog updated
grep -q "WhatsApp\|Slack" BACKLOG.md 2>/dev/null && echo "PASS: Future channels in backlog" || echo "FAIL: Missing"
```

## Archive Point

```bash
git add -A && git commit -m "S4-P0: Completion — dashboard integration, calibration doc, Teams, Mail.ReadWrite"
git tag stage4-P0-completion
```

## TASK_LOG Entry

```markdown
## S4-P0: Completion
- **Status:** COMPLETE
- **Dashboard:** CA toggle [YES/NO], Evaluator tab [YES/NO]
- **Calibration doc:** [N] outputs populated
- **Teams webhook:** [configured/already configured]
- **Known issues:** [any]
- **Next phase:** P1 (WR Discovery) or P2 (CBS Discovery) — either can run first
```
