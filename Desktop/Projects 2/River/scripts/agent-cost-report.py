#!/usr/bin/env python3
"""
S5-P6 (IB.5): Per-agent cost report.

Aggregates tokens_input + tokens_output from agent_traces for the target month,
compares against monthly budgets derived from agent-config/token-budgets.md,
and flags agents above warning / anomaly thresholds.

Usage:
    python3 scripts/agent-cost-report.py                  # current month, report only
    python3 scripts/agent-cost-report.py --month 2026-03  # historic month
    python3 scripts/agent-cost-report.py --alert          # also push Teams card on anomaly

Exit codes:
    0 = success (report emitted)
    1 = one or more agents flagged as anomaly (>120% budget)
    2 = configuration error
"""

import argparse
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import httpx

WARN_PCT = 0.80
ANOMALY_PCT = 1.20

# Monthly budgets in USD, distilled from agent-config/token-budgets.md.
# When the underlying agent_traces data has a `cost_cents` column, prefer that;
# here we fall back to reporting tokens + a USD estimate using Anthropic list prices.
AGENT_BUDGETS_USD: dict[str, float] = {
    "cbs-executive": 125.00,
    "tender-intelligence": 50.00,
    "tender-coordination": 20.00,
    "technical-writing": 25.00,
    "compliance": 5.00,
    "pricing-and-commercial": 10.00,
    "governance-cbs": 15.00,
    "office-management-cbs": 4.00,
    "research-cbs": 10.00,
    "wr-executive": 15.00,
    "governance-wr": 15.00,
    "office-management-wr": 4.00,
    "monitoring": 10.00,
}

# Rough cost model: Opus 4.6 $15 / $75 per M in/out; Sonnet 4 $3 / $15; Haiku $1 / $5.
# We use a blended Sonnet-like rate as a reasonable default when model metadata is absent.
USD_PER_INPUT_TOKEN = 3.00 / 1_000_000
USD_PER_OUTPUT_TOKEN = 15.00 / 1_000_000


def month_bounds(month: str) -> tuple[str, str]:
    start = datetime.strptime(month, "%Y-%m").replace(tzinfo=timezone.utc)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return start.isoformat(), end.isoformat()


def fetch_token_usage(url: str, key: str, month: str) -> dict[str, tuple[int, int, int]]:
    """Returns {agent_role: (trace_count, tokens_input, tokens_output)}."""
    start, end = month_bounds(month)
    headers = {"apikey": key, "Authorization": f"Bearer {key}"}

    totals: dict[str, list[int]] = defaultdict(lambda: [0, 0, 0])
    offset = 0
    page = 1000

    while True:
        params = {
            "created_at": f"gte.{start}",
            "select": "agent_role,tokens_input,tokens_output",
            "limit": str(page),
            "offset": str(offset),
        }
        # Second filter param (same key would be overwritten, so use a compound filter)
        r = httpx.get(
            f"{url}/rest/v1/agent_traces",
            headers=headers,
            params=[
                ("created_at", f"gte.{start}"),
                ("created_at", f"lt.{end}"),
                ("select", "agent_role,tokens_input,tokens_output"),
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
            role = row.get("agent_role") or "unknown"
            ti = int(row.get("tokens_input") or 0)
            to = int(row.get("tokens_output") or 0)
            totals[role][0] += 1
            totals[role][1] += ti
            totals[role][2] += to
        if len(rows) < page:
            break
        offset += page

    return {k: (v[0], v[1], v[2]) for k, v in totals.items()}


def estimate_usd(tokens_in: int, tokens_out: int) -> float:
    return tokens_in * USD_PER_INPUT_TOKEN + tokens_out * USD_PER_OUTPUT_TOKEN


def send_teams_alert(webhook: str, month: str, anomalies: list[tuple[str, float, float, float]]) -> None:
    lines = "\n".join(
        f"- {role}: ${cost:.2f} of ${budget:.2f} ({util*100:.0f}%)"
        for role, cost, budget, util in anomalies
    )
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
                        {"type": "TextBlock", "text": f"TOKEN BUDGET ANOMALY — {month}", "weight": "Bolder", "color": "Attention"},
                        {"type": "TextBlock", "text": lines, "wrap": True, "size": "Small", "fontType": "Monospace"},
                    ],
                },
            }
        ],
    }
    try:
        r = httpx.post(webhook, json=payload, timeout=10)
        if r.status_code in (200, 202):
            print("Teams anomaly alert sent")
        else:
            print(f"Teams anomaly alert failed: {r.status_code}")
    except Exception as e:
        print(f"Teams anomaly alert error: {e}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Per-agent cost report")
    parser.add_argument("--month", default=datetime.now(timezone.utc).strftime("%Y-%m"), help="YYYY-MM (default: current)")
    parser.add_argument("--alert", action="store_true", help="Send Teams card when anomalies exist")
    args = parser.parse_args()

    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    webhook = os.environ.get("TEAMS_WEBHOOK_URL", "")
    if not url or not key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(2)

    usage = fetch_token_usage(url, key, args.month)

    print(f"=== Agent cost report — {args.month} ===")
    print(f"{'agent':<28} {'runs':>6} {'tokens_in':>12} {'tokens_out':>12} {'usd_est':>10} {'budget':>10} {'util':>7}")

    anomalies: list[tuple[str, float, float, float]] = []
    warnings: list[str] = []

    for role in sorted(set(AGENT_BUDGETS_USD) | set(usage)):
        runs, ti, to = usage.get(role, (0, 0, 0))
        cost = estimate_usd(ti, to)
        budget = AGENT_BUDGETS_USD.get(role, 0.0)
        util = (cost / budget) if budget else 0.0
        flag = ""
        if budget and util >= ANOMALY_PCT:
            flag = "ANOMALY"
            anomalies.append((role, cost, budget, util))
        elif budget and util >= WARN_PCT:
            flag = "WARN"
            warnings.append(role)
        print(f"{role:<28} {runs:>6d} {ti:>12d} {to:>12d} ${cost:>8.2f} ${budget:>8.2f} {util*100:>6.0f}%  {flag}")

    print(f"\nSummary: {len(anomalies)} anomalies, {len(warnings)} warnings")

    if anomalies and args.alert and webhook:
        send_teams_alert(webhook, args.month, anomalies)

    sys.exit(1 if anomalies else 0)


if __name__ == "__main__":
    main()
