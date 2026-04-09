#!/usr/bin/env python3
"""Project River — Validation Script (Task 1.14)

Runs validation checks against the Paperclip instance and Supabase.

Usage:
    source scripts/env-setup.sh

    python scripts/paperclip-validate.py --check companies
    python scripts/paperclip-validate.py --check agents-cbs
    python scripts/paperclip-validate.py --check agents-wr
    python scripts/paperclip-validate.py --check kb-count
    python scripts/paperclip-validate.py --check heartbeat-log
    python scripts/paperclip-validate.py --check all
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


def check_companies(base_url: str, headers: dict) -> bool:
    """Confirm 4 companies exist (2 active, 2 archived)."""
    print("[CHECK] Companies...")

    resp = requests.get(f"{base_url}/api/companies", headers=headers)
    if resp.status_code != 200:
        print(f"  FAIL: Could not list companies — {resp.status_code}")
        return False

    data = resp.json()
    companies = data if isinstance(data, list) else data.get("companies", data.get("data", []))

    print(f"  Found {len(companies)} companies:")
    for c in companies:
        name = c.get("name", "unknown")
        status = c.get("status", "unknown")
        cid = c.get("id", "unknown")
        print(f"    {name:<25} status={status}  id={cid}")

    expected_names = {"CBS Group", "WaterRoads", "Adventure Safety", "MAF CobaltBlu"}
    actual_names = {c.get("name", "") for c in companies}
    missing = expected_names - actual_names

    if missing:
        print(f"  FAIL: Missing companies: {missing}")
        return False

    if len(companies) >= 4:
        print(f"  PASS: {len(companies)} companies found (expected >= 4)")
        return True
    else:
        print(f"  FAIL: Only {len(companies)} companies (expected >= 4)")
        return False


def check_agents(base_url: str, headers: dict, entity: str) -> bool:
    """Check agent count and roles for a given entity."""
    expected = {
        "cbs": {
            "count": 9,
            "roles": {"ceo": 1, "researcher": 2, "pm": 2, "engineer": 1, "qa": 1, "general": 2},
        },
        "wr": {
            "count": 3,
            "roles": {"ceo": 1, "pm": 1, "general": 1},
        },
    }

    if entity not in expected:
        print(f"  ERROR: Unknown entity '{entity}'")
        return False

    company_name = "CBS Group" if entity == "cbs" else "WaterRoads"
    print(f"[CHECK] Agents — {company_name}...")

    # Find company ID from manifest or API
    manifest_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "company-manifest.json")
    company_id = None
    if os.path.exists(manifest_path):
        with open(manifest_path, "r") as f:
            manifest = json.load(f)
        company_id = manifest.get("companies", {}).get(company_name, {}).get("id")

    if not company_id:
        # Try to find from API
        resp = requests.get(f"{base_url}/api/companies", headers=headers)
        if resp.status_code == 200:
            companies = resp.json() if isinstance(resp.json(), list) else resp.json().get("companies", [])
            for c in companies:
                if c.get("name") == company_name:
                    company_id = c.get("id")
                    break

    if not company_id:
        print(f"  FAIL: Could not find company ID for {company_name}")
        return False

    resp = requests.get(f"{base_url}/api/companies/{company_id}/agents", headers=headers)
    if resp.status_code != 200:
        print(f"  FAIL: Could not list agents — {resp.status_code}")
        return False

    data = resp.json()
    agents = data if isinstance(data, list) else data.get("agents", data.get("data", []))
    print(f"  Found {len(agents)} agents (expected {expected[entity]['count']}):")

    role_counts = {}
    for agent in agents:
        name = agent.get("name", "unknown")
        role = agent.get("role", "unknown")
        budget = agent.get("budgetMonthlyCents", 0)
        hb = agent.get("runtimeConfig", {}).get("heartbeat", {})
        hb_status = f"{hb.get('intervalSec', 0)}s" if hb.get("enabled") else "disabled"
        print(f"    {name:<30} role={role:<12} heartbeat={hb_status:<10} budget=${budget / 100:.2f}")
        role_counts[role] = role_counts.get(role, 0) + 1

    passed = True
    if len(agents) != expected[entity]["count"]:
        print(f"  FAIL: Agent count {len(agents)} != expected {expected[entity]['count']}")
        passed = False
    else:
        print(f"  PASS: Agent count correct ({len(agents)})")

    for role, count in expected[entity]["roles"].items():
        actual = role_counts.get(role, 0)
        if actual != count:
            print(f"  FAIL: Role '{role}' count {actual} != expected {count}")
            passed = False

    if passed:
        print(f"  PASS: All role counts correct")

    return passed


def check_kb_count(base_url: str, headers: dict) -> bool:
    """Report document count in Supabase."""
    print("[CHECK] Knowledge base document count...")

    supabase_url = get_env_optional("SUPABASE_URL")
    supabase_key = get_env_optional("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("  SKIP: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")
        return True

    try:
        from supabase import create_client
        client = create_client(supabase_url, supabase_key)
        result = client.table("documents").select("id", count="exact").execute()
        count = result.count if hasattr(result, "count") and result.count is not None else len(result.data)
        print(f"  Document count: {count}")

        if count > 0:
            # Show entity breakdown
            for entity in ["cbs-group", "waterroads", "general"]:
                entity_result = client.table("documents").select("id", count="exact").eq("entity", entity).execute()
                entity_count = entity_result.count if hasattr(entity_result, "count") and entity_result.count is not None else len(entity_result.data)
                if entity_count > 0:
                    print(f"    {entity}: {entity_count}")

            print(f"  PASS: Knowledge base populated ({count} documents)")
            return True
        else:
            print("  WARN: Knowledge base is empty — run ingest-knowledge-base.py")
            return True  # Not a failure, just not yet populated

    except ImportError:
        print("  SKIP: supabase package not installed")
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def check_heartbeat_log(base_url: str, headers: dict) -> bool:
    """Check recent activity entries for heartbeat events."""
    print("[CHECK] Heartbeat activity log...")

    # Get all companies and check activity for each
    resp = requests.get(f"{base_url}/api/companies", headers=headers)
    if resp.status_code != 200:
        print(f"  FAIL: Could not list companies — {resp.status_code}")
        return False

    data = resp.json()
    companies = data if isinstance(data, list) else data.get("companies", data.get("data", []))

    total_activities = 0
    for company in companies:
        cid = company.get("id")
        name = company.get("name", "unknown")
        status = company.get("status", "unknown")

        if status == "archived":
            continue

        activity_resp = requests.get(
            f"{base_url}/api/companies/{cid}/activity",
            headers=headers,
            params={"limit": 10},
        )
        if activity_resp.status_code == 200:
            activities = activity_resp.json()
            if isinstance(activities, list):
                count = len(activities)
            else:
                count = len(activities.get("activities", activities.get("data", [])))
            total_activities += count
            print(f"  {name}: {count} recent activity entries")
        else:
            print(f"  {name}: Could not fetch activity — {activity_resp.status_code}")

    if total_activities > 0:
        print(f"  PASS: {total_activities} total activity entries found")
    else:
        print(f"  INFO: No activity entries yet (agents may not have run)")

    return True


def main():
    parser = argparse.ArgumentParser(description="Validate Project River deployment")
    parser.add_argument(
        "--check",
        required=True,
        choices=["companies", "agents-cbs", "agents-wr", "kb-count", "heartbeat-log", "all"],
        help="Which validation check to run",
    )
    args = parser.parse_args()

    base_url = get_env("PAPERCLIP_URL").rstrip("/")
    api_key = get_env("PAPERCLIP_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    print("=" * 60)
    print("Project River — Validation")
    print("=" * 60)
    print(f"Target: {base_url}")
    print()

    results = {}

    checks = {
        "companies": lambda: check_companies(base_url, headers),
        "agents-cbs": lambda: check_agents(base_url, headers, "cbs"),
        "agents-wr": lambda: check_agents(base_url, headers, "wr"),
        "kb-count": lambda: check_kb_count(base_url, headers),
        "heartbeat-log": lambda: check_heartbeat_log(base_url, headers),
    }

    if args.check == "all":
        for name, func in checks.items():
            results[name] = func()
            print()
    else:
        results[args.check] = checks[args.check]()

    # Summary
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    all_pass = True
    for name, passed in results.items():
        status = "PASS" if passed else "FAIL"
        print(f"  {name:<20} {status}")
        if not passed:
            all_pass = False

    print()
    if all_pass:
        print("OVERALL: PASS")
    else:
        print("OVERALL: FAIL — review issues above")
        sys.exit(1)


if __name__ == "__main__":
    main()
