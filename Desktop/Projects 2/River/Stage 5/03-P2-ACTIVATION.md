# Phase 2: Operational Activation

## Objective

Move the evaluation layer from "built and tested" to "operating in production." Activate trace ingestion against real Paperclip data, rebuild the WR IVFFlat index, run the first production evaluation cycle, and exercise the tender lifecycle end-to-end.

## Prerequisites

- S5-P1 complete (task_type vocabulary fixed — traces will now route correctly).
- `PAPERCLIP_SESSION_COOKIE` must be fresh (trace ingestion reads Paperclip API).
- `ANTHROPIC_API_KEY` set (evaluator scoring).

## Context

```bash
cat stage5/DISCOVERY_SUMMARY.md | grep -A3 "agent_traces\|evaluation_scores\|IVFFlat"
```

## Tasks

### TASK 2.1: Refresh Paperclip Cookie and Test

If `PAPERCLIP_SESSION_COOKIE` is expired, CC cannot proceed with trace ingestion. Test:

```bash
python3 -c "
import os, httpx
url = os.environ.get('PAPERCLIP_API_URL', 'https://org.cbslab.app')
cookie = os.environ.get('PAPERCLIP_SESSION_COOKIE', '')
r = httpx.get(f'{url}/api/companies', headers={'Cookie': f'__Secure-better-auth.session_token={cookie}'})
if r.status_code == 200:
    print(f'PASS: Cookie valid — {len(r.json())} companies')
else:
    print(f'FAIL: Cookie expired or invalid (status {r.status_code})')
    print('ACTION: Refresh cookie from browser DevTools (Application → Cookies → org.cbslab.app)')
    print('Then: export PAPERCLIP_SESSION_COOKIE=\"<new value>\"')
"
```

If expired, report the failure clearly and proceed with tasks that don't require the Paperclip API. Do not skip the phase — complete what can be done and note the blocked items.

### TASK 2.2: Rebuild WR IVFFlat Index (IV#5)

```bash
python3 << 'EOF'
import os, httpx, math, subprocess

url = os.environ['WR_SUPABASE_URL']
key = os.environ['WR_SUPABASE_SERVICE_ROLE_KEY']
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Prefer': 'count=exact'}

r = httpx.get(f'{url}/rest/v1/documents?select=id', headers={**headers, 'Range': '0-0'})
total = int(r.headers.get('Content-Range', '*/0').split('/')[-1])
optimal = max(10, int(math.sqrt(total)))
print(f"WR rows: {total}, optimal lists: {optimal}, current: 40")

# Write SQL
sql = f"""
DROP INDEX IF EXISTS documents_embedding_idx;
CREATE INDEX documents_embedding_idx ON documents
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = {optimal});
ANALYZE documents;
"""
with open('scripts/wr-ivfflat-rebuild.sql', 'w') as f:
    f.write(sql)
print(f"SQL written to scripts/wr-ivfflat-rebuild.sql (lists={optimal})")

# Apply via Supabase CLI if available
result = subprocess.run(['supabase', 'db', 'query', '--linked', '--project-ref', 'imbskgjkqvadnazzhbiw', sql],
    capture_output=True, text=True, timeout=120)
if result.returncode == 0:
    print(f"PASS: Index rebuilt via Supabase CLI")
else:
    print(f"Supabase CLI failed: {result.stderr[:200]}")
    print("Apply manually in Supabase SQL Editor")
EOF
```

Also check CBS IVFFlat if needed (post-dedup row count may warrant adjustment from lists=100).

### TASK 2.3: Run Trace Ingestion Against Real Data (IV#3 / IV#9)

```bash
# Run trace ingestion for the last 48 hours of Paperclip activity
python3 scripts/ingest-traces.py --since 48 2>&1
```

Report: traces found, traces inserted, traces skipped, parse errors. If 0 traces found, check whether agents are actually emitting trace blocks (the heartbeat extensions were deployed in Stage 4 — confirm by reading a recent issue comment from the Paperclip API).

### TASK 2.4: Run First Production Evaluation Cycle

```bash
# Score any unscored traces
python3 scripts/evaluate-outputs.py --batch-size 10 2>&1
```

