#!/usr/bin/env python3
"""Project River — Sprint 3: Tender Scorecard Historical Backfill

Queries Paperclip for previously assessed tender opportunities and
generates scorecard-format assessments from the existing Go/Watch/Pass
recommendations.

Usage:
    source scripts/env-setup.sh
    python scripts/scorecard-backfill.py --dry-run    # Preview only
    python scripts/scorecard-backfill.py               # Execute backfill

Note: This script requires cookie-based auth. Set PAPERCLIP_SESSION_TOKEN
to the value of __Secure-better-auth.session_token from your browser.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone

import httpx


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


RECOMMENDATION_MAP = {
    "go": {"min_score": 4.0, "max_score": 4.5},
    "watch": {"min_score": 3.0, "max_score": 3.5},
    "pass": {"min_score": 1.5, "max_score": 2.5},
}


def extract_recommendation(text: str) -> str | None:
    """Extract Go/Watch/Pass recommendation from issue text."""
    text_lower = text.lower()
    for rec in ["go", "watch", "pass"]:
        if re.search(rf'\brecommendation["\s:]*{rec}\b', text_lower):
            return rec
        if re.search(rf'\b{rec}\b.*\brecommend', text_lower):
            return rec
    return None


def generate_placeholder_scorecard(title: str, recommendation: str) -> dict:
    """Generate a placeholder scorecard from a recommendation."""
    score_range = RECOMMENDATION_MAP.get(recommendation, {"min_score": 3.0, "max_score": 3.0})
    avg_score = (score_range["min_score"] + score_range["max_score"]) / 2

    return {
        "scorecard_version": "1.0",
        "title": title,
        "assessed_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "dimensions": {
            "sector_alignment": {"score": round(avg_score), "weight": 0.25, "evidence": "Backfilled from original assessment", "kb_sources": []},
            "capital_applicability": {"score": round(avg_score), "weight": 0.20, "evidence": "Backfilled from original assessment", "kb_sources": []},
            "contract_value": {"score": 3, "weight": 0.15, "evidence": "Backfilled — value not assessed in original", "kb_sources": []},
            "client_relationship": {"score": round(avg_score), "weight": 0.15, "evidence": "Backfilled from original assessment", "kb_sources": []},
            "competitive_position": {"score": 3, "weight": 0.10, "evidence": "Backfilled — not assessed in original", "kb_sources": []},
            "resource_availability": {"score": 3, "weight": 0.10, "evidence": "Backfilled — not assessed in original", "kb_sources": []},
            "strategic_value": {"score": 3, "weight": 0.05, "evidence": "Backfilled — not assessed in original", "kb_sources": []},
        },
        "weighted_score": round(avg_score, 2),
        "recommendation": recommendation.capitalize(),
        "backfilled": True,
        "risks": [],
        "next_steps": [],
    }


def main():
    parser = argparse.ArgumentParser(description="Backfill tender scorecards")
    parser.add_argument("--dry-run", action="store_true", help="Preview without changes")
    args = parser.parse_args()

    paperclip_url = get_env("PAPERCLIP_URL").rstrip("/")
    session_token = os.environ.get("PAPERCLIP_SESSION_TOKEN", "")
    cbs_company_id = "fafce870-b862-4754-831e-2cd10e8b203c"

    if not session_token:
        print("ERROR: Set PAPERCLIP_SESSION_TOKEN to your browser session cookie value.")
        print("  export PAPERCLIP_SESSION_TOKEN='your-cookie-value'")
        sys.exit(1)

    cookie = f"__Secure-better-auth.session_token={session_token}"

    print("=" * 60)
    print(f"Tender Scorecard Backfill {'(DRY RUN)' if args.dry_run else ''}")
    print("=" * 60)

    # Get all CBS issues
    resp = httpx.get(
        f"{paperclip_url}/api/companies/{cbs_company_id}/issues",
        cookies={"__Secure-better-auth.session_token": session_token},
    )

    if resp.status_code != 200:
        print(f"ERROR: Failed to fetch issues — {resp.status_code}")
        sys.exit(1)

    issues = resp.json()
    if isinstance(issues, dict):
        issues = issues.get("issues", issues.get("data", []))

    # Find tender-related issues
    tender_issues = [i for i in issues if "tender" in i.get("title", "").lower()]

    print(f"Found {len(tender_issues)} tender-related issues out of {len(issues)} total")

    backfilled = 0
    for issue in tender_issues:
        title = issue.get("title", "")
        description = issue.get("description", "")
        full_text = f"{title} {description}"

        rec = extract_recommendation(full_text)
        if not rec:
            print(f"  SKIP: {issue.get('identifier', '?')} — no recommendation found")
            continue

        scorecard = generate_placeholder_scorecard(title, rec)

        if args.dry_run:
            print(f"  [DRY RUN] {issue.get('identifier', '?')}: {title[:50]} → {rec} (score={scorecard['weighted_score']})")
        else:
            # Add scorecard as a comment on the issue
            comment_body = f"**Backfilled Scorecard (Sprint 3)**\n\n```json\n{json.dumps(scorecard, indent=2)}\n```"
            comment_resp = httpx.post(
                f"{paperclip_url}/api/issues/{issue['id']}/comments",
                cookies={"__Secure-better-auth.session_token": session_token},
                headers={"Content-Type": "application/json", "Origin": "https://org.cbslab.app"},
                json={"body": comment_body},
            )
            status = "OK" if comment_resp.status_code in (200, 201) else f"FAIL ({comment_resp.status_code})"
            print(f"  {issue.get('identifier', '?')}: {title[:50]} → {rec} — {status}")
            backfilled += 1

    print(f"\n{'DRY RUN complete' if args.dry_run else f'Backfilled {backfilled} scorecards'}.")


if __name__ == "__main__":
    main()
