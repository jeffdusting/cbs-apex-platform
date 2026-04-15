#!/usr/bin/env python3
"""
WR KB Dedup — S4-P3 TASK 3.1

Strategy (from stage4/WR-DISCOVERY-SUMMARY.md §5):

  Layer 1 — Folder replicas (high confidence):
    Rows whose source_file sits under a "dupe folder" pattern
    (`/LGG Advisory copy/`, `/LGG Advisory copy 2/`, `/water_roads_webflow_handoff N/`,
    `/water_roads_webflow_handoff copy/`, etc.). These are near-byte-identical trees
    that duplicate a canonical source. Delete all rows under these patterns.

  Layer 2 — Byte-identical chunk collapse:
    For each content_sha256 hash group with >1 row, keep one row (winner), delete
    the rest. Winner selection:
      (a) Prefer SharePoint over Dropbox (SharePoint is master VDR per P1 §4.2).
      (b) Among rows in the preferred source, keep the earliest created_at.

Preserve rules:
  - Never delete rows with category = 'correction' (safety; WR has none currently).
  - drive_file_id linkage is preserved: we only delete chunk rows in Supabase;
    no Drive files are touched here (that is TASK 3.3).

Args:
  --dry-run         Do not execute deletions; emit plan only.
  --batch-size N    Delete in batches of N row-ids (default 500).
  --report FILE     Output JSON report path (required).

Outputs:
  {
    "mode": "dry-run" | "execute",
    "rows_before": int,
    "layer1_rows_to_delete": int,
    "layer1_file_patterns": [...],
    "layer2_hash_groups_affected": int,
    "layer2_rows_to_delete": int,
    "rows_kept_by_sharepoint_preference": int,
    "total_rows_deleted": int,   // 0 on dry-run
    "rows_after": int,           // only in execute mode
    "sample_deletions": [first 20 deletion decisions with reasons]
  }
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
from collections import defaultdict
from typing import Any

import httpx

WR_URL = os.environ.get("WR_SUPABASE_URL", "").rstrip("/")
WR_KEY = os.environ.get("WR_SUPABASE_SERVICE_ROLE_KEY", "")

if not WR_URL or not WR_KEY:
    print("ERROR: WR_SUPABASE_URL and WR_SUPABASE_SERVICE_ROLE_KEY must be set",
          file=sys.stderr)
    sys.exit(2)

HEADERS = {
    "apikey": WR_KEY,
    "Authorization": f"Bearer {WR_KEY}",
}

# Layer 1 regex patterns — folder replicas under Imported from Dropbox/SharePoint.
# Case-insensitive. Match any segment of the path that equals these patterns.
LAYER1_PATTERNS = [
    # LGG Advisory replicas
    re.compile(r"/LGG Advisory copy( \d+)?/", re.IGNORECASE),
    # Webflow handoff replicas (handoff 2 through 9, and "handoff copy")
    re.compile(r"/water_roads_webflow_handoff[ _-]?(copy|[2-9])/", re.IGNORECASE),
    # Generic " copy" / " copy N" folder suffix on any folder segment
    # (only match when it's a folder-level segment, not a filename)
    re.compile(r"/[^/]+ copy( \d+)?/", re.IGNORECASE),
]

# Preserve category: never delete corrections.
PRESERVE_CATEGORIES = {"correction"}

PAGE_SIZE = 1000


def fetch_all_rows() -> list[dict[str, Any]]:
    """Paginate through all documents pulling the columns we need."""
    select = "id,source_file,content,created_at,category,entity,drive_file_id"
    rows: list[dict[str, Any]] = []
    offset = 0
    with httpx.Client(timeout=60.0) as client:
        while True:
            r = client.get(
                f"{WR_URL}/rest/v1/documents",
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


def is_layer1_replica(source_file: str) -> str | None:
    """Return matching pattern name if the source_file is under a Layer-1 replica folder."""
    if not source_file:
        return None
    # Add a leading / so the "/pattern/" matchers work against top-level folders.
    probe = "/" + source_file
    for pat in LAYER1_PATTERNS:
        m = pat.search(probe)
        if m:
            return m.group(0)
    return None


def is_sharepoint(source_file: str) -> bool:
    return bool(source_file) and source_file.startswith("Imported from SharePoint/")


def content_hash(content: str | None) -> str:
    """SHA-256 over the chunk content; empty content gets a distinct marker."""
    if not content:
        return "__EMPTY__"
    return hashlib.sha256(content.encode("utf-8", errors="replace")).hexdigest()


def plan_deletions(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Compute row ids to delete with Layer 1 and Layer 2 reasons."""
    # Precompute hashes, layer1 flags
    enriched = []
    for r in rows:
        r["_hash"] = content_hash(r.get("content"))
        r["_layer1"] = is_layer1_replica(r.get("source_file") or "")
        r["_is_sp"] = is_sharepoint(r.get("source_file") or "")
        enriched.append(r)

    # Layer 1: delete anything matching a replica pattern (unless preserved).
    layer1_deletes: list[dict[str, Any]] = []
    layer1_pattern_counts: dict[str, int] = defaultdict(int)
    surviving: list[dict[str, Any]] = []
    for r in enriched:
        if r["_layer1"] and r.get("category") not in PRESERVE_CATEGORIES:
            layer1_deletes.append({
                "id": r["id"],
                "reason": "layer1_folder_replica",
                "pattern": r["_layer1"],
                "source_file": r["source_file"],
            })
            layer1_pattern_counts[r["_layer1"].strip("/")] += 1
        else:
            surviving.append(r)

    # Layer 2: group survivors by content_sha256, collapse to one winner per group.
    by_hash: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in surviving:
        by_hash[r["_hash"]].append(r)

    layer2_deletes: list[dict[str, Any]] = []
    hash_groups_touched = 0
    sharepoint_preference_wins = 0
    for h, group in by_hash.items():
        if h == "__EMPTY__" or len(group) <= 1:
            continue
        hash_groups_touched += 1
        # Sort: SharePoint first (True>False), then earliest created_at first.
        group_sorted = sorted(
            group,
            key=lambda x: (not x["_is_sp"], x.get("created_at") or ""),
        )
        winner = group_sorted[0]
        if winner["_is_sp"] and any(not g["_is_sp"] for g in group):
            sharepoint_preference_wins += 1
        for loser in group_sorted[1:]:
            if loser.get("category") in PRESERVE_CATEGORIES:
                continue
            layer2_deletes.append({
                "id": loser["id"],
                "reason": "layer2_hash_duplicate",
                "hash": h[:16],
                "winner_id": winner["id"],
                "source_file": loser["source_file"],
                "winner_source_file": winner["source_file"],
            })

    all_ids = {d["id"] for d in layer1_deletes}
    layer2_deletes = [d for d in layer2_deletes if d["id"] not in all_ids]
    all_ids |= {d["id"] for d in layer2_deletes}

    return {
        "layer1_deletes": layer1_deletes,
        "layer2_deletes": layer2_deletes,
        "layer1_pattern_counts": dict(layer1_pattern_counts),
        "layer2_hash_groups_touched": hash_groups_touched,
        "sharepoint_preference_wins": sharepoint_preference_wins,
        "delete_ids": sorted(all_ids),
    }


