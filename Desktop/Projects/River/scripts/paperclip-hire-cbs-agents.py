#!/usr/bin/env python3
"""Project River — CBS Agent Hiring Script (Task 1.10)

LEGACY — DO NOT RUN WITHOUT REVIEW.

This script was used for initial Day 1 deployment. Running it again will:
- Attempt to create agents that already exist (will fail with duplicates)
- Use hardcoded env var list that may not match current requirements

For creating NEW agents, use the agent-recruitment skill pattern with
scripts/agent-standards.py as the single source of truth for env vars.

For recreating agents after full teardown, update this script to import
from agent_standards first:
    from agent_standards import build_agent_env
    env = build_agent_env(agent_role)

Usage (only after review):
    source scripts/env-setup.sh
    python scripts/paperclip-hire-cbs-agents.py --company-id <cbs-company-id>
"""

import sys
sys.exit("This is a legacy script. See docstring. Exiting to prevent accidental run.")


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
# CBS Group Agent Definitions
# ============================================================================
# Org chart:
#   Tier 1: CBS Executive (CEO)
#   Tier 2: Tender Intelligence, Tender Coordination, Governance, Office Mgmt
#           (all report to CBS Executive)
#   Tier 3: Technical Writing, Compliance, Pricing (report to Tender Coordination)
#           Research (reports to CBS Executive)
# ============================================================================

