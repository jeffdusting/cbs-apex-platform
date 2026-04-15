#!/usr/bin/env python3
"""
Register the async evaluation pipeline as a Paperclip routine.

Usage:
    python3 scripts/create-evaluator-routine.py             # preview
    python3 scripts/create-evaluator-routine.py --execute    # register
"""

import argparse
import json
import os
import sys

import httpx

PAPERCLIP_API_URL = os.environ.get("PAPERCLIP_API_URL", "https://org.cbslab.app")
PAPERCLIP_COOKIE = os.environ.get("PAPERCLIP_SESSION_COOKIE", "")
CBS_COMPANY_ID = "fafce870-b862-4754-831e-2cd10e8b203c"
CBS_EXECUTIVE_ID = "01273fb5"  # Short ID — will be resolved


def paperclip_headers() -> dict:
    return {
        "Cookie": f"__Secure-better-auth.session_token={PAPERCLIP_COOKIE}",
        "Content-Type": "application/json",
    }


def resolve_agent_id(short_id: str) -> str | None:
    headers = paperclip_headers()
    r = httpx.get(
        f"{PAPERCLIP_API_URL}/api/companies/{CBS_COMPANY_ID}/agents",
        headers=headers,
        timeout=15,
    )
    if r.status_code == 200:
        agents = r.json()
        if isinstance(agents, dict):
            agents = agents.get("agents", agents.get("data", []))
        for agent in agents:
            if agent.get("id", "").startswith(short_id):
                return agent["id"]
    return None


def main():
    parser = argparse.ArgumentParser(description="Register evaluator routine")
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()

    if not PAPERCLIP_COOKIE:
        print("ERROR: PAPERCLIP_SESSION_COOKIE must be set")
        sys.exit(2)

    routine_spec = {
        "name": "Output evaluation pipeline",
        "description": "Runs evaluate-outputs.py to score unscored agent traces every 2 hours",
        "cron": "0 */2 * * *",
        "taskTitle": "Run output evaluation pipeline",
        "taskDescription": (
            "Run the output evaluation pipeline to score unscored agent traces.\n\n"
            "Execute: python3 scripts/evaluate-outputs.py --batch-size 50\n\n"
            "Report the results: traces scored, pass/fail counts, correction proposals generated."
        ),
    }

    print("=== Evaluator Routine ===")
    print(f"  Name: {routine_spec['name']}")
    print(f"  Cron: {routine_spec['cron']} (every 2 hours)")
    print(f"  Agent: CBS Executive")
    print(f"  Company: CBS Group")
    print()

    if not args.execute:
        print(f"API call (preview):")
        print(f"  POST {PAPERCLIP_API_URL}/api/companies/{CBS_COMPANY_ID}/routines")
        print(f"  Payload: {json.dumps(routine_spec, indent=2)}")
        print(f"\nRun with --execute to register.")
        sys.exit(0)

    # Resolve agent ID
    agent_id = resolve_agent_id(CBS_EXECUTIVE_ID)
    if not agent_id:
        print(f"ERROR: Could not resolve CBS Executive agent ID ({CBS_EXECUTIVE_ID})")
        sys.exit(2)

    routine_spec["agentId"] = agent_id

    headers = paperclip_headers()
    r = httpx.post(
        f"{PAPERCLIP_API_URL}/api/companies/{CBS_COMPANY_ID}/routines",
        headers=headers,
        json=routine_spec,
        timeout=30,
    )

    if r.status_code in (200, 201):
        routine = r.json()
        print(f"  Routine created: {routine.get('id', 'unknown')}")
        print(f"  Name: {routine.get('name', '?')}")
        print("Done.")
    elif r.status_code == 401:
        print("ERROR: Session cookie expired")
        sys.exit(2)
    else:
        print(f"ERROR: {r.status_code} — {r.text[:300]}")
        sys.exit(1)


if __name__ == "__main__":
    main()
