# Project River — Discovery Summary

## Generated: 2026-04-08T00:35Z (Paperclip v2026.403.0)
## Updated: 2026-04-08T01:30Z — UI screenshots integrated (14 screenshots from board operator)

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

**Mechanism:** No dedicated search field on the agent. Web search is a Claude Code CLI capability enabled by default.

**Findings:**
- **No web search toggle exists in the UI** — confirmed from Configuration tab screenshots
- No `search`, `webSearch`, or `tools` field exists on the agent schema
- The only capability toggle in the UI is **"Enable Chrome"** (off by default) — this likely enables browser/MCP tools
- `adapterConfig.allowedTools` can be set via API (accepted by PATCH) — stores an array like `["WebSearch", "WebFetch"]`
- `dangerouslySkipPermissions: true` gives the agent full tool access including web search
- The run details view shows the Claude CLI command includes `--dangerously-skip-permissions` which grants access to all tools

**Practical approach for River:**
- Web search is **on by default** for `claude_local` agents with `dangerouslySkipPermissions: true`
- No per-agent toggle needed — all agents get web search automatically
- To restrict tools for specific agents, use `adapterConfig.allowedTools` via API (not available in UI)
- The "Extra args" field in the UI could pass additional CLI flags if needed

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

**TESTED — PASS** (9 April 2026)

Test procedure:
1. Heartbeat 1 (DIS-49): Agent wrote "42" to `/tmp/discovery-session-test.txt` — completed successfully
2. Heartbeat 2 (DIS-50): Agent read the file, reported "42", and explicitly stated: *"I wrote this file in my previous heartbeat while completing DIS-49"*
3. `sessionIdBefore` populated on run 2 (`1bbe41ad-2a4d-41eb-9deb-effb9335b5d2`), confirming session tracking

**Result:** Session persistence works across heartbeats. Agents retain context from prior runs and reference previous work by issue identifier.

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

**Image:** `ghcr.io/paperclipai/paperclip:latest`
**Digest:** `ghcr.io/paperclipai/paperclip@sha256:791f3493d101154cb8a991a3895160297fae979f50cba657032ae4ce18132bff`
**Size:** 2.84 GB
**Base:** `node:lts-trixie-slim` (Debian)
**Server version:** `@paperclipai/server@0.3.1`
**CLI version:** `2026.403.0` (via npx)

### Bundled CLIs — CONFIRMED
| CLI | Path | Version |
|---|---|---|
| Claude Code | `/usr/local/bin/claude` | 2.1.94 |
| Codex | `/usr/local/bin/codex` | 0.118.0 |

**No custom Dockerfile needed** — both Claude Code and Codex are pre-installed.

### Bundled System Tools
`git`, `curl`, `wget`, `ripgrep`, `python3`, `gh` (GitHub CLI), `corepack`

### Adapters in Image
`claude-local`, `codex-local`, `cursor-local`, `gemini-local`, `openclaw-gateway`, `opencode-local`, `pi-local`

### Docker Compose Files (in `/app/docker/`)
| File | Purpose |
|---|---|
| `docker-compose.yml` | Full stack: PostgreSQL 17 + Paperclip server |
| `docker-compose.quickstart.yml` | Minimal: Paperclip only (bring your own DB) |
| `docker-compose.untrusted-review.yml` | Untrusted code review mode |

### docker-compose.yml (production template)
```yaml
services:
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: paperclip
      POSTGRES_PASSWORD: paperclip
      POSTGRES_DB: paperclip
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U paperclip -d paperclip"]
      interval: 2s
      timeout: 5s
      retries: 30
    volumes:
      - pgdata:/var/lib/postgresql/data

  server:
    build:
      context: ..
      dockerfile: Dockerfile
    ports:
      - "3100:3100"
    environment:
      DATABASE_URL: postgres://paperclip:paperclip@db:5432/paperclip
      PORT: "3100"
      SERVE_UI: "true"
      PAPERCLIP_DEPLOYMENT_MODE: "authenticated"
      PAPERCLIP_DEPLOYMENT_EXPOSURE: "private"
      PAPERCLIP_PUBLIC_URL: "${PAPERCLIP_PUBLIC_URL:-http://localhost:3100}"
      BETTER_AUTH_SECRET: "${BETTER_AUTH_SECRET:?BETTER_AUTH_SECRET must be set}"
    volumes:
      - paperclip-data:/paperclip
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
  paperclip-data:
```

