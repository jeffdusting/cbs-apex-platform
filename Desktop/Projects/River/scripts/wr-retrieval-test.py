#!/usr/bin/env python3
"""
S4-P5 TASK 5.2 — WR KB Retrieval Quality Tests.

Five WR-specific queries, embedded via Voyage AI, sent to `match_documents`
with match_threshold=0.3, filter_entity='waterroads'. For each: top 5 hits,
duplicate source_file detection, similarity thresholds.

Pass criteria (per phase spec):
  - Zero queries with duplicate sources.
  - Zero queries with zero results.
  - All top similarities > 0.3.
"""
from __future__ import annotations

import json
import os
import sys

import httpx

WR_URL = os.environ["WR_SUPABASE_URL"].rstrip("/")
WR_KEY = os.environ["WR_SUPABASE_SERVICE_ROLE_KEY"]
VOYAGE_KEY = os.environ["VOYAGE_API_KEY"]

SUPA_HEADERS = {
    "apikey": WR_KEY,
    "Authorization": f"Bearer {WR_KEY}",
    "Content-Type": "application/json",
}

QUERIES = [
    ("ppp_financial_model",
     "Water Roads PPP financial model assumptions and revenue projections"),
    ("zero_emission_regulatory",
     "zero-emission ferry regulatory approval AMSA maritime safety"),
    ("board_resolution",
     "board resolution"),
    ("ferry_route_demand",
     "ferry route demand forecasting origin destination Sydney"),
    ("esop",
     "Water Roads ESOP employee share option plan vesting schedule"),
]


def embed(query: str) -> list[float]:
    with httpx.Client(timeout=60.0) as client:
        r = client.post(
            "https://api.voyageai.com/v1/embeddings",
            headers={
                "Authorization": f"Bearer {VOYAGE_KEY}",
                "Content-Type": "application/json",
            },
            json={"input": query, "model": "voyage-3.5", "input_type": "query"},
        )
        r.raise_for_status()
        return r.json()["data"][0]["embedding"]


def match_documents(embedding: list[float], match_count: int = 5,
                    match_threshold: float = 0.3) -> list[dict]:
    with httpx.Client(timeout=60.0) as client:
        r = client.post(
            f"{WR_URL}/rest/v1/rpc/match_documents",
            headers=SUPA_HEADERS,
            json={
                "query_embedding": embedding,
                "match_count": match_count,
                "match_threshold": match_threshold,
                "filter_entity": "waterroads",
            },
        )
        r.raise_for_status()
        return r.json()


def main() -> int:
    results: list[dict] = []
    for qid, query in QUERIES:
        print(f"\n[{qid}] {query}")
        emb = embed(query)
        hits = match_documents(emb)
        source_files = [h.get("source_file", "") for h in hits]
        similarities = [h.get("similarity", 0.0) for h in hits]
        unique_sources = list(dict.fromkeys(source_files))
        has_duplicates = len(source_files) != len(unique_sources)
        top_sim = similarities[0] if similarities else 0.0
        above_threshold = all(s > 0.3 for s in similarities)
        any_imported = any("Imported" in sf for sf in source_files)

        print(f"  hits: {len(hits)}  top sim: {top_sim:.4f}  "
              f"duplicates: {has_duplicates}  any_imported: {any_imported}")
        for rank, h in enumerate(hits, 1):
            print(f"    {rank}. sim={h.get('similarity', 0):.4f}  "
                  f"{(h.get('source_file') or '')[:95]}")

        results.append({
            "query_id": qid,
            "query": query,
            "hits": len(hits),
            "top_similarity": top_sim,
            "has_duplicates": has_duplicates,
            "all_above_threshold": above_threshold,
            "any_imported_path": any_imported,
            "source_files": source_files,
            "similarities": similarities,
            "unique_source_count": len(unique_sources),
        })

    out_path = "stage4/data/wr-retrieval-test-results.json"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n[retrieval-test] wrote: {out_path}")

    dupes = sum(1 for r in results if r["has_duplicates"])
    zeros = sum(1 for r in results if r["hits"] == 0)
    below = sum(1 for r in results if not r["all_above_threshold"])
    imported = sum(1 for r in results if r["any_imported_path"])
    print(f"[retrieval-test] queries: {len(results)}  "
          f"dupes: {dupes}  empty: {zeros}  below_threshold: {below}  "
          f"imported_paths: {imported}")
    return 0 if dupes == 0 and zeros == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
