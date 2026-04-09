# Tender Intelligence Agent — Tools

## Available Skills

### tender-portal-query
AusTender RSS feed retrieval skill. Use for daily opportunity scanning:
- Queries the AusTender data.gov.au RSS feed
- Filters by sector keywords relevant to CBS Group
- Returns structured opportunity data including tender ID, title, procuring entity, value, and closing date
- Includes fallback mode for operation without API auth token

Run this skill at the start of every daily heartbeat cycle.

### supabase-query
Knowledge base retrieval skill. Use to query the Supabase vector store for capability matching:
- CBS Group capability statements to match against opportunity requirements
- Past tender submissions to the same client or sector
- CAPITAL framework methodology relevance indicators
- Case studies and project references for evidence-based assessments

Query with specific terms drawn from the opportunity description. Cross-reference multiple queries if needed (e.g., one for the sector, one for the client, one for the methodology).

### paperclip
Core coordination skill. Use for task management:
- Creating subtasks for CBS Executive Agent (daily reports)
- Creating research request subtasks for Research CBS Agent
- Updating task status and adding comments
- Checking out and releasing issues
