#!/usr/bin/env python3
"""
S5-P5 (CE.6): Standalone near-duplicate scanner for the Supabase documents table.

Pulls up to --limit rows for the given --entity, generates k-word shingles,
and reports pairs with Jaccard similarity >= --threshold.

Usage:
    python3 scripts/check-near-duplicates.py --entity cbs-group
    python3 scripts/check-near-duplicates.py --entity waterroads --supabase wr --threshold 0.9
    python3 scripts/check-near-duplicates.py --entity cbs-group --limit 500 --k 7

Exit codes:
    0 = success (duplicates reported if any)
    2 = configuration error
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lib"))

import httpx

from near_dedup import find_near_duplicates


def fetch_documents(url: str, key: str, entity: str, limit: int) -> list[dict]:
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    params = {
        "entity": f"eq.{entity}",
        "select": "id,title,content",
        "limit": str(limit),
        "order": "created_at.desc",
    }
    r = httpx.get(f"{url}/rest/v1/documents", headers=headers, params=params, timeout=60)
    r.raise_for_status()
    return r.json()


def main() -> None:
    parser = argparse.ArgumentParser(description="Scan documents for near-duplicates")
    parser.add_argument("--table", default="documents", help="Supabase table (default: documents)")
    parser.add_argument("--entity", required=True, help="entity filter, e.g. cbs-group or waterroads")
    parser.add_argument("--supabase", choices=["cbs", "wr"], default="cbs")
    parser.add_argument("--threshold", type=float, default=0.85)
    parser.add_argument("--limit", type=int, default=1000)
    parser.add_argument("--k", type=int, default=5, help="shingle size in words")
    args = parser.parse_args()

    if args.supabase == "cbs":
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    else:
        url = os.environ.get("WR_SUPABASE_URL", "")
        key = os.environ.get("WR_SUPABASE_SERVICE_ROLE_KEY", "")

    if not url or not key:
        print(f"ERROR: Supabase env vars for '{args.supabase}' not set")
        sys.exit(2)

    print(f"=== Near-duplicate scan ({args.supabase}, entity={args.entity}) ===")
    print(f"    threshold={args.threshold}  k={args.k}  limit={args.limit}")

    docs = fetch_documents(url, key, args.entity, args.limit)
    print(f"    fetched {len(docs)} rows")

    pairs = find_near_duplicates(docs, threshold=args.threshold, k=args.k)
    print(f"    near-duplicate pairs: {len(pairs)}")

    id_to_title = {d["id"]: (d.get("title") or "")[:60] for d in docs}
    for a, b, sim in pairs[:10]:
        print(f"  {sim:.3f}  {a[:8]} {id_to_title.get(a, '')!r}")
        print(f"         {b[:8]} {id_to_title.get(b, '')!r}")


if __name__ == "__main__":
    main()
