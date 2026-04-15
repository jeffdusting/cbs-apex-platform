# Phase 1: WR KB Discovery

## Objective

Scan the WR Supabase `documents` table to quantify duplicates, analyse source file paths, assess the scope of reorganisation, and write a persistent discovery summary. No data changes.

## Prerequisites

- S4-P0 complete
- `WR_SUPABASE_URL`, `WR_SUPABASE_SERVICE_ROLE_KEY` set (`source .secrets/wr-env.sh`)
- `.secrets/wr-service-account.json` for Drive API

## Context

```bash
cat stage4/PLAN.md | head -50
cat stage4/TARGET-KB-STRUCTURE.md | head -80
```

## Tasks

### TASK 1.1: Quantify the WR KB

Query WR Supabase for total rows, distinct source_file values, entity distribution, category distribution. Paginate (19,301 rows exceed default limit). Print top 30 source_file paths sorted. Save raw data to `stage4/data/wr-audit-raw.json`.

### TASK 1.2: Identify Duplicates by Content Hash

Paginate through all WR `documents` rows. For each, compute SHA-256 of `content` field. Group by hash. Report: total rows, unique hashes, duplicate groups, excess rows (removable), percentage reduction. Show top 10 duplicate groups with source_file paths. Save to `stage4/data/wr-duplicate-report.json`.

### TASK 1.3: Analyse Source File Path Patterns

Classify every row by import source (Dropbox / SharePoint / canonical / other). Report counts per source. Analyse top-level path prefixes. Save to `stage4/data/wr-path-analysis.json`.

### TASK 1.4: Assess Cross-Source Duplicates

Group rows by filename (last component of source_file path). Find filenames appearing in both Dropbox and SharePoint imports — these are near-certain cross-source duplicates. Report count and top 20. Save to `stage4/data/wr-cross-dupes.json`.

### TASK 1.5: List Canonical Folder Structure from Drive

Use the WR service account to list top-level and second-level folders in the WR KB Shared Drive (`0AFIfqhhhv9HjUk9PVA`). Compare against `stage4/TARGET-KB-STRUCTURE.md`. Save actual folder names and IDs to `stage4/data/wr-canonical-folders.json`.

### TASK 1.6: Write Discovery Summary

Create `stage4/WR-DISCOVERY-SUMMARY.md` with sections:
1. Scale of the problem — totals, duplicates, percentage
2. Import source breakdown
3. Cross-source duplicates
4. Path structure assessment — mapping from current to canonical
5. Recommended dedup strategy
6. Recommended reorg mapping (preliminary — confirmed in P3)
7. Estimated impact — projected row count after dedup

## Confirmation Stop

Report findings and wait for operator confirmation before proceeding.

## Gate Verification

```bash
echo "=== S4-P1 Gate Verification ==="
for f in stage4/WR-DISCOVERY-SUMMARY.md stage4/data/wr-duplicate-report.json stage4/data/wr-path-analysis.json stage4/data/wr-cross-dupes.json stage4/data/wr-canonical-folders.json; do
    [ -f "$f" ] && echo "PASS: $f exists" || echo "FAIL: $f missing"
done
lines=$(wc -l < stage4/WR-DISCOVERY-SUMMARY.md 2>/dev/null || echo 0)
[ "$lines" -gt 30 ] && echo "PASS: Summary has $lines lines" || echo "FAIL: Summary too short ($lines)"
```

## Archive Point

```bash
git add -A && git commit -m "S4-P1: WR KB discovery — duplicate and path analysis"
git tag stage4-P1-wr-discovery
```

## TASK_LOG Entry

```markdown
## S4-P1: WR KB Discovery
- **Status:** COMPLETE
- **Total WR rows:** [N]
- **Unique content hashes:** [N]
- **Duplicate rows (removable):** [N] ([X]% reduction)
- **Cross-source duplicates:** [N] filenames
- **Canonical folders found:** [N]
- **Next phase:** P2 (CBS Discovery) or P3 (WR Dedup) if P2 already done
```