### docker-compose.quickstart.yml (minimal)
```yaml
services:
  paperclip:
    build:
      context: ..
      dockerfile: Dockerfile
    ports:
      - "${PAPERCLIP_PORT:-3100}:3100"
    environment:
      HOST: "0.0.0.0"
      PAPERCLIP_HOME: "/paperclip"
      OPENAI_API_KEY: "${OPENAI_API_KEY:-}"
      ANTHROPIC_API_KEY: "${ANTHROPIC_API_KEY:-}"
      PAPERCLIP_DEPLOYMENT_MODE: "authenticated"
      PAPERCLIP_DEPLOYMENT_EXPOSURE: "private"
      PAPERCLIP_PUBLIC_URL: "${PAPERCLIP_PUBLIC_URL:-http://localhost:3100}"
      BETTER_AUTH_SECRET: "${BETTER_AUTH_SECRET:?BETTER_AUTH_SECRET must be set}"
    volumes:
      - "${PAPERCLIP_DATA_DIR:-../data/docker-paperclip}:/paperclip"
```

### Key Observations for River Production Deployment
1. **BETTER_AUTH_SECRET** is required (not in the `paperclipai env` output — Docker-specific)
2. **PAPERCLIP_DEPLOYMENT_MODE** should be `"authenticated"` for production
3. **PAPERCLIP_DEPLOYMENT_EXPOSURE** should be `"private"` with `PAPERCLIP_PUBLIC_URL` set
4. **PAPERCLIP_HOME** maps to `/paperclip` inside the container
5. **ANTHROPIC_API_KEY** is passed via env (needed for Claude Code heartbeats)
6. For Railway: use the pre-built image `ghcr.io/paperclipai/paperclip:latest` instead of building from Dockerfile, pin to the digest above

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
| `BETTER_AUTH_SECRET` | Auth signing secret (required by Docker compose) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated auth origin allowlist |
| `ANTHROPIC_API_KEY` | Required for Claude Code agent heartbeats |

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

## UI Discovery (from Board Operator Screenshots)

### Agent Page Tabs
`Dashboard` | `Instructions` | `Skills` | `Configuration` | `Runs` | `Budget`

Top-right actions: `+ Assign Task` | `Run Heartbeat` | `Pause` | status badge (idle/running)

### Dashboard Tab
- **Latest Run** card: status badge (succeeded/failed), run ID, trigger type (Assignment), timestamp, summary text
- **Charts** (last 14 days): Run Activity, Issues by Priority, Issues by Status, Success Rate
- **Recent Issues**: shows identifier (TES-1), title, status badge
- **Costs**: Input tokens, Output tokens, Cached tokens, Total cost ($). Per-run breakdown table (Date, Run, Input, Output, Cost)

### Instructions Tab
- File manager sidebar: list of markdown files with sizes
- `AGENTS.md` marked as `ENTRY` (the entry file loaded by the adapter)
- `+` button to add new files, `Delete` button per file
- Content area: full markdown editor for the selected file
- **CEO template creates 4 files:** AGENTS.md, HEARTBEAT.md (3005B), SOUL.md (2590B), TOOLS.md (86B)

### Skills Tab
- "View company skills library" link
- "Required by Paperclip" section lists bundled skills with checkmarks
- Each skill: name + "Will be mounted into the ephemeral Claude skill directory on the next run"
- Bottom: Adapter type, "Skills applied: Applied when the agent runs", "Selected skills: 4"

### Configuration Tab — Full Field Inventory

**Identity Section:**
| UI Field | API Field | Type |
|---|---|---|
| Name | `name` | text input |
| Title | `title` | text input (placeholder: "e.g. VP of Engineering") |
| Reports to | `reportsTo` | agent picker ("Choose manager...") |
| Capabilities | `capabilities` | textarea |

**Adapter Section:**
| UI Field | API Field | Type |
|---|---|---|
| Adapter type | `adapterType` | dropdown (see adapter list below) |
| Test environment | — | button |

