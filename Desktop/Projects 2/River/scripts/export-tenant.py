#!/usr/bin/env python3
"""
Per-tenant export — dumps all data for a given entity to NDJSON files.

Doubles as a lightweight backup and as the mechanism for honouring a
tenant "give me my data" request (IB.9).

Usage:
    python3 scripts/export-tenant.py --entity cbs-group \\
        --output exports/cbs-2026-04-19/
    python3 scripts/export-tenant.py --entity waterroads \\
        --output exports/wr-2026-04-19/ --since 2026-01-01
    python3 scripts/export-tenant.py --entity cbs-group \\
        --output exports/cbs-2026-04-19/ --tables documents,tender_register

Output layout:
    <output>/documents.ndjson
    <output>/tender_register.ndjson
    <output>/governance_register.ndjson
    <output>/agent_traces.ndjson
    <output>/evaluation_scores.ndjson
    <output>/correction_proposals.ndjson
    <output>/prompt_templates.ndjson
    <output>/manifest.json        (row counts, arguments, timestamp)

Each `.ndjson` is one JSON object per line (streamable).

Environment:
    SUPABASE_URL                   — base URL for the target project
    SUPABASE_SERVICE_ROLE_KEY      — service-role key (required; export
                                     must bypass RLS to be complete)
    WR_SUPABASE_URL / WR_SUPABASE_SERVICE_ROLE_KEY — WR equivalents,
                                     used automatically when --entity
                                     is a WR tenant

The --since filter applies to tables with a `created_at` column. Tables
without one are exported in full regardless of --since.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import httpx


# ---------------------------------------------------------------------------
# Entity → (company_id, DB env-var pair) mapping
# ---------------------------------------------------------------------------

ENTITIES: dict[str, dict[str, str]] = {
    "cbs-group": {
        "company_id": "fafce870-b862-4754-831e-2cd10e8b203c",
        "url_env": "SUPABASE_URL",
        "key_env": "SUPABASE_SERVICE_ROLE_KEY",
    },
    "waterroads": {
        "company_id": "95a248d4-08e7-4879-8e66-5d1ff948e005",
        "url_env": "WR_SUPABASE_URL",
        "key_env": "WR_SUPABASE_SERVICE_ROLE_KEY",
    },
}

# Table name → whether it supports a `created_at`-based --since filter,
# and whether it is scoped by company_id.
TABLE_META: dict[str, dict[str, bool]] = {
    "documents": {"has_created_at": True, "scoped_by_company": True},
    "tender_register": {"has_created_at": True, "scoped_by_company": True},
    "governance_register": {"has_created_at": True, "scoped_by_company": True},
    "agent_traces": {"has_created_at": True, "scoped_by_company": True},
    "evaluation_scores": {"has_created_at": True, "scoped_by_company": False},
    "correction_proposals": {"has_created_at": True, "scoped_by_company": True},
    "prompt_templates": {"has_created_at": False, "scoped_by_company": True},
}

# Order matters only for human readability of the manifest.
DEFAULT_TABLES: list[str] = list(TABLE_META.keys())

PAGE_SIZE = 1000


# ---------------------------------------------------------------------------
# HTTP / Supabase REST helpers
# ---------------------------------------------------------------------------


def supabase_headers(key: str) -> dict[str, str]:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    }


def iter_table(
    url: str,
    key: str,
    table: str,
    company_id: str | None,
    since: str | None,
) -> Iterable[dict[str, Any]]:
    """Yield rows from a Supabase table in pages of PAGE_SIZE."""
    meta = TABLE_META[table]
    base_params: dict[str, str] = {}
    if meta["scoped_by_company"] and company_id:
        base_params["company_id"] = f"eq.{company_id}"
    if since and meta["has_created_at"]:
        base_params["created_at"] = f"gte.{since}"
    # Stable order so resume-from-offset is deterministic.
    if meta["has_created_at"]:
        base_params["order"] = "created_at.asc"
    else:
        base_params["order"] = "id.asc"

    offset = 0
    headers = supabase_headers(key)
    while True:
        params = dict(base_params)
        params["limit"] = str(PAGE_SIZE)
        params["offset"] = str(offset)
        r = httpx.get(
            f"{url}/rest/v1/{table}",
            headers=headers,
            params=params,
            timeout=60,
        )
        if r.status_code == 404:
            # Table does not exist on this project (e.g. WR has no
            # prompt_templates yet). Caller decides whether to warn.
            return
        r.raise_for_status()
        batch = r.json()
        if not batch:
            return
        for row in batch:
            yield row
        if len(batch) < PAGE_SIZE:
            return
        offset += PAGE_SIZE


# ---------------------------------------------------------------------------
# Export logic
# ---------------------------------------------------------------------------


def export_table(
    url: str,
    key: str,
    table: str,
    company_id: str | None,
    since: str | None,
    out_path: Path,
) -> int:
    count = 0
    with out_path.open("w", encoding="utf-8") as fh:
        for row in iter_table(url, key, table, company_id, since):
            fh.write(json.dumps(row, ensure_ascii=False, default=str))
            fh.write("\n")
            count += 1
    return count


def validate_since(value: str) -> str:
    # Accepts ISO date or datetime; normalises to ISO-8601 with timezone.
    try:
        if "T" in value:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        else:
            dt = datetime.fromisoformat(value).replace(tzinfo=timezone.utc)
    except ValueError as e:
        raise argparse.ArgumentTypeError(
            f"--since must be ISO-8601 (YYYY-MM-DD or full datetime): {e}"
        )
    return dt.isoformat()


def parse_tables(value: str) -> list[str]:
    tables = [t.strip() for t in value.split(",") if t.strip()]
    unknown = [t for t in tables if t not in TABLE_META]
    if unknown:
        raise argparse.ArgumentTypeError(
            f"Unknown tables: {', '.join(unknown)}. "
            f"Known: {', '.join(TABLE_META)}"
        )
    return tables


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export all data for a tenant to NDJSON"
    )
    parser.add_argument(
        "--entity",
        required=True,
        choices=sorted(ENTITIES),
        help="Tenant identifier",
    )
    parser.add_argument(
        "--output",
        required=True,
        type=Path,
        help="Output directory (created if missing)",
    )
    parser.add_argument(
        "--since",
        type=validate_since,
        default=None,
        help="Only export rows with created_at >= this ISO date/datetime",
    )
    parser.add_argument(
        "--tables",
        type=parse_tables,
        default=DEFAULT_TABLES,
        help="Comma-separated table list (default: all known tables)",
    )
    args = parser.parse_args()

    entity = ENTITIES[args.entity]
    url = os.environ.get(entity["url_env"], "")
    key = os.environ.get(entity["key_env"], "")
    if not url or not key:
        print(
            f"ERROR: {entity['url_env']} and {entity['key_env']} must be set",
            file=sys.stderr,
        )
        sys.exit(2)

    args.output.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, Any] = {
        "entity": args.entity,
        "company_id": entity["company_id"],
        "since": args.since,
        "tables": {},
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "tool": "scripts/export-tenant.py",
    }

    any_errors = False
    for table in args.tables:
        out_path = args.output / f"{table}.ndjson"
        try:
            count = export_table(
                url=url,
                key=key,
                table=table,
                company_id=entity["company_id"],
                since=args.since,
                out_path=out_path,
            )
            print(f"{table}: {count} rows -> {out_path}")
            manifest["tables"][table] = {"rows": count, "file": out_path.name}
        except httpx.HTTPError as e:
            any_errors = True
            print(f"{table}: ERROR {e}", file=sys.stderr)
            manifest["tables"][table] = {"error": str(e)}

    manifest_path = args.output / "manifest.json"
    with manifest_path.open("w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, default=str)
    print(f"manifest: {manifest_path}")

    sys.exit(1 if any_errors else 0)


if __name__ == "__main__":
    main()
