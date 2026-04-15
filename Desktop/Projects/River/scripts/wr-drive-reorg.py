#!/usr/bin/env python3
"""
WR Drive Reorg — S4-P3 TASK 3.3

Reads stage4/data/wr-path-mapping.json, walks the WR Shared Drive under the
Imported-from staging folders (and 'Items 1 and 2'), and moves each leaf file
into its canonical folder via Drive API files.update(addParents, removeParents).

drive_file_id is preserved by the API on parent change, so Supabase rows remain
linked. Folders marked in `folders_to_create` are created if missing and their
IDs cached. Log every move to stage4/data/wr-reorg-moves.json for TASK 3.4.

Args:
  --dry-run                Plan moves, do not execute.
  --source-prefix TEXT     Restrict to a single source prefix (e.g.
                           "Imported from SharePoint/IM"). Useful for
                           incremental execution. Can be repeated.
  --mapping FILE           Path to wr-path-mapping.json (default stage4/data/wr-path-mapping.json).
  --log FILE               Path to write move log (default stage4/data/wr-reorg-moves.json).

Service account credentials: .secrets/wr-service-account.json (required for
Drive access to the WR Shared Drive).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from collections import defaultdict
from typing import Any

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SERVICE_ACCOUNT_FILE = ".secrets/wr-service-account.json"
SHARED_DRIVE_ID = "0AFIfqhhhv9HjUk9PVA"
SCOPES = ["https://www.googleapis.com/auth/drive"]
FOLDER_MIME = "application/vnd.google-apps.folder"


def drive_client():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES,
    )
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def list_children(svc, parent_id: str) -> list[dict[str, Any]]:
    """List direct children of a folder in the Shared Drive."""
    children = []
    page_token = None
    while True:
        resp = svc.files().list(
            q=f"'{parent_id}' in parents and trashed = false",
            fields="nextPageToken, files(id, name, mimeType, parents)",
            corpora="drive",
            driveId=SHARED_DRIVE_ID,
            includeItemsFromAllDrives=True,
            supportsAllDrives=True,
            pageSize=1000,
            pageToken=page_token,
        ).execute()
        children.extend(resp.get("files", []))
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    return children


def walk_tree(svc, root_id: str, root_prefix: str) -> list[dict[str, Any]]:
    """Recursively walk a folder, returning leaf files with their full path
    (relative to shared-drive root, e.g. 'Imported from Dropbox/06 .../file.pdf')."""
    leaves: list[dict[str, Any]] = []
    stack = [(root_id, root_prefix)]
    while stack:
        parent_id, parent_path = stack.pop()
        for child in list_children(svc, parent_id):
            name = child["name"]
            child_path = f"{parent_path}/{name}" if parent_path else name
            if child["mimeType"] == FOLDER_MIME:
                stack.append((child["id"], child_path))
            else:
                leaves.append({
                    "id": child["id"],
                    "name": name,
                    "path": child_path,
                    "parent_id": parent_id,
                    "mime_type": child["mimeType"],
                })
    return leaves


def ensure_folder(svc, path: str, cache: dict[str, str]) -> str:
    """Ensure a folder at `path` (slash-separated from shared-drive root)
    exists; return its Drive folder id. Creates missing intermediates."""
    if path in cache:
        return cache[path]
    parts = path.split("/")
    parent_id = SHARED_DRIVE_ID
    cur_path = ""
    for part in parts:
        cur_path = f"{cur_path}/{part}" if cur_path else part
        if cur_path in cache:
            parent_id = cache[cur_path]
            continue
        # Look up existing child
        resp = svc.files().list(
            q=f"'{parent_id}' in parents and name = '{part.replace(chr(39), chr(92) + chr(39))}' "
              f"and mimeType = '{FOLDER_MIME}' and trashed = false",
            fields="files(id,name)",
            corpora="drive",
            driveId=SHARED_DRIVE_ID,
            includeItemsFromAllDrives=True,
            supportsAllDrives=True,
        ).execute()
        files = resp.get("files", [])
        if files:
            folder_id = files[0]["id"]
        else:
            body = {
                "name": part,
                "mimeType": FOLDER_MIME,
                "parents": [parent_id],
            }
            created = svc.files().create(
                body=body,
                fields="id",
                supportsAllDrives=True,
            ).execute()
            folder_id = created["id"]
            print(f"  created folder: {cur_path} ({folder_id})")
        cache[cur_path] = folder_id
        parent_id = folder_id
    return parent_id


def build_matcher(rules: list[dict[str, Any]]):
    """Return a function that, given a file path, returns (target_canonical, rule)
    using longest-prefix match. Prefers more specific rules."""
    # Sort rules by descending source_prefix length
    sorted_rules = sorted(rules, key=lambda r: -len(r["source_prefix"]))

    def match(path: str):
        for rule in sorted_rules:
            sp = rule["source_prefix"]
            if path == sp or path.startswith(sp + "/"):
                return rule["target_canonical"], rule
        return None, None

    return match


def move_file(svc, file_id: str, add_parent: str, remove_parents: list[str]) -> None:
    svc.files().update(
        fileId=file_id,
        addParents=add_parent,
        removeParents=",".join(remove_parents),
        supportsAllDrives=True,
        fields="id,parents",
    ).execute()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--source-prefix", action="append", default=[])
    ap.add_argument("--mapping", default="stage4/data/wr-path-mapping.json")
    ap.add_argument("--log", default="stage4/data/wr-reorg-moves.json")
    args = ap.parse_args()

    with open(args.mapping) as f:
        mapping = json.load(f)

    svc = drive_client()

    # Folder-id cache seeded with known existing targets.
    folder_cache: dict[str, str] = dict(mapping["existing_canonical_folder_ids"])

    # If executing, pre-create folders_to_create. (Dry-run: skip.)
    if not args.dry_run:
        print("[reorg] ensuring target folders exist...")
        for p in mapping["folders_to_create"]:
            ensure_folder(svc, p, folder_cache)

    matcher = build_matcher(mapping["mapping_rules"])

    # Select which source prefixes to walk.
    all_sources = list(mapping["source_drive_folder_ids"].keys())
    # Only walk the top-level import roots; subprefixes are discovered recursively.
    top_source_prefixes = [
        "Imported from Dropbox",
        "Imported from SharePoint",
        "Items 1 and 2",
    ]
    if args.source_prefix:
        top_source_prefixes = [
            s for s in top_source_prefixes
            if any(s == sp or sp.startswith(s + "/") for sp in args.source_prefix)
        ]
        print(f"[reorg] restricted to: {top_source_prefixes}")

    # Walk trees, collect leaves.
    print("[reorg] walking source trees...")
    t0 = time.time()
    leaves: list[dict[str, Any]] = []
    for sp in top_source_prefixes:
        root_id = mapping["source_drive_folder_ids"].get(sp)
        if not root_id:
            print(f"  WARN: no folder id for {sp}; skipping")
            continue
        tree_leaves = walk_tree(svc, root_id, sp)
        print(f"  {sp}: {len(tree_leaves)} leaf files")
        leaves.extend(tree_leaves)
    print(f"[reorg] total leaves: {len(leaves)} in {time.time() - t0:.1f}s")

    # Plan moves.
    planned: list[dict[str, Any]] = []
    unmapped: list[dict[str, Any]] = []
    target_counts: dict[str, int] = defaultdict(int)
    for leaf in leaves:
        # Apply --source-prefix filter on path.
        if args.source_prefix and not any(
            leaf["path"] == sp or leaf["path"].startswith(sp + "/")
            for sp in args.source_prefix
        ):
            continue
        target, rule = matcher(leaf["path"])
        if target is None:
            unmapped.append(leaf)
            continue
        planned.append({
            "file_id": leaf["id"],
            "source_path": leaf["path"],
            "source_parent_id": leaf["parent_id"],
            "target_canonical": target,
            "rule_confidence": rule.get("confidence"),
            "rule_ambiguous": rule.get("ambiguous", False),
            "exclude_from_index": rule.get("exclude_from_index", False),
        })
        target_counts[target] += 1

    print(f"[reorg] planned moves: {len(planned)}")
    print(f"[reorg] unmapped files: {len(unmapped)}")
    print("[reorg] target distribution:")
    for tgt, c in sorted(target_counts.items(), key=lambda x: -x[1]):
        print(f"  {c:5d}  → {tgt}")

    log: dict[str, Any] = {
        "mode": "dry-run" if args.dry_run else "execute",
        "source_prefixes_walked": top_source_prefixes,
        "source_prefix_filter": args.source_prefix,
        "planned_move_count": len(planned),
        "unmapped_count": len(unmapped),
        "target_distribution": dict(target_counts),
        "sample_planned": planned[:20],
        "sample_unmapped": unmapped[:20],
        "moves": [],
        "errors": [],
    }

    if args.dry_run:
        print("[reorg] dry-run — no Drive changes. writing log.")
    else:
        print("[reorg] executing moves...")
        done = 0
        for p in planned:
            target_id = folder_cache.get(p["target_canonical"])
            if not target_id:
                # Should have been ensured above; be defensive.
                target_id = ensure_folder(svc, p["target_canonical"], folder_cache)
            try:
                move_file(svc, p["file_id"], target_id, [p["source_parent_id"]])
                log["moves"].append({
                    "file_id": p["file_id"],
                    "source_path": p["source_path"],
                    "target_canonical": p["target_canonical"],
                    "target_folder_id": target_id,
                })
                done += 1
                if done % 100 == 0:
                    print(f"  moved {done}/{len(planned)}...", flush=True)
            except HttpError as e:
                log["errors"].append({
                    "file_id": p["file_id"],
                    "source_path": p["source_path"],
                    "target_canonical": p["target_canonical"],
                    "error": str(e)[:500],
                })
            time.sleep(0.02)  # ~50 rps soft cap
        print(f"[reorg] executed {done} moves, {len(log['errors'])} errors")

    os.makedirs(os.path.dirname(args.log) or ".", exist_ok=True)
    with open(args.log, "w") as f:
        json.dump(log, f, indent=2, default=str)
    print(f"[reorg] log written: {args.log}")
    return 0 if not log.get("errors") else 1


if __name__ == "__main__":
    sys.exit(main())
