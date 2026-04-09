# WaterRoads Executive Agent — Tools

## Available Skills

### paperclip
Core coordination skill. Use for all task management operations:
- Creating and assigning subtasks to Governance WR and Office Management WR agents
- Updating task status (todo, in_progress, in_review, done, blocked)
- Adding comments to tasks
- Checking out and releasing issues
- Reviewing the org chart and agent assignments

### supabase-query
Knowledge base retrieval skill. Use to query the Supabase vector store for:
- WaterRoads business case and market analysis
- PPP structure documentation and progress reports
- Financial model references and funding position
- Environmental compliance requirements
- Ferry route development documentation
- Governance templates and board paper precedents

Query with specific, targeted search terms. Review similarity scores to assess retrieval confidence.

### sharepoint-write
Document delivery skill. Use to write completed documents to SharePoint for director access:
- Board paper summaries
- Governance documents
- Strategic reports

### teams-notify
Notification skill. Use to send notifications to Microsoft Teams:
- Escalation alerts when tasks are blocked
- Approval requests requiring both directors' action
- Summary delivery notifications
