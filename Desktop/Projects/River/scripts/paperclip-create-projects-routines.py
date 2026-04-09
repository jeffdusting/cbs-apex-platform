#!/usr/bin/env python3
"""Project River — Project and Routine Creator (Task 1.16)

Creates projects and routines for CBS Group or WaterRoads in Paperclip.

CBS Group projects:
  - CBS Tender Operations
  - CBS Governance
  - CBS General Operations

CBS Group routines:
  - Daily tender opportunity scan (Tender Intelligence, 7am daily)
  - Board paper preparation cycle (Governance CBS, 8am on 1st and 22nd)

WaterRoads projects:
  - WR Governance
  - WR General Operations

WaterRoads routines:
  - Board paper preparation cycle (Governance WR, 8am on 1st and 22nd)

Usage:
    source scripts/env-setup.sh
    python scripts/paperclip-create-projects-routines.py --entity cbs
    python scripts/paperclip-create-projects-routines.py --entity wr
"""

import argparse
import json
import os
import sys

import requests


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


def load_manifest(filename: str) -> dict:
    """Load a JSON manifest file from the scripts directory."""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    if not os.path.exists(path):
        return {}
    with open(path, "r") as f:
        return json.load(f)


def create_project(base_url: str, headers: dict, company_id: str, name: str, description: str) -> str | None:
    """Create a project and return its ID."""
    resp = requests.post(
        f"{base_url}/api/companies/{company_id}/projects",
        headers=headers,
        json={"name": name, "description": description},
    )
    if resp.status_code in (200, 201):
        data = resp.json()
        project_id = data.get("id", data.get("projectId", "unknown"))
        print(f"  Created project: {name} (id={project_id})")
        return project_id
    else:
        print(f"  ERROR creating project '{name}': {resp.status_code} — {resp.text[:200]}")
        return None


def create_routine(
    base_url: str, headers: dict, company_id: str,
    title: str, assignee_agent_id: str, project_id: str,
    cron_expression: str,
) -> str | None:
    """Create a routine with a schedule trigger and return its ID."""
    # Step 1: Create the routine
    resp = requests.post(
        f"{base_url}/api/companies/{company_id}/routines",
        headers=headers,
        json={
            "title": title,
            "assigneeAgentId": assignee_agent_id,
            "projectId": project_id,
        },
    )
    if resp.status_code not in (200, 201):
        print(f"  ERROR creating routine '{title}': {resp.status_code} — {resp.text[:200]}")
        return None

    data = resp.json()
    routine_id = data.get("id", data.get("routineId", "unknown"))
    print(f"  Created routine: {title} (id={routine_id})")

    # Step 2: Add schedule trigger
    trigger_resp = requests.post(
        f"{base_url}/api/routines/{routine_id}/triggers",
        headers=headers,
        json={
            "kind": "schedule",
            "cronExpression": cron_expression,
        },
    )
    if trigger_resp.status_code in (200, 201):
        trigger_data = trigger_resp.json()
        trigger_id = trigger_data.get("id", "unknown")
        print(f"    Trigger added: cron={cron_expression} (id={trigger_id})")
    else:
        print(f"    ERROR adding trigger: {trigger_resp.status_code} — {trigger_resp.text[:200]}")

    return routine_id


def find_agent_id(agents_manifest: dict, agent_name: str) -> str | None:
    """Look up an agent ID from the manifest by name."""
    agents = agents_manifest.get("agents", {})
    for name, info in agents.items():
        if name.lower() == agent_name.lower() or agent_name.lower() in name.lower():
            return info.get("id")
    return None


