# Phase 6: CBS KB Retrieval Verification

## Objective

Validate CBS KB retrieval quality post-cleanup. Run tender-domain queries (the evaluator benchmark domain). Confirm match_threshold working, no duplicates in results. Update BACKLOG.md. Confirm CBS track complete for evaluator calibration.

## Prerequisites

- S4-P4 complete. CBS KB deduplicated, match_documents upgraded.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VOYAGE_API_KEY` set.

## Context

```bash
cat stage4/CBS-DISCOVERY-SUMMARY.md | tail -20
```

## Tasks

### TASK 6.1: Rebuild IVFFlat Index If Needed

Check row count, calculate optimal `lists`. Current is 100. Rebuild if delta > 20.

### TASK 6.2: Run Retrieval Quality Tests

10 tender-domain queries (the evaluator's benchmark domain): CAPITAL framework, Western Harbour Tunnel, tender scorecard, capability statement, Shipley methodology, ISO 55001, CA process, M6 Stage 1, board paper template, competitor analysis. For each, embed, call `match_documents` with `match_threshold=0.3` and `filter_entity='cbs-group'` (or `shared` for Shipley).

Check: zero duplicate sources in top 5, zero results below 0.3, all tender queries return ≥2 results above 0.4. Save to `stage4/data/cbs-retrieval-test-results.json`.

### TASK 6.3: Before/After Comparison

Print comparison table: total rows (before/after), match_threshold (absent/present), duplicate results (untested/tested).

### TASK 6.4: Update BACKLOG.md

Add CBS KB Rationalisation section with dedup stats, match_documents upgrade status, retrieval test results.

## Gate Verification

```bash
echo "=== S4-P6 Gate Verification ==="
python3 -c "
import json
with open('stage4/data/cbs-retrieval-test-results.json') as f: r = json.load(f)
dupes = sum(1 for x in r if x.get('has_duplicates'))
low_sim = sum(1 for x in r if x.get('low_similarity_results', 0) > 0)
zeros = sum(1 for x in r if x.get('hits', 0) == 0)
print(f'Queries: {len(r)}, Dupes: {dupes}, Low-sim leakage: {low_sim}, Empty: {zeros}')
print('PASS' if dupes == 0 and low_sim == 0 else 'FAIL')
" 2>&1
grep -q "CBS KB Rationalisation" BACKLOG.md && echo "PASS: BACKLOG.md updated" || echo "FAIL: BACKLOG.md not updated"
```

## Archive Point

```bash
git add -A && git commit -m "S4-P6: CBS KB verify — retrieval quality confirmed"
git tag stage4-P6-cbs-verify
```

## TASK_LOG Entry

```markdown
## S4-P6: CBS KB Verify
- **Status:** COMPLETE
- **Final row count:** [N]
- **Retrieval test:** [N] queries, [N] dupes, [N] low-sim, [N] empty
- **match_threshold:** WORKING
- **CBS KB ready for evaluator calibration:** YES
- **Next phase:** P7 (WR Reconfig) if P5 done, or P8 (Calibration) if P7 done and Jeff has scored
```
