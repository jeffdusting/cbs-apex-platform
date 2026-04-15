#!/usr/bin/env python3
"""
S4-P3 TASK 3.5 — Clean up empty import folders in the WR Shared Drive.

Steps:
  1. List any remaining leaf files under 'Imported from Dropbox',
     'Imported from SharePoint', and 'Items 1 and 2' (should be only the
     20 loose-at-root unmapped files).
  2. Move each residual to 'Archive/Unclassified' in Drive.
  3. PATCH Supabase documents.source_file for those files (where indexed).
  4. Recursively delete emptied subtrees under the three source roots
     (but preserve the roots themselves for the commit — the roots can be
      trashed at the very end if empty).
  5. Emit stage4/data/wr-cleanup-residuals.json summarising actions.
"""
from __future__ import annotations

import json
import os
import sys
import time
from typing import Any

import httpx
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SERVICE_ACCOUNT_FILE = ".secrets/wr-service-account.json"
SHARED_DRIVE_ID = "0AFIfqhhhv9HjUk9PVA"
SCOPES = ["https://www.googleapis.com/auth/drive"]
FOLDER_MIME = "application/vnd.google-apps.folder"

WR_URL = os.environ["WR_SUPABASE_URL"].rstrip("/")
WR_KEY = os.environ["WR_SUPABASE_SERVICE_ROLE_KEY"]
SUPA_HEADERS = {
    "apikey": WR_KEY,
    "Authorization": f"Bearer {WR_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

IMPORT_ROOTS = {
    "Imported from Dropbox": "1FWAwVVxRXoC4JtWPbkFweaaCGVt-6gSl",
    "Imported from SharePoint": "1TYVgA2xWZ3Fh0ejhoK_57xTP4fhsJ9QD",
    "Items 1 and 2": "1jpBK-ljSUp6Fv77MSyteblwAly3uxYeP",
}
ARCHIVE_UNCLASSIFIED_NAME = "Archive/Unclassified"


def drive_client():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES,
    )
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def list_children(svc, parent_id: str):
    items, tok = [], None
    while True:
        resp = svc.files().list(
            q=f"'{parent_id}' in parents and trashed = false",
            fields="nextPageToken, files(id, name, mimeType, parents)",
            corpora="drive", driveId=SHARED_DRIVE_ID,
            includeItemsFromAllDrives=True, supportsAllDrives=True,
            pageSize=1000, pageToken=tok,
        ).execute()
        items.extend(resp.get("files", []))
        tok = resp.get("nextPageToken")
        if not tok:
            break
    return items


def walk_leaves(svc, root_id: str, root_prefix: str):
    leaves, folders = [], []
    stack = [(root_id, root_prefix)]
    while stack:
        pid, ppath = stack.pop()
        for c in list_children(svc, pid):
            path = f"{ppath}/{c['name']}" if ppath else c["name"]
            if c["mimeType"] == FOLDER_MIME:
                folders.append({"id": c["id"], "path": path})
                stack.append((c["id"], path))
            else:
                leaves.append({"id": c["id"], "name": c["name"], "path": path, "parent_id": pid})
    return leaves, folders


def ensure_archive_unclassified(svc) -> str:
    """Return the Drive folder id for Archive/Unclassified, creating it if needed."""
    # Archive already exists per mapping
    archive_id = "1N7bk1gI1-RLGA_eFVoPlW3oaVgQ4oi4I"
    # Look for child "Unclassified"
    resp = svc.files().list(
        q=f"'{archive_id}' in parents and name = 'Unclassified' and mimeType = '{FOLDER_MIME}' and trashed = false",
        fields="files(id)", corpora="drive", driveId=SHARED_DRIVE_ID,
        includeItemsFromAllDrives=True, supportsAllDrives=True,
    ).execute()
    files = resp.get("files", [])
    if files:
        return files[0]["id"]
    created = svc.files().create(
        body={"name": "Unclassified", "mimeType": FOLDER_MIME, "parents": [archive_id]},
        fields="id", supportsAllDrives=True,
    ).execute()
    print(f"  created Archive/Unclassified ({created['id']})")
    return created["id"]


def move_file(svc, file_id: str, add_parent: str, remove_parent: str):
    svc.files().update(
        fileId=file_id, addParents=add_parent, removeParents=remove_parent,
        supportsAllDrives=True, fields="id",
    ).execute()


