# CBS Executive Agent — Tools

## Available Skills

### paperclip
Core coordination skill. Use for all task management operations:
- Creating and assigning subtasks to Tier 2 agents
- Updating task status (todo, in_progress, in_review, done, blocked)
- Adding comments to tasks
- Checking out and releasing issues
- Reviewing the org chart and agent assignments

### supabase-query
Knowledge base retrieval skill. Use to query the Supabase vector store for:
- CBS Group capability statements and case studies
- CAPITAL framework methodology documents
- Past tender content and responses
- Governance templates and board paper precedents
- Fee structures and commercial principles

Query with specific, targeted search terms. Review similarity scores to assess retrieval confidence. If retrieval returns fewer than 2 documents above 0.7 similarity, flag as low confidence in your output.

### sharepoint-write
Document delivery skill. Use to write completed documents to SharePoint for human access:
- Board paper summaries
- Tender response compilations
- Reporting dashboards

Always confirm the target path before writing. Documents delivered to SharePoint are considered the human-facing output.

### teams-notify
Notification skill. Use to send notifications to Microsoft Teams channels:
- Escalation alerts when tasks are blocked
- Approval requests requiring human action
- Weekly summary delivery notifications

Keep notifications concise and actionable. Include the task identifier and a direct link where possible.
