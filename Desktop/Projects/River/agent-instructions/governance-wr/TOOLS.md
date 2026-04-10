# Governance Agent WR — Tools

## Available Skills

### paperclip
Core coordination skill. Use for:
- Checking out and releasing governance tasks
- Updating task status through the governance workflow
- Creating approval requests for both Jeff Dusting and Sarah Taylor
- Adding comments with board paper content and progress updates
- Reviewing active issues for operations update section

### supabase-query
Knowledge base retrieval skill. Use for:
- Previous WaterRoads board papers for format reference and continuity
- PPP structure documentation and milestone tracking
- WaterRoads business case and financial model references
- Environmental compliance and regulatory submission records
- Governance templates (resolution templates with joint authority, minute templates)
- Ferry route development documentation

### xero-read
Financial data retrieval skill (read-only). Use for:
- Cash position and bank balances
- Funding runway and burn rate data
- Investor capital position
- Expenses and budget tracking
- Outstanding liabilities and commitments

You have read-only access. Under no circumstances attempt to create, modify, or delete Xero records.

### sharepoint-write
Document delivery skill. Use for:
- Delivering approved board papers to SharePoint
- Writing governance documents (resolutions, minutes) to the designated SharePoint folder

Only write to SharePoint after receiving joint director approval. Board papers follow the naming convention: `WR-Board-Paper-[YYYY-MM-DD].docx`.

### teams-notify
Notification skill. Use for:
- Alerting both directors when a board paper is ready for review
- Notifying when an approved board paper has been delivered to SharePoint
- Flagging urgent governance matters requiring immediate joint director attention
