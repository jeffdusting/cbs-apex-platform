#!/usr/bin/env python3
"""
Blocked-work detection — queries agent_traces for errors and reports blockers.

Usage:
    python3 scripts/check-blocked-work.py                  # last 24 hours
    python3 scripts/check-blocked-work.py --since 6        # last 6 hours
    python3 scripts/check-blocked-work.py --notify          # send Teams alert
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import httpx


def categorise_error(error_text: str) -> str:
    """Categorise an error into standard buckets."""
    error_lower = error_text.lower()
    if any(k in error_lower for k in ["skill", "not found", "no skill", "cannot find skill"]):
        return "missing_skill"
    if any(k in error_lower for k in ["key", "token", "auth", "401", "403", "credential"]):
        return "missing_key"
    if any(k in error_lower for k in ["unavailable", "unreachable", "timeout", "connection", "502", "503"]):
        return "service_unavailable"
    if any(k in error_lower for k in ["dependency", "waiting", "blocked", "not available"]):
        return "dependency_blocked"
    return "other"


def main():
    parser = argparse.ArgumentParser(description="Check for blocked work in agent traces")
    parser.add_argument("--since", type=int, default=24, help="Look back N hours (default: 24)")
    parser.add_argument("--notify", action="store_true", help="Send Teams notification")
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not supabase_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(2)

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
    }

    cutoff = (datetime.now(timezone.utc) - timedelta(hours=args.since)).isoformat()

    # Query traces with errors
    r = httpx.get(
        f"{supabase_url}/rest/v1/agent_traces",
        headers=headers,
        params={
            "error": "not.is.null",
            "created_at": f"gte.{cutoff}",
            "select": "id,agent_role,task_type,error,confidence,created_at",
            "order": "created_at.desc",
            "limit": "200",
        },
    )

    if r.status_code != 200:
        print(f"ERROR: Query failed: {r.status_code}")
        sys.exit(2)

    traces = r.json()

    if not traces:
        print(f"No blocked work detected in the last {args.since} hours.")
        sys.exit(0)

    # Group by category
    by_category = defaultdict(list)
    for t in traces:
        category = categorise_error(t["error"])
        by_category[category].append(t)

    print(f"BLOCKED WORK DETECTED — {len(traces)} traces with errors in last {args.since}h\n")

    report_lines = []
    for category, items in sorted(by_category.items()):
        print(f"  {category.upper()} ({len(items)} traces):")
        report_lines.append(f"{category}: {len(items)} traces")
        agents = set()
        for item in items:
            agents.add(item["agent_role"])
            print(
                f"    - {item['agent_role']} / {item['task_type']}: "
                f"{item['error'][:100]}"
            )
        report_lines.append(f"  Agents: {', '.join(sorted(agents))}")
        print()

    # Send Teams notification if requested
    if args.notify:
        webhook_url = os.environ.get("TEAMS_WEBHOOK_URL", "")
        if not webhook_url:
            print("WARN: TEAMS_WEBHOOK_URL not set — cannot send notification")
        else:
            digest = f"BLOCKED WORK ALERT — {len(traces)} errors in last {args.since}h\n\n"
            digest += "\n".join(report_lines)

            payload = {
                "type": "message",
                "attachments": [
                    {
                        "contentType": "application/vnd.microsoft.card.adaptive",
                        "content": {
                            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                            "type": "AdaptiveCard",
                            "version": "1.4",
                            "body": [
                                {
                                    "type": "TextBlock",
                                    "text": "BLOCKED WORK ALERT",
                                    "weight": "Bolder",
                                    "size": "Medium",
                                    "color": "Attention",
                                },
                                {
                                    "type": "TextBlock",
                                    "text": digest,
                                    "wrap": True,
                                    "size": "Small",
                                },
                            ],
                        },
                    }
                ],
            }
            try:
                nr = httpx.post(webhook_url, json=payload, timeout=10)
                if nr.status_code in (200, 202):
                    print("Teams notification sent.")
                else:
                    print(f"Teams notification failed: {nr.status_code}")
            except Exception as e:
                print(f"Teams notification error: {e}")

    sys.exit(1)  # Exit 1 = blocked work found


if __name__ == "__main__":
    main()
