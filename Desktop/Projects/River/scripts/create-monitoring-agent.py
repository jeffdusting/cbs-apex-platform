#!/usr/bin/env python3
"""
Create the River Monitor agent in Paperclip.

Usage:
    python3 scripts/create-monitoring-agent.py             # preview
    python3 scripts/create-monitoring-agent.py --execute    # create agent
"""

import argparse
import json
import os
import sys

import httpx

PAPERCLIP_API_URL = os.environ.get("PAPERCLIP_API_URL", "https://org.cbslab.app")
PAPERCLIP_COOKIE = os.environ.get("PAPERCLIP_SESSION_COOKIE", "")
CBS_COMPANY_ID = "fafce870-b862-4754-831e-2cd10e8b203c"


def paperclip_headers() -> dict:
    return {
        "Cookie": f"__Secure-better-auth.session_token={PAPERCLIP_COOKIE}",
        "Content-Type": "application/json",
        "Origin": PAPERCLIP_API_URL,
        "Referer": f"{PAPERCLIP_API_URL}/",
    }


def main():
    parser = argparse.ArgumentParser(description="Create River Monitor agent")
    parser.add_argument("--execute", action="store_true", help="Actually create the agent")
    args = parser.parse_args()

    if not PAPERCLIP_COOKIE:
        print("ERROR: PAPERCLIP_SESSION_COOKIE must be set")
        sys.exit(2)

    # Read agent instructions
    instructions_path = os.path.join(
        os.path.dirname(__file__), "..", "agent-instructions", "monitoring", "AGENTS.md"
    )
    with open(instructions_path) as f:
        prompt_template = f.read()

    # Agent configuration
    agent_config = {
        "name": "River Monitor",
        "adapter": "claude_local",
        "adapterConfig": {
            "model": "claude-haiku-4-5-20251001",
            "promptTemplate": prompt_template,
            "env": {
                "SUPABASE_URL": {"type": "plain", "value": os.environ.get("SUPABASE_URL", "")},
                "SUPABASE_SERVICE_ROLE_KEY": {"type": "plain", "value": os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")},
                "VOYAGE_API_KEY": {"type": "plain", "value": os.environ.get("VOYAGE_API_KEY", "")},
                "PAPERCLIP_API_URL": {"type": "plain", "value": PAPERCLIP_API_URL},
                "TEAMS_WEBHOOK_URL": {"type": "plain", "value": os.environ.get("TEAMS_WEBHOOK_URL", "")},
            },
        },
        "role": "general",
        "runtimeConfig": {
            "heartbeat": {"intervalSec": 3600},
            "deploymentMode": "authenticated",
        },
        "budgetMonthlyCents": 200,  # $2/month
    }

    skills_to_assign = ["trace-capture", "self-check", "supabase-query", "teams-notify"]

    print("=== River Monitor Agent ===")
    print(f"  Company: CBS Group ({CBS_COMPANY_ID})")
    print(f"  Model: claude-haiku-4-5-20251001")
    print(f"  Heartbeat: 3600s (1 hour)")
    print(f"  Budget: $2/month")
    print(f"  Skills: {skills_to_assign}")
    print(f"  Prompt template: {len(prompt_template)} chars")
    print()

    if not args.execute:
        print("API call (preview):")
        print(f"  POST {PAPERCLIP_API_URL}/api/companies/{CBS_COMPANY_ID}/agents")
        print(f"  Payload: {json.dumps({k: v for k, v in agent_config.items() if k != 'adapterConfig'}, indent=2)}")
        print(f"\nRun with --execute to create the agent.")
        sys.exit(0)

    # Create agent
    headers = paperclip_headers()
    print("Creating agent...")

    r = httpx.post(
        f"{PAPERCLIP_API_URL}/api/companies/{CBS_COMPANY_ID}/agents",
        headers=headers,
        json=agent_config,
        timeout=30,
    )

    if r.status_code in (200, 201):
        agent = r.json()
        agent_id = agent.get("id", "unknown")
        print(f"  Agent created: {agent_id}")
        print(f"  Name: {agent.get('name', '?')}")

        # Assign skills
        print("Assigning skills...")
        skill_payload = [{"name": s} for s in skills_to_assign]
        sr = httpx.patch(
            f"{PAPERCLIP_API_URL}/api/agents/{agent_id}",
            headers=headers,
            json={"adapterConfig": {**agent_config["adapterConfig"], "skills": skill_payload}},
            timeout=15,
        )
        if sr.status_code in (200, 204):
            print(f"  Skills assigned: {skills_to_assign}")
        else:
            print(f"  WARN: Skill assignment returned {sr.status_code}")

        # Verify
        vr = httpx.get(
            f"{PAPERCLIP_API_URL}/api/agents/{agent_id}",
            headers=headers,
            timeout=15,
        )
        if vr.status_code == 200:
            verified = vr.json()
            pt = verified.get("adapterConfig", {}).get("promptTemplate", "")
            if "River Monitor" in pt:
                print("  Verified: promptTemplate contains 'River Monitor'")
            else:
                print("  WARN: Verification — 'River Monitor' not found in promptTemplate")

        print(f"\nAgent ID: {agent_id}")
        print("Done.")
    elif r.status_code == 401:
        print("ERROR: Session cookie expired")
        sys.exit(2)
    else:
        print(f"ERROR: Agent creation failed: {r.status_code}")
        print(f"  {r.text[:500]}")
        sys.exit(1)


if __name__ == "__main__":
    main()
