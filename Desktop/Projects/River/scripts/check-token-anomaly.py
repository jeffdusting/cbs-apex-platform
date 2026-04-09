#!/usr/bin/env python3
"""Project River — Token Consumption Anomaly Check

Flags any agent that consumed >20% of its monthly budget in the most recent
heartbeat run. Designed to run after each heartbeat cycle or as a periodic check.

Usage:
    export PAPERCLIP_URL="https://org.cbslab.app"
    export PAPERCLIP_BOARD_COOKIE="__Secure-better-auth.session_token=..."
    python3 scripts/check-token-anomaly.py
"""

import os
import sys
import requests
import json

PAPERCLIP_URL = os.environ.get("PAPERCLIP_URL", "https://org.cbslab.app")
COOKIE_VALUE = os.environ.get("PAPERCLIP_BOARD_COOKIE", "")
COMPANY_ID = os.environ.get("CBS_COMPANY_ID", "fafce870-b862-4754-831e-2cd10e8b203c")
ANOMALY_THRESHOLD = 0.20  # 20% of monthly budget in a single heartbeat

TEAMS_WEBHOOK_URL = os.environ.get("TEAMS_WEBHOOK_URL", "")


def get_cookies():
    if COOKIE_VALUE:
        return {"__Secure-better-auth.session_token": COOKIE_VALUE}
    return {}


def check_anomalies():
    cookies = get_cookies()
    if not cookies:
        print("WARNING: No board cookie set. Using agent key fallback.")

    r = requests.get(
        f"{PAPERCLIP_URL}/api/companies/{COMPANY_ID}/agents", cookies=cookies
    )
    if r.status_code != 200:
        print(f"ERROR: Could not fetch agents — {r.status_code}")
        sys.exit(1)

    agents = r.json()
    anomalies = []

    print(f"{'Agent':<25} {'Spent':>8} {'Budget':>8} {'Usage':>7} {'Status'}")
    print("-" * 65)

    for a in agents:
        name = a.get("name", "?")
        spent = a.get("spentMonthlyCents", 0)
        budget = a.get("budgetMonthlyCents", 0)

        if budget == 0:
            pct = 0
            status = "no budget"
        else:
            pct = spent / budget
            if pct >= ANOMALY_THRESHOLD:
                status = "ANOMALY"
                anomalies.append(
                    {"name": name, "spent": spent, "budget": budget, "pct": pct}
                )
            elif pct >= ANOMALY_THRESHOLD * 0.8:  # 80% of threshold = warning
                status = "WARNING"
            else:
                status = "OK"

        print(
            f"{name:<25} {spent:>7}c {budget:>7}c {pct:>6.1%} {status}"
        )

    if anomalies:
        print(f"\n{'='*65}")
        print(f"ANOMALIES DETECTED: {len(anomalies)}")
        for a in anomalies:
            print(
                f"  {a['name']}: {a['spent']}c / {a['budget']}c ({a['pct']:.0%})"
            )

        # Send Teams notification if webhook available
        if TEAMS_WEBHOOK_URL:
            lines = ["TOKEN ANOMALY ALERT"]
            for a in anomalies:
                lines.append(
                    f"{a['name']}: {a['spent']}c spent of {a['budget']}c budget ({a['pct']:.0%})"
                )
            lines.append("Action: Review agent activity in Paperclip dashboard")

            requests.post(
                TEAMS_WEBHOOK_URL,
                json={"title": "\n".join(lines)},
                timeout=30,
            )
            print("Teams notification sent.")

        sys.exit(1)
    else:
        print("\nNo anomalies detected.")
        sys.exit(0)


if __name__ == "__main__":
    check_anomalies()
