# Project River — Discovery Summary

## Generated: 2026-04-08T00:35Z (Paperclip v2026.403.0)

---

## Critical Unknown Resolutions

### 1. HEARTBEAT INTERVALS — RESOLVED

**Mechanism:** `runtimeConfig.heartbeat.intervalSec` on the agent object.

Heartbeat scheduling is controlled per-agent via `PATCH /api/agents/{agentId}` with:

```json
{
  "runtimeConfig": {
    "heartbeat": {
      "enabled": true,
      "intervalSec": 1800,
      "cooldownSec": 10,
      "wakeOnDemand": true,
      "maxConcurrentRuns": 1
    }
  }
}
```

**Confirmed fields:**
| Field | Type | Description |
|---|---|---|
| `enabled` | boolean | Enables/disables the heartbeat timer |
| `intervalSec` | integer | Seconds between heartbeats (e.g. 3600 = 1hr, 21600 = 6hr) |
| `cooldownSec` | integer | Minimum seconds between consecutive runs |
| `wakeOnDemand` | boolean | Allow on-demand heartbeat invocation |
| `maxConcurrentRuns` | integer | Max parallel heartbeat runs |

**API-settable:** YES — via `PATCH /api/agents/{agentId}` with `runtimeConfig.heartbeat`.

**CLI invoke:** `npx paperclipai heartbeat run --agent-id <agentId>` for manual trigger.

**API invoke:** `POST /api/agents/{agentId}/heartbeat/invoke` returns 202 with run object.

**Server scheduler:** Controlled by env vars `HEARTBEAT_SCHEDULER_ENABLED=true` and `HEARTBEAT_SCHEDULER_INTERVAL_MS=30000` (poll interval, not heartbeat interval).

**Implementation plan mapping:**
- 6-hour heartbeat → `intervalSec: 21600`
- 24-hour heartbeat → `intervalSec: 86400`
- 4-hour heartbeat → `intervalSec: 14400`
- 30-minute testing → `intervalSec: 1800`

**IMPORTANT:** The plan's references to "heartbeatInterval" and "schedule" fields on the agent object are incorrect. The fields `heartbeatInterval`, `heartbeatIntervalMinutes`, and `schedule` do NOT exist on the agent — PATCH accepts them silently but they are ignored (not stored). The correct path is `runtimeConfig.heartbeat.intervalSec`.

**Additionally:** Paperclip has a **Routines** system for cron-based recurring tasks (separate from heartbeat intervals). Routines create issues on a schedule. See Task 4 details below.

---

### 2. INSTRUCTIONS DELIVERY — RESOLVED

**Mechanism:** File-based managed instruction bundles at a known filesystem path.

When an agent is created, Paperclip auto-generates an instructions directory:

```
~/.paperclip/instances/default/companies/{companyId}/agents/{agentId}/instructions/
├── AGENTS.md    (entry file — main instructions)
├── HEARTBEAT.md (heartbeat checklist — auto-generated for CEO)
├── SOUL.md      (persona definition — auto-generated for CEO)
└── TOOLS.md     (tool notes — auto-generated for CEO)
```

**adapterConfig fields (auto-set on creation):**
| Field | Value |
|---|---|
| `instructionsFilePath` | Absolute path to `AGENTS.md` |
| `instructionsRootPath` | Absolute path to instructions directory |
| `instructionsEntryFile` | `AGENTS.md` |
| `instructionsBundleMode` | `managed` |

**How to deliver custom instructions:**
1. Write markdown files to the agent's `instructionsRootPath` directory
2. The entry file (`AGENTS.md`) is the main instructions file read by the adapter
3. Additional files (HEARTBEAT.md, SOUL.md, etc.) are referenced from AGENTS.md

**Changing instructions path:** `PATCH /api/agents/{agentId}/instructions-path` with `{ "path": "relative/or/absolute/path.md" }`. Relative paths resolve against `adapterConfig.cwd`.

**promptTemplate:** When passed in `adapterConfig` during creation, it becomes the content of `AGENTS.md`. The agent created with `promptTemplate: "You are a research agent..."` had that exact text written to its AGENTS.md file. So `promptTemplate` in create request → written to `AGENTS.md` on disk.

**Maximum length:** No observed limit — the file is on disk.

**API-settable:** YES — write files to the instructions directory, or use the instructions-path endpoint.

