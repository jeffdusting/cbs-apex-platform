#!/usr/bin/env python3
"""Project River — Insert Governance Templates into Supabase (Task 5.3)

Reads all .md files from prompt-templates/, determines entity and agent_role
from the filename, and inserts into the Supabase prompt_templates table.

Filename conventions:
  - board-paper-template.md        → entity=cbs-group, category=governance
  - waterroads-board-paper-template.md → entity=waterroads, category=governance

Usage:
    source scripts/env-setup.sh
    python scripts/insert-governance-templates.py
"""

import os
import sys
import glob
import json
import re

from supabase import create_client, Client


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


# Map filename patterns to entity and agent role
TEMPLATE_MAPPING = {
    "board-paper-template.md": {
        "entity": "cbs-group",
        "category": "governance",
        "agent_role": "cbs-executive",
    },
    "board-agenda-template.md": {
        "entity": "cbs-group",
        "category": "governance",
        "agent_role": "cbs-executive",
    },
    "board-minutes-template.md": {
        "entity": "cbs-group",
        "category": "governance",
        "agent_role": "governance-cbs",
    },
    "resolution-template.md": {
        "entity": "cbs-group",
        "category": "governance",
        "agent_role": "governance-cbs",
    },
    "agm-notice-template.md": {
        "entity": "cbs-group",
        "category": "governance",
        "agent_role": "governance-cbs",
    },
    "agm-agenda-template.md": {
        "entity": "cbs-group",
        "category": "governance",
        "agent_role": "governance-cbs",
    },
    "waterroads-board-paper-template.md": {
        "entity": "waterroads",
        "category": "governance",
        "agent_role": "wr-executive",
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
    # Match [PLACEHOLDER] style variables
    variables = re.findall(r"\[([A-Z][A-Za-z0-9_ /&\-']+)\]", content)
    # Deduplicate while preserving order
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

    # Find all .md files in prompt-templates/
    templates_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "prompt-templates",
    )
    md_files = sorted(glob.glob(os.path.join(templates_dir, "*.md")))

    if not md_files:
        print(f"WARNING: No .md files found in {templates_dir}")
        sys.exit(0)

    print(f"Found {len(md_files)} template files in {templates_dir}")

    total_inserted = 0
    total_skipped = 0
    total_errors = 0

    for filepath in md_files:
        filename = os.path.basename(filepath)

        # Look up mapping
        mapping = TEMPLATE_MAPPING.get(filename)
        if not mapping:
            print(f"  SKIP: {filename} — no mapping defined")
            total_skipped += 1
            continue

        # Read template content
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"  ERROR reading {filename}: {e}")
            total_errors += 1
            continue

        # Extract variables
        variables = extract_variables(content)
        template_name = make_template_name(filename)

        # Build record
        record = {
            "name": template_name,
            "template": content,
            "variables": json.dumps(variables),
            "entity": mapping["entity"],
            "category": mapping["category"],
            "version": 1,
        }

        try:
            # Upsert (insert or update on name conflict)
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

    # Summary
    print(f"\n{'=' * 60}")
    print(f"Governance Template Insertion Complete")
    print(f"  Inserted: {total_inserted}")
    print(f"  Skipped:  {total_skipped}")
    print(f"  Errors:   {total_errors}")
    print(f"{'=' * 60}")

    sys.exit(0 if total_errors == 0 else 1)


if __name__ == "__main__":
    main()