def delete_rows(ids: list[int], batch_size: int) -> int:
    """DELETE /documents?id=in.(...) in batches. Returns count deleted."""
    total = 0
    with httpx.Client(timeout=120.0) as client:
        for i in range(0, len(ids), batch_size):
            chunk = ids[i:i + batch_size]
            in_list = "(" + ",".join(str(x) for x in chunk) + ")"
            r = client.delete(
                f"{WR_URL}/rest/v1/documents",
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
            f"{WR_URL}/rest/v1/documents",
            params={"select": "id"},
            headers={**HEADERS, "Prefer": "count=exact", "Range": "0-0"},
        )
        cr = r.headers.get("Content-Range", "0-0/0")
        return int(cr.split("/")[-1])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--batch-size", type=int, default=500)
    ap.add_argument("--report", required=True)
    args = ap.parse_args()

    print(f"[wr-kb-dedup] mode={'dry-run' if args.dry_run else 'execute'}")
    rows_before = row_count()
    print(f"[wr-kb-dedup] rows_before: {rows_before}")

    print("[wr-kb-dedup] fetching all rows...")
    t0 = time.time()
    rows = fetch_all_rows()
    print(f"[wr-kb-dedup] fetched {len(rows)} rows in {time.time() - t0:.1f}s")

    print("[wr-kb-dedup] planning deletions...")
    plan = plan_deletions(rows)
    layer1 = plan["layer1_deletes"]
    layer2 = plan["layer2_deletes"]
    all_ids = plan["delete_ids"]
    print(f"[wr-kb-dedup] layer1 (folder replicas): {len(layer1)} rows")
    print(f"[wr-kb-dedup] layer2 (hash duplicates): {len(layer2)} rows")
    print(f"[wr-kb-dedup] total to delete: {len(all_ids)} rows "
          f"({100 * len(all_ids) / max(rows_before,1):.1f}%)")

    report: dict[str, Any] = {
        "mode": "dry-run" if args.dry_run else "execute",
        "rows_before": rows_before,
        "layer1_rows_to_delete": len(layer1),
        "layer1_pattern_counts": plan["layer1_pattern_counts"],
        "layer2_hash_groups_affected": plan["layer2_hash_groups_touched"],
        "layer2_rows_to_delete": len(layer2),
        "rows_kept_by_sharepoint_preference": plan["sharepoint_preference_wins"],
        "total_rows_to_delete": len(all_ids),
        "sample_deletions": (layer1[:10] + layer2[:10])[:20],
    }

    if args.dry_run:
        report["rows_deleted"] = 0
        print("[wr-kb-dedup] dry-run — no deletions performed.")
    else:
        print(f"[wr-kb-dedup] deleting in batches of {args.batch_size}...")
        deleted = delete_rows(all_ids, args.batch_size)
        rows_after = row_count()
        report["rows_deleted"] = deleted
        report["rows_after"] = rows_after
        print(f"[wr-kb-dedup] done. rows_after: {rows_after}")

    os.makedirs(os.path.dirname(args.report) or ".", exist_ok=True)
    with open(args.report, "w") as f:
        json.dump(report, f, indent=2, default=str)
    print(f"[wr-kb-dedup] report written: {args.report}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