**IMPORTANT for implementation:** The plan should write River's role-specific instruction files directly to each agent's `instructionsRootPath` directory. No API upload needed — it's filesystem-based.

---

### 3. WEB SEARCH — RESOLVED

**Mechanism:** No dedicated search field on the agent. Web search is a Claude Code CLI capability.

**Findings:**
- No `search`, `webSearch`, or `tools` field exists on the agent schema
- `adapterConfig.allowedTools` can be set (accepted by PATCH) — stores an array like `["WebSearch", "WebFetch"]`. Whether the adapter enforces this list is TBD (requires heartbeat execution test)
- `runtimeConfig` accepts arbitrary keys — `runtimeConfig.webSearch: true` was accepted and stored
- Claude Code has web search enabled by default via `WebSearch` and `WebFetch` tools

**Practical approach for River:**
- Web search is likely **on by default** for `claude_local` agents (Claude Code has these tools)
- To explicitly control it, use `adapterConfig.allowedTools` or `adapterConfig.disallowedTools` (if supported by adapter)
- The `dangerouslySkipPermissions: true` flag in adapterConfig gives the agent full tool access including web search

**NEEDS LIVE TEST:** Run a heartbeat on an agent with a web search task to confirm default behavior.

---

### 4. NOTIFICATIONS — NO NATIVE SUPPORT

**Mechanism:** No native webhook/notification endpoints exist.

**Findings:**
- `GET /api/webhooks` → 404
- `GET /api/notifications` → 404
- `GET /api/integrations` → 404
- No plugins installed; no bundled examples available
- Paperclip has a **plugin system** (`paperclipai plugin install`) but no notification plugins exist yet

**Recommended approach for Teams notifications:**
1. **Agent skill approach:** Create a custom skill that calls Microsoft Graph API to post to Teams channels. Inject this skill into governance/tender agents.
2. **Routine webhook trigger:** Routines support `webhook` triggers with signing. An external service could fire routines, or routines could trigger external webhooks via agent code.
3. **Plugin approach:** Write a Paperclip plugin that hooks into activity events and forwards to Teams. The plugin system supports install from local path or npm.
4. **External polling:** Poll the activity log (`GET /api/companies/{companyId}/activity`) and forward events to Teams via a lightweight script.

**Plugin CLI:**
```
paperclipai plugin install ./my-plugin          # local path
paperclipai plugin install @acme/plugin-linear  # npm package
```

---

## API Capability Matrix

| Endpoint | Supported | Method | Notes |
|---|---|---|---|
| `/api/companies` | YES | GET, POST | List/create companies |
| `/api/companies/{id}` | YES | GET, PATCH | Get/update company, status changes work |
| `/api/companies/{id}/agents` | YES | GET, POST | List/create agents (direct, bypasses approval) |
| `/api/companies/{id}/agent-hires` | YES | POST | Create agent via hire request (creates approval) |
| `/api/companies/{id}/issues` | YES | GET, POST | List/create issues |
| `/api/companies/{id}/activity` | YES | GET | Audit trail |
| `/api/companies/{id}/costs/summary` | YES | GET | Budget summary |
| `/api/companies/{id}/costs/by-agent` | YES | GET | Per-agent costs |
| `/api/companies/{id}/org` | YES | GET | Org chart tree |
| `/api/companies/{id}/approvals` | YES | GET | List approvals |
| `/api/companies/{id}/projects` | YES | GET, POST | List/create projects |
| `/api/companies/{id}/routines` | YES | GET, POST | List/create routines |
| `/api/companies/{id}/skills` | YES | GET | List company skills |
| `/api/companies/{id}/dashboard` | YES | GET | Dashboard summary |
| `/api/agents/{id}` | YES | GET, PATCH | Get/update agent |
| `/api/agents/{id}/heartbeat/invoke` | YES | POST | Manual heartbeat trigger (202) |
| `/api/agents/{id}/instructions-path` | YES | PATCH | Set instructions file path |
| `/api/agents/me` | YES | GET | Agent self-identity (requires agent JWT) |
| `/api/agents/me/inbox-lite` | YES | GET | Agent inbox (requires agent JWT) |
| `/api/issues/{id}` | YES | GET, PATCH | Get/update issue |
| `/api/issues/{id}/comments` | YES | GET, POST | List/add comments |
| `/api/issues/{id}/checkout` | YES | POST | Checkout issue for agent |
| `/api/issues/{id}/release` | YES | POST | Release issue |
| `/api/issues/{id}/documents/{key}` | YES | GET, PUT | Issue documents (plans, etc.) |
| `/api/issues/{id}/heartbeat-context` | YES | GET | Compact context for heartbeat |
| `/api/approvals/{id}` | YES | GET | Get approval |
| `/api/routines/{id}` | YES | GET, PATCH | Get/update routine |
| `/api/routines/{id}/triggers` | YES | POST | Add trigger to routine |
| `/api/routines/{id}/run` | YES | POST | Manual routine run |
| `/api/skills/index` | YES | GET | List available skills |
| `/api/skills/{name}` | YES | GET | Get skill content |
| `/api/webhooks` | NO | - | 404 |
| `/api/notifications` | NO | - | 404 |
| `/api/integrations` | NO | - | 404 |
| `/api/agents/{id}/routines` | NO | - | 404 (use company routines endpoint) |
| `/api/agents/{id}/schedule` | NO | - | 404 |
| `/api/agents/{id}/instructions` | NO | - | 404 (use instructions-path or filesystem) |
| `/api/agents/{id}/runs` | NO | - | 404 |

