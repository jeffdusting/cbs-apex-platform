# Project River — Operator Runbook

**Version:** 1.0
**Date:** 8 April 2026
**Platform:** Paperclip AI v2026.403.0 (server @paperclipai/server@0.3.1)
**Deployment:** Railway (Docker) + Supabase (pgvector KB) + M365 Graph API + Xero OAuth

---

## Table of Contents

1. [Dashboard Access and Navigation](#1-dashboard-access-and-navigation)
2. [Reviewing and Approving Agent Tickets](#2-reviewing-and-approving-agent-tickets)
3. [Budget Warnings and Auto-Pauses](#3-budget-warnings-and-auto-pauses)
4. [Knowledge Base Updates](#4-knowledge-base-updates)
5. [Credential Rotation — GitHub PAT](#5-credential-rotation--github-pat)
6. [Adding a New Agent](#6-adding-a-new-agent)
7. [Switching an Agent to a Different Model](#7-switching-an-agent-to-a-different-model)
8. [Claude Code CLI Update](#8-claude-code-cli-update)
9. [Backup Verification and Recovery](#9-backup-verification-and-recovery)
10. [Token Consumption Monitoring](#10-token-consumption-monitoring)
11. [Hard Stop Enforcement and Activity Log Review](#11-hard-stop-enforcement-and-activity-log-review)
12. [Skills Maintenance](#12-skills-maintenance)
13. [Wet Signature Workflow](#13-wet-signature-workflow)
14. [Lightweight Rollback](#14-lightweight-rollback)
15. [Full Rollback](#15-full-rollback)
16. [Xero OAuth Token Renewal](#16-xero-oauth-token-renewal)
17. [Day 3 Failure Mode Decision Tree](#17-day-3-failure-mode-decision-tree)

---

## 1. Dashboard Access and Navigation

### Accessing the Dashboard

1. Open `https://org.cbslab.app` in a browser.
2. Authenticate using the board operator credentials (set up via `paperclipai auth login` during deployment).
3. The dashboard landing page shows all companies (CBS Group, WaterRoads, Adventure Safety, MAF/CobaltBlu).

### Key Dashboard Views

| View | Path | Purpose |
|---|---|---|
| Company Overview | `/companies/{id}` | Agent list, org chart, recent activity |
| Agent Detail | `/agents/{id}` | Configuration, heartbeat history, current status |
| Issues | `/companies/{id}/issues` | All tasks — filter by status, agent, priority |
| Activity Log | `/companies/{id}/activity` | Audit trail of all agent and operator actions |
| Costs | `/companies/{id}/costs` | Budget utilisation, per-agent spend |
| Approvals | `/companies/{id}/approvals` | Pending hire requests and approval items |
| Org Chart | `/companies/{id}/org` | Hierarchical agent structure |

### Navigation Tips

- Use the company switcher (top-left) to move between CBS Group and WaterRoads.
- The activity log is the primary audit tool — check it daily during Sprint 1.
- Agent status indicators: `idle` (green), `running` (blue), `paused` (amber), `error` (red).

---

## 2. Reviewing and Approving Agent Tickets

### Issue Lifecycle

Issues follow this status flow:

```
backlog → todo → in_progress → in_review → done
                     ↓
                  blocked → (escalated to operator)
```

### Reviewing an Issue

1. Navigate to **Issues** for the relevant company.
2. Filter by `status: in_review` to see items awaiting your approval.
3. Open the issue. Read the agent's output and any attached documents.
4. Check the confidence signal at the bottom of the agent's output:
   - **High confidence** — proceed to approve if output meets quality standards.
   - **Medium confidence** — review the cited KB sources; verify key claims.
   - **Low confidence / insufficient source material** — the agent flagged gaps. Review carefully and supplement if needed.

### Approving or Rejecting

| Action | Method | Effect |
|---|---|---|
| **Approve** | Change status to `done` | Task marked complete. Agent moves to next task. |
| **Reject** | Change status to `todo` with comment explaining the issue | Task returns to the agent's queue for rework. |
| **Request revision** | Add a comment with specific feedback, keep status as `in_review` | Agent picks up the comment in the next heartbeat. |
| **Escalate** | Change status to `blocked` with comment | Task is flagged as blocked. Investigate the root cause. |

### Approval via API

```bash
# Move issue to done
curl -X PATCH http://localhost:3100/api/issues/{issueId} \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# Add a review comment
curl -X POST http://localhost:3100/api/issues/{issueId}/comments \
  -H "Content-Type: application/json" \
  -d '{"body": "Approved. Good quality output."}'
```

---

## 3. Budget Warnings and Auto-Pauses

### Budget Model

Budgets are set in US cents per calendar month (UTC) via `budgetMonthlyCents` on each agent.

### Threshold Behaviour

| Threshold | Effect |
|---|---|
| **80% utilisation** | Soft alert — agent should focus on critical tasks only. Check the activity log for a `budget.policy_upserted` event. |
| **100% utilisation** | Auto-pause — agent is paused by the platform. `pauseReason` is set on the agent object. |

### Responding to an 80% Warning

1. Check the costs dashboard: **Costs** > **By Agent**.
2. Review what the agent has been working on — look at completed issues this month.
3. If spend is legitimate (high-value tasks), no action needed. The agent self-throttles at 80%.
4. If spend seems excessive, review the activity log for unusual patterns (repeated failures, loops, large outputs).
5. Consider increasing the budget via API:

```bash
curl -X PATCH http://localhost:3100/api/agents/{agentId} \
  -H "Content-Type: application/json" \
  -d '{"budgetMonthlyCents": 7500}'
```

### Responding to a 100% Auto-Pause

1. The agent is paused. No further heartbeats will execute until the budget is increased or the calendar month resets.
2. Check if any critical tasks are in progress. If so, increase the budget to allow completion.
3. To unpause, increase the budget. The platform will resume the agent automatically.
4. If the auto-pause is expected (end of month, low-priority agent), no action needed — the budget resets on the first of the next month (UTC).

---

## 4. Knowledge Base Updates

### Adding Content to the Knowledge Base

1. Export the new content as a markdown file.
2. Place the file in the `knowledge-base/` directory with the naming convention: `{entity}-{topic}.md` (e.g. `cbs-group-new-case-study.md`).
3. Update `knowledge-base/index.md` to include the new file.
4. Run the ingestion script to chunk and embed the content into Supabase:

```bash
cd river-config
python3 scripts/ingest-kb.py --file knowledge-base/cbs-group-new-case-study.md \
  --entity cbs-group --category capability
```

5. Verify ingestion by checking the document count in Supabase:

```bash
python3 scripts/verify-kb.py --entity cbs-group
```

### Updating Existing Content

1. Edit the markdown file in `knowledge-base/`.
2. Re-run the ingestion script with `--replace` flag to replace existing chunks:

```bash
python3 scripts/ingest-kb.py --file knowledge-base/cbs-group-capital-methodology.md \
  --entity cbs-group --category methodology --replace
```

### Content Guidelines

- Use Australian spelling throughout.
- Remove any client-confidential information before ingesting. The knowledge base is accessible to all agents in the entity.
- Include source attribution at the top of each file.
- Maximum recommended file size: 500 KB per markdown file. Larger files should be split by topic.

---

## 5. Credential Rotation — GitHub PAT

The GitHub Personal Access Token (PAT) is used by agents for repository access. It expires and must be rotated every 90 days.

### Rotation Procedure

1. Go to GitHub > Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens.
2. Generate a new token with the same repository access and permissions as the current token.
3. Update the agent environment variable via API:

```bash
curl -X PATCH http://localhost:3100/api/agents/{agentId} \
  -H "Content-Type: application/json" \
  -d '{
    "adapterConfig": {
      "env": {
        "GITHUB_TOKEN": { "type": "plain", "value": "ghp_newTokenValueHere" }
      }
    }
  }'
```

4. Repeat for all agents that use the GitHub token.
5. Revoke the old token in GitHub.
6. Record the rotation date and next rotation due date.

### Rotation Schedule

| Credential | Rotation Period | Next Due |
|---|---|---|
| GitHub PAT | 90 days | [Set after deployment] |
| Microsoft client secret | 24 months (set at creation) | [Set after deployment] |
| Xero OAuth refresh token | Re-authorise if unused for 60 days | Ongoing |

---

## 6. Adding a New Agent

### Via Dashboard

1. Navigate to the company in the dashboard.
2. Select **Agents** > **Add Agent**.
3. Fill in: name, role (from the valid enum: `ceo`, `cto`, `cmo`, `cfo`, `engineer`, `designer`, `pm`, `qa`, `devops`, `researcher`, `general`), title, reporting line.
4. Configure the adapter (claude_local), model, and environment variables.
5. Submit. The agent is created in `idle` status.

### Via API (Direct — Bypasses Approval)

```bash
curl -X POST http://localhost:3100/api/companies/{companyId}/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "new-agent",
    "role": "engineer",
    "title": "New Agent Title",
    "reportsTo": "{managerAgentId}",
    "adapterType": "claude_local",
    "adapterConfig": {
      "model": "claude-sonnet-4-20250514",
      "cwd": "/paperclip/workspaces/{companyId}/{agentId}",
      "dangerouslySkipPermissions": true,
      "maxTurnsPerRun": 25,
      "env": {}
    },
    "runtimeConfig": {
      "heartbeat": {
        "enabled": true,
        "intervalSec": 21600,
        "cooldownSec": 10,
        "wakeOnDemand": true,
        "maxConcurrentRuns": 1
      }
    },
    "budgetMonthlyCents": 5000
  }'
```

### Post-Creation Steps

1. Write instruction files (AGENTS.md, HEARTBEAT.md, SOUL.md, TOOLS.md) to the agent's `instructionsRootPath`.
2. Sync skills to the agent: `POST /api/agents/{id}/skills/sync` with the desired skill list.
3. Verify the agent appears in the org chart.
4. Trigger a test heartbeat: `POST /api/agents/{id}/heartbeat/invoke`.
5. Monitor the first heartbeat in the activity log.

---

## 7. Switching an Agent to a Different Model

Change the model in the agent's adapter configuration:

```bash
curl -X PATCH http://localhost:3100/api/agents/{agentId} \
  -H "Content-Type: application/json" \
  -d '{
    "adapterConfig": {
      "model": "claude-haiku-4-20250414"
    }
  }'
```

### Available Models

| Model | Use Case | Relative Cost |
|---|---|---|
| `claude-sonnet-4-20250514` | General purpose, most agents | Medium |
| `claude-opus-4-20250514` | Complex reasoning, executive agents | High |
| `claude-haiku-4-20250414` | Simple tasks, compliance checks, office management | Low |

### When to Switch

- Switch to Haiku for agents consistently producing high-confidence output on straightforward tasks (compliance checklists, administrative coordination).
- Switch to Opus for agents struggling with complex reasoning tasks (tender strategy, executive synthesis).
- Monitor token consumption after switching — Haiku uses significantly fewer tokens but may require more turns for complex tasks.

---

## 8. Claude Code CLI Update

The Claude Code CLI is bundled in the Paperclip Docker image. To update:

1. Check the current version:

```bash
# SSH into the Railway container or use Railway CLI
railway run claude --version
```

2. Update the Docker image tag in the Railway service configuration:
   - Go to Railway dashboard > River service > Settings > Deploy.
   - Change the image reference to the latest Paperclip image digest.
   - Alternatively, if using `ghcr.io/paperclipai/paperclip:latest`, trigger a redeployment.

3. Verify the update after redeployment:

```bash
railway run claude --version
```

4. Run a test heartbeat on one agent to confirm the new CLI version works correctly.

### Rollback

If the new CLI version causes issues, revert the Docker image tag to the previous known-good digest:

```
ghcr.io/paperclipai/paperclip@sha256:791f3493d101154cb8a991a3895160297fae979f50cba657032ae4ce18132bff
```

---

## 9. Backup Verification and Recovery

### Railway PostgreSQL

Railway manages PostgreSQL backups. The Paperclip database contains agent state, issues, activity logs, and configuration.

**Verification:**
1. Go to Railway dashboard > Database service > Backups tab.
2. Confirm that automated backups are running daily.
3. Verify the most recent backup timestamp is within 24 hours.

**Recovery:**
1. In the Railway dashboard, select the backup to restore from.
2. Create a new database instance from the backup.
3. Update the `DATABASE_URL` environment variable on the Paperclip service to point to the restored database.
4. Restart the Paperclip service.

### Supabase (Knowledge Base)

Supabase provides Point-in-Time Recovery (PITR) for the pgvector knowledge base.

**Verification:**
1. Go to Supabase dashboard > Project > Settings > Database > Backups.
2. Confirm PITR is enabled and the recovery window covers at least 7 days.

**Recovery:**
1. In the Supabase dashboard, select Database > Backups > Point-in-Time Recovery.
2. Choose the recovery target time (before the incident).
3. Confirm the recovery. Supabase will restore the database to the specified point.
4. Verify document counts match expected values:

```bash
python3 scripts/verify-kb.py --all-entities
```

### Recovery Priority

| System | Priority | Impact of Loss |
|---|---|---|
| Railway PostgreSQL | Critical | Agent state, all issue history, configuration |
| Supabase pgvector | High | Knowledge base — can be re-ingested from source files but takes time |
| SharePoint documents | Medium | Governance documents — originals exist in the generation pipeline |
| Agent instruction files | Low | Stored in git — restore from repository |

---

## 10. Token Consumption Monitoring

### Daily Monitoring

1. Check the costs dashboard: **Costs** > **Summary** for the company-level view.
2. Check **Costs** > **By Agent** for per-agent breakdown.
3. Look for anomalies:
   - Any single agent consuming more than 40% of the company budget.
   - Day-over-day spend increase greater than 50%.
   - Agents with zero spend (may indicate a broken heartbeat).

### API Monitoring

```bash
# Company-level cost summary
curl http://localhost:3100/api/companies/{companyId}/costs/summary

# Per-agent costs
curl http://localhost:3100/api/companies/{companyId}/costs/by-agent
```

### Anomaly Detection

| Signal | Possible Cause | Action |
|---|---|---|
| Agent spend spikes suddenly | Looping on a failed task | Check activity log, pause agent if needed |
| Agent has zero spend for 48+ hours | Heartbeat not firing, agent paused, or no tasks | Check agent status and heartbeat configuration |
| All agents spending at similar rate | Normal operation | No action |
| Tier 3 agent outspending Tier 1 | Complex task assigned to a lightweight agent | Review task assignment, consider model upgrade |

---

## 11. Hard Stop Enforcement and Activity Log Review

### Hard Stop Prohibitions

Every agent has the following prohibitions in their instructions:

1. Must not send any email, message, or communication to any external party.
2. Must not submit any document to any tender portal or external system.
3. Must not create, modify, or delete any financial record in Xero.
4. Must not publish any content to any external channel.
5. Must not approve or execute any resolution, contract, or commitment.

### Enforcement Layers

| Layer | Mechanism |
|---|---|
| **Instruction-level** | Hard stop text in every AGENTS.md file |
| **Permission-level** | Xero OAuth has read-only scopes; M365 Graph has no Mail.Send permission |
| **Skill-level** | xero-read skill explicitly states write prohibition |
| **Review-level** | All external-facing outputs require `in_review` status and human approval |

### Activity Log Review

Review the activity log daily during Sprint 1, then weekly once stable:

```bash
curl http://localhost:3100/api/companies/{companyId}/activity?limit=50
```

Look for:
- Any `issue.status_changed` events where an agent moved a task to `done` without going through `in_review` (for tasks that require approval).
- Any error events indicating permission failures (which may mean an agent attempted a prohibited action).
- Any unusual API calls logged in the activity trail.

---

## 12. Skills Maintenance

### Adding a New Skill

1. Create the skill directory: `skills/{skill-name}/SKILL.md`.
2. Write the skill instructions following the Paperclip convention (structured markdown).
3. Import the skill to the company:

```bash
curl -X POST http://localhost:3100/api/companies/{companyId}/skills/import \
  -H "Content-Type: application/json" \
  -d '{"path": "skills/{skill-name}"}'
```

4. Sync the skill to relevant agents:

```bash
curl -X POST http://localhost:3100/api/agents/{agentId}/skills/sync \
  -H "Content-Type: application/json" \
  -d '{"skills": ["paperclip", "supabase-query", "{new-skill-name}"]}'
```

### Updating an Existing Skill

1. Edit the `SKILL.md` file in the skill directory.
2. The skill content is loaded from disk at heartbeat time. Changes take effect on the next heartbeat cycle.
3. For immediate effect, invoke a manual heartbeat: `POST /api/agents/{agentId}/heartbeat/invoke`.

### Skill Assignment Matrix

| Skill | CBS Executive | Tender Intel | Tender Coord | Tech Writing | Compliance | Pricing | Gov CBS | Office CBS | Research | WR Exec | Gov WR | Office WR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| paperclip | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| supabase-query | Y | Y | Y | Y | Y | Y | Y | | Y | Y | Y | |
| xero-read | | | | | | Y | Y | | | | | |
| sharepoint-write | Y | | Y | | | | Y | | | Y | Y | |
| teams-notify | Y | | Y | | | | Y | | | Y | Y | |
| cbs-capital-framework | Y | Y | Y | Y | | Y | | | Y | | | |
| tender-portal-query | | Y | | | | | | | | | | |

---

## 13. Wet Signature Workflow

Board resolutions, minutes confirmations, and certain governance documents require wet (physical) signatures.

### Procedure

1. **Agent generates the document** — the governance agent drafts the resolution or minutes and uploads to SharePoint via sharepoint-write.
2. **Operator receives notification** — the agent posts to Teams via teams-notify, flagging the document as requiring signature.
3. **Print the document** — download from SharePoint and print.
4. **Obtain signatures** — have the required signatories sign the printed document.
   - CBS Group: Jeff Davidson (and any additional directors).
   - WaterRoads: Both Jeff Davidson and Sarah Taylor must sign.
5. **Scan the signed document** — scan to PDF at a minimum of 300 DPI.
6. **Upload to SharePoint** — upload the signed PDF to the same SharePoint folder, using the naming convention `{original-name}-SIGNED.pdf`. For example: `CBS-RES-2026-001-SIGNED.pdf`.
7. **Update the governance register** — add an entry to the governance register noting the resolution number, date signed, and SharePoint path of the signed copy.

### Naming Convention for Signed Documents

| Original | Signed Copy |
|---|---|
| `CBS-RES-2026-001.docx` | `CBS-RES-2026-001-SIGNED.pdf` |
| `WR-RES-2026-001.docx` | `WR-RES-2026-001-SIGNED.pdf` |
| `CBS-Minutes-2026-04-15.docx` | `CBS-Minutes-2026-04-15-SIGNED.pdf` |

---

## 14. Lightweight Rollback

Use a lightweight rollback when an agent is producing poor-quality output or behaving incorrectly, but the underlying infrastructure is sound.

### Procedure

1. **Pause the agent:**

```bash
curl -X PATCH http://localhost:3100/api/agents/{agentId} \
  -H "Content-Type: application/json" \
  -d '{"runtimeConfig": {"heartbeat": {"enabled": false}}}'
```

2. **Diagnose the issue:**
   - Review the agent's recent activity log entries.
   - Read the agent's last heartbeat output (issue comments, task updates).
   - Check if the issue is in the instructions, the skill content, or the knowledge base.

3. **Fix the instructions or skill:**
   - Edit the relevant file (AGENTS.md, HEARTBEAT.md, SKILL.md, etc.) in the repository.
   - If the fix is in agent instructions, write the updated file to the agent's `instructionsRootPath`.

4. **Re-enable the agent:**

```bash
curl -X PATCH http://localhost:3100/api/agents/{agentId} \
  -H "Content-Type: application/json" \
  -d '{"runtimeConfig": {"heartbeat": {"enabled": true}}}'
```

5. **Trigger a test heartbeat:**

```bash
curl -X POST http://localhost:3100/api/agents/{agentId}/heartbeat/invoke
```

6. **Monitor the next 2-3 heartbeat cycles** to confirm the fix is effective.

---

## 15. Full Rollback

Use a full rollback when the platform is in a broken state — data corruption, misconfigured infrastructure, or a bad deployment.

### Railway PostgreSQL Rollback

1. Pause all agents (disable heartbeats on every agent).
2. Restore the Railway PostgreSQL database from backup (see Section 9).
3. Update `DATABASE_URL` if the restored database has a different connection string.
4. Restart the Paperclip service.
5. Verify agent state:

```bash
curl http://localhost:3100/api/companies/{companyId}/agents
```

6. Re-enable agents one at a time, starting with the CBS Executive.

### Supabase Rollback

1. Use Supabase PITR to restore to a point before the issue (see Section 9).
2. Verify document counts:

```bash
python3 scripts/verify-kb.py --all-entities
```

3. If counts are incorrect, re-ingest from source files in `knowledge-base/`.

### Docker Image Rollback

If a Paperclip update caused the issue:

1. Revert the Railway service to the known-good Docker image digest:
   ```
   ghcr.io/paperclipai/paperclip@sha256:791f3493d101154cb8a991a3895160297fae979f50cba657032ae4ce18132bff
   ```
2. Redeploy the Railway service.
3. Verify the server version: check the dashboard footer or `GET /api/health`.

---

## 16. Xero OAuth Token Renewal

Xero uses OAuth 2.0 with refresh tokens. The refresh token expires if unused for 60 days. When it expires, browser-based re-authorisation is required.

### When to Renew

- The governance agent (governance-cbs) reports a Xero token refresh failure.
- A Teams notification alerts you that Xero re-authorisation is required.
- The activity log shows a Xero 401 error.

### Re-Authorisation Procedure

1. Open the Xero developer app settings: `https://developer.xero.com/app/manage`.
2. Select the River integration app.
3. Navigate to the OAuth 2.0 configuration.
4. Click "Connect" and sign in with the Xero organisation credentials.
5. Authorise the app for the CBS Group Xero organisation.
6. Copy the new refresh token from the callback.
7. Update the agent environment variable:

```bash
curl -X PATCH http://localhost:3100/api/agents/{governanceCbsAgentId} \
  -H "Content-Type: application/json" \
  -d '{
    "adapterConfig": {
      "env": {
        "XERO_REFRESH_TOKEN": { "type": "plain", "value": "newRefreshTokenHere" }
      }
    }
  }'
```

8. Also update the pricing-commercial agent if it uses Xero.
9. Trigger a test heartbeat on the governance agent to verify the new token works.

### Prevention

- The governance agent runs on a 3-week cycle. As long as it executes at least once every 60 days, the refresh token stays valid.
- If an agent is paused for an extended period, set a calendar reminder to manually refresh the Xero token before 60 days elapse.

---

## 17. Day 3 Failure Mode Decision Tree

On Day 3, the system should be operational with CBS Group agents running and WaterRoads preparation in progress. Use this decision tree if things are not working as expected.

### Agent Cannot Authenticate (PAPERCLIP_API_KEY Not Injected)

```
Agent reports "PAPERCLIP_API_KEY not injected" or API calls return 401/403
└── Check Railway env vars:
    railway variables | grep AGENT_JWT
    ├── PAPERCLIP_AGENT_JWT_SECRET is missing
    │   └── Fix: railway variables set PAPERCLIP_AGENT_JWT_SECRET="$(openssl rand -base64 32)"
    │       This triggers a redeployment. Session cookies are invalidated — re-login required.
    └── PAPERCLIP_AGENT_JWT_SECRET is set
        └── Check server logs for JWT errors: railway logs -n 50
```

**Background:** The Paperclip server uses `PAPERCLIP_AGENT_JWT_SECRET` to mint JWT tokens that are auto-injected as `PAPERCLIP_API_KEY` into agent heartbeat runs. Without this secret, agents spawn but cannot call the Paperclip API (cannot list issues, create subtasks, update status, etc.). This is a required variable for `PAPERCLIP_DEPLOYMENT_MODE=authenticated`.

### Agent Not Executing Heartbeats

```
Agent heartbeat not firing
├── Check agent status
│   ├── Status: "paused"
│   │   ├── pauseReason: "budget_exceeded" → Increase budget (Section 3)
│   │   └── pauseReason: other → Review reason, fix, unpause
│   ├── Status: "error"
│   │   └── Check activity log for error details → Fix and re-enable
│   └── Status: "idle" (should be running)
│       ├── Check runtimeConfig.heartbeat.enabled → Should be true
│       ├── Check runtimeConfig.heartbeat.intervalSec → Should be > 0
│       ├── Check HEARTBEAT_SCHEDULER_ENABLED env var on Railway → Should be "true"
│       └── Manual invoke: POST /api/agents/{id}/heartbeat/invoke → Check response
```

### Agent Producing Poor Output

```
Agent output quality is poor
├── Check confidence signal in output
│   ├── "Low confidence / insufficient source material"
│   │   └── Knowledge base gap → Add content (Section 4)
│   ├── "Medium confidence"
│   │   └── Review KB retrieval results → Refine query filters or add content
│   └── No confidence signal present
│       └── Instructions issue → Check AGENTS.md includes confidence signalling directive
├── Check if correct skills are synced
│   └── GET /api/agents/{id} → Check skills list → Sync if missing (Section 12)
├── Check model assignment
│   └── Haiku on a complex task? → Upgrade to Sonnet (Section 7)
└── Check instruction files
    └── Read AGENTS.md in instructionsRootPath → Verify content is correct
```

### Integration Failures

```
Integration not working
├── Xero returning 401
│   └── Token expired → Re-authorise (Section 16)
├── SharePoint upload failing
│   ├── 401 → Client secret expired or consent revoked → Check Azure AD
│   ├── 403 → Permissions not granted → Check app registration
│   └── 404 → Site ID or folder path wrong → Verify configuration
├── Teams notification failing
│   ├── 401 → Same as SharePoint (shared credentials)
│   ├── 403 → ChannelMessage.Send not consented → Grant admin consent
│   └── 404 → Team or channel ID wrong → Verify TEAMS_TEAM_ID and TEAMS_CHANNEL_ID
├── Supabase query returning empty results
│   ├── Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
│   ├── Verify documents exist: python3 scripts/verify-kb.py
│   └── Check embedding dimensions match (must be 1024 for voyage-3.5)
└── GitHub access failing
    └── PAT expired → Rotate (Section 5)
```

### Platform-Level Failures

```
Paperclip platform issues
├── Dashboard not loading
│   ├── Check Railway service status → Redeploy if crashed
│   ├── Check DATABASE_URL → Verify PostgreSQL is running
│   └── Check PAPERCLIP_PUBLIC_URL → Must match actual URL
├── All agents paused simultaneously
│   ├── Company-level budget exceeded → Increase company budget
│   └── Platform error → Check Railway logs
├── Heartbeats queueing but not completing
│   ├── Check ANTHROPIC_API_KEY → Must be valid
│   ├── Check Claude API status → status.anthropic.com
│   └── Check agent cwd → Must exist and be writable
└── Data appears corrupted
    └── Full rollback (Section 15)
```

---

*This runbook covers Sprint 1 operations. It will be expanded in subsequent sprints as new integrations and agents are added. For issues not covered here, check the Paperclip documentation or contact the platform administrator.*
