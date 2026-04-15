# Phase 5: WR KB Retrieval Verification

## Objective

Validate WR KB retrieval quality post-dedup and reorg. Rebuild IVFFlat index if needed. Confirm no duplicate sources in results, no import folder paths remain. Update BACKLOG.md.

## Prerequisites

- S4-P3 complete. WR KB deduplicated and reorganised.
- `WR_SUPABASE_URL`, `WR_SUPABASE_SERVICE_ROLE_KEY`, `VOYAGE_API_KEY` set.

## Context

```bash
cat stage4/WR-DISCOVERY-SUMMARY.md | tail -20
cat stage4/data/wr-dedup-results.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Rows after dedup: {d.get(\"rows_after\", \"unknown\")}')"
```

## Tasks

### TASK 5.1: Rebuild IVFFlat Index

Check current row count, calculate optimal `lists = max(10, sqrt(rows))`. If delta from current (40) exceeds 10, drop and recreate the index.

### TASK 5.2: Run Retrieval Quality Tests

5 WR-specific queries: PPP financial model, zero-emission ferry regulatory, board resolution, ferry route demand, ESOP. For each, embed via Voyage AI, call `match_documents` with `match_threshold=0.3`, check for duplicate source_files in top 5, check all similarities > 0.3. Save results to `stage4/data/wr-retrieval-test-results.json`.

**Pass criteria:** Zero queries with duplicate sources. Zero queries with zero results. All top similarities > 0.3.

### TASK 5.3: Verify No Import Folder Paths Remain

Query `documents` where `source_file LIKE '%Imported%'`. Must return 0 rows.

### TASK 5.4: Update BACKLOG.md

Mark WR Phase 3.5 (Re-organise Drive content) as ✅ DONE. Add dedup statistics. Note any residual items.

## Gate Verification

```bash
echo "=== S4-P5 Gate Verification ==="
python3 -c "
import json
with open('stage4/data/wr-retrieval-test-results.json') as f: r = json.load(f)
dupes = sum(1 for x in r if x.get('has_duplicates'))
zeros = sum(1 for x in r if x.get('hits', 0) == 0)
print(f'PASS: {len(r)} queries, {dupes} with dupes, {zeros} empty' if dupes == 0 and zeros == 0 else f'FAIL: {dupes} dupes, {zeros} empty')
" 2>&1

python3 -c "
import os, httpx
url = os.environ['WR_SUPABASE_URL']; key = os.environ['WR_SUPABASE_SERVICE_ROLE_KEY']
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Prefer': 'count=exact'}
r = httpx.get(f'{url}/rest/v1/documents?source_file=like.*Imported*&select=id', headers={**headers, 'Range': '0-0'})
c = r.headers.get('Content-Range','*/0').split('/')[-1]
print(f'PASS: No import paths remain' if c == '0' else f'WARN: {c} rows still reference import paths')
" 2>&1
```

## Archive Point

```bash
git add -A && git commit -m "S4-P5: WR KB verify — retrieval quality confirmed"
git tag stage4-P5-wr-verify
```

## TASK_LOG Entry

```markdown
## S4-P5: WR KB Verify
- **Status:** COMPLETE
- **Final row count:** [N]
- **Index rebuilt:** [YES lists=[N] / NO — adequate]
- **Retrieval test:** [N] queries, [N] dupes, [N] empty
- **Import paths remaining:** [N]
- **Next phase:** P6 (CBS Verify) or P7 (WR Reconfig) — P7 if P6 already done
```