---

## Agent Configuration Fields

Complete field list from actual API responses:

| Field | Type | Description | Settable on Create | Settable on PATCH |
|---|---|---|---|---|
| `id` | UUID | Agent ID | auto | no |
| `companyId` | UUID | Parent company | auto | no |
| `name` | string | Agent name | yes | yes |
| `role` | enum | Agent role (see below) | yes | yes |
| `title` | string | Display title | yes | yes |
| `icon` | string/null | Icon identifier | yes | yes |
| `status` | enum | Agent status (see below) | auto | auto |
| `reportsTo` | UUID/null | Manager agent ID | yes | yes |
| `capabilities` | string/null | Free-text capabilities description | yes | yes |
| `adapterType` | enum | Adapter type | yes | yes |
| `adapterConfig` | object | Adapter-specific config | yes | yes (merged) |
| `runtimeConfig` | object | Runtime settings incl. heartbeat | yes | yes (merged) |
| `budgetMonthlyCents` | integer | Monthly budget in cents | yes | yes |
| `spentMonthlyCents` | integer | Current month spend | auto | no |
| `pauseReason` | string/null | Why agent is paused | auto | auto |
| `pausedAt` | timestamp/null | When paused | auto | auto |
| `permissions` | object | Agent permissions | auto | yes |
| `permissions.canCreateAgents` | boolean | Can this agent hire? | auto (false) | yes |
| `lastHeartbeatAt` | timestamp/null | Last heartbeat time | auto | auto |
| `metadata` | object/null | Arbitrary metadata | yes | yes |
| `urlKey` | string | URL-friendly slug | auto | no |
| `chainOfCommand` | array | Reporting chain (GET only) | - | - |
| `access` | object | Membership and grants (GET only) | - | - |

**Role enum values:** `ceo`, `cto`, `cmo`, `cfo`, `engineer`, `designer`, `pm`, `qa`, `devops`, `researcher`, `general`

**Status values (agent):** `idle`, `running`, `pending_approval`, `paused`, `error` (observed)

---

## Adapter Configuration (claude_local)

Complete `adapterConfig` fields confirmed via actual responses:

| Field | Type | Description | Default |
|---|---|---|---|
| `cwd` | string | Working directory for the agent | required |
| `model` | string | Claude model ID | (adapter default) |
| `maxTurnsPerRun` | integer | Max conversation turns per heartbeat | 1000 (CEO default) |
| `graceSec` | integer | Grace period before timeout | 15 |
| `timeoutSec` | integer | Hard timeout (0 = unlimited) | 0 |
| `dangerouslySkipPermissions` | boolean | Skip Claude Code permission prompts | false |
| `env` | object | Environment variables (wrapped in `{type, value}`) | {} |
| `allowedTools` | array | Tool allowlist (e.g. `["WebSearch"]`) | (all tools) |
| `instructionsFilePath` | string | Absolute path to entry instructions file | auto-set |
| `instructionsRootPath` | string | Absolute path to instructions directory | auto-set |
| `instructionsEntryFile` | string | Entry file name | `AGENTS.md` |
| `instructionsBundleMode` | string | Instructions management mode | `managed` |

