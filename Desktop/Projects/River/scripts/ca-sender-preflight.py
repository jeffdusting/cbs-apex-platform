#!/usr/bin/env python3
"""
CA Sender pre-flight check — architectural guard that prevents CA send
unless human approval is recorded in tender_register.

Usage:
    python3 scripts/ca-sender-preflight.py --tender-id 42
"""

import argparse
import os
import sys
from datetime import datetime, timezone

import httpx


def main():
    parser = argparse.ArgumentParser(description="CA sender pre-flight check")
    parser.add_argument("--tender-id", required=True, help="Tender register ID")
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

    # Fetch tender
    r = httpx.get(
        f"{supabase_url}/rest/v1/tender_register",
        headers=headers,
        params={
            "id": f"eq.{args.tender_id}",
            "select": "id,title,reference,lifecycle_stage,ca_send_approved,ca_send_approved_by,ca_send_approved_at",
            "limit": "1",
        },
    )

    if r.status_code != 200:
        print(f"ERROR: Could not fetch tender: {r.status_code}")
        sys.exit(2)

    rows = r.json()
    if not rows:
        print(f"ERROR: Tender ID {args.tender_id} not found")
        sys.exit(2)

    tender = rows[0]
    title = tender.get("title", "untitled")
    ref = tender.get("reference", "?")

    print(f"Tender: {ref} — {title}")

    # Check 1: lifecycle_stage
    stage = tender.get("lifecycle_stage", "")
    if stage != "ca_drafted":
        print(f"BLOCKED: lifecycle_stage is '{stage}', expected 'ca_drafted'")
        log_preflight(supabase_url, supabase_key, headers, args.tender_id, stage, False, f"Wrong stage: {stage}")
        sys.exit(1)

    # Check 2: ca_send_approved
    approved = tender.get("ca_send_approved", False)
    if not approved:
        print(f"BLOCKED: ca_send_approved is FALSE — human approval required")
        print("  → Approve via the tender dashboard or run:")
        print(f"  → UPDATE tender_register SET ca_send_approved=TRUE, ca_send_approved_by='jeff' WHERE id={args.tender_id};")
        log_preflight(supabase_url, supabase_key, headers, args.tender_id, stage, False, "Not approved")
        sys.exit(1)

    # Check 3: ca_send_approved_by
    approved_by = tender.get("ca_send_approved_by")
    if not approved_by:
        print(f"BLOCKED: ca_send_approved_by is NULL — approval record incomplete")
        log_preflight(supabase_url, supabase_key, headers, args.tender_id, stage, False, "Approver not recorded")
        sys.exit(1)

    print(f"APPROVED — proceed with CA send")
    print(f"  Approved by: {approved_by}")
    print(f"  Approved at: {tender.get('ca_send_approved_at', 'unknown')}")
    log_preflight(supabase_url, supabase_key, headers, args.tender_id, stage, True, f"Approved by {approved_by}")
    sys.exit(0)


def log_preflight(supabase_url, supabase_key, headers, tender_id, stage, passed, detail):
    """Log the pre-flight check result to tender_lifecycle_log."""
    log_headers = {**headers, "Prefer": "return=minimal"}
    try:
        httpx.post(
            f"{supabase_url}/rest/v1/tender_lifecycle_log",
            headers=log_headers,
            json={
                "tender_id": int(tender_id),
                "from_stage": stage,
                "to_stage": stage,
                "actor": "ca_preflight",
                "rationale": f"Pre-flight {'PASS' if passed else 'FAIL'}: {detail}",
                "metadata": {"check": "ca_send_preflight", "passed": passed},
            },
        )
    except Exception:
        pass  # Non-critical — don't block on logging failure


if __name__ == "__main__":
    main()