**Permissions & Configuration Section (claude_local adapter):**
| UI Field | API Field | Type | Default |
|---|---|---|---|
| Command | `adapterConfig.command` | text | `claude` |
| Model | `adapterConfig.model` | dropdown | `Default` |
| Thinking effort | `adapterConfig.thinkingEffort` | dropdown | `Auto` |
| Enable Chrome | `adapterConfig.enableChrome` | toggle | OFF |
| Skip permissions | `adapterConfig.dangerouslySkipPermissions` | toggle | OFF (ON for CEO) |
| Max turns per run | `adapterConfig.maxTurnsPerRun` | number | 1000 |
| Extra args (comma-separated) | `adapterConfig.extraArgs` | text | (empty, placeholder: "--verbose, --foo=bar") |
| Environment variables | `adapterConfig.env` | KEY / Plain\|Secret / value + Seal button | note: "PAPERCLIP_* variables are injected automatically at runtime" |
| Timeout (sec) | `adapterConfig.timeoutSec` | number | 0 |
| Interrupt grace period (sec) | `adapterConfig.graceSec` | number | 15 |

**Run Policy Section:**
| UI Field | API Field | Type | Default |
|---|---|---|---|
| Heartbeat on interval | `runtimeConfig.heartbeat.enabled` | toggle | ON (for CEO) |
| Run heartbeat every ___ sec | `runtimeConfig.heartbeat.intervalSec` | number spinner | 3600 |
| Wake on demand | `runtimeConfig.heartbeat.wakeOnDemand` | toggle (under Advanced) | ON |
| Cooldown (sec) | `runtimeConfig.heartbeat.cooldownSec` | number (under Advanced) | 10 |
| Max concurrent runs | `runtimeConfig.heartbeat.maxConcurrentRuns` | number (under Advanced) | 1 |

**Permissions Section:**
| UI Field | API Field | Type | Default |
|---|---|---|---|
| Can create new agents | `permissions.canCreateAgents` | toggle | OFF (ON for CEO) |
| Can assign tasks | `permissions.canAssignTasks` | toggle | auto-enabled for CEO |

**API Keys Section:**
- Per-agent API key creation with custom name
- "API keys allow this agent to authenticate calls to the Paperclip server"
- Configuration Revisions counter at bottom

### Budget Tab
- Shows: OBSERVED (current spend in USD), BUDGET (Disabled when $0, or amount), status (HEALTHY)
- "Soft alert at 80%" — confirms 80% warning is built-in
- Remaining bar: shows Unlimited when no cap set
- BUDGET (USD) input field + "Set budget" button
- Budget is displayed in **dollars** in UI but stored as **cents** in API