**NOTE on `env`:** When you pass `env: { "CUSTOM_VAR": "test-value" }`, Paperclip wraps it as `{ "CUSTOM_VAR": { "type": "plain", "value": "test-value" } }`. This supports secret references too (type: "secret").

**NOTE on `promptTemplate`:** Not stored as a field in adapterConfig. When passed during creation, it becomes the content of the AGENTS.md entry file. Not visible in subsequent GET responses.

---

## Issue Lifecycle

**Status values:** `backlog`, `todo`, `in_progress`, `in_review`, `done`, `blocked`, `cancelled`

**Priority values:** `critical`, `high`, `medium`, `low`

**Checkout mechanics:**
- `POST /api/issues/{id}/checkout` with `{ "agentId": "...", "expectedStatuses": ["todo"] }`
- Returns 409 Conflict if already checked out by another run
- Checkout locks the issue to a specific heartbeat run via `executionRunId`
- `POST /api/issues/{id}/release` to release back

**Issue fields (full):**
| Field | Type |
|---|---|
| `id` | UUID |
| `companyId` | UUID |
| `projectId` | UUID/null |
| `projectWorkspaceId` | UUID/null |
| `goalId` | UUID/null |
| `parentId` | UUID/null |
| `title` | string |
| `description` | string |
| `status` | enum |
| `priority` | enum |
| `assigneeAgentId` | UUID/null |
| `assigneeUserId` | UUID/null |
| `checkoutRunId` | UUID/null |
| `executionRunId` | UUID/null |
| `executionAgentNameKey` | string/null |
| `executionLockedAt` | timestamp/null |
| `createdByAgentId` | UUID/null |
| `createdByUserId` | UUID/null |
| `issueNumber` | integer |
| `identifier` | string (e.g. "DIS-1") |
| `originKind` | string |
| `originId` | UUID/null |
| `originRunId` | UUID/null |
| `requestDepth` | integer |
| `billingCode` | string/null |
| `assigneeAdapterOverrides` | object/null |
| `executionWorkspaceId` | UUID/null |
| `executionWorkspacePreference` | string/null |
| `executionWorkspaceSettings` | object/null |
| `startedAt` | timestamp/null |
| `completedAt` | timestamp/null |
| `cancelledAt` | timestamp/null |
| `hiddenAt` | timestamp/null |
| `labels` | array |
| `labelIds` | array |

---

## Budget Mechanics

**Field:** `budgetMonthlyCents` on both company and agent objects.

**Unit:** US cents per calendar month (UTC).

**Cost tracking:**
- `GET /api/companies/{id}/costs/summary` → `{ companyId, spendCents, budgetCents, utilizationPercent }`
- `GET /api/companies/{id}/costs/by-agent` → array of per-agent spend

**Threshold behavior:**
- Activity log records `budget.policy_upserted` with `{ amount, scopeId, scopeType: "agent", windowKind: "calendar_month_utc" }`
- 80% warning and 100% auto-pause: referenced in the Paperclip skill instructions ("auto-paused at 100%; above 80%, focus on critical tasks only") — this appears to be enforced server-side
- Agents can check their own budget via `GET /api/agents/me`

**Setting budget:** `PATCH /api/agents/{id}` with `{ "budgetMonthlyCents": 5000 }` or set during creation.

---

## Authentication

**Local mode (PoC):** Implicit authentication as `local-board` user. No API key or cookie required. All requests to localhost:3100 are authenticated automatically.

**Auth identity:**
```json
{
  "user": { "id": "local-board", "name": "Board", "email": "local@paperclip.local" },
  "isInstanceAdmin": true,
  "source": "local_implicit"
}
```

**Agent authentication:** Agents use JWT bearer tokens. Auto-injected as `PAPERCLIP_API_KEY` env var during heartbeat runs.

**Production mode:** Requires:
- `PAPERCLIP_PUBLIC_URL` — canonical public URL
- `BETTER_AUTH_TRUSTED_ORIGINS` — comma-separated auth origin allowlist
- `PAPERCLIP_AGENT_JWT_SECRET` — JWT signing secret
- Board user login via `paperclipai auth login`

**CLI auth commands:**
- `paperclipai auth bootstrap-ceo` — create first admin invite
- `paperclipai auth login` — authenticate CLI
- `paperclipai auth whoami` — check identity
- `paperclipai agent local-cli <agentRef>` — get agent API key + install skills

