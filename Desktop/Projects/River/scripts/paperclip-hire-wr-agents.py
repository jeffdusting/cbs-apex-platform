#!/usr/bin/env python3
"""Project River — WaterRoads Agent Hiring Script (Task 1.11)

Creates all 3 WaterRoads agents using the direct creation endpoint
(board operator path). Sets up org chart hierarchy, writes instruction
bundles, and syncs skills.

Usage:
    source scripts/env-setup.sh
    python scripts/paperclip-hire-wr-agents.py --company-id <wr-company-id>

    Or auto-reads from company-manifest.json:
    python scripts/paperclip-hire-wr-agents.py
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


def get_env_optional(key: str) -> str:
    """Retrieve an environment variable, returning empty string if unset."""
    return os.environ.get(key, "")


# ============================================================================
# WaterRoads Agent Definitions
# ============================================================================
# Org chart:
#   Tier 1: WR Executive (CEO)
#   Tier 2: Governance WR, Office Management WR (both report to WR Executive)
# ============================================================================

WR_AGENTS = [
    {
        "name": "WR Executive",
        "role": "ceo",
        "title": "WaterRoads Executive Agent",
        "tier": 1,
        "reports_to": None,
        "capabilities": "Strategic oversight, governance compliance, investor relations, route development oversight",
        "model": "claude-sonnet-4-20250514",
        "heartbeat_enabled": True,
        "heartbeat_interval_sec": 21600,  # 6 hours
        "budget_monthly_cents": 1500,
        "skills": ["paperclip", "supabase-query", "sharepoint-write", "teams-notify"],
        "env_keys": {
            "SUPABASE_URL": {"type": "plain"},
            "SUPABASE_SERVICE_ROLE_KEY": {"type": "secret"},
            "MICROSOFT_CLIENT_ID": {"type": "plain"},
            "MICROSOFT_CLIENT_SECRET": {"type": "secret"},
            "MICROSOFT_TENANT_ID": {"type": "plain"},
        },
    },
    {
        "name": "Governance WR",
        "role": "pm",
        "title": "WaterRoads Governance Agent",
        "tier": 2,
        "reports_to": "WR Executive",
        "capabilities": "Board paper production, meeting management, governance compliance, Xero reporting",
        "model": "claude-sonnet-4-20250514",
        "heartbeat_enabled": False,  # Routine-driven (wakeOnDemand)
        "heartbeat_interval_sec": 0,
        "budget_monthly_cents": 1500,
        "skills": ["paperclip", "supabase-query", "xero-read", "sharepoint-write", "teams-notify"],
        "env_keys": {
            "SUPABASE_URL": {"type": "plain"},
            "SUPABASE_SERVICE_ROLE_KEY": {"type": "secret"},
            "MICROSOFT_CLIENT_ID": {"type": "plain"},
            "MICROSOFT_CLIENT_SECRET": {"type": "secret"},
            "MICROSOFT_TENANT_ID": {"type": "plain"},
            "XERO_CLIENT_ID": {"type": "plain"},
            "XERO_CLIENT_SECRET": {"type": "secret"},
        },
    },
    {
        "name": "Office Management WR",
        "role": "general",
        "title": "WaterRoads Office Management Agent",
        "tier": 2,
        "reports_to": "WR Executive",
        "capabilities": "Administrative coordination, document management, ad-hoc task handling",
        "model": "claude-haiku-4-5-20251001",
        "heartbeat_enabled": True,
        "heartbeat_interval_sec": 43200,  # 12 hours
        "budget_monthly_cents": 400,
        "skills": ["paperclip", "supabase-query", "sharepoint-write"],
        "env_keys": {
            "SUPABASE_URL": {"type": "plain"},
            "SUPABASE_SERVICE_ROLE_KEY": {"type": "secret"},
            "MICROSOFT_CLIENT_ID": {"type": "plain"},
            "MICROSOFT_CLIENT_SECRET": {"type": "secret"},
            "MICROSOFT_TENANT_ID": {"type": "plain"},
        },
    },
]


def build_env_vars(agent_def: dict) -> dict:
    """Build the type-wrapped env var dict from agent definition."""
    env_vars = {}
    for key, config in agent_def["env_keys"].items():
        value = get_env_optional(key)
        env_vars[key] = {
            "type": config["type"],
            "value": value,
        }
    return env_vars


def build_agent_payload(agent_def: dict, reports_to_id: str | None = None) -> dict:
    """Build the full agent creation payload."""
    cwd_name = agent_def["name"].lower().replace(" ", "-")
    payload = {
        "name": agent_def["name"],
        "role": agent_def["role"],
        "title": agent_def["title"],
        "capabilities": agent_def["capabilities"],
        "adapterType": "claude_local",
        "adapterConfig": {
            "cwd": f"/paperclip/workspaces/{cwd_name}",
            "model": agent_def["model"],
            "maxTurnsPerRun": 1000,
            "dangerouslySkipPermissions": True,
            "graceSec": 15,
            "timeoutSec": 0,
            "env": build_env_vars(agent_def),
        },
        "runtimeConfig": {
            "heartbeat": {
                "enabled": agent_def["heartbeat_enabled"],
                "intervalSec": agent_def["heartbeat_interval_sec"],
                "cooldownSec": 10,
                "wakeOnDemand": True,
                "maxConcurrentRuns": 1,
            }
        },
        "budgetMonthlyCents": agent_def["budget_monthly_cents"],
    }

    if reports_to_id:
        payload["reportsTo"] = reports_to_id

    return payload


def write_instruction_bundle(base_url: str, headers: dict, agent_id: str, agent_def: dict):
    """Write the 4-file instruction bundle to the agent's instructionsRootPath."""
    resp = requests.get(f"{base_url}/api/agents/{agent_id}", headers=headers)
    if resp.status_code != 200:
        print(f"    WARNING: Could not retrieve agent {agent_id} for instruction path")
        return

    agent_data = resp.json()
    instructions_path = agent_data.get("adapterConfig", {}).get("instructionsRootPath", "")

    if not instructions_path:
        print(f"    INFO: No instructionsRootPath found — instructions will be set via promptTemplate")
        agent_name = agent_def["name"]
        prompt = f"""You are {agent_name}, a {agent_def['title']} for WaterRoads Pty Ltd.

Your capabilities: {agent_def['capabilities']}

Refer to your AGENTS.md, HEARTBEAT.md, SOUL.md, and TOOLS.md instruction files
for detailed operating procedures. These files are located in your instructions
directory and define your behaviour, boundaries, and available tools.
"""
        patch_resp = requests.patch(
            f"{base_url}/api/agents/{agent_id}",
            headers=headers,
            json={"adapterConfig": {**agent_data.get("adapterConfig", {}), "promptTemplate": prompt}},
        )
        if patch_resp.status_code in (200, 204):
            print(f"    Set promptTemplate for {agent_name}")
        else:
            print(f"    WARNING: Failed to set promptTemplate — {patch_resp.status_code}")
        return

    print(f"    Instructions path: {instructions_path}")
    print(f"    NOTE: Instruction bundle files (AGENTS.md, HEARTBEAT.md, SOUL.md, TOOLS.md)")
    print(f"          will be written by Phase 2 (agent instructions generation)")


