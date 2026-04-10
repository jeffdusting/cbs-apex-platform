#!/usr/bin/env python3
"""Project River — Weekly Feedback Report (Sprint 2)

Queries Supabase for correction documents and produces a weekly summary
per agent role, showing correction counts, task types, and trends.

Usage:
    source scripts/env-setup.sh
    python scripts/feedback-report.py
    python scripts/feedback-report.py --days 14    # Custom lookback period
"""

import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import httpx


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


def main():
    parser = argparse.ArgumentParser(description="Generate weekly feedback report")
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Lookback period in days (default: 7)",
    )
    args = parser.parse_args()

    supabase_url = get_env("SUPABASE_URL")
    supabase_key = get_env("SUPABASE_SERVICE_ROLE_KEY")

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
    }

    # Calculate date range
    now = datetime.now(timezone.utc)
    lookback = now - timedelta(days=args.days)
    lookback_iso = lookback.isoformat()

    print("=" * 60)
    print(f"Project River — Feedback Report")
    print(f"Period: {lookback.strftime('%d %b %Y')} — {now.strftime('%d %b %Y')} ({args.days} days)")
    print("=" * 60)

    # Query all correction documents within the lookback period
    params = {
        "category": "eq.correction",
        "created_at": f"gte.{lookback_iso}",
        "order": "created_at.desc",
        "limit": 500,
    }

    response = httpx.get(
        f"{supabase_url}/rest/v1/documents",
        headers=headers,
        params=params,
    )

    if response.status_code != 200:
        print(f"ERROR: Supabase query failed — {response.status_code}: {response.text[:200]}")
        sys.exit(1)

    corrections = response.json()

    if not corrections:
        print("\nNo corrections found in this period.")
        print("This is expected if no operator feedback has been ingested yet.")
        print("\nTo ingest a correction:")
        print("  1. Create a correction document in knowledge-base/corrections/")
        print("  2. Run: python scripts/ingest-knowledge-base.py --file <path> --entity <entity> --category correction")
        sys.exit(0)

    # Aggregate by agent role
    by_role = defaultdict(list)
    by_task_type = defaultdict(int)
    by_entity = defaultdict(int)

    for doc in corrections:
        metadata = doc.get("metadata", {})
        if isinstance(metadata, str):
            metadata = json.loads(metadata)

        role = metadata.get("agent_role", "unknown")
        task_type = metadata.get("task_type", "unspecified")
        entity = doc.get("entity", "unknown")

        by_role[role].append(doc)
        by_task_type[task_type] += 1
        by_entity[entity] += 1

    # Report
    print(f"\nTotal corrections: {len(corrections)}")
    print(f"Entities: {dict(by_entity)}")
    print(f"Task types: {dict(by_task_type)}")

    print(f"\n{'Agent Role':<30} {'Count':<8} {'Task Types'}")
    print("-" * 70)

    for role in sorted(by_role.keys()):
        docs = by_role[role]
        task_types = defaultdict(int)
        for d in docs:
            meta = d.get("metadata", {})
            if isinstance(meta, str):
                meta = json.loads(meta)
            task_types[meta.get("task_type", "unspecified")] += 1

        types_str = ", ".join(f"{t}({c})" for t, c in sorted(task_types.items()))
        print(f"  {role:<28} {len(docs):<8} {types_str}")

    # Recent corrections detail
    print(f"\n{'=' * 60}")
    print("Recent Corrections (last 5)")
    print("=" * 60)

    for doc in corrections[:5]:
        metadata = doc.get("metadata", {})
        if isinstance(metadata, str):
            metadata = json.loads(metadata)

        print(f"\n  Role: {metadata.get('agent_role', 'unknown')}")
        print(f"  Task: {metadata.get('task_type', 'unspecified')}")
        print(f"  Issue: {metadata.get('issue_ref', 'N/A')}")
        print(f"  Date: {doc.get('created_at', 'N/A')[:10]}")
        print(f"  Title: {doc.get('title', 'N/A')}")

    print(f"\n{'=' * 60}")
    print("Report complete.")


if __name__ == "__main__":
    main()