**Deployment mode:** `server.deploymentMode: "local_trusted"` (current) — all requests auto-authenticated. For production: needs authenticated mode with proper JWT validation.

---

## Session Persistence

**NOT TESTED** — Heartbeat was invoked (Task 4f, returned 202 queued) but the agent has no real `cwd` directory or assigned task that exercises session persistence. The heartbeat run object includes `sessionIdBefore` and `sessionIdAfter` fields, suggesting Paperclip tracks session continuity.

**Key fields on heartbeat run:**
| Field | Description |
|---|---|
| `sessionIdBefore` | Session ID at run start |
| `sessionIdAfter` | Session ID at run end |
| `resultJson` | Run result data |
| `exitCode` | Process exit code |
| `usageJson` | Token/cost usage |
| `logStore` / `logRef` | Log storage reference |

**Session context is delivered via env vars:**
- `PAPERCLIP_TASK_ID` — issue that triggered wake
- `PAPERCLIP_WAKE_REASON` — why triggered
- `PAPERCLIP_WAKE_COMMENT_ID` — specific comment trigger
- `PAPERCLIP_RUN_ID` — current run ID
- `PAPERCLIP_APPROVAL_ID` / `PAPERCLIP_APPROVAL_STATUS` — approval context

**RECOMMENDATION:** Test with a real agent working directory and task assignment to confirm cross-heartbeat context retention. The agent's `cwd` should be persistent storage.

---

## Skills System

**Built-in skills (4):**
| Skill | Description |
|---|---|
| `paperclip` | Core coordination API — task management, heartbeat procedure, routines, planning |
| `para-memory-files` | PARA-method file-based memory system for agents |
| `paperclip-create-agent` | Agent hiring with governance-aware approval flow |
| `paperclip-create-plugin` | Plugin creation skill |

**Skill structure on disk:**
```
skills/{skill-name}/
├── SKILL.md           (main skill instructions — kind: "skill")
└── references/
    ├── api-reference.md   (kind: "reference")
    ├── routines.md        (kind: "reference")
    └── company-skills.md  (kind: "reference")
```

**Skill location:** Bundled in the Paperclip server package at:
`~/.npm/_npx/.../node_modules/@paperclipai/server/skills/`

**Company skills API:**
- `GET /api/companies/{id}/skills` — list installed skills
- `POST /api/companies/{id}/skills/import` — import skills
- `POST /api/companies/{id}/skills/scan-projects` — scan for skills in project workspaces
- `POST /api/agents/{id}/skills/sync` — sync desired skills to an agent

**Custom skills:** Can be added via:
1. Plugin system (`paperclipai plugin install`)
2. Company skill import API
3. Project workspace scanning

**Skills injection:** Skills are injected per-agent via the skill sync mechanism. Agents reference skills by name and the adapter loads the relevant SKILL.md content during heartbeat.

**Trust levels:** `markdown_only` (default for bundled skills). Skills are read-only when bundled.

---

## Docker Image

**NOT TESTED** — Docker is not installed on this machine (`command not found: docker`).

**Paperclip version:** `2026.403.0` (via `npx paperclipai --version`)

**Deployment method:** Currently running via `npx paperclipai` (Node.js), not Docker.

**For production Docker deployment, these are needed:**
- Docker image: `paperclipai/paperclip:2026.403.0` (pin to this version)
- Verify Claude Code CLI is bundled in image
- Check for docker-compose quickstart

**ACTION REQUIRED:** Install Docker Desktop, then run:
```bash
docker pull paperclipai/paperclip:2026.403.0
docker run --rm paperclipai/paperclip:2026.403.0 which claude
docker run --rm paperclipai/paperclip:2026.403.0 which codex
```

---

## Environment Variables

Complete list from `paperclipai env`:

### Required
| Variable | Description | Current |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | **missing** (embedded-postgres in PoC) |
| `PAPERCLIP_AGENT_JWT_SECRET` | JWT signing secret | set |

### Required for Production
| Variable | Description |
|---|---|
| `PAPERCLIP_PUBLIC_URL` | Canonical public URL (e.g. `https://org.cbslab.app`) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated auth origin allowlist |

