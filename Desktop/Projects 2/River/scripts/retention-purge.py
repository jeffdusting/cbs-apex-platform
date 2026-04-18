#!/usr/bin/env python3
"""
Scheduled retention purge — enforces docs/policies/data-retention-policy.md.

Deletes rows older than the configured retention window for each table.
Defaults to --dry-run; must pass --execute to actually delete.

Usage:
    python3 scripts/retention-purge.py                      # dry-run, all tables
    python3 scripts/retention-purge.py --execute            # actually delete
    python3 scripts/retention-purge.py --table agent_traces # limit to one table
    python3 scripts/retention-purge.py --execute --table correction_proposals

Exit codes:
    0 = success
    1 = one or more tables failed
    2 = configuration error
"""

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone

import httpx


# table -> (retention_days, extra_filter)
# extra_filter is a dict of PostgREST query parameters added to the DELETE.
RETENTION_RULES: dict[str, tuple[int, dict]] = {
    "agent_traces": (90, {}),
    "evaluation_scores": (365, {}),
    "correction_proposals": (90, {"status": "in.(ingested,rejected)"}),
}


def supabase_headers(key: str) -> dict:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "count=exact",
    }


def cutoff_iso(days: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


def count_expired(url: str, key: str, table: str, days: int, extra: dict) -> int:
    headers = supabase_headers(key)
    headers["Prefer"] = "count=exact"
    params = {
        "created_at": f"lt.{cutoff_iso(days)}",
        "select": "id",
        "limit": "1",
    }
    params.update(extra)
    r = httpx.get(f"{url}/rest/v1/{table}", headers=headers, params=params, timeout=30)
    r.raise_for_status()
    content_range = r.headers.get("content-range", "0-0/0")
    try:
        return int(content_range.rsplit("/", 1)[-1])
    except ValueError:
        return 0


def delete_expired(url: str, key: str, table: str, days: int, extra: dict) -> int:
    headers = supabase_headers(key)
    headers["Prefer"] = "return=representation,count=exact"
    params = {"created_at": f"lt.{cutoff_iso(days)}"}
    params.update(extra)
    r = httpx.delete(f"{url}/rest/v1/{table}", headers=headers, params=params, timeout=60)
    r.raise_for_status()
    deleted = r.json() if r.text else []
    return len(deleted)


def main() -> None:
    parser = argparse.ArgumentParser(description="River retention purge")
    parser.add_argument("--execute", action="store_true", help="Actually delete rows (default: dry-run)")
    parser.add_argument("--table", choices=list(RETENTION_RULES.keys()), help="Limit to one table")
    parser.add_argument("--supabase", choices=["cbs", "wr"], default="cbs", help="Which Supabase instance")
    args = parser.parse_args()

    if args.supabase == "cbs":
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    else:
        url = os.environ.get("WR_SUPABASE_URL", "")
        key = os.environ.get("WR_SUPABASE_SERVICE_ROLE_KEY", "")

    if not url or not key:
        print(f"ERROR: Supabase env vars for '{args.supabase}' not set")
        sys.exit(2)

    tables = [args.table] if args.table else list(RETENTION_RULES.keys())
    mode = "EXECUTE" if args.execute else "DRY-RUN"
    print(f"=== Retention purge ({mode}, {args.supabase}) — {datetime.now(timezone.utc).isoformat()} ===")

    failures = 0
    total_expired = 0
    total_deleted = 0

    for table in tables:
        days, extra = RETENTION_RULES[table]
        try:
            expired = count_expired(url, key, table, days, extra)
            total_expired += expired
            print(f"  {table}: {expired} rows older than {days}d")

            if args.execute and expired > 0:
                deleted = delete_expired(url, key, table, days, extra)
                total_deleted += deleted
                print(f"    deleted {deleted} rows")
        except httpx.HTTPError as e:
            failures += 1
            print(f"  {table}: FAILED — {e}")

    print(f"\nTotal expired: {total_expired}; deleted: {total_deleted}; failures: {failures}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
