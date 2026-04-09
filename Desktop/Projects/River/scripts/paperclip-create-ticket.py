#!/usr/bin/env python3
"""Project River — Ticket Creation Utility (Task 1.12)

Creates an issue (ticket) in Paperclip assigned to a specific agent.

Usage:
    source scripts/env-setup.sh

    python scripts/paperclip-create-ticket.py \\
        --company-id <id> \\
        --title "Daily tender opportunity scan" \\
        --description "Scan AusTender for new opportunities matching CBS sector keywords" \\
        --assignee-agent-id <agent-id> \\
        --project-id <project-id> \\
        --priority medium

    Or load description from a file:
    python scripts/paperclip-create-ticket.py \\
        --company-id <id> \\
        --title "Board paper preparation" \\
        --file task-description.md \\
        --assignee-agent-id <agent-id>
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


def main():
    parser = argparse.ArgumentParser(description="Create a Paperclip issue (ticket)")
    parser.add_argument("--company-id", required=True, help="Company ID")
    parser.add_argument("--title", required=True, help="Issue title")
    parser.add_argument("--description", help="Issue description text")
    parser.add_argument("--file", help="Read description from file (alternative to --description)")
    parser.add_argument("--assignee-agent-id", help="Agent ID to assign the issue to")
    parser.add_argument("--project-id", help="Project ID to associate the issue with")
    parser.add_argument(
        "--priority",
        choices=["low", "medium", "high", "urgent"],
        default="medium",
        help="Issue priority (default: medium)",
    )
    args = parser.parse_args()

    base_url = get_env("PAPERCLIP_URL").rstrip("/")
    api_key = get_env("PAPERCLIP_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # Resolve description
    description = args.description
    if args.file:
        try:
            with open(args.file, "r", encoding="utf-8") as f:
                description = f.read()
        except FileNotFoundError:
            print(f"ERROR: File not found: {args.file}")
            sys.exit(1)

    if not description:
        print("ERROR: Either --description or --file is required.")
        sys.exit(1)

    # Build payload
    payload = {
        "title": args.title,
        "description": description,
        "priority": args.priority,
    }

    if args.assignee_agent_id:
        payload["assigneeAgentId"] = args.assignee_agent_id

    if args.project_id:
        payload["projectId"] = args.project_id

    # Create the issue
    print(f"Creating issue in company {args.company_id}...")
    print(f"  Title: {args.title}")
    print(f"  Priority: {args.priority}")
    if args.assignee_agent_id:
        print(f"  Assignee: {args.assignee_agent_id}")
    if args.project_id:
        print(f"  Project: {args.project_id}")

    resp = requests.post(
        f"{base_url}/api/companies/{args.company_id}/issues",
        headers=headers,
        json=payload,
    )

    if resp.status_code in (200, 201):
        data = resp.json()
        issue_id = data.get("id", data.get("issueId", "unknown"))
        issue_number = data.get("number", data.get("issueNumber", "N/A"))
        print(f"\n  CREATED: Issue #{issue_number} (id={issue_id})")
        print(f"  Status: {data.get('status', 'todo')}")
        print(json.dumps(data, indent=2))
    else:
        print(f"\n  ERROR: {resp.status_code} — {resp.text}")
        sys.exit(1)


if __name__ == "__main__":
    main()
