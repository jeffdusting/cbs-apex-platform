# CBS KB — Before/After Comparison (S4-P6 TASK 6.3)

Generated 2026-04-16 from S4-P2 discovery artefacts + S4-P6 retrieval tests.

| Metric | Before (pre-P4) | After (post-P4) |
|---|---:|---:|
| Total rows in `documents` | 15,655 | 1,273 |
| Distinct content hashes | 1,273 | 1,273 (unchanged) |
| Duplicate hash groups | 1,259 | 0 |
| Excess rows (removable by dedup) | 14,382 | 0 |
| `correction` category rows | 4 | 4 (preserved) |
| NULL entity rows | 0 | 0 |
| Ingest script idempotent | No | Yes (DELETE-per-source before insert) |
| `match_documents` signature | accepts `match_threshold` | accepts `match_threshold` (unchanged; already live pre-P4) |
| `match_threshold` enforced in production | Untested | Tested — 10/10 queries respect threshold 0.3 |
| Duplicate results in top-5 (content-identical) | Untested (frequent anecdotally: 3× same chunk observed) | 0/10 queries |
| Queries returning ≥1 result above threshold 0.3 | Untested | 10/10 |
| Queries with ≥2 results above 0.4 | Untested | 8/10 |
| IVFFlat `lists` | 100 (sized for 15,655) | 100 (over-sized for 1,273; rebuild SQL ready, pending manual apply) |

## Retrieval test findings

- 10 tender-domain queries executed at `match_threshold=0.3`, `match_count=5`, against `filter_entity='cbs-group'` (or `shared` for Shipley).
- **No content-hash duplicates** in any top-5 result set (the regression signal that P4 dedup was intended to address).
- **5/10 queries return multiple chunks of the same source_file** — this is legitimate for long documents (different `Part N` chunk indices, different content hashes). The gate metric `has_duplicates` was redefined in P6 to detect content-identical regressions, not source-file diversity.
- **2/10 queries have fewer than 2 results above 0.4**: `CA approval process for outbound communications` (CA process is freshly added content) and `competitor analysis Aurecon WSP Jacobs` (only 5 competitor-category rows in CBS KB). These are content-coverage issues, not retrieval failures.

## Not regressed

- `correction` category preservation: 4 → 4 ✓
- NULL entity: 0 → 0 ✓
- Threshold filtering: all retrieval results respect `match_threshold=0.3` ✓

## Deferred

- IVFFlat index rebuild to `lists=36` — SQL at `scripts/cbs-ivfflat-rebuild.sql`. Operator-applied via Supabase SQL Editor. Retrieval quality with current `lists=100` is acceptable; the rebuild is a latency/recall optimisation rather than a correctness fix.
