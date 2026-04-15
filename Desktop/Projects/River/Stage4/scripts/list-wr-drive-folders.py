#!/usr/bin/env python3
"""List top-level and second-level folders in the WR KB Shared Drive.

Compares the observed structure against stage4/TARGET-KB-STRUCTURE.md and
writes stage4/data/wr-canonical-folders.json.
"""
import json
import os
import sys
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build

SERVICE_ACCOUNT_FILE = os.environ.get(
    "WR_SERVICE_ACCOUNT_FILE",
    str(Path(__file__).resolve().parents[2] / ".secrets" / "wr-service-account.json"),
)
SHARED_DRIVE_ID = os.environ.get("WR_DRIVE_ID", "0AFIfqhhhv9HjUk9PVA")
SCOPES = ["https://www.googleapis.com/auth/drive"]
FOLDER_MIME = "application/vnd.google-apps.folder"

OUT = Path(__file__).resolve().parents[1] / "data" / "wr-canonical-folders.json"

TARGET_TOP = {
    "Governance", "PPP", "Financial", "Investor Relations", "Technical",
    "Operations", "Commercial", "Legal", "HR", "Reference", "Marketing",
    "Archive",
}


def get_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    return build("drive", "v3", credentials=creds)


def list_children(service, parent_id):
    query = f"'{parent_id}' in parents and mimeType = '{FOLDER_MIME}' and trashed = false"
    results = []
    page_token = None
    while True:
        res = service.files().list(
            q=query,
            fields="nextPageToken,files(id,name)",
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
            driveId=SHARED_DRIVE_ID,
            corpora="drive",
            pageSize=1000,
            pageToken=page_token,
        ).execute()
        results.extend(res.get("files", []))
        page_token = res.get("nextPageToken")
        if not page_token:
            break
    return sorted(results, key=lambda f: f["name"].lower())


def main():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"ERROR: service account file not found at {SERVICE_ACCOUNT_FILE}")
        sys.exit(1)
    service = get_service()

    top = list_children(service, SHARED_DRIVE_ID)
    tree = []
    for folder in top:
        children = list_children(service, folder["id"])
        tree.append({
            "name": folder["name"],
            "id": folder["id"],
            "children": [{"name": c["name"], "id": c["id"]} for c in children],
        })

    observed_top = {f["name"] for f in top}
    matching = sorted(observed_top & TARGET_TOP)
    missing = sorted(TARGET_TOP - observed_top)
    extra = sorted(observed_top - TARGET_TOP)

    out = {
        "shared_drive_id": SHARED_DRIVE_ID,
        "top_level_folder_count": len(top),
        "target_top_level_folders": sorted(TARGET_TOP),
        "observed_top_level_folders": sorted(observed_top),
        "top_folders_matching_target": matching,
        "top_folders_missing_from_target": missing,
        "top_folders_not_in_target": extra,
        "tree": tree,
    }
    OUT.write_text(json.dumps(out, indent=2))
    print(f"Wrote {OUT}")
    print(f"  top-level folders: {len(top)}")
    print(f"  matching target:   {len(matching)}")
    print(f"  missing:           {missing}")
    print(f"  extra:             {extra}")


if __name__ == "__main__":
    main()
