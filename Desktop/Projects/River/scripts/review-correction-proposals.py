#!/usr/bin/env python3
"""
Interactive review tool for evaluator-generated correction proposals.

Usage:
    python3 scripts/review-correction-proposals.py
    python3 scripts/review-correction-proposals.py --status pending
    python3 scripts/review-correction-proposals.py --list-only
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

import httpx


def supabase_headers(key: str) -> dict:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def get_proposals(
    supabase_url: str, supabase_key: str, status: str = "pending"
) -> list[dict]:
    """Fetch correction proposals with the given status."""
    headers = supabase_headers(supabase_key)
    r = httpx.get(
        f"{supabase_url}/rest/v1/correction_proposals",
        headers=headers,
        params={
            "status": f"eq.{status}",
            "order": "created_at.desc",
            "select": "*",
        },
    )
    r.raise_for_status()
    return r.json()


def update_proposal(
    supabase_url: str, supabase_key: str, proposal_id: str, updates: dict
) -> None:
    """Update a correction proposal."""
    headers = supabase_headers(supabase_key)
    headers["Prefer"] = "return=minimal"
    r = httpx.patch(
        f"{supabase_url}/rest/v1/correction_proposals",
        headers=headers,
        params={"id": f"eq.{proposal_id}"},
        json=updates,
    )
    r.raise_for_status()


def ingest_correction(
    proposal: dict, supabase_url: str, supabase_key: str, entity: str = "cbs-group"
) -> int | None:
    """
    Create a correction document in the KB from an approved proposal.

    Writes a correction file and ingests it via the existing pipeline.
    Returns the document ID if successful.
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    agent_role = proposal["agent_role"]
    task_type = proposal["task_type"]
    safe_role = agent_role.replace(" ", "-").lower()

    filename = f"{now}-{safe_role}-{task_type}-evaluator-correction.md"
    filepath = os.path.join("knowledge-base", "corrections", filename)

    content = f"""---
category: correction
agent_role: {agent_role}
task_type: {task_type}
correction_date: {now}
source: evaluator-pipeline
proposal_id: {proposal['id']}
severity: {proposal.get('severity', 'minor')}
---

## Original Output (excerpt)
{proposal.get('original_output_excerpt', 'N/A')}

## Correction
{proposal['proposed_correction']}

## Guidance
{proposal['proposed_guidance']}
"""

    # Write the correction file
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        f.write(content)

    print(f"    Correction file written: {filepath}")

    # Ingest via existing pipeline
    try:
        result = subprocess.run(
            [
                "python3",
                "scripts/ingest-knowledge-base.py",
                "--file",
                filepath,
                "--entity",
                entity,
                "--category",
                "correction",
            ],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode == 0:
            print(f"    Ingested into KB successfully")
            # Try to extract document ID from output
            return None  # Document ID extraction depends on ingest script output format
        else:
            print(f"    Ingestion warning: {result.stderr[:200]}")
            return None
    except FileNotFoundError:
        print("    Warning: ingest-knowledge-base.py not found — file written but not embedded")
        return None
    except Exception as e:
        print(f"    Ingestion error: {e}")
        return None


def display_proposal(proposal: dict, index: int, total: int) -> None:
    """Display a single proposal for review."""
    print(f"\n{'='*70}")
    print(f"Proposal {index}/{total} — {proposal['id'][:12]}")
    print(f"{'='*70}")
    print(f"  Agent role:  {proposal['agent_role']}")
    print(f"  Task type:   {proposal['task_type']}")
    print(f"  Severity:    {proposal.get('severity', 'unknown')}")
    print(f"  Created:     {proposal['created_at']}")
    print(f"\n  Original output excerpt:")
    print(f"    {proposal.get('original_output_excerpt', 'N/A')}")
    print(f"\n  Proposed correction:")
    print(f"    {proposal['proposed_correction']}")
    print(f"\n  Proposed guidance:")
    print(f"    {proposal['proposed_guidance']}")
    print()


def main():
    parser = argparse.ArgumentParser(description="Review correction proposals")
    parser.add_argument(
        "--status", default="pending", help="Filter by status (default: pending)"
    )
    parser.add_argument(
        "--list-only", action="store_true", help="List proposals without interactive review"
    )
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not supabase_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(1)

    proposals = get_proposals(supabase_url, supabase_key, args.status)

    if not proposals:
        print(f"No {args.status} correction proposals.")
        sys.exit(0)

    print(f"\n{len(proposals)} {args.status} correction proposal(s)\n")

    if args.list_only:
        for p in proposals:
            print(
                f"  {p['id'][:12]} | {p['agent_role']:25s} | {p['task_type']:20s} | "
                f"{p.get('severity', '?'):8s} | {p['created_at'][:10]}"
            )
        sys.exit(0)

    # Interactive review
    for i, proposal in enumerate(proposals, 1):
        display_proposal(proposal, i, len(proposals))

        while True:
            choice = input("  [A]pprove / [R]eject / [S]kip / [Q]uit: ").strip().upper()

            if choice == "A":
                update_proposal(
                    supabase_url,
                    supabase_key,
                    proposal["id"],
                    {
                        "status": "approved",
                        "reviewed_by": "operator",
                        "reviewed_at": datetime.now(timezone.utc).isoformat(),
                    },
                )
                print("  → Approved. Ingesting correction...")
                doc_id = ingest_correction(proposal, supabase_url, supabase_key)
                if doc_id:
                    update_proposal(
                        supabase_url,
                        supabase_key,
                        proposal["id"],
                        {"status": "ingested", "correction_document_id": doc_id},
                    )
                else:
                    update_proposal(
                        supabase_url,
                        supabase_key,
                        proposal["id"],
                        {"status": "ingested"},
                    )
                break

            elif choice == "R":
                reason = input("  Rejection reason: ").strip()
                update_proposal(
                    supabase_url,
                    supabase_key,
                    proposal["id"],
                    {
                        "status": "rejected",
                        "reviewed_by": "operator",
                        "reviewed_at": datetime.now(timezone.utc).isoformat(),
                        "rejection_reason": reason,
                    },
                )
                print("  → Rejected.")
                break

            elif choice == "S":
                print("  → Skipped.")
                break

            elif choice == "Q":
                print("Exiting review.")
                sys.exit(0)

            else:
                print("  Invalid choice. Use A, R, S, or Q.")

    print(f"\nReview complete.")


if __name__ == "__main__":
    main()
