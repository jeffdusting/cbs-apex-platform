# Phase 2: CBS KB Discovery

## Objective

Audit the CBS Supabase `documents` table to understand why it has 15,655 rows (11× expected), identify duplicates and stale content, assess entity tagging, check the `match_documents` threshold gap, and assess whether Drive migration is warranted. No data changes.

## Prerequisites

- S4-P0 complete
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` set

## Context

```bash
cat stage4/PLAN.md | head -50
cat docs/hyper-agent-v1/DISCOVERY_SUMMARY.md | grep -A5 "Documents count"
```

## Tasks

### TASK 2.1: Quantify by Source, Category, and Timeline

Paginate through all 15,655 rows. Report: entity distribution, category distribution, source_file prefix breakdown (top 20), ingestion timeline by month, count of rows with `email_message_id` in metadata (from KB email intake). Save to `stage4/data/cbs-audit-raw.json`.

### TASK 2.2: Identify Duplicates by Content Hash

Same approach as WR-P1: SHA-256 of content, group by hash. Categorise duplicate sources: same_source_file_reingest, email_intake_duplicate, cross_source_duplicate. Report top 15 duplicate groups. Save to `stage4/data/cbs-duplicate-report.json`.

### TASK 2.3: Assess Stale and Orphaned Content

Check whether source_file paths reference files that exist on disk in `knowledge-base/`. Categorise missing: email intake (expected — no file on disk), truly orphaned (file was deleted/renamed). Save to `stage4/data/cbs-orphan-analysis.json`.

### TASK 2.4: Check match_documents Threshold Gap

Test CBS `match_documents` with and without `match_threshold` parameter. Report whether the function accepts the parameter. If not, report the SQL needed to upgrade it (for P4 execution). Run a sample query showing low-similarity results that would be filtered by threshold.

### TASK 2.5: Assess Drive Migration Value

Produce a structured assessment:

| Factor | Current (repo-based) | After Drive migration | Weight |
|---|---|---|---|
| Incremental sync | Manual re-ingest | Automatic via change detection | High |
| Content management UI | Git + editor | Drive web UI | Medium |
| Infrastructure consistency | Different from WR | Same as WR | Medium |
| Dedup on ingest | None | `drive_file_id` idempotency | High |
| Migration effort | N/A | Move 225 files, update scripts | High (negative) |

Write recommendation with clear rationale.

### TASK 2.6: Write Discovery Summary

Create `stage4/CBS-DISCOVERY-SUMMARY.md` with sections:
1. Scale of the problem — total rows, unique content, duplicates, excess, timeline
2. Root cause analysis — why 15,655 from 225 files
3. Duplicate categorisation
4. Orphaned content
5. Entity tagging assessment
6. match_documents gap
7. Drive migration assessment and recommendation
8. Recommended cleanup strategy

## Confirmation Stop

Report findings and wait for operator confirmation.

## Gate Verification

```bash
echo "=== S4-P2 Gate Verification ==="
for f in stage4/CBS-DISCOVERY-SUMMARY.md stage4/data/cbs-audit-raw.json stage4/data/cbs-duplicate-report.json stage4/data/cbs-orphan-analysis.json; do
    [ -f "$f" ] && echo "PASS: $f exists" || echo "FAIL: $f missing"
done
lines=$(wc -l < stage4/CBS-DISCOVERY-SUMMARY.md 2>/dev/null || echo 0)
[ "$lines" -gt 40 ] && echo "PASS: Summary has $lines lines" || echo "FAIL: Summary too short ($lines)"
```

## Archive Point

```bash
git add -A && git commit -m "S4-P2: CBS KB discovery — audit and Drive migration assessment"
git tag stage4-P2-cbs-discovery
```

## TASK_LOG Entry

```markdown
## S4-P2: CBS KB Discovery
- **Status:** COMPLETE
- **Total CBS rows:** [N]
- **Unique content hashes:** [N]
- **Duplicate rows (removable):** [N] ([X]% reduction)
- **Root cause:** [summary]
- **match_documents threshold:** [MISSING/PRESENT]
- **Drive migration recommendation:** [YES/NO/DEFER — rationale]
- **Next phase:** P3 (WR Dedup) or P4 (CBS Cleanup) — either, based on which discovery is done
```
