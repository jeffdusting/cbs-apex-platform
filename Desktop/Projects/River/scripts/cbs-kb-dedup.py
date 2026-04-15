#!/usr/bin/env python3
"""
CBS KB Dedup — S4-P4 TASK 4.1

Strategy (from stage4/CBS-DISCOVERY-SUMMARY.md §8.2):

  Single-layer hash collapse:
    Group all rows by sha256(content). For each group with >1 row, keep the
    earliest-created row (lowest created_at); on tie, keep the lowest id.
    Delete the rest.

  Unlike WR, CBS has no folder-replica layer — all rows live under the flat
  `kb_repo_flat` layout. The 15,655 vs 242 file blow-up is caused by
  non-idempotent re-ingestion of the same on-disk content, so hash-based
  collapse alone recovers the true row set (~1,273 rows).

Preserve rules:
  - Never delete rows with category in --preserve-categories
    (default: 'correction'). The 4 correction rows documented in
    CBS-DISCOVERY-SUMMARY §3 are audit-trail content that must survive.

Args:
  --dry-run                  Emit plan only; do not delete.
  --batch-size N             Delete in batches of N ids (default 500).
  --preserve-categories CSV  Comma-separated categories to never delete
                             (default: correction).
  --report FILE              Output JSON report path (required).

Outputs (JSON report):
  {
    "mode": "dry-run" | "execute",
    "rows_before": int,
    "hash_groups_total": int,
    "hash_groups_with_duplicates": int,
    "rows_to_delete": int,
    "rows_preserved_by_category": int,
    "rows_after_projected": int,     // rows_before - rows_to_delete
    "rows_after": int,               // only in execute mode
    "rows_deleted": int,             // 0 on dry-run
    "preserve_categories": [...],
    "sample_deletions": [first 20 deletion decisions with reasons],
    "per_source_file_impact": {source_file: {before, after, deleted}}
  }
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from collections import defaultdict
from typing import Any

import httpx

CBS_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
CBS_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not CBS_URL or not CBS_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
          file=sys.stderr)
    sys.exit(2)

HEADERS = {
    "apikey": CBS_KEY,
    "Authorization": f"Bearer {CBS_KEY}",
}

PAGE_SIZE = 1000


def fetch_all_rows() -> list[dict[str, Any]]:
    """Paginate through all documents pulling the columns needed for dedup."""
    select = "id,source_file,content,created_at,category,entity"
    rows: list[dict[str, Any]] = []
    offset = 0
    with httpx.Client(timeout=120.0) as client:
        while True:
            r = client.get(
                f"{CBS_URL}/rest/v1/documents",
                params={"select": select, "order": "id.asc",
                        "limit": PAGE_SIZE, "offset": offset},
                headers=HEADERS,
            )
            r.raise_for_status()
            batch = r.json()
            if not batch:
                break
            rows.extend(batch)
            if len(batch) < PAGE_SIZE:
                break
            offset += PAGE_SIZE
    return rows


def content_hash(content: str | None) -> str:
    """SHA-256 over the chunk content; empty content gets a distinct marker."""
    if not content:
        return "__EMPTY__"
    return hashlib.sha256(content.encode("utf-8", errors="replace")).hexdigest()


def plan_deletions(rows: list[dict[str, Any]],
                   preserve_categories: set[str]) -> dict[str, Any]:
    """Compute row ids to delete via single-layer hash collapse."""
    for r in rows:
        r["_hash"] = content_hash(r.get("content"))

    by_hash: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in rows:
        by_hash[r["_hash"]].append(r)

    deletes: list[dict[str, Any]] = []
    rows_preserved_by_category = 0
    hash_groups_with_duplicates = 0

    for h, group in by_hash.items():
        if h == "__EMPTY__" or len(group) <= 1:
            continue
        hash_groups_with_duplicates += 1

        # Sort: earliest created_at first; tie-break by lowest id.
        group_sorted = sorted(
            group,
            key=lambda x: (x.get("created_at") or "", x.get("id") or 0),
        )
        winner = group_sorted[0]
        for loser in group_sorted[1:]:
            if loser.get("category") in preserve_categories:
                rows_preserved_by_category += 1
                continue
            deletes.append({
                "id": loser["id"],
                "reason": "hash_duplicate",
                "hash_prefix": h[:16],
                "winner_id": winner["id"],
                "source_file": loser["source_file"],
                "winner_source_file": winner["source_file"],
                "loser_created_at": loser.get("created_at"),
                "winner_created_at": winner.get("created_at"),
                "category": loser.get("category"),
            })

    # Per-source-file impact
    per_file_before: dict[str, int] = defaultdict(int)
    for r in rows:
        per_file_before[r.get("source_file") or "<null>"] += 1
    per_file_deleted: dict[str, int] = defaultdict(int)
    for d in deletes:
        per_file_deleted[d["source_file"] or "<null>"] += 1
    per_source_file_impact = {
        f: {
            "before": per_file_before[f],
            "deleted": per_file_deleted.get(f, 0),
            "after": per_file_before[f] - per_file_deleted.get(f, 0),
        }
        for f in per_file_before
    }

    return {
        "deletes": deletes,
        "hash_groups_total": len(by_hash),
        "hash_groups_with_duplicates": hash_groups_with_duplicates,
        "rows_preserved_by_category": rows_preserved_by_category,
        "per_source_file_impact": per_source_file_impact,
    }


def delete_rows(ids: list[int], batch_size: int) -> int:
    """DELETE /documents?id=in.(...) in batches. Returns count deleted."""
    total = 0
    with httpx.Client(timeout=180.0) as client:
        for i in range(0, len(ids), batch_size):
            chunk = ids[i:i + batch_size]
            in_list = "(" + ",".join(str(x) for x in chunk) + ")"
            r = client.delete(
                f"{CBS_URL}/rest/v1/documents",
                params={"id": f"in.{in_list}"},
                headers={**HEADERS, "Prefer": "return=representation"},
            )
            r.raise_for_status()
            deleted = len(r.json()) if r.text else len(chunk)
            total += deleted
            print(f"  deleted batch {i // batch_size + 1}: {deleted} rows "
                  f"(total {total}/{len(ids)})", flush=True)
            time.sleep(0.05)
    return total


def row_count() -> int:
    with httpx.Client(timeout=30.0) as client:
        r = client.get(
            f"{CBS_URL}/rest/v1/documents",
            params={"select": "id"},
            headers={**HEADERS, "Prefer": "count=exact", "Range": "0-0"},
        )
        cr = r.headers.get("Content-Range", "0-0/0")
        return int(cr.split("/")[-1])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--batch-size", type=int, default=500)
    ap.add_argument(
        "--preserve-categories",
        default="correction",
        help="Comma-separated categories that must never be deleted.",
    )
    ap.add_argument("--report", required=True)
    args = ap.parse_args()

    preserve_categories = {
        c.strip() for c in args.preserve_categories.split(",") if c.strip()
    }

    print(f"[cbs-kb-dedup] mode={'dry-run' if args.dry_run else 'execute'}")
    print(f"[cbs-kb-dedup] preserve_categories={sorted(preserve_categories)}")

    rows_before = row_count()
    print(f"[cbs-kb-dedup] rows_before: {rows_before}")

    print("[cbs-kb-dedup] fetching all rows...")
    t0 = time.time()
    rows = fetch_all_rows()
    print(f"[cbs-kb-dedup] fetched {len(rows)} rows in {time.time() - t0:.1f}s")

    print("[cbs-kb-dedup] planning deletions...")
    plan = plan_deletions(rows, preserve_categories)
    deletes = plan["deletes"]
    all_ids = sorted(d["id"] for d in deletes)
    pct = 100 * len(all_ids) / max(rows_before, 1)
    print(f"[cbs-kb-dedup] hash_groups_total: {plan['hash_groups_total']}")
    print(f"[cbs-kb-dedup] hash_groups_with_duplicates: "
          f"{plan['hash_groups_with_duplicates']}")
    print(f"[cbs-kb-dedup] rows preserved by category: "
          f"{plan['rows_preserved_by_category']}")
    print(f"[cbs-kb-dedup] rows to delete: {len(all_ids)} ({pct:.1f}%)")

    report: dict[str, Any] = {
        "mode": "dry-run" if args.dry_run else "execute",
        "rows_before": rows_before,
        "hash_groups_total": plan["hash_groups_total"],
        "hash_groups_with_duplicates": plan["hash_groups_with_duplicates"],
        "rows_to_delete": len(all_ids),
        "rows_preserved_by_category": plan["rows_preserved_by_category"],
        "rows_after_projected": rows_before - len(all_ids),
        "preserve_categories": sorted(preserve_categories),
        "sample_deletions": deletes[:20],
        "per_source_file_impact": plan["per_source_file_impact"],
    }

    if args.dry_run:
        report["rows_deleted"] = 0
        print("[cbs-kb-dedup] dry-run — no deletions performed.")
    else:
        print(f"[cbs-kb-dedup] deleting in batches of {args.batch_size}...")
        deleted = delete_rows(all_ids, args.batch_size)
        rows_after = row_count()
        report["rows_deleted"] = deleted
        report["rows_after"] = rows_after
        print(f"[cbs-kb-dedup] done. rows_after: {rows_after}")

    os.makedirs(os.path.dirname(args.report) or ".", exist_ok=True)
    with open(args.report, "w") as f:
        json.dump(report, f, indent=2, default=str)
    print(f"[cbs-kb-dedup] report written: {args.report}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
