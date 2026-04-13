#!/usr/bin/env python3
"""Create the WR KB folder structure in the WaterRoads KB Shared Drive.

Usage:
    python3 scripts/wr-create-folders.py
"""

import os
import sys

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SERVICE_ACCOUNT_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    ".secrets/wr-service-account.json",
)
SHARED_DRIVE_ID = "0AFIfqhhhv9HjUk9PVA"
SCOPES = ["https://www.googleapis.com/auth/drive"]

FOLDER_MIME = "application/vnd.google-apps.folder"

STRUCTURE = {
    "Governance": {
        "Board Papers": {"Drafts": {}, "Approved": {}},
        "Minutes": {},
        "Resolutions": {},
        "Register": {},
    },
    "PPP": {
        "Programme Documents": {},
        "NSW Government Correspondence": {},
        "Milestone Tracker": {},
    },
    "Investor Relations": {
        "Updates": {},
        "Data Room": {},
        "Cap Table": {},
    },
    "Financial": {
        "Business Case": {},
        "Financial Model": {},
        "Monthly Reports": {},
    },
    "Regulatory": {
        "AMSA": {},
        "Environmental": {},
        "Maritime Safety": {},
    },
    "Stakeholder Engagement": {
        "Council": {},
        "Community": {},
        "TfNSW": {},
    },
    "Operational": {},
    "Reference": {
        "Shipley": {},
        "Industry Standards": {},
    },
    "Correspondence": {},
    "Archive": {},
    "Templates": {},
    "Imported from Dropbox": {},
    "Imported from SharePoint": {},
}


def get_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    return build("drive", "v3", credentials=creds)


def find_folder(service, name, parent_id):
    """Return folder ID if exists, else None."""
    query = (
        f"name = '{name}' and "
        f"'{parent_id}' in parents and "
        f"mimeType = '{FOLDER_MIME}' and "
        f"trashed = false"
    )
    res = service.files().list(
        q=query,
        fields="files(id,name)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
        driveId=SHARED_DRIVE_ID,
        corpora="drive",
    ).execute()
    files = res.get("files", [])
    return files[0]["id"] if files else None


def create_folder(service, name, parent_id):
    body = {
        "name": name,
        "mimeType": FOLDER_MIME,
        "parents": [parent_id],
    }
    folder = service.files().create(
        body=body,
        supportsAllDrives=True,
        fields="id,name",
    ).execute()
    return folder["id"]


def ensure_folder(service, name, parent_id, indent=""):
    existing = find_folder(service, name, parent_id)
    if existing:
        print(f"{indent}- {name} (exists)")
        return existing
    new_id = create_folder(service, name, parent_id)
    print(f"{indent}+ {name} (created)")
    return new_id


def create_tree(service, structure, parent_id, indent=""):
    for name, children in structure.items():
        folder_id = ensure_folder(service, name, parent_id, indent)
        if children:
            create_tree(service, children, folder_id, indent + "  ")


def main():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"ERROR: service account file not found at {SERVICE_ACCOUNT_FILE}")
        sys.exit(1)

    print(f"Connecting to Drive...")
    service = get_service()

    print(f"Verifying Shared Drive access...")
    try:
        drive = service.drives().get(driveId=SHARED_DRIVE_ID).execute()
        print(f"  Drive: {drive['name']}")
    except HttpError as e:
        print(f"ERROR accessing drive: {e}")
        print("Confirm the service account is added as a member of the Shared Drive.")
        sys.exit(1)

    print(f"\nCreating folder structure:")
    create_tree(service, STRUCTURE, SHARED_DRIVE_ID)
    print(f"\nComplete.")


if __name__ == "__main__":
    main()
