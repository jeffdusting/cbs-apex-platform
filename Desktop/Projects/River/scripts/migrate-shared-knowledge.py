#!/usr/bin/env python3
"""Project River — Sprint 2: Shared Knowledge Migration

Moves applicable documents from entity-specific to 'shared' entity.
Candidates: CAPITAL framework methodology, ISO standards references,
general Australian regulatory guidance.

Usage:
    source scripts/env-setup.sh
    python scripts/migrate-shared-knowledge.py --dry-run   # Preview only
    python scripts/migrate-shared-knowledge.py              # Execute migration
"""

import argparse
import os
import sys

from supabase import create_client, Client


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


# Documents to migrate to shared entity.
# These are relevant to both CBS Group and WaterRoads.
SHARED_PATTERNS = [
    # CAPITAL framework methodology — CBS proprietary but used across entities
    {"source_file_like": "%capital-methodology%", "reason": "CAPITAL framework — cross-entity methodology"},
    {"source_file_like": "%capital-framework%", "reason": "CAPITAL framework — cross-entity methodology"},
    # ISO standards
    {"source_file_like": "%iso-55001%", "reason": "ISO 55001 Asset Management — general reference"},
    {"source_file_like": "%iso-44001%", "reason": "ISO 44001 Collaborative Business — general reference"},
    # General regulatory and standards content
    {"source_file_like": "%australian-standards%", "reason": "Australian standards — general reference"},
    {"source_file_like": "%general-%", "reason": "General knowledge — cross-entity"},
]


def main():
    parser = argparse.ArgumentParser(description="Migrate documents to shared entity")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview migration without making changes",
    )
    args = parser.parse_args()

    supabase_url = get_env("SUPABASE_URL")
    supabase_key = get_env("SUPABASE_SERVICE_ROLE_KEY")

    supabase: Client = create_client(supabase_url, supabase_key)

    print("=" * 60)
    print(f"Project River — Shared Knowledge Migration {'(DRY RUN)' if args.dry_run else ''}")
    print("=" * 60)

    total_migrated = 0
    total_skipped = 0

    for pattern in SHARED_PATTERNS:
        like_pattern = pattern["source_file_like"]
        reason = pattern["reason"]

        # Find matching documents that are NOT already shared
        result = (
            supabase.table("documents")
            .select("id, entity, source_file, title")
            .like("source_file", like_pattern)
            .neq("entity", "shared")
            .execute()
        )

        docs = result.data or []

        if not docs:
            print(f"\n  No matches for pattern '{like_pattern}'")
            total_skipped += 1
            continue

        print(f"\n  Pattern: {like_pattern} ({reason})")
        print(f"  Matches: {len(docs)}")

        for doc in docs:
            doc_id = doc["id"]
            old_entity = doc["entity"]
            title = doc.get("title", "N/A")

            if args.dry_run:
                print(f"    [DRY RUN] Would migrate: {doc_id} ({old_entity}) — {title}")
            else:
                try:
                    supabase.table("documents").update(
                        {"entity": "shared"}
                    ).eq("id", doc_id).execute()
                    print(f"    MIGRATED: {doc_id} ({old_entity} → shared) — {title}")
                    total_migrated += 1
                except Exception as e:
                    print(f"    ERROR: {doc_id} — {e}")

    print(f"\n{'=' * 60}")
    if args.dry_run:
        print(f"DRY RUN complete. No changes made.")
    else:
        print(f"Migration complete. {total_migrated} documents moved to shared entity.")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
