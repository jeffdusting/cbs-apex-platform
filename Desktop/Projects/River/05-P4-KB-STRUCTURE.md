# Phase 4: Knowledge Base Structuring (Day 1 CC)

**Prerequisites:** Jeff has exported institutional IP content into `knowledge-base/`. P1–P3 complete.
**Context:** Read `DISCOVERY_SUMMARY.md` for Supabase schema details.

---

## Objective

Structure the exported knowledge base content for optimal retrieval quality. Create the manifest and define retrieval evaluation queries with expected results.

## Tasks

### Task 4.1. Review and Structure KB Files

For each file in `knowledge-base/`:

1. Confirm the entity is identifiable from the filename prefix (`cbs-group-*` → entity `cbs-group`, `waterroads-*` → entity `waterroads`).
2. Add a YAML front-matter block if missing:
   ```yaml
   ---
   entity: cbs-group
   category: methodology  # or: tender, governance, template, financial, ip
   title: "CAPITAL Framework Methodology"
   ---
   ```
3. Ensure section headings are clear and topic-delineated for retrieval.
4. If a file exceeds 5,000 words, split into logical sub-documents. Each sub-document gets its own front-matter and retains a 200-word contextual header summarising the parent document's scope. This overlap ensures retrieval doesn't lose context at chunk boundaries.

### Task 4.2. Create Manifest

Create `knowledge-base/MANIFEST.md` listing every file with: filename, entity, category, word count, one-line description.

### Task 4.3. Define Retrieval Evaluation Queries

Create `knowledge-base/RETRIEVAL_EVAL.md` with 5 test queries and expected results:

| Query | Entity | Expected Top Result | Required Content |
|---|---|---|---|
| "CAPITAL framework whole-of-life cost modelling tunnel" | cbs-group | CAPITAL methodology doc | $180M savings reference, WHT design phase |
| "value-based pricing methodology CBS Group" | cbs-group | Fee structure doc | Value-based pricing, CAPITAL commercial principles |
| "WaterRoads PPP financial model Rhodes Barangaroo" | waterroads | Business case doc | Feasibility analysis, investor materials |
| "systems engineering assurance safety ISO 55001" | cbs-group | CAPITAL methodology doc | ISO 55001, ISO 44001 standards |
| "board paper resolution register CBS Group" | cbs-group | Board papers doc | Resolution format, recent governance records |

Each query should return at least one document with >0.7 cosine similarity. If the exported content cannot support these queries, flag the gap for Jeff to export additional material.

### Task 4.4. Review Agent Instruction Files

If Jeff has flagged issues with any agent instruction files in RIVER-STATUS.md or TASK_LOG.md, resolve them. Otherwise, spot-check 3 random AGENTS.md files against the Reference Document Section C.2 hard stops to confirm nothing was missed in P2.

---

## Gate Verification

```bash
# 1. All KB files have front-matter
for f in knowledge-base/*.md; do
  [ "$f" = "knowledge-base/MANIFEST.md" ] && continue
  [ "$f" = "knowledge-base/RETRIEVAL_EVAL.md" ] && continue
  head -1 "$f" | grep -q "^---" || echo "MISSING front-matter: $f"
done

# 2. Manifest exists and has entries
test -f knowledge-base/MANIFEST.md && echo "PASS: manifest" || echo "FAIL: no manifest"
wc -l knowledge-base/MANIFEST.md

# 3. Retrieval eval exists
test -f knowledge-base/RETRIEVAL_EVAL.md && echo "PASS: eval queries" || echo "FAIL: no eval"

echo "Total KB files: $(find knowledge-base -name '*.md' | wc -l)"
```

**Archive point:** `git add -A && git commit -m "P4: KB structuring — manifest, retrieval eval, front-matter" && git tag river-p4-kb-structure`

## Phase 4 Completion

Update TASK_LOG.md:
```markdown
## Project River — Phase 4 (KB Structure)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** river-p4-kb-structure

### Files Modified/Created
- knowledge-base/ (structured with front-matter, splits applied)
- knowledge-base/MANIFEST.md
- knowledge-base/RETRIEVAL_EVAL.md

### Next Phase
- Read `docs/river-sprint/06-P5-DAY2-VALIDATION.md`
- Prerequisites: Jeff has completed Day 1 infrastructure (Railway, Supabase, Azure AD, Xero, env vars)
```
