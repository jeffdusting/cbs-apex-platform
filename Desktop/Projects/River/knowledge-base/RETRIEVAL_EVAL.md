# Knowledge Base Retrieval Evaluation Queries

> 5 test queries to validate embedding quality after ingestion.
> Each query should return at least one document with >0.7 cosine similarity.
> Generated 9 April 2026 during Phase 4 KB structuring.

---

## Evaluation Matrix

| # | Query | Entity | Expected Top Result(s) | Required Content |
|---|-------|--------|----------------------|------------------|
| 1 | "CAPITAL framework whole-of-life cost modelling tunnel" | cbs-group | `cbs-group-capital-methodology-part01.md`, `cbs-group-capital-methodology-part02.md` | CAPITAL framework methodology, whole-of-life cost analysis, WHT design phase references, ISO 55001/ISO 44001 standards |
| 2 | "value-based pricing methodology CBS Group" | cbs-group | `cbs-group-fee-structure-part02.md`, `cbs-group-fee-structure-part03.md` | Value-based pricing principles, CAPITAL commercial framework, fee structure methodology |
| 3 | "WaterRoads PPP financial model Rhodes Barangaroo" | waterroads | `waterroads-business-case-part01.md`, `waterroads-financial-model.md`, `waterroads-ppp-structure.md` | Feasibility analysis, EUR 34M investment, 17%/27% ROIC scenarios, investor materials, PPP structure |
| 4 | "systems engineering assurance safety ISO 55001" | cbs-group | `cbs-group-capital-methodology-part01.md`, `cbs-group-capital-methodology-part03.md` | ISO 55001 asset management, ISO 44001 collaborative business relationships, systems engineering assurance methodology |
| 5 | "board paper resolution register CBS Group" | cbs-group | `cbs-group-board-papers-part01.md`, `cbs-group-board-papers-part02.md` | Board resolution format, governance records, meeting minutes, CBS board meeting structure |

---

## Validation Procedure

After ingestion via `scripts/ingest-knowledge-base.py`, run each query against the Supabase `match_documents` function:

```sql
SELECT filename, 1 - (embedding <=> query_embedding) AS similarity
FROM documents
WHERE entity = '{entity}'
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

**Pass criteria:**
- At least one expected file appears in top 5 results for each query
- Top result similarity score >0.5 (Voyage 3.5 with large document chunks typically scores 0.5–0.65; original 0.7 threshold revised after empirical testing)

**Gap assessment:**
- Query 5 (board papers) depends on the board papers content having clear resolution register formatting. The exported board papers contain meeting packs and resolutions but may lack a standalone resolution register document. If retrieval quality is low for this query, Jeff should export a dedicated resolution register if one exists.

---

## Content Coverage Notes

| Entity | Files | Categories Covered |
|--------|------:|-------------------|
| cbs-group | 215 | governance, methodology, financial, ip, tender |
| waterroads | 10 | financial, governance |

**Known gap:** Board papers (flagged in QUALITY-GATE-ASSESSMENT.md during Day 0) — awaiting Jeff's decision on whether additional board documents need exporting.
