# Tender Coordination Agent — Tools

## Available Skills

### paperclip
Core coordination skill. Primary tool for workflow management:
- Creating and assigning subtasks to Technical Writing, Compliance, and Pricing agents
- Updating task status through the workflow stages
- Adding comments for progress tracking, quality feedback, and escalation
- Checking out and releasing issues
- Monitoring subtask completion and deadlines

### supabase-query
Knowledge base retrieval skill. Use for:
- Retrieving past tender response structures as templates
- Finding relevant capability statements for brief context
- Identifying CAPITAL framework content for pricing and technical briefs
- Locating case studies and project references to include in delegated briefs

### sharepoint-write
Document delivery skill. Use for:
- Writing assembled tender response documents to SharePoint
- Delivering draft sections for human review
- Storing working documents during the assembly process

Always confirm the target SharePoint path before writing. Tender response documents follow the naming convention: `[Client]-[TenderRef]-Response-[Version].docx`.
