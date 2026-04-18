#!/usr/bin/env python3
"""
Synchronous evaluation gate — evaluates a single trace and blocks delivery if below threshold.

Usage:
    python3 scripts/sync-evaluate.py --trace-id <UUID>
    python3 scripts/sync-evaluate.py --trace-id <UUID> --dry-run
    python3 scripts/sync-evaluate.py --trace-id <UUID> --override --reason "Jeff approved"

Exit codes:
    0 = PASS (score >= threshold or override applied)
    1 = FAIL (score < threshold, issue set to in_review)
    2 = error
"""

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lib"))

import evaluator
import httpx


def get_trace(supabase_url: str, supabase_key: str, trace_id: str) -> dict:
    """Fetch a single trace by ID."""
    headers = evaluator.supabase_headers(supabase_key)
    r = httpx.get(
        f"{supabase_url}/rest/v1/agent_traces",
        headers=headers,
        params={"id": f"eq.{trace_id}", "limit": "1"},
    )
    r.raise_for_status()
    rows = r.json()
    if not rows:
        raise ValueError(f"Trace {trace_id} not found")
    return rows[0]


def send_teams_notification(
    webhook_url: str, trace: dict, score: float, rationale: str
):
    """Send a Teams notification for a failed sync evaluation."""
    payload = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "EVALUATOR GATE — REVIEW REQUIRED",
                            "weight": "Bolder",
                            "size": "Medium",
                            "color": "Attention",
                        },
                        {
                            "type": "FactSet",
                            "facts": [
                                {"title": "Agent", "value": trace.get("agent_role", "unknown")},
                                {"title": "Task", "value": trace.get("task_type", "unknown")},
                                {"title": "Score", "value": f"{score:.1f}/5.0"},
                                {"title": "Issue", "value": trace.get("issue_id", "N/A")},
                            ],
                        },
                        {
                            "type": "TextBlock",
                            "text": rationale[:500],
                            "wrap": True,
                            "size": "Small",
                        },
                    ],
                },
            }
        ],
    }
    try:
        r = httpx.post(webhook_url, json=payload, timeout=10)
        if r.status_code in (200, 202):
            print("  Teams notification sent")
        else:
            print(f"  Teams notification failed: {r.status_code}")
    except Exception as e:
        print(f"  Teams notification error: {e}")


def apply_override(
    supabase_url: str,
    supabase_key: str,
    trace_id: str,
    reason: str,
    reviewer: str = "operator",
) -> None:
    """Apply a human override to an existing evaluation."""
    headers = evaluator.supabase_headers(supabase_key)
    headers["Prefer"] = "return=minimal"

    r = httpx.patch(
        f"{supabase_url}/rest/v1/evaluation_scores",
        headers=headers,
        params={"trace_id": f"eq.{trace_id}"},
        json={
            "human_reviewed": True,
            "human_override_reason": reason,
            "human_reviewer": reviewer,
            "human_reviewed_at": "now()",
        },
    )
    r.raise_for_status()
    print(f"  Override applied: {reason}")


def main():
    parser = argparse.ArgumentParser(description="Sync evaluation gate")
    parser.add_argument("--trace-id", required=True, help="UUID of the trace to evaluate")
    parser.add_argument("--dry-run", action="store_true", help="Preview without scoring")
    parser.add_argument("--override", action="store_true", help="Human override — approve despite score")
    parser.add_argument("--reason", default="", help="Override reason (required with --override)")
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    teams_webhook = os.environ.get("TEAMS_WEBHOOK_URL", "")

    if not supabase_url or not supabase_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(2)

    # Fetch trace
    try:
        trace = get_trace(supabase_url, supabase_key, args.trace_id)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(2)

    print(f"Trace: {trace['id'][:8]} agent={trace['agent_role']} task={trace['task_type']}")

    # Handle override
    if args.override:
        if not args.reason:
            print("ERROR: --reason is required with --override")
            sys.exit(2)
        apply_override(supabase_url, supabase_key, args.trace_id, args.reason)
        print("PASS (human override)")
        sys.exit(0)

    # Resolve evaluation mode via the canonical resolver (warns on unknown task_types)
    events = evaluator.load_events_config()
    mode = evaluator.resolve_evaluation_mode(trace["task_type"], events)
    if mode != "sync":
        print(f"  Task type '{trace['task_type']}' resolves to '{mode}' — sync gate not required. Skipping.")
        sys.exit(0)

    if not api_key and not args.dry_run:
        print("ERROR: ANTHROPIC_API_KEY must be set (or use --dry-run)")
        sys.exit(2)

    # Load rubric
    rubric = evaluator.load_active_rubric(supabase_url, supabase_key)
    threshold = rubric["pass_threshold"]

    if args.dry_run:
        print(f"  DRY-RUN: Would evaluate with rubric {rubric['version_tag']} (threshold {threshold})")
        sys.exit(0)

    # Evaluate
    try:
        prompt = evaluator.build_evaluation_prompt(trace, rubric)
        result = evaluator.call_evaluator(prompt, api_key)
        result["composite"] = evaluator.calculate_composite(result["scores"], rubric)

        eval_id = evaluator.write_evaluation_score(
            supabase_url, supabase_key, trace["id"], result, rubric["id"], "sync"
        )

        composite = result["composite"]
        passed = composite >= threshold
        status = "PASS" if passed else "FAIL"
        print(f"  Score: {composite:.1f}/{threshold} — {status}")
        print(f"  Rationale: {result.get('rationale', 'N/A')}")

        if not passed:
            # Generate correction proposal
            prop_id = evaluator.generate_correction_proposal(
                trace, result, supabase_url, supabase_key, eval_id
            )
            if prop_id:
                print(f"  Correction proposal: {prop_id[:8]}")

            # Send Teams notification
            if teams_webhook:
                send_teams_notification(
                    teams_webhook, trace, composite, result.get("rationale", "")
                )

            print(f"\nFAIL — output blocked. Set issue to in_review or use --override.")
            sys.exit(1)

        print(f"\nPASS — output approved.")
        sys.exit(0)

    except Exception as e:
        print(f"ERROR during evaluation: {e}")
        sys.exit(2)


if __name__ == "__main__":
    main()
