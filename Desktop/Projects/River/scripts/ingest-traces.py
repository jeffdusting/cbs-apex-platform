#!/usr/bin/env python3
"""
Trace ingestion script — parses trace blocks from Paperclip issue comments
and writes them to the agent_traces Supabase table.

Usage:
    python3 scripts/ingest-traces.py                      # last 24 hours
    python3 scripts/ingest-traces.py --since 6             # last 6 hours
    python3 scripts/ingest-traces.py --dry-run             # parse only
    python3 scripts/ingest-traces.py --company-id UUID     # one company
"""

import argparse
import hashlib
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

import httpx

# Paperclip API config
PAPERCLIP_API_URL = os.environ.get("PAPERCLIP_API_URL", "https://org.cbslab.app")
PAPERCLIP_COOKIE = os.environ.get("PAPERCLIP_SESSION_COOKIE", "")

# Company IDs
CBS_COMPANY_ID = "fafce870-b862-4754-831e-2cd10e8b203c"
WR_COMPANY_ID = "95a248d4-08e7-4879-8e66-5d1ff948e005"

TRACE_PATTERN = re.compile(
    r"---TRACE-START---\s*(\{.*?\})\s*---TRACE-END---", re.DOTALL
)


def paperclip_headers() -> dict:
    return {
        "Cookie": f"__Secure-better-auth.session_token={PAPERCLIP_COOKIE}",
        "Content-Type": "application/json",
        "Origin": PAPERCLIP_API_URL,
        "Referer": f"{PAPERCLIP_API_URL}/",
    }


def supabase_headers(key: str) -> dict:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def get_recent_issues(company_id: str, since_hours: int) -> list[dict]:
    """Fetch recent issues from Paperclip API."""
    headers = paperclip_headers()
    issues = []

    # Try primary endpoint pattern
    for status in ["done", "in_review", "in_progress"]:
        try:
            r = httpx.get(
                f"{PAPERCLIP_API_URL}/api/companies/{company_id}/issues",
                headers=headers,
                params={"status": status, "limit": "50"},
                timeout=15,
            )
            if r.status_code == 200:
                data = r.json()
                if isinstance(data, list):
                    issues.extend(data)
                elif isinstance(data, dict):
                    issues.extend(data.get("issues", data.get("data", [])))
            elif r.status_code == 401:
                print("ERROR: Paperclip API returned 401 — session cookie expired")
                sys.exit(2)
            elif r.status_code == 404:
                # Try alternative endpoint
                r2 = httpx.get(
                    f"{PAPERCLIP_API_URL}/api/issues",
                    headers=headers,
                    params={"companyId": company_id, "status": status, "limit": "50"},
                    timeout=15,
                )
                if r2.status_code == 200:
                    data = r2.json()
                    if isinstance(data, list):
                        issues.extend(data)
        except httpx.ConnectError:
            print("ERROR: Cannot reach Paperclip API")
            sys.exit(2)

    # Filter by time
    cutoff = datetime.now(timezone.utc) - timedelta(hours=since_hours)
    recent = []
    for issue in issues:
        updated = issue.get("updatedAt") or issue.get("updated_at") or issue.get("createdAt", "")
        try:
            dt = datetime.fromisoformat(updated.replace("Z", "+00:00"))
            if dt >= cutoff:
                recent.append(issue)
        except (ValueError, AttributeError):
            recent.append(issue)  # include if we can't parse the date

    return recent


def get_issue_comments(issue_id: str) -> list[dict]:
    """Fetch comments for a specific issue."""
    headers = paperclip_headers()
    try:
        r = httpx.get(
            f"{PAPERCLIP_API_URL}/api/issues/{issue_id}/comments",
            headers=headers,
            timeout=15,
        )
        if r.status_code == 200:
            data = r.json()
            return data if isinstance(data, list) else data.get("comments", data.get("data", []))
        return []
    except Exception:
        return []


def parse_traces_from_text(text: str) -> list[dict]:
    """Extract trace JSON blocks from text."""
    traces = []
    for match in TRACE_PATTERN.finditer(text):
        raw_json = match.group(1)
        try:
            trace_data = json.loads(raw_json)
            traces.append(trace_data)
        except json.JSONDecodeError as e:
            print(f"    WARN: Malformed trace JSON: {e}")
    return traces


def check_duplicate(
    supabase_url: str,
    supabase_key: str,
    issue_id: str,
    agent_role: str,
    created_at: str,
) -> bool:
    """Check if a trace already exists within a 60s window."""
    headers = supabase_headers(supabase_key)

    try:
        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        dt = datetime.now(timezone.utc)

    window_start = (dt - timedelta(seconds=60)).isoformat()
    window_end = (dt + timedelta(seconds=60)).isoformat()

    r = httpx.get(
        f"{supabase_url}/rest/v1/agent_traces",
        headers=headers,
        params={
            "issue_id": f"eq.{issue_id}",
            "agent_role": f"eq.{agent_role}",
            "created_at": f"gte.{window_start}",
            "select": "id",
            "limit": "1",
        },
    )
    if r.status_code == 200:
        return len(r.json()) > 0
    return False


