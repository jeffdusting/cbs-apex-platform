#!/usr/bin/env python3
"""
S5-P5 (CE.10): Nightly retrieval regression suite.

Runs every baseline query in config/retrieval-baselines.json against live
Supabase (CBS + WR). Flags any query whose top similarity drops by more than
the configured threshold against its baseline.

Usage:
    python3 scripts/retrieval-regression.py
    python3 scripts/retrieval-regression.py --update-baseline
    python3 scripts/retrieval-regression.py --threshold-drop 0.03

Required env vars:
    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY        (CBS)
    WR_SUPABASE_URL, WR_SUPABASE_SERVICE_ROLE_KEY  (WR)
    VOYAGE_API_KEY

Exit codes:
    0 = all queries within tolerance
    1 = one or more regressions detected
    2 = configuration error
"""

import argparse
import json
import os
import sys
from pathlib import Path

import httpx

BASELINES_PATH = Path("config/retrieval-baselines.json")
VOYAGE_URL = "https://api.voyageai.com/v1/embeddings"
MODEL = "voyage-3.5"
MATCH_COUNT = 5
MATCH_THRESHOLD = 0.3


def embed(query: str, voyage_key: str) -> list[float]:
    r = httpx.post(
        VOYAGE_URL,
        headers={"Authorization": f"Bearer {voyage_key}", "Content-Type": "application/json"},
        json={"input": [query], "model": MODEL, "input_type": "query"},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["data"][0]["embedding"]


def top_similarity(url: str, key: str, embedding: list[float], entity: str | None) -> float:
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    body = {
        "query_embedding": embedding,
        "match_threshold": MATCH_THRESHOLD,
        "match_count": MATCH_COUNT,
    }
    if entity:
        body["filter_entity"] = entity
    r = httpx.post(f"{url}/rest/v1/rpc/match_documents", headers=headers, json=body, timeout=60)
    r.raise_for_status()
    results = r.json()
    if not results:
        return 0.0
    return max(float(row["similarity"]) for row in results)


def main() -> None:
    parser = argparse.ArgumentParser(description="Retrieval regression suite")
    parser.add_argument("--update-baseline", action="store_true", help="Overwrite the baseline file with current values")
    parser.add_argument("--threshold-drop", type=float, default=None, help="Drop tolerance (default: from baselines file)")
    args = parser.parse_args()

    cbs_url = os.environ.get("SUPABASE_URL", "")
    cbs_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    wr_url = os.environ.get("WR_SUPABASE_URL", "")
    wr_key = os.environ.get("WR_SUPABASE_SERVICE_ROLE_KEY", "")
    voyage_key = os.environ.get("VOYAGE_API_KEY", "")

    if not all([cbs_url, cbs_key, wr_url, wr_key, voyage_key]):
        print("ERROR: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WR_SUPABASE_URL, WR_SUPABASE_SERVICE_ROLE_KEY, VOYAGE_API_KEY must all be set")
        sys.exit(2)

    if not BASELINES_PATH.exists():
        print(f"ERROR: {BASELINES_PATH} not found")
        sys.exit(2)

    with BASELINES_PATH.open() as f:
        data = json.load(f)

    drop_tolerance = args.threshold_drop if args.threshold_drop is not None else data.get("threshold_drop", 0.05)
    regressions: list[tuple[str, str, float, float, float]] = []  # (side, query_id, baseline, current, delta)
    updated_data = {**data, "cbs": [], "wr": []}

    for side, url, key, entity, rows in (
        ("cbs", cbs_url, cbs_key, "cbs-group", data["cbs"]),
        ("wr", wr_url, wr_key, None, data["wr"]),
    ):
        print(f"=== {side.upper()} ===")
        for row in rows:
            qid = row["query_id"]
            query = row["query"]
            baseline = float(row["baseline_top_similarity"])
            try:
                emb = embed(query, voyage_key)
                current = top_similarity(url, key, emb, entity)
            except httpx.HTTPError as e:
                print(f"  {qid}: FAILED — {e}")
                continue

            delta = current - baseline
            status = "OK"
            if delta < -drop_tolerance:
                status = "REGRESS"
                regressions.append((side, qid, baseline, current, delta))
            print(f"  {qid}: baseline={baseline:.4f} current={current:.4f} delta={delta:+.4f} [{status}]")

            updated_data[side].append({
                "query_id": qid,
                "query": query,
                "baseline_top_similarity": round(current, 6) if args.update_baseline else baseline,
            })

    print(f"\nRegressions: {len(regressions)}")
    for side, qid, baseline, current, delta in regressions:
        print(f"  {side}/{qid}: {baseline:.4f} → {current:.4f} (delta {delta:+.4f})")

    if args.update_baseline:
        with BASELINES_PATH.open("w") as f:
            json.dump(updated_data, f, indent=2)
        print(f"\nBaselines updated in {BASELINES_PATH}")

    sys.exit(1 if regressions else 0)


if __name__ == "__main__":
    main()