CBS_AGENTS = [
    {
        "name": "CBS Executive",
        "role": "ceo",
        "title": "CBS Group Executive Agent",
        "tier": 1,
        "reports_to": None,
        "capabilities": "Strategic oversight, delegation, board reporting, tender Go/No-Go decisions",
        "model": "claude-sonnet-4-20250514",
        "heartbeat_enabled": True,
        "heartbeat_interval_sec": 21600,  # 6 hours
        "budget_monthly_cents": 2500,
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
        "name": "Tender Intelligence",
        "role": "researcher",
        "title": "Tender Intelligence Agent",
        "tier": 2,
        "reports_to": "CBS Executive",
        "capabilities": "Opportunity identification, AusTender monitoring, sector analysis, tender assessment",
        "model": "claude-sonnet-4-20250514",
        "heartbeat_enabled": True,
        "heartbeat_interval_sec": 86400,  # 24 hours
        "budget_monthly_cents": 1500,
        "skills": ["paperclip", "supabase-query", "tender-portal-query"],
        "env_keys": {
            "SUPABASE_URL": {"type": "plain"},
            "SUPABASE_SERVICE_ROLE_KEY": {"type": "secret"},
        },
    },
    {
        "name": "Tender Coordination",
        "role": "pm",
        "title": "Tender Coordination Agent",
        "tier": 2,
        "reports_to": "CBS Executive",
        "capabilities": "Workflow orchestration, task delegation, submission timeline management",
        "model": "claude-sonnet-4-20250514",
        "heartbeat_enabled": True,
        "heartbeat_interval_sec": 14400,  # 4 hours
        "budget_monthly_cents": 2000,
        "skills": ["paperclip", "supabase-query", "sharepoint-write"],
        "env_keys": {
            "SUPABASE_URL": {"type": "plain"},
            "SUPABASE_SERVICE_ROLE_KEY": {"type": "secret"},
            "MICROSOFT_CLIENT_ID": {"type": "plain"},
            "MICROSOFT_CLIENT_SECRET": {"type": "secret"},
            "MICROSOFT_TENANT_ID": {"type": "plain"},
        },
    },
    {
        "name": "Technical Writing",
        "role": "engineer",
        "title": "Technical Writing Agent",
        "tier": 3,
        "reports_to": "Tender Coordination",
        "capabilities": "Long-form tender content production, CAPITAL framework narratives, technical documentation",
        "model": "claude-sonnet-4-20250514",
        "heartbeat_enabled": False,  # On assignment
        "heartbeat_interval_sec": 0,
        "budget_monthly_cents": 2500,
        "skills": ["paperclip", "supabase-query", "cbs-capital-framework", "sharepoint-write"],
        "env_keys": {
            "SUPABASE_URL": {"type": "plain"},
            "SUPABASE_SERVICE_ROLE_KEY": {"type": "secret"},
            "MICROSOFT_CLIENT_ID": {"type": "plain"},
            "MICROSOFT_CLIENT_SECRET": {"type": "secret"},
            "MICROSOFT_TENANT_ID": {"type": "plain"},
        },
    },
    {
        "name": "Compliance",
        "role": "qa",
        "title": "Compliance Agent",
        "tier": 3,
        "reports_to": "Tender Coordination",
        "capabilities": "Tender compliance review, mandatory criteria checking, quality assurance",
        "model": "claude-haiku-4-5-20251001",
        "heartbeat_enabled": False,  # On assignment
        "heartbeat_interval_sec": 0,
        "budget_monthly_cents": 500,
        "skills": ["paperclip", "supabase-query"],
        "env_keys": {
            "SUPABASE_URL": {"type": "plain"},
            "SUPABASE_SERVICE_ROLE_KEY": {"type": "secret"},
        },
    },
    {
        "name": "Pricing and Commercial",
        "role": "general",
        "title": "Pricing and Commercial Agent",
        "tier": 3,
        "reports_to": "Tender Coordination",
        "capabilities": "Value-based pricing, commercial analysis, fee structure modelling, Xero data retrieval",
        "model": "claude-sonnet-4-20250514",
        "heartbeat_enabled": False,  # On assignment
        "heartbeat_interval_sec": 0,
        "budget_monthly_cents": 1000,
        "skills": ["paperclip", "supabase-query", "xero-read", "cbs-capital-framework"],
        "env_keys": {
            "SUPABASE_URL": {"type": "plain"},
            "SUPABASE_SERVICE_ROLE_KEY": {"type": "secret"},
            "XERO_CLIENT_ID": {"type": "plain"},
            "XERO_CLIENT_SECRET": {"type": "secret"},
        },
    },
    {
        "name": "Governance CBS",
        "role": "pm",
        "title": "CBS Group Governance Agent",
        "tier": 2,
        "reports_to": "CBS Executive",
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
        "name": "Office Management CBS",
        "role": "general",
        "title": "CBS Group Office Management Agent",
        "tier": 2,
        "reports_to": "CBS Executive",
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
    {
        "name": "Research CBS",
        "role": "researcher",
        "title": "CBS Group Research Agent",
        "tier": 3,
        "reports_to": "CBS Executive",
        "capabilities": "Research and analysis, market intelligence, technical investigation",
        "model": "claude-sonnet-4-20250514",
        "heartbeat_enabled": False,  # On demand
        "heartbeat_interval_sec": 0,
        "budget_monthly_cents": 1000,
        "skills": ["paperclip", "supabase-query"],
        "env_keys": {
            "SUPABASE_URL": {"type": "plain"},
            "SUPABASE_SERVICE_ROLE_KEY": {"type": "secret"},
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
    cwd_name = agent_def["name"].lower().replace(" ", "-").replace("---", "-")
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
    # First, GET the agent to find its instructionsRootPath
    resp = requests.get(f"{base_url}/api/agents/{agent_id}", headers=headers)
    if resp.status_code != 200:
        print(f"    WARNING: Could not retrieve agent {agent_id} for instruction path")
        return

    agent_data = resp.json()
    instructions_path = agent_data.get("adapterConfig", {}).get("instructionsRootPath", "")

    if not instructions_path:
        print(f"    INFO: No instructionsRootPath found — instructions will be set via promptTemplate")
        # Fallback: set promptTemplate on the agent
        agent_name = agent_def["name"]
        prompt = f"""You are {agent_name}, a {agent_def['title']} for CBS Group.

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
    # The instruction files are written by Phase 2 (CC-0B).
    # This script records the path for P2 to use.
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
    parser = argparse.ArgumentParser(description="Create CBS Group agents in Paperclip")
    parser.add_argument("--company-id", help="CBS Group company ID (or auto-read from manifest)")
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
            company_id = manifest.get("companies", {}).get("CBS Group", {}).get("id")

    if not company_id:
        print("ERROR: No company ID provided. Use --company-id or run paperclip-create-companies.py first.")
        sys.exit(1)

    print("=" * 70)
    print("Project River — CBS Group Agent Hiring")
    print("=" * 70)
    print(f"Target: {base_url}")
    print(f"Company: CBS Group (id={company_id})")
    print(f"Agents to create: {len(CBS_AGENTS)}")
    print()

    # Phase 1: Create all agents, building the ID map for reportsTo references
    created_agents = {}  # name -> {id, definition}

    # Create Tier 1 first (no reportsTo)
    for agent_def in CBS_AGENTS:
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

    # Create Tier 2 (reports to Tier 1)
    for agent_def in CBS_AGENTS:
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

    # Create Tier 3 (reports to their Tier 2 manager)
    for agent_def in CBS_AGENTS:
        if agent_def["tier"] == 3:
            reports_to_name = agent_def["reports_to"]
            reports_to_id = created_agents.get(reports_to_name, {}).get("id")
            print(f"Creating Tier 3: {agent_def['name']} ({agent_def['role']}) -> {reports_to_name}...")
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
    print("CBS GROUP AGENT HIRING SUMMARY")
    print("=" * 70)
    print(f"{'Name':<25} {'Role':<12} {'Tier':<6} {'Heartbeat':<15} {'Budget':<10} {'ID'}")
    print("-" * 110)
    for agent_def in CBS_AGENTS:
        name = agent_def["name"]
        info = created_agents.get(name)
        agent_id = info["id"] if info else "FAILED"
        hb = f"{agent_def['heartbeat_interval_sec']}s" if agent_def["heartbeat_enabled"] else "disabled"
        budget = f"${agent_def['budget_monthly_cents'] / 100:.2f}"
        print(f"{name:<25} {agent_def['role']:<12} {agent_def['tier']:<6} {hb:<15} {budget:<10} {agent_id}")

    # Write agent manifest for downstream scripts
    manifest_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cbs-agents-manifest.json")
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
    print(f"Total agents created: {len(created_agents)}/{len(CBS_AGENTS)}")


if __name__ == "__main__":
    main()