def trash_folder(svc, folder_id: str):
    """Trash a folder (soft-delete) in the Shared Drive."""
    svc.files().update(
        fileId=folder_id, body={"trashed": True},
        supportsAllDrives=True, fields="id",
    ).execute()


def patch_supabase_source_file(client: httpx.Client, file_id: str, new_path: str) -> int:
    r = client.patch(
        f"{WR_URL}/rest/v1/documents",
        params={"drive_file_id": f"eq.{file_id}"},
        headers=SUPA_HEADERS, json={"source_file": new_path},
    )
    if r.status_code >= 400:
        return -1
    return len(r.json()) if isinstance(r.json(), list) else 0


def main() -> int:
    svc = drive_client()
    arch_id = ensure_archive_unclassified(svc)

    residuals: list[dict[str, Any]] = []
    emptied_folders: list[dict[str, Any]] = []
    root_summary = {}

    # Walk each import root; collect any remaining leaves + all subfolders.
    for root_name, root_id in IMPORT_ROOTS.items():
        print(f"\n[cleanup] walking {root_name}...")
        leaves, folders = walk_leaves(svc, root_id, root_name)
        print(f"  leaves: {len(leaves)}, subfolders: {len(folders)}")
        root_summary[root_name] = {"leaves": len(leaves), "subfolders": len(folders)}
        for leaf in leaves:
            residuals.append(leaf)

    print(f"\n[cleanup] total residual leaf files: {len(residuals)}")

    # Move residual leaves to Archive/Unclassified; update Supabase.
    moved = 0
    supabase_rows_updated = 0
    errors = []
    with httpx.Client(timeout=60.0) as client:
        for leaf in residuals:
            try:
                move_file(svc, leaf["id"], arch_id, leaf["parent_id"])
                moved += 1
            except HttpError as e:
                errors.append({"op": "drive_move", "file": leaf, "error": str(e)[:300]})
                continue
            new_path = f"Archive/Unclassified/{leaf['name']}"
            n = patch_supabase_source_file(client, leaf["id"], new_path)
            if n > 0:
                supabase_rows_updated += n
            elif n < 0:
                errors.append({"op": "supabase_patch", "file": leaf, "error": "non-2xx"})
            time.sleep(0.03)

    print(f"[cleanup] moved {moved}/{len(residuals)} residuals to Archive/Unclassified")
    print(f"[cleanup] supabase rows updated: {supabase_rows_updated}")

    # Now trash emptied subtrees. Walk again; any folder with no children (deep) is trashed.
    # Simpler: re-walk each root and trash empty folders deepest-first.
    for root_name, root_id in IMPORT_ROOTS.items():
        print(f"\n[cleanup] purging empty subtree under {root_name}...")
        leaves, folders = walk_leaves(svc, root_id, root_name)
        # If any leaves remain, do not trash — safety.
        if leaves:
            print(f"  {len(leaves)} leaves still remain; skipping root trash.")
            continue
        # Trash deepest folders first
        folders_sorted = sorted(folders, key=lambda f: -f["path"].count("/"))
        trashed = 0
        for f in folders_sorted:
            try:
                trash_folder(svc, f["id"])
                emptied_folders.append({"path": f["path"], "id": f["id"]})
                trashed += 1
            except HttpError as e:
                errors.append({"op": "drive_trash", "folder": f, "error": str(e)[:300]})
        # Trash the root itself
        try:
            trash_folder(svc, root_id)
            emptied_folders.append({"path": root_name, "id": root_id})
            print(f"  trashed root {root_name} ({root_id}) plus {trashed} subfolders")
        except HttpError as e:
            errors.append({"op": "drive_trash", "folder": {"path": root_name, "id": root_id},
                           "error": str(e)[:300]})

    out = {
        "residual_leaf_count": len(residuals),
        "residuals_moved": moved,
        "supabase_rows_updated_for_residuals": supabase_rows_updated,
        "emptied_folders_trashed": len(emptied_folders),
        "root_walk_summary_before": root_summary,
        "sample_residuals": residuals[:10],
        "errors": errors,
    }
    with open("stage4/data/wr-cleanup-residuals.json", "w") as f:
        json.dump(out, f, indent=2, default=str)
    print(f"\n[cleanup] report written: stage4/data/wr-cleanup-residuals.json")
    print(f"[cleanup] errors: {len(errors)}")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