def setup_cbs(base_url: str, headers: dict, company_id: str):
    """Create CBS Group projects and routines."""
    print("\n--- CBS Group Projects ---")

    # Load agent manifest
    agents_manifest = load_manifest("cbs-agents-manifest.json")

    # Create projects
    tender_ops_id = create_project(
        base_url, headers, company_id,
        "CBS Tender Operations",
        "Tender identification, response, and submission workflow",
    )
    governance_id = create_project(
        base_url, headers, company_id,
        "CBS Governance",
        "Board papers, meeting management, and governance compliance",
    )
    general_ops_id = create_project(
        base_url, headers, company_id,
        "CBS General Operations",
        "Office management and ad-hoc tasks",
    )

    # Create routines
    print("\n--- CBS Group Routines ---")

    # Daily tender scan
    tender_intel_id = find_agent_id(agents_manifest, "Tender Intelligence")
    if tender_intel_id and tender_ops_id:
        create_routine(
            base_url, headers, company_id,
            "Daily tender opportunity scan",
            tender_intel_id,
            tender_ops_id,
            "0 7 * * *",  # 7am daily
        )
    else:
        print("  SKIP: Daily tender scan — missing agent or project ID")
        if not tender_intel_id:
            print("    (Tender Intelligence agent ID not found in manifest)")
        if not tender_ops_id:
            print("    (CBS Tender Operations project not created)")

    # Board paper preparation cycle
    governance_agent_id = find_agent_id(agents_manifest, "Governance CBS")
    if governance_agent_id and governance_id:
        create_routine(
            base_url, headers, company_id,
            "Board paper preparation cycle",
            governance_agent_id,
            governance_id,
            "0 8 1,22 * *",  # 8am on 1st and 22nd of each month
        )
    else:
        print("  SKIP: Board paper cycle — missing agent or project ID")
        if not governance_agent_id:
            print("    (Governance CBS agent ID not found in manifest)")
        if not governance_id:
            print("    (CBS Governance project not created)")

    return {
        "projects": {
            "CBS Tender Operations": tender_ops_id,
            "CBS Governance": governance_id,
            "CBS General Operations": general_ops_id,
        }
    }


def setup_wr(base_url: str, headers: dict, company_id: str):
    """Create WaterRoads projects and routines."""
    print("\n--- WaterRoads Projects ---")

    # Load agent manifest
    agents_manifest = load_manifest("wr-agents-manifest.json")

    # Create projects
    governance_id = create_project(
        base_url, headers, company_id,
        "WR Governance",
        "Board papers, meeting management, and governance compliance for WaterRoads",
    )
    general_ops_id = create_project(
        base_url, headers, company_id,
        "WR General Operations",
        "Office management and ad-hoc tasks for WaterRoads",
    )

    # Create routines
    print("\n--- WaterRoads Routines ---")

    # Board paper preparation cycle
    governance_agent_id = find_agent_id(agents_manifest, "Governance WR")
    if governance_agent_id and governance_id:
        create_routine(
            base_url, headers, company_id,
            "Board paper preparation cycle",
            governance_agent_id,
            governance_id,
            "0 8 1,22 * *",  # 8am on 1st and 22nd of each month
        )
    else:
        print("  SKIP: Board paper cycle — missing agent or project ID")
        if not governance_agent_id:
            print("    (Governance WR agent ID not found in manifest)")
        if not governance_id:
            print("    (WR Governance project not created)")

    return {
        "projects": {
            "WR Governance": governance_id,
            "WR General Operations": general_ops_id,
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Create Paperclip projects and routines")
    parser.add_argument(
        "--entity",
        required=True,
        choices=["cbs", "wr"],
        help="Entity to configure (cbs or wr)",
    )
    args = parser.parse_args()

    base_url = get_env("PAPERCLIP_URL").rstrip("/")
    api_key = get_env("PAPERCLIP_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # Resolve company ID
    company_manifest = load_manifest("company-manifest.json")
    entity_name = "CBS Group" if args.entity == "cbs" else "WaterRoads"
    company_id = company_manifest.get("companies", {}).get(entity_name, {}).get("id")

    if not company_id:
        print(f"ERROR: No company ID found for {entity_name}.")
        print("Run paperclip-create-companies.py first, or provide the ID in company-manifest.json.")
        sys.exit(1)

    print("=" * 60)
    print(f"Project River — Projects & Routines ({entity_name})")
    print("=" * 60)
    print(f"Target: {base_url}")
    print(f"Company: {entity_name} (id={company_id})")

    if args.entity == "cbs":
        result = setup_cbs(base_url, headers, company_id)
    else:
        result = setup_wr(base_url, headers, company_id)

    # Save project manifest
    manifest_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        f"{args.entity}-projects-manifest.json",
    )
    with open(manifest_path, "w") as f:
        json.dump(result, f, indent=2)
    print(f"\nProject manifest written to {manifest_path}")
    print("Done.")


if __name__ == "__main__":
    main()
