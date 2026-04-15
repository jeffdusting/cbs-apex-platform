#!/usr/bin/env python3
"""
Generate Paperclip API calls to assign trace-capture and self-check skills
to all 12 active agents. Does NOT execute unless --execute is passed.

Usage:
    python3 scripts/prepare-trace-skill-sync.py             # preview commands
    python3 scripts/prepare-trace-skill-sync.py --execute    # run API calls
"""

import argparse
import json
import os
import sys

import httpx

PAPERCLIP_API_URL = os.environ.get("PAPERCLIP_API_URL", "https://org.cbslab.app")
PAPERCLIP_COOKIE = os.environ.get("PAPERCLIP_SESSION_COOKIE", "")

# Agent roster from RIVER-STATUS.md
AGENTS = [
    {"id": "01273fb5", "name": "CBS Executive", "company": "CBS"},
    {"id": "1dcabe74", "name": "Tender Intelligence", "company": "CBS"},
    {"id": "69aa7cc8", "name": "Tender Coordination", "company": "CBS"},
    {"id": "31230e7a", "name": "Technical Writing", "company": "CBS"},
    {"id": "9f649467", "name": "Compliance", "company": "CBS"},
    {"id": "43468bee", "name": "Pricing and Commercial", "company": "CBS"},
    {"id": "beb7d905", "name": "Governance CBS", "company": "CBS"},
    {"id": "d5df66da", "name": "Office Management CBS", "company": "CBS"},
    {"id": "a0bb2e2a", "name": "Research CBS", "company": "CBS"},
    {"id": "00fb11a2", "name": "WR Executive", "company": "WR"},
    {"id": "10adea58", "name": "Governance WR", "company": "WR"},
    {"id": "9594ef21", "name": "Office Management WR", "company": "WR"},
]

NEW_SKILLS = ["trace-capture", "self-check"]


def paperclip_headers() -> dict:
    return {
        "Cookie": f"__Secure-better-auth.session_token={PAPERCLIP_COOKIE}",
        "Content-Type": "application/json",
        "Origin": PAPERCLIP_API_URL,
        "Referer": f"{PAPERCLIP_API_URL}/",
    }


def get_agent_full_id(short_id: str) -> str | None:
    """Resolve a short agent ID to the full UUID via the Paperclip API."""
    headers = paperclip_headers()
    for company_id in [
        "fafce870-b862-4754-831e-2cd10e8b203c",
        "95a248d4-08e7-4879-8e66-5d1ff948e005",
    ]:
        try:
            r = httpx.get(
                f"{PAPERCLIP_API_URL}/api/companies/{company_id}/agents",
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
        except Exception:
            continue
    return None


def get_agent_skills(agent_id: str) -> list[str]:
    """Get the current skill list for an agent."""
    headers = paperclip_headers()
    try:
        r = httpx.get(
            f"{PAPERCLIP_API_URL}/api/agents/{agent_id}",
            headers=headers,
            timeout=15,
        )
        if r.status_code == 200:
            agent = r.json()
            config = agent.get("adapterConfig", {})
            skills = config.get("skills", [])
            if isinstance(skills, list):
                return [s.get("name", s) if isinstance(s, dict) else s for s in skills]
        elif r.status_code == 401:
            print("ERROR: Session cookie expired")
            sys.exit(2)
    except Exception as e:
        print(f"  WARN: Could not fetch agent {agent_id[:8]}: {e}")
    return []


def sync_skills(agent_id: str, all_skills: list[str]) -> bool:
    """Sync skills to an agent via the Paperclip API."""
    headers = paperclip_headers()

    # Paperclip skill sync replaces all skills — include existing + new
    skill_payload = [{"name": s} for s in all_skills]

    try:
        r = httpx.patch(
            f"{PAPERCLIP_API_URL}/api/agents/{agent_id}",
            headers=headers,
            json={"adapterConfig": {"skills": skill_payload}},
            timeout=15,
        )
        if r.status_code in (200, 204):
            return True
        else:
            print(f"  ERROR: Skill sync returned {r.status_code}: {r.text[:200]}")
            return False
    except Exception as e:
        print(f"  ERROR: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Prepare trace skill sync for all agents")
    parser.add_argument("--execute", action="store_true", help="Actually run the API calls")
    args = parser.parse_args()

    if not PAPERCLIP_COOKIE:
        print("ERROR: PAPERCLIP_SESSION_COOKIE must be set")
        sys.exit(2)

    print(f"{'EXECUTING' if args.execute else 'PREVIEW'} — skill sync for {len(AGENTS)} agents\n")
    print(f"New skills to add: {NEW_SKILLS}\n")

    success = 0
    failed = 0

    for agent_info in AGENTS:
        short_id = agent_info["id"]
        name = agent_info["name"]

        # Resolve full ID
        if args.execute:
            full_id = get_agent_full_id(short_id)
            if not full_id:
                print(f"  {name} ({short_id}): SKIP — could not resolve full ID")
                failed += 1
                continue
        else:
            full_id = f"{short_id}-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

        # Get current skills
        if args.execute:
            current_skills = get_agent_skills(full_id)
        else:
            current_skills = ["(fetch from API)"]

        # Merge skills (avoid duplicates)
        merged = list(set(current_skills) | set(NEW_SKILLS))
        added = set(NEW_SKILLS) - set(current_skills)

        print(f"  {name} ({short_id}):")
        print(f"    Current: {current_skills}")
        print(f"    Adding:  {list(added) if added else '(already present)'}")
        print(f"    Result:  {merged}")

        if args.execute:
            if added:
                ok = sync_skills(full_id, merged)
                if ok:
                    print(f"    → SYNCED")
                    success += 1
                else:
                    print(f"    → FAILED")
                    failed += 1
            else:
                print(f"    → SKIP (skills already present)")
                success += 1
        print()

    print(f"\nSummary: {success} succeeded, {failed} failed")
    if not args.execute:
        print("Run with --execute to apply changes.")


if __name__ == "__main__":
    main()
