#!/usr/bin/env python3
"""Project River — Heartbeat Interval Setter (Task 1.13)

Sets agent heartbeat intervals for test or production mode.

Usage:
    source scripts/env-setup.sh

    # Set all CBS agents to 30-minute test intervals:
    python scripts/paperclip-set-heartbeats.py --company-id <id> --mode test

    # Restore production intervals from stored config:
    python scripts/paperclip-set-heartbeats.py --company-id <id> --mode production
"""

import argparse
import json
import os
import sys

import requests


TEST_INTERVAL_SEC = 1800  # 30 minutes for test mode


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


def get_agents(base_url: str, headers: dict, company_id: str) -> list[dict]:
    """Retrieve all agents for a company."""
    resp = requests.get(f"{base_url}/api/companies/{company_id}/agents", headers=headers)
    if resp.status_code != 200:
        print(f"ERROR: Failed to list agents — {resp.status_code}: {resp.text}")
        sys.exit(1)
    data = resp.json()
    # Handle both list and paginated responses
    if isinstance(data, list):
        return data
    return data.get("agents", data.get("data", []))


def set_heartbeat(base_url: str, headers: dict, agent_id: str, heartbeat_config: dict) -> bool:
    """Update an agent's heartbeat configuration."""
    payload = {
        "runtimeConfig": {
            "heartbeat": heartbeat_config,
        }
    }
    resp = requests.patch(
        f"{base_url}/api/agents/{agent_id}",
        headers=headers,
        json=payload,
    )
    return resp.status_code in (200, 204)


def get_config_path(company_id: str) -> str:
    """Get the path for the stored heartbeat config file."""
    return os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        f"heartbeat-config-{company_id}.json",
    )


def save_production_config(company_id: str, agents: list[dict]):
    """Save current heartbeat config as the production baseline."""
    config = {}
    for agent in agents:
        agent_id = agent.get("id", agent.get("agentId"))
        heartbeat = agent.get("runtimeConfig", {}).get("heartbeat", {})
        config[agent_id] = {
            "name": agent.get("name", "unknown"),
            "heartbeat": heartbeat,
        }

    config_path = get_config_path(company_id)
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    print(f"Production config saved to {config_path}")


def load_production_config(company_id: str) -> dict:
    """Load the saved production heartbeat config."""
    config_path = get_config_path(company_id)
    if not os.path.exists(config_path):
        print(f"ERROR: No saved production config found at {config_path}")
        print("Run with --mode test first to save production intervals before switching.")
        sys.exit(1)

    with open(config_path, "r") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(description="Set Paperclip agent heartbeat intervals")
    parser.add_argument("--company-id", required=True, help="Company ID")
    parser.add_argument(
        "--mode",
        required=True,
        choices=["test", "production"],
        help="'test' sets 30min intervals; 'production' restores saved config",
    )
    args = parser.parse_args()

    base_url = get_env("PAPERCLIP_URL").rstrip("/")
    api_key = get_env("PAPERCLIP_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    company_id = args.company_id

    print("=" * 60)
    print(f"Project River — Heartbeat Interval Setter ({args.mode} mode)")
    print("=" * 60)
    print(f"Company: {company_id}")
    print()

    # Get current agents
    agents = get_agents(base_url, headers, company_id)
    print(f"Found {len(agents)} agents")

    if args.mode == "test":
        # Save current production config before overwriting
        save_production_config(company_id, agents)
        print()

        # Set all agents to test interval
        print(f"Setting all agents to test mode ({TEST_INTERVAL_SEC}s / {TEST_INTERVAL_SEC // 60}min)...")
        for agent in agents:
            agent_id = agent.get("id", agent.get("agentId"))
            name = agent.get("name", "unknown")
            current_hb = agent.get("runtimeConfig", {}).get("heartbeat", {})

            test_config = {
                "enabled": True,
                "intervalSec": TEST_INTERVAL_SEC,
                "cooldownSec": current_hb.get("cooldownSec", 10),
                "wakeOnDemand": current_hb.get("wakeOnDemand", True),
                "maxConcurrentRuns": current_hb.get("maxConcurrentRuns", 1),
            }

            success = set_heartbeat(base_url, headers, agent_id, test_config)
            status = "OK" if success else "FAIL"
            print(f"  {name:<30} {status}  (was {current_hb.get('intervalSec', 'N/A')}s -> {TEST_INTERVAL_SEC}s)")

    elif args.mode == "production":
        # Restore from saved config
        production_config = load_production_config(company_id)
        print("Restoring production heartbeat intervals...\n")

        for agent in agents:
            agent_id = agent.get("id", agent.get("agentId"))
            name = agent.get("name", "unknown")

            if agent_id in production_config:
                saved = production_config[agent_id]
                heartbeat = saved["heartbeat"]
                success = set_heartbeat(base_url, headers, agent_id, heartbeat)
                status = "OK" if success else "FAIL"
                enabled = heartbeat.get("enabled", False)
                interval = heartbeat.get("intervalSec", 0)
                mode_str = f"{interval}s" if enabled else "disabled"
                print(f"  {name:<30} {status}  (restored to {mode_str})")
            else:
                print(f"  {name:<30} SKIP  (no saved config)")

    print("\nDone.")


if __name__ == "__main__":
    main()
