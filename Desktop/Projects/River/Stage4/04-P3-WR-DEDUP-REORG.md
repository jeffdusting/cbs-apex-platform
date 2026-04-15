# Phase 3: WR KB Dedup + Reorganisation

## Objective

Remove duplicate chunks from WR Supabase, move Drive files into the canonical folder structure, update source_file metadata. After this phase, WR KB has no duplicates and all content is in canonical folders.

## Prerequisites

- S4-P1 complete. Discovery summary and duplicate report in `stage4/`.
- `WR_SUPABASE_URL`, `WR_SUPABASE_SERVICE_ROLE_KEY` set.
- `.secrets/wr-service-account.json` for Drive API.

## Context

```bash
cat stage4/WR-DISCOVERY-SUMMARY.md
cat stage4/data/wr-duplicate-report.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Groups: {d[\"duplicate_groups_count\"]}, Excess: {d[\"excess_rows\"]}')"
cat stage4/TARGET-KB-STRUCTURE.md | head -80
```

## Tasks

### TASK 3.1: Build and Run WR Dedup Script

Create `scripts/wr-kb-dedup.py`. Dedup strategy: content-hash dedup (keep earliest `created_at`), cross-source preference (SharePoint over Dropbox), preserve `drive_file_id` linkage. Arguments: `--dry-run`, `--batch-size N`, `--report FILE`.

Run dry-run first, then execute:
```bash
python3 scripts/wr-kb-dedup.py --dry-run --report stage4/data/wr-dedup-dryrun.json
python3 scripts/wr-kb-dedup.py --report stage4/data/wr-dedup-results.json
```

### TASK 3.2: Build Path Mapping

Using P1 discovery data (`wr-path-analysis.json`, `wr-canonical-folders.json`) and the target structure (`TARGET-KB-STRUCTURE.md`), create `stage4/data/wr-path-mapping.json` — mapping from current import path prefixes to canonical folder names and Drive folder IDs. Flag ambiguous mappings.

### TASK 3.3: Build and Run Drive Reorg Script

Create `scripts/wr-drive-reorg.py`. For each mapping rule: find files in source prefix, move via Drive API `files().update(addParents=target, removeParents=source)` (preserves `drive_file_id`), log each move. Arguments: `--dry-run`, `--source-prefix TEXT`.

Run dry-run first, then execute. Save move log to `stage4/data/wr-reorg-moves.json`.

### TASK 3.4: Update Supabase Source Paths

After Drive moves, update `source_file` in WR Supabase `documents` for all moved files using `drive_file_id` as the join key.

### TASK 3.5: Clean Up Empty Import Folders

List remaining files in "Imported from Dropbox" and "Imported from SharePoint" Drive folders. If empty, delete the folders. If residual unclassifiable files remain, move to `Archive/Unclassified/`.

## Gate Verification

```bash
echo "=== S4-P3 Gate Verification ==="
for script in scripts/wr-kb-dedup.py scripts/wr-drive-reorg.py; do
    [ -f "$script" ] && python3 -m py_compile "$script" 2>&1 && echo "PASS: $script" || echo "FAIL: $script"
done
[ -f "stage4/data/wr-dedup-results.json" ] && echo "PASS: Dedup results exist" || echo "FAIL: Missing"
[ -f "stage4/data/wr-path-mapping.json" ] && echo "PASS: Path mapping exists" || echo "FAIL: Missing"

python3 -c "
import os, httpx
url = os.environ['WR_SUPABASE_URL']; key = os.environ['WR_SUPABASE_SERVICE_ROLE_KEY']
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Prefer': 'count=exact'}
r = httpx.get(f'{url}/rest/v1/documents?select=id', headers={**headers, 'Range': '0-0'})
print(f'PASS: Post-dedup WR rows: {r.headers.get(\"Content-Range\", \"unknown\")}')
" 2>&1
```

## Archive Point

```bash
git add -A && git commit -m "S4-P3: WR dedup + reorg — duplicates removed, Drive reorganised"
git tag stage4-P3-wr-dedup-reorg
```

## TASK_LOG Entry

```markdown
## S4-P3: WR Dedup + Reorg
- **Status:** COMPLETE
- **Rows before:** [N]
- **Rows deleted:** [N]
- **Rows after:** [N]
- **Files moved in Drive:** [N]
- **Source paths updated:** [N]
- **Import folders cleaned:** [YES/NO]
- **Next phase:** P4 (CBS Cleanup) or P5 (WR Verify) — P5 if P4 already done
```