Report: traces evaluated, pass count, fail count, correction proposals generated. If 0 traces available (trace ingestion found nothing), run the evaluator in dry-run and note this as a dependency on trace data accumulation.

### TASK 2.5: Verify Sync Evaluation Routing

With the P1 task_type fix in place, verify that a trace with a sync task_type is correctly identified:

```bash
python3 -c "
import json, sys
sys.path.insert(0, 'scripts/lib')
from evaluator import resolve_evaluation_mode

with open('config/evaluation-events.json') as f:
    events = json.load(f)

# Test all sync types
sync_types = ['go-no-go', 'board-paper', 'ca-fill', 'executive-brief', 'white-paper']
for tt in sync_types:
    mode = resolve_evaluation_mode(tt, events)
    print(f'{tt}: {mode} {\"PASS\" if mode == \"sync\" else \"FAIL\"}'  )

# Test async
async_types = ['tender-scan', 'email-triage', 'interest-test']
for tt in async_types:
    mode = resolve_evaluation_mode(tt, events)
    print(f'{tt}: {mode} {\"PASS\" if mode == \"async\" else \"FAIL\"}'  )
"
```

### TASK 2.6: Document Tender Lifecycle Exercise Plan (IV#10)

IV#10 notes no tender has passed beyond `interest_passed`. Create `docs/tender-lifecycle-exercise.md` — a step-by-step plan for Jeff to drive one real tender through the full lifecycle as a smoke test:

1. Select a real tender from the 23 in `tender_register` (one with `lifecycle_stage='interest_passed'`)
2. Click "Pursue" on the dashboard → lifecycle moves to `pursue`
3. Monitor Tender Coordination agent's CA fill workflow
4. Approve CA send on dashboard (the new CA approval gate from Stage 4)
5. Monitor for CA sent → docs received transitions
6. When documents arrive, trigger Go/No-Go assessment
7. Review the evaluator's sync scoring of the Go/No-Go output
8. Make Go or No-Go decision on dashboard

Document expected agent behaviour at each step, what to watch for, and how to roll back if something breaks. This is a human-executed exercise, not a CC task — CC produces the guide.

## Gate Verification

```bash
echo "=== S5-P2 Gate ==="

# IVFFlat rebuild
[ -f "scripts/wr-ivfflat-rebuild.sql" ] && echo "PASS: WR IVFFlat SQL exists" || echo "FAIL"

# Trace ingestion ran
python3 -c "
import os, httpx
url = os.environ['SUPABASE_URL']; key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
h = {'apikey': key, 'Authorization': f'Bearer {key}', 'Prefer': 'count=exact'}
r = httpx.get(f'{url}/rest/v1/agent_traces?select=id', headers={**h, 'Range': '0-0'})
c = r.headers.get('Content-Range','*/0').split('/')[-1]
print(f'agent_traces rows: {c} {\"PASS\" if int(c) > 0 else \"WARN: still 0 — agents may not be emitting traces yet\"}'  )
" 2>&1

# Sync routing works
python3 -c "
import json, sys; sys.path.insert(0, 'scripts/lib')
from evaluator import resolve_evaluation_mode
with open('config/evaluation-events.json') as f: e = json.load(f)
r = resolve_evaluation_mode('go-no-go', e)
print(f'Sync routing for go-no-go: {r} {\"PASS\" if r == \"sync\" else \"FAIL\"}'  )
" 2>&1

# Tender exercise guide
[ -f "docs/tender-lifecycle-exercise.md" ] && echo "PASS: Exercise guide exists" || echo "FAIL"
```

## Archive Point

```bash
git add -A && git commit -m "S5-P2: Operational activation — traces, IVFFlat, first eval, exercise plan"
git tag stage5-P2-activation
```

## TASK_LOG Entry

```markdown
## S5-P2: Operational Activation
- **Status:** COMPLETE
- **Cookie valid:** [YES / NO — trace ingestion blocked]
- **Traces ingested:** [N]
- **Evaluations run:** [N] (pass: [N], fail: [N])
- **WR IVFFlat rebuilt:** [YES lists=[N] / NO — manual required]
- **Sync routing verified:** [PASS / FAIL]
- **Tender exercise guide:** created
- **Next phase:** P3 (Secrets), P4 (Governance), P5 (CI), or P8 (Deferred Designs) — any can run next
```
