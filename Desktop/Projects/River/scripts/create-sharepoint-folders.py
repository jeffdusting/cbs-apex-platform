#!/usr/bin/env python3
"""Project River — SharePoint Folder Creator (Task 1.15)

Creates the folder structure in SharePoint for CBS Group and WaterRoads:
  CBS Group/Board Papers/
  CBS Group/Minutes/
  CBS Group/Resolutions/
  CBS Group/Tender Documents/
  WaterRoads/Board Papers/
  WaterRoads/Minutes/
  WaterRoads/Resolutions/
  WaterRoads/Tender Documents/

Usage:
    source scripts/env-setup.sh
    python scripts/create-sharepoint-folders.py
"""

import os
import sys
import json

import msal
import requests


GRAPH_BASE = "https://graph.microsoft.com/v1.0"

# Folder structure to create
FOLDER_STRUCTURE = {
    "CBS Group": [
        "Board Papers",
        "Minutes",
        "Resolutions",
        "Tender Documents",
    ],
    "WaterRoads": [
        "Board Papers",
        "Minutes",
        "Resolutions",
        "Tender Documents",
    ],
}


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


def get_access_token() -> str:
    """Authenticate via MSAL client credentials flow."""
    client_id = get_env("MICROSOFT_CLIENT_ID")
    client_secret = get_env("MICROSOFT_CLIENT_SECRET")
    tenant_id = get_env("MICROSOFT_TENANT_ID")

    authority = f"https://login.microsoftonline.com/{tenant_id}"
    app = msal.ConfidentialClientApplication(
        client_id, authority=authority, client_credential=client_secret
    )
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])

    if "access_token" not in result:
        print(f"ERROR: Token acquisition failed: {result.get('error_description', result)}")
        sys.exit(1)

    return result["access_token"]


def create_folder(headers: dict, drive_id: str, parent_path: str, folder_name: str) -> bool:
    """Create a folder in SharePoint via Graph API."""
    url = f"{GRAPH_BASE}/drives/{drive_id}/root:/{parent_path}:/children"

    payload = {
        "name": folder_name,
        "folder": {},
        "@microsoft.graph.conflictBehavior": "fail",
    }

    resp = requests.post(url, headers=headers, json=payload)

    if resp.status_code in (200, 201):
        return True
    elif resp.status_code == 409:
        # Folder already exists — not an error
        print(f"      (already exists)")
        return True
    else:
        print(f"      ERROR: {resp.status_code} — {resp.text[:200]}")
        return False


def main():
    print("=" * 60)
    print("Project River — SharePoint Folder Creator")
    print("=" * 60)

    token = get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    # Get root site drive
    print("\nGetting root SharePoint site drive...")
    resp = requests.get(f"{GRAPH_BASE}/sites/root/drive", headers=headers)
    if resp.status_code != 200:
        print(f"ERROR: Could not access SharePoint drive — {resp.status_code}: {resp.text}")
        sys.exit(1)

    drive_id = resp.json()["id"]
    print(f"  Drive ID: {drive_id}")

    # Create folder structure
    success_count = 0
    fail_count = 0

    for entity, subfolders in FOLDER_STRUCTURE.items():
        print(f"\nCreating: {entity}/")

        # Create entity root folder
        root_payload = {
            "name": entity,
            "folder": {},
            "@microsoft.graph.conflictBehavior": "fail",
        }
        root_resp = requests.post(
            f"{GRAPH_BASE}/drives/{drive_id}/root/children",
            headers=headers,
            json=root_payload,
        )
        if root_resp.status_code in (200, 201):
            print(f"  Created: {entity}/")
        elif root_resp.status_code == 409:
            print(f"  Exists: {entity}/")
        else:
            print(f"  ERROR creating {entity}/: {root_resp.status_code}")

        # Create subfolders
        for subfolder in subfolders:
            print(f"    Creating: {entity}/{subfolder}/")
            ok = create_folder(headers, drive_id, entity, subfolder)
            if ok:
                success_count += 1
            else:
                fail_count += 1

    # Summary
    print("\n" + "=" * 60)
    print("SHAREPOINT FOLDER CREATION SUMMARY")
    print("=" * 60)
    print(f"  Created/confirmed: {success_count}")
    print(f"  Failed: {fail_count}")
    if fail_count == 0:
        print("  OVERALL: PASS")
    else:
        print("  OVERALL: PARTIAL — review errors above")


if __name__ == "__main__":
    main()
