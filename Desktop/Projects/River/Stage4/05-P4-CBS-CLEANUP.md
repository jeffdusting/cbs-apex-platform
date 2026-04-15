# Phase 4: CBS KB Cleanup

## Objective

Remove duplicate rows from CBS Supabase `documents`, fix entity tagging, add `match_threshold` to `match_documents`, rebuild IVFFlat index if needed. Conditional Drive migration if P2 recommended it.

## Prerequisites

- S4-P2 complete. Discovery summary and duplicate report in `stage4/`.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` set.
- `VOYAGE_API_KEY` set (for match_documents verification).

## Context

```bash
cat stage4/CBS-DISCOVERY-SUMMARY.md
cat stage4/data/cbs-duplicate-report.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Groups: {d[\"duplicate_groups_count\"]}, Excess: {d[\"excess_rows\"]}')"
```

## Tasks

### TASK 4.1: Build and Run CBS Dedup Script

Create `scripts/cbs-kb-dedup.py`. Strategy: content-hash dedup (keep earliest `created_at` for initial ingest, keep most recent for email intake re-ingestion), never delete `category='correction'`, `--dry-run`, `--batch-size N`, `--preserve-categories correction`, `--report FILE`.

```bash
python3 scripts/cbs-kb-dedup.py --dry-run --report stage4/data/cbs-dedup-dryrun.json
python3 scripts/cbs-kb-dedup.py --report stage4/data/cbs-dedup-results.json
```

### TASK 4.2: Fix Entity Tagging

Set NULL entities to `cbs-group`. Check for `waterroads` content that shouldn't be in CBS Supabase — report but don't delete (may be intentional shared content).

### TASK 4.3: Upgrade match_documents with Threshold

Create `scripts/cbs-match-documents-upgrade.sql` with the updated function signature adding `match_threshold float DEFAULT 0.0`. Apply via Supabase CLI or REST. Verify by calling with `match_threshold=0.3`.

### TASK 4.4: Rebuild IVFFlat Index

Check if `lists` parameter needs adjustment: `optimal = max(10, sqrt(row_count))`. Current is 100. If delta > 20, rebuild.

### TASK 4.5: Conditional Drive Migration

Read CBS-P2 discovery summary Drive migration recommendation. If YES: create Drive structure, upload 225 files, add `drive_file_id`/`drive_modified` columns, re-index. If NO: skip and document why. If DEFER: note trigger conditions.

## Gate Verification

```bash
echo "=== S4-P4 Gate Verification ==="
[ -f "scripts/cbs-kb-dedup.py" ] && python3 -m py_compile scripts/cbs-kb-dedup.py 2>&1 && echo "PASS: Dedup script" || echo "FAIL"
[ -f "stage4/data/cbs-dedup-results.json" ] && echo "PASS: Dedup results" || echo "FAIL"
[ -f "scripts/cbs-match-documents-upgrade.sql" ] && echo "PASS: match_documents SQL" || echo "FAIL"

python3 -c "
import os, httpx, voyageai
url = os.environ['SUPABASE_URL']; key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}
vc = voyageai.Client(api_key=os.environ['VOYAGE_API_KEY'])
emb = vc.embed(['test threshold'], model='voyage-3.5').embeddings[0]
r = httpx.post(f'{url}/rest/v1/rpc/match_documents', headers=headers,
    json={'query_embedding': emb, 'match_count': 3, 'match_threshold': 0.3, 'filter_entity': 'cbs-group'})
print(f'PASS: match_documents threshold works' if r.status_code == 200 else f'FAIL: status {r.status_code}')
" 2>&1

python3 -c "
import os, httpx
url = os.environ['SUPABASE_URL']; key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
r = httpx.get(f'{url}/rest/v1/documents?select=id', headers={'apikey': key, 'Authorization': f'Bearer {key}', 'Prefer': 'count=exact', 'Range': '0-0'})
print(f'PASS: Post-dedup CBS rows: {r.headers.get(\"Content-Range\", \"unknown\")}')
" 2>&1
```

## Archive Point

```bash
git add -A && git commit -m "S4-P4: CBS cleanup — dedup, entity fix, match_threshold upgrade"
git tag stage4-P4-cbs-cleanup
```

## TASK_LOG Entry

```markdown
## S4-P4: CBS Cleanup
- **Status:** COMPLETE
- **Rows before:** [N]
- **Rows deleted:** [N]
- **Rows after:** [N]
- **Entity fixes:** [N] NULL fixed
- **match_documents upgraded:** [YES/NO]
- **Drive migration:** [EXECUTED/SKIPPED/DEFERRED]
- **Next phase:** P5 (WR Verify) or P6 (CBS Verify) — whichever track needs it
```