### Optional
| Variable | Default | Description |
|---|---|---|
| `HEARTBEAT_SCHEDULER_ENABLED` | `true` | Enable heartbeat timer scheduler |
| `HEARTBEAT_SCHEDULER_INTERVAL_MS` | `30000` | Scheduler poll interval (ms) |
| `PAPERCLIP_AGENT_JWT_AUDIENCE` | `paperclip-api` | JWT audience |
| `PAPERCLIP_AGENT_JWT_ISSUER` | `paperclip` | JWT issuer |
| `PAPERCLIP_AGENT_JWT_TTL_SECONDS` | `172800` | JWT lifetime (48 hours) |
| `PAPERCLIP_SECRETS_MASTER_KEY_FILE` | (config) | Path to encryption key |
| `PAPERCLIP_SECRETS_PROVIDER` | `local_encrypted` | Secrets provider |
| `PAPERCLIP_SECRETS_STRICT_MODE` | `false` | Require secret refs for sensitive keys |
| `PAPERCLIP_STORAGE_PROVIDER` | `local_disk` | Storage provider (`local_disk` or `s3`) |
| `PAPERCLIP_STORAGE_LOCAL_DIR` | (config) | Local storage directory |
| `PAPERCLIP_STORAGE_S3_BUCKET` | `paperclip` | S3 bucket |
| `PAPERCLIP_STORAGE_S3_REGION` | `us-east-1` | S3 region |
| `PAPERCLIP_STORAGE_S3_ENDPOINT` | `""` | Custom S3 endpoint |
| `PAPERCLIP_STORAGE_S3_PREFIX` | `""` | S3 key prefix |
| `PAPERCLIP_STORAGE_S3_FORCE_PATH_STYLE` | `false` | Path-style S3 access |
| `PORT` | `3100` | HTTP listen port |

**IMPORTANT:** The correct public URL variable is `PAPERCLIP_PUBLIC_URL` (NOT `NEXT_PUBLIC_APP_URL`). The plan should be updated to use this variable name.

**Agent-level env vars:** Passed via `adapterConfig.env` with type wrapping:
```json
{
  "adapterConfig": {
    "env": {
      "SUPABASE_URL": { "type": "plain", "value": "https://..." },
      "SUPABASE_KEY": { "type": "secret", "value": "secret-ref-id" }
    }
  }
}
```

---

## Org Chart and Delegation

**Org chart:** `GET /api/companies/{id}/org` returns a tree structure:
```json
[
  {
    "id": "...", "name": "Agent-1", "role": "engineer", "status": "running",
    "reports": [
      { "id": "...", "name": "Tier2", "role": "engineer", "status": "idle", "reports": [] }
    ]
  }
]
```

**Reporting:** Set via `reportsTo` field on agent creation or PATCH. The org chart reflects the hierarchy immediately.

**Delegation:** Works via the issue system. Create a subtask with `parentId` pointing to the parent issue and `assigneeAgentId` pointing to the Tier 2 agent. Confirmed working.

**Chain of command:** Available on agent GET response as `chainOfCommand` array.

---

## Agent Hiring Flow

**Two paths exist:**

### Path 1: Direct creation (bypasses approval)
`POST /api/companies/{companyId}/agents` — creates the agent immediately in `idle` status. No approval required. This is the board operator path.

### Path 2: Hire request (requires approval)
`POST /api/companies/{companyId}/agent-hires` — creates agent in `pending_approval` status AND creates an approval record. The approval must be approved before the agent becomes active. This is the governance-aware path (used by agents via the `paperclip-create-agent` skill).

**Company setting:** `requireBoardApprovalForNewAgents: true` (default). This controls whether agent-initiated hires require board approval.

**Approval API:**
- `GET /api/companies/{id}/approvals` — list pending approvals
- `POST /api/approvals/{id}/approve` — approve
- `POST /api/approvals/{id}/reject` — reject
- `POST /api/approvals/{id}/request-revision` — request changes
- `POST /api/approvals/{id}/resubmit` — resubmit after revision

---

## Routines System (Discovered — Not in Original Plan)

Paperclip has a **routines system** for recurring scheduled tasks, separate from heartbeat intervals.

**How routines work:**
1. A routine is a template that creates issues on a schedule
2. Each routine fires create an execution issue assigned to an agent
3. The agent picks up the issue in its normal heartbeat flow

**Creating a routine:**
```
POST /api/companies/{companyId}/routines
{
  "title": "Weekly report",
  "assigneeAgentId": "...",
  "projectId": "..."     // required
}
```

