#!/usr/bin/env python3
"""
End-to-end smoke test for the evaluation pipeline.

Usage:
    python3 scripts/test-evaluator-e2e.py
"""

import json
import os
import subprocess
import sys
import uuid

import httpx

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

CBS_COMPANY_ID = "fafce870-b862-4754-831e-2cd10e8b203c"

# Track IDs for cleanup
cleanup_trace_ids = []
cleanup_eval_ids = []
cleanup_proposal_ids = []

results = {"pass": 0, "fail": 0, "skip": 0}


def headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def report(step, total, name, status, detail=""):
    symbol = {"PASS": "PASS", "FAIL": "FAIL", "SKIP": "SKIP"}[status]
    results[status.lower()] += 1
    msg = f"[{step}/{total}] {name:35s} {symbol}"
    if detail:
        msg += f" ({detail})"
    print(msg)


def cleanup():
    """Remove test data."""
    h = headers()
    h["Prefer"] = "return=minimal"
    deleted = 0

    for pid in cleanup_proposal_ids:
        r = httpx.delete(f"{SUPABASE_URL}/rest/v1/correction_proposals?id=eq.{pid}", headers=h)
        if r.status_code in (200, 204):
            deleted += 1

    for eid in cleanup_eval_ids:
        r = httpx.delete(f"{SUPABASE_URL}/rest/v1/evaluation_scores?id=eq.{eid}", headers=h)
        if r.status_code in (200, 204):
            deleted += 1

    for tid in cleanup_trace_ids:
        r = httpx.delete(f"{SUPABASE_URL}/rest/v1/agent_traces?id=eq.{tid}", headers=h)
        if r.status_code in (200, 204):
            deleted += 1

    return deleted


