#!/usr/bin/env python3
"""
Async evaluation pipeline — scores unscored agent traces in batch.

Usage:
    python3 scripts/evaluate-outputs.py                    # score up to 50 traces
    python3 scripts/evaluate-outputs.py --batch-size 10    # score up to 10
    python3 scripts/evaluate-outputs.py --dry-run          # preview without scoring

Exit codes:
    0 = success (all traces scored or none to score)
    1 = partial failure (some traces failed)
    2 = total failure
"""

import argparse
import json
import os
import sys

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lib"))

import evaluator


def main():
    parser = argparse.ArgumentParser(description="Evaluate unscored agent traces")
    parser.add_argument(
        "--batch-size", type=int, default=50, help="Max traces to evaluate per run"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview what would be evaluated without calling the API",
    )
    parser.add_argument(
        "--max-age-days",
        type=int,
        default=7,
        help="Skip traces older than this many days",
    )
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")

    if not supabase_url or not supabase_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(2)

    if not api_key and not args.dry_run:
        print("ERROR: ANTHROPIC_API_KEY must be set (or use --dry-run)")
        sys.exit(2)

    # Load active rubric
    try:
        rubric = evaluator.load_active_rubric(supabase_url, supabase_key)
        print(
            f"Rubric: {rubric['version_tag']} (threshold: {rubric['pass_threshold']})"
        )
    except Exception as e:
        print(f"ERROR loading rubric: {e}")
        sys.exit(2)

    # Fetch unscored traces
    try:
        scorable, stale = evaluator.get_unscored_traces(
            supabase_url, supabase_key, args.batch_size, args.max_age_days
        )
    except Exception as e:
        print(f"ERROR fetching traces: {e}")
        sys.exit(2)

    if stale:
        print(f"Skipping {len(stale)} stale traces (older than {args.max_age_days} days)")
        for t in stale:
            print(f"  STALE: {t['id'][:8]} {t['agent_role']} {t['task_type']} {t['created_at']}")

    if not scorable:
        print("No unscored traces to evaluate.")
        sys.exit(0)

    print(f"\nEvaluating {len(scorable)} traces...")

    if args.dry_run:
        for t in scorable:
            print(
                f"  DRY-RUN: {t['id'][:8]} agent={t['agent_role']} "
                f"task={t['task_type']} created={t['created_at']}"
            )
        print(f"\nDry run complete. {len(scorable)} traces would be evaluated.")
        sys.exit(0)

    # Evaluate each trace
    successes = 0
    failures = 0
    proposals = 0

    for i, trace in enumerate(scorable, 1):
        trace_short = trace["id"][:8]
        try:
            prompt = evaluator.build_evaluation_prompt(trace, rubric)
            result = evaluator.call_evaluator(prompt, api_key)

            # Recalculate composite with our weights
            result["composite"] = evaluator.calculate_composite(
                result["scores"], rubric
            )

            eval_id = evaluator.write_evaluation_score(
                supabase_url,
                supabase_key,
                trace["id"],
                result,
                rubric["id"],
                "async",
            )

            passed = result["composite"] >= rubric["pass_threshold"]
            status = "PASS" if passed else "FAIL"
            print(
                f"  [{i}/{len(scorable)}] {trace_short} {trace['agent_role']}: "
                f"{result['composite']:.1f} {status} ({result.get('_duration_seconds', 0):.1f}s)"
            )

            # Generate correction proposal if below threshold
            if not passed:
                prop_id = evaluator.generate_correction_proposal(
                    trace, result, supabase_url, supabase_key, eval_id
                )
                if prop_id:
                    proposals += 1
                    print(f"    → Correction proposal generated: {prop_id[:8]}")

            successes += 1

        except Exception as e:
            failures += 1
            print(f"  [{i}/{len(scorable)}] {trace_short} ERROR: {e}")

    print(f"\nResults: {successes} scored, {failures} failed, {proposals} correction proposals")

    if failures == len(scorable):
        sys.exit(2)
    elif failures > 0:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
