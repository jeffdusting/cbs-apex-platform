#!/usr/bin/env python3
"""Project River — Agent Env Var Validator

Audits all agents across all companies and reports missing env vars.
Can be run anytime to confirm all agents are correctly configured.

Usage:
    source scripts/env-setup.sh
    export PAPERCLIP_SESSION_TOKEN='...'   # from browser cookie
    python scripts/validate-agent-env.py
    python scripts/validate-agent-env.py --fix    # auto-add missing vars
"""

import argparse
import json
import os
import sys

import httpx

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agent_standards import REQUIRED_ENV_VARS, ROLE_SPECIFIC_ENV_VARS, validate_agent_env, build_agent_env


COMPANY_IDS = {
    "CBS Group": "fafce870-b862-4754-831e-2cd10e8b203c",
    "WaterRoads": "95a248d4-08e7-4879-8e66-5d1ff948e005",
}

# Map agent names to role keys for role-specific checks
AGENT_ROLE_MAPPING = {
    "Governance CBS": "governance-cbs",
    "Governance WR": "governance-wr",
    "Pricing and Commercial": "pricing-commercial",
}


def get_agents(base_url: str, cookie: str, company_id: str) -> list[dict]:
    r = httpx.get(
        f"{base_url}/api/companies/{company_id}/agents",
        cookies={"__Secure-better-auth.session_token": cookie},
        timeout=30,
    )
    if r.status_code != 200:
        print(f"  ERROR listing agents for {company_id}: HTTP {r.status_code}")
        return []
    data = r.json()
    return data if isinstance(data, list) else data.get("agents", data.get("data", []))


def patch_agent_env(base_url: str, cookie: str, agent_id: str, new_env: dict) -> bool:
    r = httpx.patch(
        f"{base_url}/api/agents/{agent_id}",
        cookies={"__Secure-better-auth.session_token": cookie},
        headers={
            "Content-Type": "application/json",
            "Origin": "https://org.cbslab.app",
        },
        json={"adapterConfig": {"env": new_env}},
        timeout=30,
    )
    return r.status_code == 200


def main():
    parser = argparse.ArgumentParser(description="Validate agent env vars")
    parser.add_argument("--fix", action="store_true", help="Auto-add missing vars")
    args = parser.parse_args()

    base_url = os.environ["PAPERCLIP_URL"].rstrip("/")
    cookie = os.environ.get("PAPERCLIP_SESSION_TOKEN")
    if not cookie:
        # Try parsing from Cookie header if user set it that way
        cookie_header = os.environ.get("PAPERCLIP_COOKIE", "")
        if "=" in cookie_header:
            cookie = cookie_header.split("=", 1)[1]
        else:
            print("ERROR: Set PAPERCLIP_SESSION_TOKEN to the browser session token value.")
            sys.exit(1)

    total_agents = 0
    total_missing = 0
    fixed = 0

    for company_name, company_id in COMPANY_IDS.items():
        print(f"\n=== {company_name} ===")
        agents = get_agents(base_url, cookie, company_id)
        for agent in agents:
            if agent.get("budgetMonthlyCents", 0) == 0 and not agent.get("runtimeConfig", {}).get("heartbeat", {}).get("enabled", False):
                # Skip disabled agents
                continue

            name = agent.get("name", "?")
            env = agent.get("adapterConfig", {}).get("env", {})
            role_key = AGENT_ROLE_MAPPING.get(name)

            missing = validate_agent_env(env, role_key)
            total_agents += 1

            if not missing:
                print(f"  ✓ {name}")
                continue

            total_missing += 1
            print(f"  ✗ {name}: missing {missing}")

            if args.fix:
                # Build the full env (keep existing + add required)
                try:
                    required_env = build_agent_env(role_key)
                except ValueError as e:
                    print(f"    SKIP (can't build env): {e}")
                    continue

                # Merge: existing env wins for non-required keys
                new_env = dict(env)
                for key, val in required_env.items():
                    if not new_env.get(key, {}).get("value"):
                        new_env[key] = val

                if patch_agent_env(base_url, cookie, agent["id"], new_env):
                    fixed += 1
                    print(f"    FIXED: added {missing}")
                else:
                    print(f"    FAILED to patch")

    print(f"\n{'=' * 60}")
    print(f"Total agents checked: {total_agents}")
    print(f"Agents with missing env: {total_missing}")
    if args.fix:
        print(f"Agents fixed: {fixed}")
    else:
        if total_missing > 0:
            print(f"\nRun with --fix to auto-add missing env vars.")

    sys.exit(1 if total_missing > 0 and not args.fix else 0)


if __name__ == "__main__":
    main()
