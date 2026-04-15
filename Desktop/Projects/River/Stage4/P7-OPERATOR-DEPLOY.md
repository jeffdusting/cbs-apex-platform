# S4-P7 Operator Deployment — WR Agent Reconfiguration

**Status at hand-off:** Code and configuration committed. The Paperclip
`adapterConfig` PATCH and `skills/sync` POST require a live
`PAPERCLIP_SESSION_COOKIE`, which was not available in the automation session
(Claude Code cannot mint or refresh the cookie). Jeff runs the script below
after refreshing.

## What has already been done (committed, no operator action needed)

1. Local `agent-instructions/wr-executive/AGENTS.md`, `agent-instructions/governance-wr/AGENTS.md`, and `agent-instructions/office-management-wr/AGENTS.md` now contain explicit WR-Supabase retrieval guidance (`filter_entity="waterroads"`, `match_threshold=0.3`, entity-isolation warning).
2. `skills/wr-drive-read/SKILL.md` created — Drive-read helper for WR agents using the WR service account.
3. Entity-isolation data-layer test executed: WR Supabase is clean (0 cbs-group rows). CBS Supabase contains 98 legacy waterroads rows — flagged as a known issue (not a P7 gate failure because WR agents no longer query CBS).
4. `scripts/wr-agent-reconfig.py` combines the adapterConfig PATCH + skills sync + verification in a single run.

## What the operator runs

```bash
cd /Users/jeffdusting/Desktop/Projects/River

# 1. Source credentials
source scripts/env-setup.sh
source .secrets/wr-env.sh

# 2. Refresh the Paperclip session token
#    - Open https://org.cbslab.app, sign in
#    - DevTools → Application → Cookies → copy the VALUE of __Secure-better-auth.session_token
#    - Export it:
export PAPERCLIP_SESSION_COOKIE='<paste session token value here>'

# 3. Preview intended changes (no writes)
python3 scripts/wr-agent-reconfig.py --dry-run

# 4. Apply (PATCH adapterConfig, POST skills/sync, verify)
python3 scripts/wr-agent-reconfig.py
```

Expected output (success):

```
=== wr-executive (00fb11a2) ===
  Before: SUPABASE_URL=https://eptugqwlgsmwhnubbqsk.supabase.co  key_tail=…xxxxxxxx  env_keys=N
  New:    SUPABASE_URL=https://imbskgjkqvadnazzhbiw.supabase.co  key_tail=…xxxxxxxx  env_keys=N
  Skills: [...]
  Verify: OK  url_ok=True  prompt_ok=True  wr-drive-read_assigned=True
  ...
PASS: all WR agents reconfigured
```

## What the script changes per agent

For each of WR Executive, Governance WR, Office Management WR:

1. `adapterConfig.env.SUPABASE_URL` → `https://imbskgjkqvadnazzhbiw.supabase.co` (WR)
2. `adapterConfig.env.SUPABASE_SERVICE_ROLE_KEY` → WR service role key
3. `adapterConfig.promptTemplate` → updated AGENTS.md from local repo
4. Skills synced via `POST /api/agents/{id}/skills/sync` — adds `wr-drive-read` alongside existing hyper-agent-v1 skills (`trace-capture`, `self-check`, `feedback-loop`)

Skills assigned per agent:

| Agent | Skills |
|---|---|
| WR Executive | paperclip, supabase-query, wr-drive-read, sharepoint-write, teams-notify, feedback-loop, trace-capture, self-check |
| Governance WR | paperclip, supabase-query, wr-drive-read, xero-read, sharepoint-write, teams-notify, feedback-loop, trace-capture, self-check |
| Office Management WR | paperclip, supabase-query, wr-drive-read, sharepoint-write, feedback-loop, trace-capture, self-check |

## Rollback

If the PATCH produces undesired behaviour, the adapterConfig is versioned by
Paperclip. Revert via the Paperclip dashboard, or re-run this script after
pointing `scripts/env-setup.sh` at a previous state file.

## Verification checklist (for the operator to confirm manually)

After the script reports PASS:

- [ ] In Paperclip dashboard, open each WR agent and confirm:
  - `adapterConfig.env.SUPABASE_URL` shows the WR project URL.
  - `promptTemplate` contains the string `filter_entity="waterroads"`.
  - Skills list includes `wr-drive-read`.
- [ ] Trigger a manual heartbeat on WR Executive and check the resulting trace
      confirms retrieval was against WR Supabase (source_file should match
      WR-sourced files like `Archive/Unclassified/WaterRoads_*`).
