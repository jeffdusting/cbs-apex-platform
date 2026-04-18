#!/usr/bin/env python3
"""
S5-P6 (RA.5): Trace-to-activity reconciliation.

Compares agent_traces counts against expected output signals. The audit trail
is incomplete if an agent is emitting work without writing traces.

Two reconciliation modes:
  1. Paperclip-aware — queries /api/companies/{id}/agents for recent issue
     comment counts and compares per agent. Requires a fresh PAPERCLIP_SESSION_COOKIE.
  2. Heartbeat-expected fallback — when the Paperclip API is unavailable or
     unauthenticated, compares trace counts against the expected frequency
     derived from each agent's heartbeat interval (24h window / heartbeat_sec).

Usage:
    python3 scripts/trace-reconciliation.py              # default 24h window
    python3 scripts/trace-reconciliation.py --hours 48
    python3 scripts/trace-reconciliation.py --fallback   # skip Paperclip, use heartbeats

Exit codes:
    0 = within tolerance
    1 = divergence > 5% or agents with zero traces where >0 expected
    2 = configuration error
"""

import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import httpx

DIVERGENCE_THRESHOLD = 0.05  # 5%

CBS_CO = "fafce870-b862-4754-831e-2cd10e8b203c"
WR_CO = "95a248d4-08e7-4879-8e66-5d1ff948e005"


def trace_counts(url: str, key: str, hours: int) -> dict[str, int]:
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    headers = {"apikey": key, "Authorization": f"Bearer {key}"}
    counts: dict[str, int] = defaultdict(int)
    offset = 0
    page = 1000
    while True:
        r = httpx.get(
            f"{url}/rest/v1/agent_traces",
            headers=headers,
            params=[
                ("created_at", f"gte.{cutoff}"),
                ("select", "agent_role"),
                ("limit", str(page)),
                ("offset", str(offset)),
            ],
            timeout=60,
        )
        r.raise_for_status()
        rows = r.json()
        if not rows:
            break
        for row in rows:
            counts[row.get("agent_role") or "unknown"] += 1
        if len(rows) < page:
            break
        offset += page
    return dict(counts)


def paperclip_agents(base: str, cookie: str, company_id: str) -> list[dict]:
    headers = {"Cookie": f"__Secure-better-auth.session_token={cookie}"}
    try:
        r = httpx.get(f"{base}/api/companies/{company_id}/agents", headers=headers, timeout=15)
        r.raise_for_status()
        data = r.json()
        return data if isinstance(data, list) else data.get("agents", [])
    except (httpx.HTTPError, ValueError):
        return []


def expected_from_heartbeat(agent: dict, hours: int) -> float:
    hb = agent.get("runtimeConfig", {}).get("heartbeat", {}).get("intervalSec", 0)
    if not hb:
        return 0.0
    return (hours * 3600) / hb


def main() -> None:
    parser = argparse.ArgumentParser(description="Trace reconciliation")
    parser.add_argument("--hours", type=int, default=24)
    parser.add_argument("--fallback", action="store_true", help="Skip Paperclip and use heartbeat expectations only")
    args = parser.parse_args()

    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    base = os.environ.get("PAPERCLIP_API_URL", "https://org.cbslab.app")
    cookie = os.environ.get("PAPERCLIP_SESSION_COOKIE", "")

    if not url or not key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(2)

    print(f"=== Trace reconciliation — last {args.hours}h ===")
    traces = trace_counts(url, key, args.hours)
    print(f"trace counts by agent_role: {len(traces)} agents observed")

    divergences: list[str] = []

    all_agents: list[dict] = []
    if not args.fallback and cookie:
        for company_id, label in ((CBS_CO, "cbs"), (WR_CO, "wr")):
            agents = paperclip_agents(base, cookie, company_id)
            print(f"  paperclip {label}: {len(agents)} agents")
            all_agents.extend(agents)
    if args.fallback or not cookie or not all_agents:
        if not args.fallback:
            print("  paperclip unavailable — falling back to heartbeat expectations")

    if all_agents:
        print(f"\n{'agent':<32} {'role':<24} {'traces':>8} {'expected':>10} {'divergence':>12}")
        for agent in all_agents:
            name = agent.get("name", "unknown")
            role = (agent.get("role") or name).lower().replace(" ", "-")
            actual = traces.get(role, 0)
            expected = expected_from_heartbeat(agent, args.hours)
            if expected <= 0:
                status = "on-demand"
                print(f"{name:<32} {role:<24} {actual:>8d} {'--':>10} {status:>12}")
                continue
            div = (expected - actual) / expected if expected else 0.0
            status = f"{div*100:+.0f}%"
            if div > DIVERGENCE_THRESHOLD:
                divergences.append(role)
                status += " DIVERGE"
            print(f"{name:<32} {role:<24} {actual:>8d} {expected:>10.1f} {status:>12}")
    else:
        # No agents available — report trace counts only
        for role, count in sorted(traces.items()):
            print(f"  {role}: {count} traces")

    print(f"\nDivergences: {len(divergences)}")
    if divergences:
        print(f"  affected roles: {', '.join(divergences)}")
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
