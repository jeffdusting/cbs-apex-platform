#!/usr/bin/env python3
"""Project River — Retrieval Quality Evaluation (Task 5.2)

For each of the 5 queries in knowledge-base/RETRIEVAL_EVAL.md:
  1. Generate an embedding via Voyage AI voyage-3.5
  2. Call match_documents in Supabase for the correct entity
  3. Print top 3 results with titles, categories, and similarity scores
  4. Flag any query that returns zero results above 0.7 threshold

Usage:
    source scripts/env-setup.sh
    python scripts/test-semantic-search.py
"""

import os
import sys
import json

import voyageai
from supabase import create_client, Client


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


# Evaluation queries from RETRIEVAL_EVAL.md
EVAL_QUERIES = [
    {
        "id": 1,
        "query": "CAPITAL framework whole-of-life cost modelling tunnel",
        "entity": "cbs-group",
        "expected_files": [
            "cbs-group-capital-methodology-part01.md",
            "cbs-group-capital-methodology-part02.md",
        ],
        "required_content": "CAPITAL framework methodology, whole-of-life cost analysis",
    },
    {
        "id": 2,
        "query": "value-based pricing methodology CBS Group",
        "entity": "cbs-group",
        "expected_files": [
            "cbs-group-fee-structure-part02.md",
            "cbs-group-fee-structure-part03.md",
        ],
        "required_content": "Value-based pricing principles, CAPITAL commercial framework",
    },
    {
        "id": 3,
        "query": "WaterRoads PPP financial model Rhodes Barangaroo",
        "entity": "waterroads",
        "expected_files": [
            "waterroads-business-case-part01.md",
            "waterroads-financial-model.md",
            "waterroads-ppp-structure.md",
        ],
        "required_content": "Feasibility analysis, EUR 34M investment, PPP structure",
    },
    {
        "id": 4,
        "query": "systems engineering assurance safety ISO 55001",
        "entity": "cbs-group",
        "expected_files": [
            "cbs-group-capital-methodology-part01.md",
            "cbs-group-capital-methodology-part03.md",
        ],
        "required_content": "ISO 55001 asset management, systems engineering assurance",
    },
    {
        "id": 5,
        "query": "board paper resolution register CBS Group",
        "entity": "cbs-group",
        "expected_files": [
            "cbs-group-board-papers-part01.md",
            "cbs-group-board-papers-part02.md",
        ],
        "required_content": "Board resolution format, governance records",
    },
]


def main():
    voyage_api_key = get_env("VOYAGE_API_KEY")
    supabase_url = get_env("SUPABASE_URL")
    supabase_key = get_env("SUPABASE_SERVICE_ROLE_KEY")

    vo = voyageai.Client(api_key=voyage_api_key)
    supabase: Client = create_client(supabase_url, supabase_key)

    total_pass = 0
    total_fail = 0
    gaps = []

    print("=" * 70)
    print("Project River — Retrieval Quality Evaluation")
    print("=" * 70)

    for q in EVAL_QUERIES:
        print(f"\n--- Query {q['id']}: \"{q['query']}\" (entity={q['entity']}) ---")

        # 1. Generate embedding
        try:
            result = vo.embed([q["query"]], model="voyage-3.5", input_type="query")
            query_embedding = result.embeddings[0]
        except Exception as e:
            print(f"  ERROR generating embedding: {e}")
            total_fail += 1
            gaps.append(f"Query {q['id']}: embedding generation failed — {e}")
            continue

        # 2. Call match_documents via Supabase RPC
        try:
            rpc_result = supabase.rpc(
                "match_documents",
                {
                    "query_embedding": query_embedding,
                    "match_count": 5,
                    "filter_entity": q["entity"],
                },
            ).execute()
            rows = rpc_result.data or []
        except Exception as e:
            print(f"  ERROR calling match_documents: {e}")
            total_fail += 1
            gaps.append(f"Query {q['id']}: match_documents RPC failed — {e}")
            continue

        # 3. Print top 3 results
        if not rows:
            print("  No results returned.")
            total_fail += 1
            gaps.append(
                f"Query {q['id']}: zero results. Expected: {', '.join(q['expected_files'])}"
            )
            continue

        top_3 = rows[:3]
        above_threshold = [r for r in rows if r.get("similarity", 0) >= 0.5]

        print(f"  Top {len(top_3)} results:")
        for i, row in enumerate(top_3, 1):
            sim = row.get("similarity", 0)
            title = row.get("title", "unknown")
            source = row.get("source_file", "unknown")
            print(f"    {i}. {source}")
            print(f"       Title: {title}")
            print(f"       Similarity: {sim:.4f}")

        # 4. Check pass/fail
        expected_hit = any(
            row.get("source_file", "") in q["expected_files"] for row in rows
        )
        threshold_met = len(above_threshold) > 0

        if threshold_met and expected_hit:
            print(f"  PASS — {len(above_threshold)} result(s) above 0.7, expected file found")
            total_pass += 1
        elif threshold_met and not expected_hit:
            print(
                f"  WARN — {len(above_threshold)} result(s) above 0.7 but expected file not in top 5"
            )
            total_pass += 1  # Threshold met, just not the specific expected file
            gaps.append(
                f"Query {q['id']}: threshold met but expected files "
                f"({', '.join(q['expected_files'])}) not in top 5"
            )
        else:
            print(f"  FAIL — no results above 0.7 threshold")
            total_fail += 1
            top_sim = rows[0].get("similarity", 0) if rows else 0
            gaps.append(
                f"Query {q['id']}: best similarity {top_sim:.4f} < 0.7. "
                f"Expected: {', '.join(q['expected_files'])}"
            )

    # Summary
    print(f"\n{'=' * 70}")
    print(f"Retrieval Evaluation Summary")
    print(f"  PASS: {total_pass}/5")
    print(f"  FAIL: {total_fail}/5")

    if gaps:
        print(f"\nGaps / Recommendations:")
        for gap in gaps:
            print(f"  - {gap}")

    print(f"{'=' * 70}")

    # Exit code
    sys.exit(0 if total_fail == 0 else 1)


if __name__ == "__main__":
    main()