### Adapter Type Dropdown (All Available)
| Adapter | Status |
|---|---|
| Process | Coming soon |
| HTTP | Coming soon |
| **Claude (local)** | Available (River's adapter) |
| Codex (local) | Available |
| Gemini CLI (local) | Available |
| OpenCode (local) | Available |
| pi_local | Available |
| Cursor (local) | Available |
| OpenClaw Gateway | Coming soon |
| Hermes Agent | Available |

### Run Details View
- Breadcrumb: Agents > CEO > Runs > Run {id}
- Status badge, timestamps (start → end), duration
- Token counts: Input, Output, Cached, Cost
- Session section (collapsible)
- Issues Touched list with identifiers
- **Invocation details:** Adapter (claude_local), Working dir, full Command line
- Command shows: `/opt/homebrew/bin/claude --print --output-format stream-json --verbose --dangerously-skip-permissions --max-turns 1000 --append-system ...`
- Shows injected instructions path and prompt

### Instance Settings
Sidebar: `General` | `Heartbeats` | `Experimental` | `Plugins`

**Heartbeats page:**
- "Scheduler Heartbeats" — overview of ALL agents across ALL companies
- Shows: agent name, status (On/Off), role/title, interval (sec), last run time
- Per-agent "Disable Timer Heartbeat" button
- "Disable All" button at top
- Confirms Discovery-Agent-1 shows 1800s interval (our API PATCH worked)

**Experimental page:**
- "Enable Isolated Workspaces" (OFF) — execution workspace controls for project configuration
- "Auto-Restart Dev Server When Idle" (OFF) — auto-restart when backend changes detected

**Plugins page:**
- "Plugins are alpha" warning
- No bundled examples in this checkout
- No plugins installed
- `+ Install Plugin` button

### Key UI Observations for River

1. **No web search toggle in UI.** There is no visible checkbox or toggle for web search in the Configuration tab. Web search is controlled by Claude Code's default tool set, not by a Paperclip setting. The `Enable Chrome` toggle is the closest capability toggle visible.

2. **Model dropdown exists** but shows "Default" — the API `adapterConfig.model` field maps to this dropdown. Specific model selection (e.g., `claude-sonnet-4-20250514`) is available.

3. **Thinking effort dropdown** is a new finding — `Auto` is default. This maps to `adapterConfig.thinkingEffort` and can be set per-agent.

4. **Extra args field** allows passing additional CLI flags to Claude Code (e.g., `--verbose`). This could be used to pass `--allowedTools` or similar flags if needed.

5. **"Seal" button** on env vars converts a plain value to a sealed/encrypted secret reference. Important for credential management.

6. **Onboard created "Test Co"** with CEO (3600s heartbeat) and CTO (3600s heartbeat, "Chief Technology Officer" title). The CTO has never run a heartbeat yet.

7. **Budget UI confirms soft alert at 80%** — this is automatic and does not require configuration.

8. **Configuration Revisions** tracks config changes — useful for audit trail.

---



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

12. **Docker image confirmed — no custom Dockerfile needed.** `ghcr.io/paperclipai/paperclip:latest` bundles Claude Code 2.1.94 and Codex 0.118.0. Pin to digest `sha256:791f3493d101...` for production.

13. **Node.js version mismatch.** Current Node.js is v23.11.0 but Paperclip recommends v20 or v22. Engine warnings are present but non-blocking for PoC.

14. **`dangerouslySkipPermissions: true` is needed** for automated agents to run without interactive permission prompts in Claude Code.

15. **The `local-cli` command** (`paperclipai agent local-cli <agentRef>`) generates API keys and installs Paperclip skills for Claude/Codex locally. This is the recommended way to set up agents for local development/testing.

16. **Issue checkout returns 409** if the issue has an active `executionRunId` (even from a heartbeat invoke). The plan's task assignment flow should handle this gracefully.

17. **BETTER_AUTH_SECRET is required for Docker/production.** Not shown in `paperclipai env` but required by both docker-compose files. Must be generated and set.

18. **ANTHROPIC_API_KEY must be passed to the container.** The Docker quickstart includes it as an env var. Without it, Claude Code agents cannot authenticate with the Anthropic API during heartbeats.

### UI-Derived Findings

19. **Thinking effort is configurable per-agent.** `adapterConfig.thinkingEffort` with options including `Auto`. This was not visible in the API discovery — only found in UI. Could be used to reduce costs for simpler agents.

20. **Enable Chrome toggle exists.** `adapterConfig.enableChrome` — likely enables browser/MCP tools. Could be relevant for agents that need to interact with web UIs (e.g., tender portals).

21. **Extra args field** allows passing arbitrary CLI flags to Claude Code. Placeholder shows `--verbose, --foo=bar`. This provides an escape hatch for any adapter config not exposed as a dedicated field.

22. **"Seal" button on env vars** — converts plain text to encrypted secret references. The plan should use this for all credential values (Supabase keys, Graph API secrets, Xero tokens).

23. **Budget soft alert at 80% is automatic** — confirmed in Budget UI: "Soft alert at 80%". No configuration needed. When budget is $0.00 it shows "Disabled" / "No cap configured" / "Unlimited".

24. **Onboard creates CEO + CTO by default.** The "Test Co" onboard created both agents with 3600s heartbeats and `canCreateAgents: true` for CEO. River's onboard will similarly create a CEO agent — the implementation plan should account for this starter agent.

25. **Configuration Revisions** are tracked — provides built-in audit trail for config changes without needing external tracking.

### Information Gaps (Still Unknown)

26. ~~**Session persistence across heartbeats**~~ — **RESOLVED: PASS.** Agent retains context across heartbeats, references prior work by issue ID.

27. **Budget auto-pause enforcement at 100%** — 80% soft alert confirmed in UI, but 100% hard pause not tested at threshold.

28. **`allowedTools` enforcement** — Field accepted in adapterConfig but unclear if the claude_local adapter enforces it during heartbeat execution.

29. **Model dropdown options** — UI shows "Default" but specific model list not captured. Need to confirm which Claude models are available (Opus, Sonnet, Haiku).

30. **Enable Chrome behavior** — Toggle exists but exact capability set it enables is undocumented in our discovery.