def insert_trace(
    supabase_url: str,
    supabase_key: str,
    trace_data: dict,
    issue_id: str,
    company_id: str,
    comment_created_at: str,
) -> str | None:
    """Insert a trace into agent_traces. Returns the trace ID."""
    headers = supabase_headers(supabase_key)
    headers["Prefer"] = "return=representation"

    self_check = trace_data.get("self_check", {})

    # Build output hash for dedup
    raw_hash = hashlib.sha256(json.dumps(trace_data, sort_keys=True).encode()).hexdigest()

    payload = {
        "agent_id": "00000000-0000-0000-0000-000000000000",  # placeholder until we can resolve agent_id
        "agent_role": trace_data.get("agent_role", "unknown"),
        "company_id": company_id,
        "issue_id": issue_id,
        "task_type": trace_data.get("task_type", "other"),
        "prompt_version": trace_data.get("prompt_version"),
        "kb_queries": trace_data.get("kb_queries", []),
        "kb_results_count": trace_data.get("kb_results_count", 0),
        "kb_top_similarity": trace_data.get("kb_top_similarity"),
        "corrections_applied": trace_data.get("corrections_applied", []),
        "self_check_score": self_check.get("score"),
        "self_check_flags": self_check.get("flags", []),
        "decision": trace_data.get("decision"),
        "confidence": trace_data.get("confidence"),
        "error": trace_data.get("error"),
        "raw_output_hash": raw_hash,
    }

    r = httpx.post(
        f"{supabase_url}/rest/v1/agent_traces",
        headers=headers,
        json=payload,
    )
    if r.status_code in (200, 201):
        return r.json()[0]["id"]
    else:
        print(f"    ERROR inserting trace: {r.status_code} — {r.text[:200]}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Ingest agent traces from Paperclip")
    parser.add_argument("--since", type=int, default=24, help="Look back N hours (default: 24)")
    parser.add_argument("--dry-run", action="store_true", help="Parse and report only")
    parser.add_argument("--company-id", help="Limit to one company ID")
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not supabase_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(2)

    if not PAPERCLIP_COOKIE:
        print("ERROR: PAPERCLIP_SESSION_COOKIE must be set")
        sys.exit(2)

    # Determine which companies to scan
    if args.company_id:
        company_ids = [args.company_id]
    else:
        company_ids = [CBS_COMPANY_ID, WR_COMPANY_ID]

    stats = {"found": 0, "inserted": 0, "skipped_dup": 0, "failed": 0}

    for company_id in company_ids:
        company_label = "CBS" if company_id == CBS_COMPANY_ID else "WR"
        print(f"\nScanning {company_label} issues (last {args.since}h)...")

        issues = get_recent_issues(company_id, args.since)
        print(f"  {len(issues)} recent issues found")

        for issue in issues:
            issue_id = issue.get("id", "")
            issue_title = issue.get("title", issue.get("name", "untitled"))[:60]

            # Check issue description for traces
            description = issue.get("description", "") or ""
            desc_traces = parse_traces_from_text(description)

            # Check comments for traces
            comments = get_issue_comments(issue_id)
            comment_traces = []
            for comment in comments:
                body = comment.get("body", comment.get("content", "")) or ""
                created = comment.get("createdAt", comment.get("created_at", ""))
                for trace_data in parse_traces_from_text(body):
                    comment_traces.append((trace_data, created))

            all_traces = [(t, "") for t in desc_traces] + comment_traces

            if not all_traces:
                continue

            print(f"  Issue {issue_id[:8]} '{issue_title}': {len(all_traces)} trace(s)")

            for trace_data, created_at in all_traces:
                stats["found"] += 1
                agent_role = trace_data.get("agent_role", "unknown")

                if args.dry_run:
                    print(
                        f"    DRY-RUN: {agent_role} / {trace_data.get('task_type', '?')} "
                        f"/ confidence={trace_data.get('confidence', '?')}"
                    )
                    continue

                # Check for duplicates
                if check_duplicate(
                    supabase_url, supabase_key, issue_id, agent_role, created_at or ""
                ):
                    stats["skipped_dup"] += 1
                    print(f"    SKIP (duplicate): {agent_role}")
                    continue

                trace_id = insert_trace(
                    supabase_url,
                    supabase_key,
                    trace_data,
                    issue_id,
                    company_id,
                    created_at or "",
                )
                if trace_id:
                    stats["inserted"] += 1
                    print(f"    INSERTED: {trace_id[:8]} ({agent_role})")
                else:
                    stats["failed"] += 1

    print(f"\nResults: {stats['found']} found, {stats['inserted']} inserted, "
          f"{stats['skipped_dup']} duplicates skipped, {stats['failed']} failed")

    if stats["failed"] == stats["found"] and stats["found"] > 0:
        sys.exit(2)
    elif stats["failed"] > 0:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
