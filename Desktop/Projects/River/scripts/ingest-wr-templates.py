#!/usr/bin/env python3
"""Project River — Insert WaterRoads Governance Templates into Supabase (Task 6.5)

Reads WaterRoads-specific .md files from prompt-templates/ and inserts them
into the Supabase prompt_templates table with entity=waterroads.

Usage:
    source scripts/env-setup.sh
    python scripts/ingest-wr-templates.py
"""

import glob
import json
import os
import re
import sys

from supabase import create_client, Client


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


WR_TEMPLATE_MAPPING = {
    "waterroads-board-paper-template.md": {
        "entity": "waterroads",
        "category": "governance",
        "agent_role": "wr-executive",
    },
    "waterroads-board-agenda-template.md": {
        "entity": "waterroads",
        "category": "governance",
        "agent_role": "governance-wr",
    },
    "waterroads-board-minutes-template.md": {
        "entity": "waterroads",
        "category": "governance",
        "agent_role": "governance-wr",
    },
    "waterroads-resolution-template.md": {
        "entity": "waterroads",
        "category": "governance",
        "agent_role": "governance-wr",
    },
}


def extract_variables(content: str) -> list[str]:
    """Extract template variables (placeholders in [square brackets]) from content."""
    variables = re.findall(r"\[([A-Z][A-Za-z0-9_ /&\-']+)\]", content)
    seen = set()
    unique = []
    for v in variables:
        if v not in seen:
            seen.add(v)
            unique.append(v)
    return unique


def make_template_name(filename: str) -> str:
    """Convert filename to a human-readable template name."""
    name = os.path.splitext(filename)[0]
    return name.replace("-", " ").replace("_", " ").title()


def main():
    supabase_url = get_env("SUPABASE_URL")
    supabase_key = get_env("SUPABASE_SERVICE_ROLE_KEY")

    supabase: Client = create_client(supabase_url, supabase_key)

    templates_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "prompt-templates",
    )

    print("=" * 60)
    print("Project River — WaterRoads Template Ingestion")
    print("=" * 60)

    total_inserted = 0
    total_errors = 0

    for filename, mapping in WR_TEMPLATE_MAPPING.items():
        filepath = os.path.join(templates_dir, filename)

        if not os.path.exists(filepath):
            print(f"  MISSING: {filename} — skipping")
            total_errors += 1
            continue

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"  ERROR reading {filename}: {e}")
            total_errors += 1
            continue

        variables = extract_variables(content)
        template_name = make_template_name(filename)

        record = {
            "name": template_name,
            "template": content,
            "variables": json.dumps(variables),
            "entity": mapping["entity"],
            "category": mapping["category"],
            "version": 1,
        }

        try:
            supabase.table("prompt_templates").upsert(
                record, on_conflict="name"
            ).execute()
            total_inserted += 1
            print(
                f"  INSERTED: {filename} → {template_name} "
                f"(entity={mapping['entity']}, role={mapping['agent_role']}, "
                f"{len(variables)} variables)"
            )
        except Exception as e:
            print(f"  ERROR inserting {filename}: {e}")
            total_errors += 1

    print(f"\n{'=' * 60}")
    print(f"WaterRoads Template Ingestion Complete")
    print(f"  Inserted: {total_inserted}")
    print(f"  Errors:   {total_errors}")
    print(f"{'=' * 60}")

    sys.exit(0 if total_errors == 0 else 1)


if __name__ == "__main__":
    main()