**Adding a cron trigger:**
```
POST /api/routines/{routineId}/triggers
{
  "kind": "schedule",
  "cronExpression": "0 9 * * 1"   // Every Monday 9am
}
```

**Trigger types:** `schedule` (cron), `webhook` (external), `api` (manual)

**Routine fields:**
| Field | Type | Description |
|---|---|---|
| `concurrencyPolicy` | string | `coalesce_if_active` (default) |
| `catchUpPolicy` | string | `skip_missed` (default) |
| `variables` | array | Template variables |
| `status` | string | `active`, `paused`, etc. |

**This is highly relevant to River:** Routines can replace or supplement heartbeat-based scheduling for specific recurring tasks (e.g., weekly governance reviews, daily tender scans).

---

## Findings That Affect the Implementation Plan

### Must-Change Items

1. **Heartbeat field name is wrong.** The plan references `heartbeatInterval` or `schedule` on agents. The correct mechanism is `runtimeConfig.heartbeat.intervalSec` (integer, seconds). All agent creation scripts must be updated.

2. **Public URL env var is wrong.** The plan may reference `NEXT_PUBLIC_APP_URL`. The correct variable is `PAPERCLIP_PUBLIC_URL`.

3. **Instructions are file-based, not API fields.** The plan assumes an `instructions` field or API upload. Instructions are delivered by writing files to `~/.paperclip/instances/default/companies/{companyId}/agents/{agentId}/instructions/AGENTS.md`. The `promptTemplate` in adapterConfig during creation is written to this file.

4. **Agent roles are enum-constrained.** Only these roles are valid: `ceo`, `cto`, `cmo`, `cfo`, `engineer`, `designer`, `pm`, `qa`, `devops`, `researcher`, `general`. The plan may reference custom roles (e.g., "analyst") — these will fail validation.

5. **No native notification/webhook support.** Teams notifications must be implemented as a custom agent skill or plugin. No built-in webhook endpoint exists.

6. **Environment variables are type-wrapped.** When setting agent env vars via `adapterConfig.env`, values are wrapped as `{ "type": "plain", "value": "..." }` or `{ "type": "secret", "value": "..." }`. Scripts must account for this.

### Should-Incorporate Items

7. **Routines system exists.** The plan doesn't mention routines. These provide cron-based recurring task creation — useful for weekly governance reviews, daily tender checks, etc.

8. **Projects are required for routines.** Each routine requires a `projectId`. River companies will need projects created before routines can be set up.

9. **Company `issuePrefix` is auto-generated** from company name (e.g., "Discovery-Test" → "DIS"). This creates the issue identifier prefix (DIS-1, DIS-2). Ensure meaningful prefixes for River entities.

10. **`requireBoardApprovalForNewAgents` defaults to `true`.** All companies created will require board approval for agent-initiated hires. The board operator can bypass this by using the direct `POST /api/companies/{id}/agents` endpoint.

11. **Skills must be explicitly synced to agents.** Skills are company-level resources that must be assigned to agents via `POST /api/agents/{id}/skills/sync`. They are not automatically available to all agents.

12. **Docker not installed.** Docker Desktop needs to be installed before Docker image inspection (Task 12) can be completed.

13. **Node.js version mismatch.** Current Node.js is v23.11.0 but Paperclip recommends v20 or v22. Engine warnings are present but non-blocking for PoC.

14. **`dangerouslySkipPermissions: true` is needed** for automated agents to run without interactive permission prompts in Claude Code.

15. **The `local-cli` command** (`paperclipai agent local-cli <agentRef>`) generates API keys and installs Paperclip skills for Claude/Codex locally. This is the recommended way to set up agents for local development/testing.

16. **Issue checkout returns 409** if the issue has an active `executionRunId` (even from a heartbeat invoke). The plan's task assignment flow should handle this gracefully.

### Information Gaps (Still Unknown)

17. **Docker image contents** — Claude Code CLI bundled? Codex bundled? Docker Compose quickstart? → Requires Docker installation.

18. **Session persistence across heartbeats** — `sessionIdBefore`/`sessionIdAfter` fields exist but live test not completed.

19. **Budget auto-pause enforcement** — Referenced in skill docs but not tested at threshold.

20. **`allowedTools` enforcement** — Field accepted in adapterConfig but unclear if the claude_local adapter enforces it during heartbeat execution.