def sync_skills(base_url: str, headers: dict, agent_id: str, skills: list[str], agent_name: str):
    """Sync skills to an agent."""
    resp = requests.post(
        f"{base_url}/api/agents/{agent_id}/skills/sync",
        headers=headers,
        json={"skills": skills},
    )
    if resp.status_code in (200, 204):
        print(f"    Skills synced: {', '.join(skills)}")
    else:
        print(f"    WARNING: Skill sync failed for {agent_name} — {resp.status_code}: {resp.text[:200]}")


def main():
    parser = argparse.ArgumentParser(description="Create WaterRoads agents in Paperclip")
    parser.add_argument("--company-id", help="WaterRoads company ID (or auto-read from manifest)")
    args = parser.parse_args()

    base_url = get_env("PAPERCLIP_URL").rstrip("/")
    api_key = get_env("PAPERCLIP_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # Resolve company ID
    company_id = args.company_id
    if not company_id:
        manifest_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "company-manifest.json")
        if os.path.exists(manifest_path):
            with open(manifest_path, "r") as f:
                manifest = json.load(f)
            company_id = manifest.get("companies", {}).get("WaterRoads", {}).get("id")

    if not company_id:
        print("ERROR: No company ID provided. Use --company-id or run paperclip-create-companies.py first.")
        sys.exit(1)

    print("=" * 70)
    print("Project River — WaterRoads Agent Hiring")
    print("=" * 70)
    print(f"Target: {base_url}")
    print(f"Company: WaterRoads (id={company_id})")
    print(f"Agents to create: {len(WR_AGENTS)}")
    print()

    # Phase 1: Create all agents
    created_agents = {}

    # Tier 1 first
    for agent_def in WR_AGENTS:
        if agent_def["tier"] == 1:
            print(f"Creating Tier 1: {agent_def['name']} ({agent_def['role']})...")
            payload = build_agent_payload(agent_def)
            resp = requests.post(
                f"{base_url}/api/companies/{company_id}/agents",
                headers=headers,
                json=payload,
            )
            if resp.status_code in (200, 201):
                data = resp.json()
                agent_id = data.get("id", data.get("agentId", "unknown"))
                created_agents[agent_def["name"]] = {"id": agent_id, "def": agent_def}
                print(f"  Created: {agent_def['name']} (id={agent_id})")
            else:
                print(f"  ERROR: {resp.status_code} — {resp.text[:300]}")

    # Tier 2 (reports to Tier 1)
    for agent_def in WR_AGENTS:
        if agent_def["tier"] == 2:
            reports_to_name = agent_def["reports_to"]
            reports_to_id = created_agents.get(reports_to_name, {}).get("id")
            print(f"Creating Tier 2: {agent_def['name']} ({agent_def['role']}) -> {reports_to_name}...")
            payload = build_agent_payload(agent_def, reports_to_id)
            resp = requests.post(
                f"{base_url}/api/companies/{company_id}/agents",
                headers=headers,
                json=payload,
            )
            if resp.status_code in (200, 201):
                data = resp.json()
                agent_id = data.get("id", data.get("agentId", "unknown"))
                created_agents[agent_def["name"]] = {"id": agent_id, "def": agent_def}
                print(f"  Created: {agent_def['name']} (id={agent_id})")
            else:
                print(f"  ERROR: {resp.status_code} — {resp.text[:300]}")

    # Phase 2: Write instruction bundles
    print("\n--- Writing instruction bundles ---")
    for name, info in created_agents.items():
        print(f"  {name}:")
        write_instruction_bundle(base_url, headers, info["id"], info["def"])

    # Phase 3: Sync skills
    print("\n--- Syncing skills ---")
    for name, info in created_agents.items():
        agent_def = info["def"]
        print(f"  {name}:")
        sync_skills(base_url, headers, info["id"], agent_def["skills"], name)

    # Summary table
    print("\n" + "=" * 70)
    print("WATERROADS AGENT HIRING SUMMARY")
    print("=" * 70)
    print(f"{'Name':<25} {'Role':<12} {'Tier':<6} {'Heartbeat':<15} {'Budget':<10} {'ID'}")
    print("-" * 110)
    for agent_def in WR_AGENTS:
        name = agent_def["name"]
        info = created_agents.get(name)
        agent_id = info["id"] if info else "FAILED"
        hb = f"{agent_def['heartbeat_interval_sec']}s" if agent_def["heartbeat_enabled"] else "disabled"
        budget = f"${agent_def['budget_monthly_cents'] / 100:.2f}"
        print(f"{name:<25} {agent_def['role']:<12} {agent_def['tier']:<6} {hb:<15} {budget:<10} {agent_id}")

    # Write agent manifest
    manifest_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "wr-agents-manifest.json")
    manifest = {
        "company_id": company_id,
        "agents": {
            name: {
                "id": info["id"],
                "role": info["def"]["role"],
                "tier": info["def"]["tier"],
                "heartbeat_enabled": info["def"]["heartbeat_enabled"],
                "heartbeat_interval_sec": info["def"]["heartbeat_interval_sec"],
                "budget_monthly_cents": info["def"]["budget_monthly_cents"],
                "model": info["def"]["model"],
                "skills": info["def"]["skills"],
            }
            for name, info in created_agents.items()
        },
    }
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nAgent manifest written to {manifest_path}")
    print(f"Total agents created: {len(created_agents)}/{len(WR_AGENTS)}")


if __name__ == "__main__":
    main()
