# Phase 7: DR + Resilience Planning

## Objective

Establish backup automation, produce a DR drill plan, write the 14-day-absence runbook, document vendor migration costs and provider abstraction, and plan Railway failover. Addresses IB.1, IB.2, IB.3, IB.4, CE.2.

## Prerequisites

- S5-P3 complete (secrets in vault — DR procedures should reference the vault, not plaintext).

## Context

```bash
cat stage5/DISCOVERY_SUMMARY.md | grep -A3 "backup\|DR\|Railway\|vendor"
```

## Tasks

### TASK 7.1: Automated Backup Script (IB.2)

Create `scripts/backup-supabase.sh`:

```bash
#!/bin/bash
# Daily backup of both Supabase projects
# Run via cron: 0 2 * * * bash /path/to/scripts/backup-supabase.sh

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="${BACKUP_DIR:-$HOME/river-backups}"
mkdir -p "$BACKUP_DIR/$DATE"

# CBS Supabase
supabase db dump --linked --project-ref eptugqwlgsmwhnubbqsk \
  > "$BACKUP_DIR/$DATE/cbs-dump.sql" 2>&1

# WR Supabase
supabase db dump --linked --project-ref imbskgjkqvadnazzhbiw \
  > "$BACKUP_DIR/$DATE/wr-dump.sql" 2>&1

# Verify
for f in "$BACKUP_DIR/$DATE/cbs-dump.sql" "$BACKUP_DIR/$DATE/wr-dump.sql"; do
    if [ -s "$f" ]; then
        echo "OK: $(wc -c < "$f") bytes — $f"
    else
        echo "FAIL: Empty or missing — $f"
    fi
done

# Retention: keep 30 days
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +

# Optional: upload to S3-compatible storage
# aws s3 sync "$BACKUP_DIR/$DATE" "s3://river-backups/$DATE/" --storage-class STANDARD_IA
```

If `supabase` CLI is not available, fall back to `pg_dump` via the Supabase PostgreSQL connection string. Document both approaches.

### TASK 7.2: DR Drill Plan (IB.2)

Create `docs/dr-drill-plan.md`:

1. **Scenario:** CBS Supabase data loss (tables dropped or corrupted).
2. **Steps:**
   - Locate latest backup in `$BACKUP_DIR/`
   - Create a new Supabase project (or restore to existing)
   - Apply the backup: `psql $NEW_DB_URL < cbs-dump.sql`
   - Update 1Password with new credentials
   - Update env references to point to restored project
   - Run `scripts/retrieval-regression.py` to verify KB integrity
   - Run `scripts/test-evaluator-e2e.py` to verify evaluator
3. **Target RTO:** 2 hours (manual, one operator)
4. **Target RPO:** 24 hours (daily backups)
5. **Drill frequency:** Quarterly
6. **Success criteria:** All retrieval regression queries pass within 0.05 of baseline. Evaluator E2E passes 8/8.

### TASK 7.3: 14-Day Absence Runbook (IB.1)

Create `docs/absence-runbook.md` — what breaks if Jeff is unavailable for 14 days:

| System | Failure mode | Time to failure | Remediation for second operator |
|---|---|---|---|
| Paperclip cookie | Expires | ~4 hours | Log in to org.cbslab.app, extract cookie from DevTools, update `PAPERCLIP_SESSION_COOKIE` |
| Email intake (Apps Script) | Cookie in script expires | ~4 hours | Open Apps Script in Google workspace, update the session token property |
| Supabase | Stable | Weeks | No action needed unless key rotated |
| Railway | Stable | Weeks (unless outage) | If down: Railway dashboard → restart service |
| Vercel dashboard | Stable | Weeks | No action needed |
| Agent heartbeats | Cookie-dependent scripts fail | Hours | Non-cookie scripts (KB query, scoring) continue. Cookie-dependent scripts (trace ingestion, Paperclip mutations) stop. |
| Correction review | Queue grows | Immediate | `scripts/review-correction-proposals.py` — second operator can run |
| Tender decisions | No human-in-the-loop | Immediate | Tenders in `go_no_go_pending` stage will wait indefinitely |

**Minimum viable second-operator handoff:**
1. Share 1Password vault access for "River" vault
2. Share Paperclip login credentials (org.cbslab.app)
3. Walk through the cookie refresh procedure (5 min)
4. Walk through `scripts/review-correction-proposals.py` (5 min)
5. Walk through the Vercel dashboard for tender decisions (5 min)
6. Provide this runbook and the operator-runbook.md

### TASK 7.4: Cookie Auth Documentation (IB.3)

