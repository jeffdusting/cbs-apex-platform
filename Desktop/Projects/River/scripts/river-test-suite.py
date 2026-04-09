#!/usr/bin/env python3
"""Project River — Automated Test Suite (Task 1.18)

Three modes:
  --mode poc:        Runs against localhost:3100. Tests company CRUD, agent
                     creation, heartbeat invoke, issue lifecycle, checkout/release,
                     activity log, budget query, org chart, session persistence.
  --mode regression: Runs against production (PAPERCLIP_URL from env).
                     Non-destructive checks only.
  --mode monitor:    JSON status snapshot for the dashboard.

Usage:
    source scripts/env-setup.sh
    python scripts/river-test-suite.py --mode poc
    python scripts/river-test-suite.py --mode regression
    python scripts/river-test-suite.py --mode monitor > status.json
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime

import requests


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


def get_env_optional(key: str, default: str = "") -> str:
    """Retrieve an environment variable, returning default if unset."""
    return os.environ.get(key, default)


class TestRunner:
    """Test runner with result collection and reporting."""

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        self.results = []
        self.cleanup_ids = {"companies": [], "agents": [], "issues": []}

    def api(self, method: str, path: str, json_data: dict = None) -> requests.Response:
        """Make an API request."""
        url = f"{self.base_url}{path}"
        return requests.request(method, url, headers=self.headers, json=json_data, timeout=30)

    def test(self, name: str, func):
        """Run a test and record the result."""
        try:
            result = func()
            passed = result is True or (isinstance(result, dict) and result.get("passed", False))
            detail = result.get("detail", "") if isinstance(result, dict) else ""
            self.results.append({"name": name, "passed": passed, "detail": detail})
            status = "PASS" if passed else "FAIL"
            print(f"  [{status}] {name}{f' — {detail}' if detail else ''}")
        except Exception as e:
            self.results.append({"name": name, "passed": False, "detail": str(e)})
            print(f"  [FAIL] {name} — {e}")

    def cleanup(self):
        """Clean up test artefacts created during PoC tests."""
        for issue_id in self.cleanup_ids.get("issues", []):
            try:
                self.api("DELETE", f"/api/issues/{issue_id}")
            except Exception:
                pass
        for agent_id in self.cleanup_ids.get("agents", []):
            try:
                self.api("DELETE", f"/api/agents/{agent_id}")
            except Exception:
                pass
        for company_id in self.cleanup_ids.get("companies", []):
            try:
                self.api("POST", f"/api/companies/{company_id}/archive")
            except Exception:
                pass

    def summary(self) -> dict:
        """Return test summary."""
        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        failed = total - passed
        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "results": self.results,
        }


# ============================================================================
# PoC Tests (localhost:3100, may create/delete artefacts)
# ============================================================================
def run_poc_tests(runner: TestRunner):
    """Full PoC test suite against local instance."""
    print("\n--- Company CRUD ---")

    test_company_id = None

    def test_company_create():
        resp = runner.api("POST", "/api/companies", {
            "name": "River PoC Test Company",
            "description": "Automated test — will be archived after testing",
        })
        nonlocal test_company_id
        if resp.status_code in (200, 201):
            test_company_id = resp.json().get("id", resp.json().get("companyId"))
            runner.cleanup_ids["companies"].append(test_company_id)
            return {"passed": True, "detail": f"id={test_company_id}"}
        return {"passed": False, "detail": f"HTTP {resp.status_code}: {resp.text[:100]}"}

    def test_company_list():
        resp = runner.api("GET", "/api/companies")
        if resp.status_code == 200:
            data = resp.json()
            count = len(data) if isinstance(data, list) else len(data.get("companies", data.get("data", [])))
            return {"passed": count > 0, "detail": f"{count} companies"}
        return {"passed": False, "detail": f"HTTP {resp.status_code}"}

    runner.test("Company creation", test_company_create)
    runner.test("Company listing", test_company_list)

    if not test_company_id:
        print("  SKIP: Remaining tests require a company — creation failed")
        return

    # Agent tests
    print("\n--- Agent Creation ---")
    test_agent_id = None

    def test_agent_create():
        nonlocal test_agent_id
        resp = runner.api("POST", f"/api/companies/{test_company_id}/agents", {
            "name": "PoC Test Agent",
            "role": "general",
            "title": "Test Agent",
            "capabilities": "Automated testing",
            "adapterType": "claude_local",
            "adapterConfig": {
                "cwd": "/paperclip/workspaces/poc-test",
                "model": "claude-sonnet-4-20250514",
                "maxTurnsPerRun": 10,
                "dangerouslySkipPermissions": True,
                "graceSec": 15,
                "timeoutSec": 0,
                "env": {},
            },
            "runtimeConfig": {
                "heartbeat": {
                    "enabled": False,
                    "intervalSec": 0,
                    "cooldownSec": 10,
                    "wakeOnDemand": True,
                    "maxConcurrentRuns": 1,
                }
            },
            "budgetMonthlyCents": 100,
        })
        if resp.status_code in (200, 201):
            test_agent_id = resp.json().get("id", resp.json().get("agentId"))
            runner.cleanup_ids["agents"].append(test_agent_id)
            return {"passed": True, "detail": f"id={test_agent_id}"}
        return {"passed": False, "detail": f"HTTP {resp.status_code}: {resp.text[:100]}"}

    runner.test("Agent creation (direct/board operator)", test_agent_create)

    # Heartbeat invoke
    print("\n--- Heartbeat ---")

    def test_heartbeat_invoke():
        if not test_agent_id:
            return {"passed": False, "detail": "No agent to test"}
        resp = runner.api("POST", f"/api/agents/{test_agent_id}/heartbeat/invoke")
        return {"passed": resp.status_code == 202, "detail": f"HTTP {resp.status_code}"}

    runner.test("Heartbeat invoke", test_heartbeat_invoke)

    # Issue lifecycle
    print("\n--- Issue Lifecycle ---")
    test_issue_id = None

    def test_issue_create():
        nonlocal test_issue_id
        resp = runner.api("POST", f"/api/companies/{test_company_id}/issues", {
            "title": "PoC test issue",
            "description": "Automated test issue — will be deleted after testing",
            "priority": "low",
        })
        if resp.status_code in (200, 201):
            test_issue_id = resp.json().get("id", resp.json().get("issueId"))
            runner.cleanup_ids["issues"].append(test_issue_id)
            return {"passed": True, "detail": f"id={test_issue_id}"}
        return {"passed": False, "detail": f"HTTP {resp.status_code}: {resp.text[:100]}"}

    def test_issue_checkout():
        if not test_issue_id or not test_agent_id:
            return {"passed": False, "detail": "Missing issue or agent"}
        resp = runner.api("POST", f"/api/issues/{test_issue_id}/checkout", {
            "agentId": test_agent_id,
        })
        return {"passed": resp.status_code in (200, 204), "detail": f"HTTP {resp.status_code}"}

    def test_issue_release():
        if not test_issue_id:
            return {"passed": False, "detail": "Missing issue"}
        resp = runner.api("POST", f"/api/issues/{test_issue_id}/release")
        return {"passed": resp.status_code in (200, 204), "detail": f"HTTP {resp.status_code}"}

    runner.test("Issue creation", test_issue_create)
    runner.test("Issue checkout", test_issue_checkout)
    runner.test("Issue release", test_issue_release)

    # Activity log
    print("\n--- Activity & Budget ---")

    def test_activity_log():
        resp = runner.api("GET", f"/api/companies/{test_company_id}/activity")
        if resp.status_code == 200:
            data = resp.json()
            count = len(data) if isinstance(data, list) else len(data.get("activities", data.get("data", [])))
            return {"passed": True, "detail": f"{count} entries"}
        return {"passed": False, "detail": f"HTTP {resp.status_code}"}

    def test_budget_query():
        resp = runner.api("GET", f"/api/companies/{test_company_id}/costs/by-agent")
        return {"passed": resp.status_code == 200, "detail": f"HTTP {resp.status_code}"}

    runner.test("Activity log retrieval", test_activity_log)
    runner.test("Budget/cost query", test_budget_query)

    # Org chart
    print("\n--- Org Chart ---")

    def test_org_chart():
        resp = runner.api("GET", f"/api/companies/{test_company_id}/agents")
        if resp.status_code == 200:
            agents = resp.json()
            if isinstance(agents, list):
                return {"passed": len(agents) > 0, "detail": f"{len(agents)} agents"}
            count = len(agents.get("agents", agents.get("data", [])))
            return {"passed": count > 0, "detail": f"{count} agents"}
        return {"passed": False, "detail": f"HTTP {resp.status_code}"}

    runner.test("Org chart (agent listing)", test_org_chart)

    # Session persistence (check if agent state persists)
    print("\n--- Session Persistence ---")

    def test_session_persistence():
        if not test_agent_id:
            return {"passed": False, "detail": "No agent to test"}
        resp = runner.api("GET", f"/api/agents/{test_agent_id}")
        if resp.status_code == 200:
            agent = resp.json()
            return {"passed": agent.get("name") == "PoC Test Agent", "detail": "Agent state persisted"}
        return {"passed": False, "detail": f"HTTP {resp.status_code}"}

    runner.test("Session persistence", test_session_persistence)

    # Archive test company
    print("\n--- Cleanup ---")

    def test_company_archive():
        resp = runner.api("POST", f"/api/companies/{test_company_id}/archive")
        return {"passed": resp.status_code in (200, 204), "detail": f"HTTP {resp.status_code}"}

    runner.test("Company archive", test_company_archive)


# ============================================================================
# Regression Tests (non-destructive, production-safe)
# ============================================================================
def run_regression_tests(runner: TestRunner):
    """Non-destructive regression tests against production."""
    print("\n--- Connectivity ---")

    def test_api_reachable():
        resp = runner.api("GET", "/api/companies")
        return {"passed": resp.status_code == 200, "detail": f"HTTP {resp.status_code}"}

    runner.test("API reachable", test_api_reachable)

    print("\n--- Company Verification ---")

    def test_companies_exist():
        resp = runner.api("GET", "/api/companies")
        if resp.status_code != 200:
            return {"passed": False, "detail": f"HTTP {resp.status_code}"}
        data = resp.json()
        companies = data if isinstance(data, list) else data.get("companies", data.get("data", []))
        names = {c.get("name", "") for c in companies}
        expected = {"CBS Group", "WaterRoads"}
        missing = expected - names
        if missing:
            return {"passed": False, "detail": f"Missing: {missing}"}
        return {"passed": True, "detail": f"{len(companies)} companies, all expected present"}

    runner.test("Expected companies exist", test_companies_exist)

    print("\n--- Agent Verification ---")

    # Get company IDs
    resp = runner.api("GET", "/api/companies")
    companies = resp.json() if resp.status_code == 200 else []
    if not isinstance(companies, list):
        companies = companies.get("companies", companies.get("data", []))

    for company in companies:
        cid = company.get("id")
        cname = company.get("name", "unknown")
        status = company.get("status", "active")
        if status == "archived":
            continue

        def make_agent_test(company_id=cid, company_name=cname):
            def test():
                resp = runner.api("GET", f"/api/companies/{company_id}/agents")
                if resp.status_code != 200:
                    return {"passed": False, "detail": f"HTTP {resp.status_code}"}
                data = resp.json()
                agents = data if isinstance(data, list) else data.get("agents", data.get("data", []))
                return {"passed": len(agents) > 0, "detail": f"{len(agents)} agents"}
            return test

        runner.test(f"Agents in {cname}", make_agent_test())

    print("\n--- Budget Health ---")

    for company in companies:
        cid = company.get("id")
        cname = company.get("name", "unknown")
        status = company.get("status", "active")
        if status == "archived":
            continue

        def make_budget_test(company_id=cid, company_name=cname):
            def test():
                resp = runner.api("GET", f"/api/companies/{company_id}/costs/by-agent")
                return {"passed": resp.status_code == 200, "detail": f"HTTP {resp.status_code}"}
            return test

        runner.test(f"Budget query — {cname}", make_budget_test())

    print("\n--- Activity Log ---")

    for company in companies:
        cid = company.get("id")
        cname = company.get("name", "unknown")
        status = company.get("status", "active")
        if status == "archived":
            continue

        def make_activity_test(company_id=cid, company_name=cname):
            def test():
                resp = runner.api("GET", f"/api/companies/{company_id}/activity", )
                return {"passed": resp.status_code == 200, "detail": f"HTTP {resp.status_code}"}
            return test

        runner.test(f"Activity log — {cname}", make_activity_test())


# ============================================================================
# Monitor Mode (JSON snapshot)
# ============================================================================
def run_monitor(runner: TestRunner):
    """Generate a JSON status snapshot for the dashboard."""
    snapshot = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "paperclip_url": runner.base_url,
        "companies": [],
    }

    resp = runner.api("GET", "/api/companies")
    if resp.status_code != 200:
        snapshot["error"] = f"API unreachable — HTTP {resp.status_code}"
        print(json.dumps(snapshot, indent=2))
        return

    companies = resp.json()
    if not isinstance(companies, list):
        companies = companies.get("companies", companies.get("data", []))

    for company in companies:
        cid = company.get("id")
        cname = company.get("name", "unknown")
        status = company.get("status", "active")

        company_data = {
            "id": cid,
            "name": cname,
            "status": status,
            "agents": [],
        }

        if status != "archived":
            # Get agents
            agent_resp = runner.api("GET", f"/api/companies/{cid}/agents")
            if agent_resp.status_code == 200:
                agents = agent_resp.json()
                if not isinstance(agents, list):
                    agents = agents.get("agents", agents.get("data", []))
                for agent in agents:
                    hb = (agent.get("runtimeConfig") or {}).get("heartbeat", {})
                    company_data["agents"].append({
                        "id": agent.get("id"),
                        "name": agent.get("name"),
                        "role": agent.get("role"),
                        "heartbeat_enabled": hb.get("enabled", False),
                        "heartbeat_interval_sec": hb.get("intervalSec", 0),
                        "budget_monthly_cents": agent.get("budgetMonthlyCents", 0),
                        "last_active": agent.get("lastActiveAt"),
                    })

            # Get costs
            cost_resp = runner.api("GET", f"/api/companies/{cid}/costs/by-agent")
            if cost_resp.status_code == 200:
                company_data["costs"] = cost_resp.json()

        snapshot["companies"].append(company_data)

    print(json.dumps(snapshot, indent=2))


# ============================================================================
# Main
# ============================================================================
def main():
    parser = argparse.ArgumentParser(description="Project River automated test suite")
    parser.add_argument(
        "--mode",
        required=True,
        choices=["poc", "regression", "monitor"],
        help="Test mode: poc (localhost), regression (production), monitor (JSON snapshot)",
    )
    args = parser.parse_args()

    if args.mode == "poc":
        base_url = get_env_optional("PAPERCLIP_URL", "http://localhost:3100")
        api_key = get_env("PAPERCLIP_API_KEY")
    elif args.mode in ("regression", "monitor"):
        base_url = get_env("PAPERCLIP_URL")
        api_key = get_env("PAPERCLIP_API_KEY")

    runner = TestRunner(base_url, api_key)

    if args.mode == "monitor":
        run_monitor(runner)
        return

    print("=" * 60)
    print(f"Project River — Test Suite ({args.mode} mode)")
    print("=" * 60)
    print(f"Target: {base_url}")
    print()

    if args.mode == "poc":
        run_poc_tests(runner)
    elif args.mode == "regression":
        run_regression_tests(runner)

    # Summary
    summary = runner.summary()
    print("\n" + "=" * 60)
    print("TEST SUITE SUMMARY")
    print("=" * 60)
    print(f"  Total:  {summary['total']}")
    print(f"  Passed: {summary['passed']}")
    print(f"  Failed: {summary['failed']}")
    print()

    if summary["failed"] > 0:
        print("FAILED TESTS:")
        for r in summary["results"]:
            if not r["passed"]:
                print(f"  - {r['name']}: {r['detail']}")
        sys.exit(1)
    else:
        print("ALL TESTS PASSED")

    # Cleanup for PoC
    if args.mode == "poc":
        print("\nCleaning up test artefacts...")
        runner.cleanup()
        print("Done.")


if __name__ == "__main__":
    main()
