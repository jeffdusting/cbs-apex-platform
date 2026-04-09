#!/usr/bin/env python3
"""Project River — Company Creation Script (Task 1.9)

Creates four companies in Paperclip, then archives Adventure Safety and MAF.

Usage:
    source scripts/env-setup.sh
    python scripts/paperclip-create-companies.py
"""

import os
import sys
import json

import requests


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


# Company definitions with full mission statement descriptions
COMPANIES = [
    {
        "name": "CBS Group",
        "description": (
            "CBS Group is a technical advisory firm that improves client asset "
            "performance over the whole of life for less money. Specialising in "
            "infrastructure asset management, systems engineering, tolling advisory, "
            "and professional engineering services across transport, tunnels, and "
            "public infrastructure sectors."
        ),
    },
    {
        "name": "WaterRoads",
        "description": (
            "WaterRoads Pty Ltd is a maritime transport operator committed to "
            "sustainable passenger ferry services connecting Sydney harbour "
            "communities. Focused on PPP-structured route development, regulatory "
            "compliance, and investor-ready governance."
        ),
    },
    {
        "name": "Adventure Safety",
        "description": (
            "Online marine retail business — provisioned inactive for Sprint 1. "
            "Full platform build deferred to Sprint 4."
        ),
    },
    {
        "name": "MAF CobaltBlu",
        "description": (
            "Personal asset management application — provisioned inactive for "
            "Sprint 1. Development stabilisation deferred to Sprint 5."
        ),
    },
]

# Companies to archive after creation
ARCHIVE_COMPANIES = ["Adventure Safety", "MAF CobaltBlu"]


def create_company(base_url: str, headers: dict, company: dict) -> dict:
    """Create a single company via the Paperclip API."""
    resp = requests.post(
        f"{base_url}/api/companies",
        headers=headers,
        json=company,
    )
    if resp.status_code in (200, 201):
        data = resp.json()
        return data
    else:
        print(f"  ERROR: Failed to create '{company['name']}' — {resp.status_code}: {resp.text}")
        return None


def archive_company(base_url: str, headers: dict, company_id: str, name: str) -> bool:
    """Archive a company via the Paperclip API."""
    resp = requests.post(
        f"{base_url}/api/companies/{company_id}/archive",
        headers=headers,
    )
    if resp.status_code in (200, 204):
        print(f"  Archived: {name}")
        return True
    else:
        print(f"  ERROR: Failed to archive '{name}' — {resp.status_code}: {resp.text}")
        return False


def main():
    base_url = get_env("PAPERCLIP_URL").rstrip("/")
    api_key = get_env("PAPERCLIP_API_KEY")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    print("=" * 60)
    print("Project River — Company Creation")
    print("=" * 60)
    print(f"Target: {base_url}")
    print()

    created = {}
    for company in COMPANIES:
        print(f"Creating: {company['name']}...")
        result = create_company(base_url, headers, company)
        if result:
            company_id = result.get("id", result.get("companyId", "unknown"))
            created[company["name"]] = company_id
            print(f"  Created: {company['name']} (id={company_id})")
        else:
            print(f"  FAILED: {company['name']}")

    # Archive inactive companies
    print("\nArchiving inactive companies...")
    for name in ARCHIVE_COMPANIES:
        if name in created:
            archive_company(base_url, headers, created[name], name)
        else:
            print(f"  SKIP: {name} — not created (cannot archive)")

    # Summary
    print("\n" + "=" * 60)
    print("COMPANY CREATION SUMMARY")
    print("=" * 60)
    print(f"{'Name':<25} {'ID':<40} {'Status'}")
    print("-" * 80)
    for company in COMPANIES:
        name = company["name"]
        cid = created.get(name, "FAILED")
        status = "archived" if name in ARCHIVE_COMPANIES else "active"
        if cid == "FAILED":
            status = "FAILED"
        print(f"{name:<25} {cid:<40} {status}")

    # Write company IDs to manifest file for downstream scripts
    manifest_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "company-manifest.json")
    manifest = {
        "companies": {
            name: {"id": cid, "status": "archived" if name in ARCHIVE_COMPANIES else "active"}
            for name, cid in created.items()
        }
    }
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest written to {manifest_path}")


if __name__ == "__main__":
    main()