Create `docs/architecture-decisions/ADR-003-cookie-auth.md`:
- **Status:** Accepted (vendor limitation)
- **Context:** Paperclip v0.3.1 does not support API keys or service accounts. All API mutations require a `__Secure-better-auth.session_token` cookie extracted from a browser session. Cookies expire after a few hours.
- **Decision:** Accept the constraint. Document the cookie refresh as an explicit operator runbook step. Raise API key support as a roadmap item with the Paperclip vendor.
- **Consequence:** All deploy/mutation scripts are manual-trigger (require fresh cookie). Trace ingestion routine may fail silently if cookie expires between runs. Monitoring agent includes cookie-expiry detection.
- **Future:** When Paperclip supports API keys, replace all `PAPERCLIP_SESSION_COOKIE` references with `PAPERCLIP_API_KEY`.

### TASK 7.5: Vendor Migration Cost Matrix (IB.4)

Create `docs/vendor-migration-costs.md`:

| Layer | Current | Migration target | Effort | Data portability | Cost impact |
|---|---|---|---|---|---|
| Orchestration | Paperclip v0.3.1 (Railway) | Self-hosted (no alternative drop-in) | XL | Agent instructions + skills are git-managed. Paperclip-specific: heartbeat protocol, issue management, budget enforcement. | Highest risk — no direct replacement. |
| Database | Supabase (Postgres + pgvector) | Self-hosted Postgres + pgvector | M | Full SQL dump portable. pgvector extension available on any Postgres. RPC functions need minor adaptation. | $20–50/month self-hosted vs ~$25/month Supabase free tier. |
| LLM (agents) | Anthropic Claude (Sonnet 4, Opus 4.6, Haiku 4.5) | Multi-provider via abstraction | L | Agent instructions are model-agnostic. Adapter layer in Paperclip handles model selection. `lib/evaluator.py` has a `model` parameter already. | Variable — depends on alternative provider pricing. |
| Embeddings | Voyage AI voyage-3.5 (1024-dim) | OpenAI, Cohere, or self-hosted | L | Full re-embedding required (~18,000 chunks). ~$5–10 one-time cost. Must rebuild all IVFFlat indexes. | One-time migration cost. Ongoing cost similar. |
| Hosting | Railway | Render, Fly.io, self-hosted Docker | S | Docker image is portable. Environment variables documented. | Similar pricing ($5–20/month). |
| Email intake | Google Apps Script | Power Automate, custom Lambda | M | Logic is simple (poll, parse, create issue). Rewrite effort ~1 day. | Similar. |
| Dashboard | Vercel | Netlify, Cloudflare Pages, self-hosted | S | Static HTML + edge function. Portable. | Similar or free. |

**Provider abstraction action:** Update `scripts/lib/evaluator.py` to accept `provider` and `model` as configuration rather than hardcoding Anthropic. This is M effort and is the highest-leverage hedge against LLM vendor lock-in.

### TASK 7.6: Railway Health Check + Restart (CE.2)

Create `scripts/railway-health-check.sh`:
```bash
#!/bin/bash
# Check if Paperclip is responding. If not, trigger Railway restart.
HEALTH_URL="https://org.cbslab.app/api/companies"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" --max-time 10)
if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 401 ]; then
    echo "Paperclip is responding (HTTP $STATUS)"
else
    echo "Paperclip DOWN (HTTP $STATUS) — triggering restart"
    # Railway CLI restart (if installed)
    railway up --detach 2>/dev/null || echo "Railway CLI not available — manual restart required"
fi
```

Document that this can be run via cron every 5 minutes as a basic liveness check. A true multi-region failover is documented in the vendor migration costs as an XL effort and deferred.

## Gate Verification

```bash
echo "=== S5-P7 Gate ==="
[ -f "scripts/backup-supabase.sh" ] && echo "PASS: Backup script" || echo "FAIL"
[ -f "docs/dr-drill-plan.md" ] && echo "PASS: DR drill plan" || echo "FAIL"
[ -f "docs/absence-runbook.md" ] && echo "PASS: Absence runbook" || echo "FAIL"
[ -f "docs/architecture-decisions/ADR-003-cookie-auth.md" ] && echo "PASS: ADR-003" || echo "FAIL"
[ -f "docs/vendor-migration-costs.md" ] && echo "PASS: Vendor costs" || echo "FAIL"
[ -f "scripts/railway-health-check.sh" ] && echo "PASS: Health check" || echo "FAIL"
```

## Archive Point

```bash
git add -A && git commit -m "S5-P7: DR + resilience — backups, drill, runbook, vendor costs, health check"
git tag stage5-P7-dr-resilience
```

## TASK_LOG Entry

```markdown
## S5-P7: DR + Resilience
- **Status:** COMPLETE
- **Backup script:** created (scripts/backup-supabase.sh)
- **DR drill plan:** documented (2h RTO, 24h RPO)
- **Absence runbook:** 14-day scenario with second-operator handoff
- **Cookie auth:** ADR-003 accepted (vendor limitation)
- **Vendor migration:** cost matrix produced, evaluator provider abstraction recommended
- **Health check:** created (scripts/railway-health-check.sh)
- **Next phase:** P8 (Deferred Designs) or P9 (Verification) if P8 already done
```