def main():
    print("=== Evaluator E2E Smoke Test ===\n")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required")
        sys.exit(2)

    total = 8
    h = headers()

    # --- Step 1: Insert synthetic trace ---
    trace_id = str(uuid.uuid4())
    trace_payload = {
        "id": trace_id,
        "agent_id": "00000000-0000-0000-0000-000000000001",
        "agent_role": "test-agent",
        "company_id": CBS_COMPANY_ID,
        "issue_id": "smoke-test-issue",
        "task_type": "smoke-test",
        "kb_queries": ["test query for smoke test"],
        "kb_results_count": 3,
        "kb_top_similarity": 0.65,
        "self_check_score": 3.0,
        "self_check_flags": ["test_flag"],
        "confidence": "medium",
    }

    r = httpx.post(
        f"{SUPABASE_URL}/rest/v1/agent_traces",
        headers={**h, "Prefer": "return=representation"},
        json=trace_payload,
    )
    if r.status_code in (200, 201):
        cleanup_trace_ids.append(trace_id)
        report(1, total, "Insert synthetic trace", "PASS", f"trace_id: {trace_id[:8]}")
    else:
        report(1, total, "Insert synthetic trace", "FAIL", f"{r.status_code}: {r.text[:100]}")
        print(f"\nCannot continue without test trace. Cleaning up...")
        cleanup()
        sys.exit(1)

    # --- Step 2: Dry-run detection ---
    try:
        result = subprocess.run(
            ["python3", "scripts/evaluate-outputs.py", "--dry-run", "--batch-size", "5"],
            capture_output=True,
            text=True,
            timeout=30,
            env={**os.environ},
        )
        if "smoke-test" in result.stdout or "test-agent" in result.stdout:
            report(2, total, "Dry-run detection", "PASS", "synthetic trace found")
        else:
            report(2, total, "Dry-run detection", "FAIL", f"trace not detected: {result.stdout[:100]}")
    except Exception as e:
        report(2, total, "Dry-run detection", "FAIL", str(e))

    # --- Step 3: Live evaluation ---
    if not ANTHROPIC_KEY:
        report(3, total, "Live evaluation", "SKIP", "ANTHROPIC_API_KEY not set")
        report(4, total, "Score written to DB", "SKIP", "depends on step 3")
        report(5, total, "Correction proposal", "SKIP", "depends on step 3")
        report(6, total, "Sync evaluation dry-run", "SKIP", "depends on step 3")
    else:
        try:
            result = subprocess.run(
                ["python3", "scripts/evaluate-outputs.py", "--batch-size", "1"],
                capture_output=True,
                text=True,
                timeout=120,
                env={**os.environ},
            )
            if result.returncode == 0 and "test-agent" in result.stdout:
                # Extract composite score
                import re
                score_match = re.search(r"(\d+\.\d+)\s+(PASS|FAIL)", result.stdout)
                if score_match:
                    composite = float(score_match.group(1))
                    verdict = score_match.group(2)
                    report(3, total, "Live evaluation", "PASS", f"composite: {composite}, mode: async")
                else:
                    report(3, total, "Live evaluation", "PASS", "scored (could not parse score)")
                    composite = 0
            else:
                report(3, total, "Live evaluation", "FAIL", f"exit={result.returncode}: {result.stdout[:100]} {result.stderr[:100]}")
                composite = 0
        except Exception as e:
            report(3, total, "Live evaluation", "FAIL", str(e))
            composite = 0

        # --- Step 4: Verify score in DB ---
        r = httpx.get(
            f"{SUPABASE_URL}/rest/v1/evaluation_scores",
            headers=h,
            params={"trace_id": f"eq.{trace_id}", "select": "*", "limit": "1"},
        )
        if r.status_code == 200 and r.json():
            eval_row = r.json()[0]
            cleanup_eval_ids.append(eval_row["id"])
            dims = sum(1 for k, v in eval_row.items() if k.startswith("score_") and v is not None)
            report(4, total, "Score written to DB", "PASS", f"{dims} dimensions, composite {eval_row.get('score_composite', '?')}")
        else:
            report(4, total, "Score written to DB", "FAIL", f"no evaluation found for trace {trace_id[:8]}")

        # --- Step 5: Correction proposal ---
        r = httpx.get(
            f"{SUPABASE_URL}/rest/v1/correction_proposals",
            headers=h,
            params={"trace_id": f"eq.{trace_id}", "select": "*", "limit": "1"},
        )
        if r.status_code == 200:
            proposals = r.json()
            if proposals:
                cleanup_proposal_ids.append(proposals[0]["id"])
                report(5, total, "Correction proposal", "PASS", f"severity: {proposals[0].get('severity', '?')}")
            else:
                if composite >= 3.5:
                    report(5, total, "Correction proposal", "SKIP", "score above threshold")
                else:
                    report(5, total, "Correction proposal", "FAIL", "expected proposal for low score")
        else:
            report(5, total, "Correction proposal", "FAIL", f"query error: {r.status_code}")

        # --- Step 6: Sync evaluation dry-run ---
        try:
            result = subprocess.run(
                ["python3", "scripts/sync-evaluate.py", "--trace-id", trace_id, "--dry-run"],
                capture_output=True,
                text=True,
                timeout=30,
                env={**os.environ},
            )
            if result.returncode == 0:
                report(6, total, "Sync evaluation dry-run", "PASS")
            else:
                report(6, total, "Sync evaluation dry-run", "FAIL", f"exit={result.returncode}: {result.stdout[:100]}")
        except Exception as e:
            report(6, total, "Sync evaluation dry-run", "FAIL", str(e))

    # --- Step 7: Blocked-work detection ---
    error_trace_id = str(uuid.uuid4())
    error_payload = {
        "id": error_trace_id,
        "agent_id": "00000000-0000-0000-0000-000000000002",
        "agent_role": "test-agent-blocked",
        "company_id": CBS_COMPANY_ID,
        "issue_id": "smoke-test-blocked",
        "task_type": "smoke-test",
        "confidence": "low",
        "error": "missing key: XERO_CLIENT_ID",
    }

    r = httpx.post(
        f"{SUPABASE_URL}/rest/v1/agent_traces",
        headers={**h, "Prefer": "return=minimal"},
        json=error_payload,
    )
    if r.status_code in (200, 201):
        cleanup_trace_ids.append(error_trace_id)

    try:
        result = subprocess.run(
            ["python3", "scripts/check-blocked-work.py", "--since", "1"],
            capture_output=True,
            text=True,
            timeout=15,
            env={**os.environ},
        )
        if "missing_key" in result.stdout.lower() or "XERO_CLIENT_ID" in result.stdout:
            report(7, total, "Blocked-work detection", "PASS", "blocker found: missing key")
        elif result.returncode == 1:
            report(7, total, "Blocked-work detection", "PASS", "blocked work detected")
        else:
            report(7, total, "Blocked-work detection", "FAIL", f"exit={result.returncode}: {result.stdout[:100]}")
    except Exception as e:
        report(7, total, "Blocked-work detection", "FAIL", str(e))

    # --- Step 8: Cleanup ---
    deleted = cleanup()
    report(8, total, "Cleanup", "PASS", f"{deleted} rows deleted")

    # Summary
    print(f"\nRESULT: {results['pass']} PASS, {results['fail']} FAIL, {results['skip']} SKIP")
    sys.exit(1 if results["fail"] > 0 else 0)


if __name__ == "__main__":
    main()
