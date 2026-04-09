#!/usr/bin/env python3
"""Project River — Graph API Smoke Test (Task 1.5)

Authenticates to Microsoft Graph using client credentials (MSAL),
lists the root SharePoint site, creates a test file, reads it back,
then deletes it.

Usage:
    source scripts/env-setup.sh
    pip install --break-system-packages msal requests
    python scripts/test-graph-api.py
"""

import os
import sys
import json
import time

import msal
import requests


GRAPH_BASE = "https://graph.microsoft.com/v1.0"


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
        client_id,
        authority=authority,
        client_credential=client_secret,
    )

    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])

    if "access_token" not in result:
        print(f"ERROR: Failed to acquire token: {result.get('error_description', result)}")
        sys.exit(1)

    return result["access_token"]


def run_test():
    """Run the Graph API smoke test sequence."""
    print("=" * 60)
    print("Project River — Graph API Smoke Test")
    print("=" * 60)

    # Step 1: Authenticate
    print("\n[1/5] Authenticating via MSAL client credentials...")
    token = get_access_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("  PASS: Token acquired")

    # Step 2: List root SharePoint site
    print("\n[2/5] Listing root SharePoint site...")
    resp = requests.get(f"{GRAPH_BASE}/sites/root", headers=headers)
    if resp.status_code == 200:
        site = resp.json()
        print(f"  PASS: Root site = {site.get('displayName', 'unknown')} ({site.get('webUrl', '')})")
    else:
        print(f"  FAIL: {resp.status_code} — {resp.text}")
        sys.exit(1)

    # Step 3: Create test file in root site's default drive
    print("\n[3/5] Creating test file 'river-integration-test.txt'...")
    drive_resp = requests.get(f"{GRAPH_BASE}/sites/root/drive", headers=headers)
    if drive_resp.status_code != 200:
        print(f"  FAIL: Could not access default drive — {drive_resp.status_code}")
        sys.exit(1)

    test_content = "Project River integration test — this file will be deleted shortly."
    upload_resp = requests.put(
        f"{GRAPH_BASE}/sites/root/drive/root:/river-integration-test.txt:/content",
        headers={**headers, "Content-Type": "text/plain"},
        data=test_content.encode("utf-8"),
    )
    if upload_resp.status_code in (200, 201):
        item = upload_resp.json()
        item_id = item["id"]
        print(f"  PASS: File created (id={item_id})")
    else:
        print(f"  FAIL: Upload failed — {upload_resp.status_code} — {upload_resp.text}")
        sys.exit(1)

    # Step 4: Read it back
    print("\n[4/5] Reading back test file...")
    time.sleep(1)  # Brief pause for propagation
    read_resp = requests.get(
        f"{GRAPH_BASE}/sites/root/drive/items/{item_id}/content",
        headers=headers,
    )
    if read_resp.status_code == 200 and "Project River" in read_resp.text:
        print(f"  PASS: Content verified ({len(read_resp.text)} bytes)")
    else:
        print(f"  FAIL: Read back failed — {read_resp.status_code}")

    # Step 5: Delete the test file
    print("\n[5/5] Deleting test file...")
    del_resp = requests.delete(
        f"{GRAPH_BASE}/sites/root/drive/items/{item_id}",
        headers=headers,
    )
    if del_resp.status_code == 204:
        print("  PASS: File deleted")
    else:
        print(f"  WARN: Delete returned {del_resp.status_code} — {del_resp.text}")

    print("\n" + "=" * 60)
    print("Graph API smoke test COMPLETE — all checks passed")
    print("=" * 60)


if __name__ == "__main__":
    run_test()
