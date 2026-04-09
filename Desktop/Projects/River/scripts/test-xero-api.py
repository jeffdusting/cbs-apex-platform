#!/usr/bin/env python3
"""Project River — Xero API Smoke Test (Task 1.6)

Walks through the Xero OAuth 2.0 authorisation flow:
1. Prints an authorisation URL for the user to open in a browser
2. Accepts the callback code
3. Exchanges for access token
4. Retrieves Profit & Loss summary

Usage:
    source scripts/env-setup.sh
    pip install --break-system-packages requests
    python scripts/test-xero-api.py

    NOTE: The xero-python SDK is available but for this smoke test we use
    direct HTTP calls to keep the OAuth flow transparent and debuggable.
"""

import os
import sys
import json
import urllib.parse
import http.server
import threading

import requests


XERO_AUTH_URL = "https://login.xero.com/identity/connect/authorize"
XERO_TOKEN_URL = "https://identity.xero.com/connect/token"
XERO_API_BASE = "https://api.xero.com/api.xro/2.0"
XERO_CONNECTIONS_URL = "https://api.xero.com/connections"
REDIRECT_URI = "http://localhost:8089/callback"


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


def run_test():
    """Run the Xero OAuth smoke test."""
    print("=" * 60)
    print("Project River — Xero API Smoke Test")
    print("=" * 60)

    client_id = get_env("XERO_CLIENT_ID")
    client_secret = get_env("XERO_CLIENT_SECRET")

    # Step 1: Generate authorisation URL
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "scope": "openid profile email accounting.transactions.read accounting.reports.read offline_access",
        "state": "river-smoke-test",
    }
    auth_url = f"{XERO_AUTH_URL}?{urllib.parse.urlencode(params)}"

    print("\n[1/4] Open this URL in your browser to authorise:")
    print(f"\n  {auth_url}\n")
    print("A local server will listen on http://localhost:8089/callback")
    print("for the redirect. Alternatively, paste the full callback URL below.\n")

    # Start a minimal HTTP server to capture the callback
    auth_code = None
    server_error = None

    class CallbackHandler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            nonlocal auth_code
            parsed = urllib.parse.urlparse(self.path)
            qs = urllib.parse.parse_qs(parsed.query)
            auth_code = qs.get("code", [None])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<h2>Authorisation received. You can close this tab.</h2>")

        def log_message(self, format, *args):
            pass  # Suppress request logging

    server = http.server.HTTPServer(("localhost", 8089), CallbackHandler)
    server_thread = threading.Thread(target=server.handle_request, daemon=True)
    server_thread.start()

    # Also accept manual paste
    print("Waiting for callback (or paste the full callback URL here)...")
    try:
        manual_input = input("Callback URL (or press Enter if browser redirect worked): ").strip()
        if manual_input and "code=" in manual_input:
            parsed = urllib.parse.urlparse(manual_input)
            qs = urllib.parse.parse_qs(parsed.query)
            auth_code = qs.get("code", [None])[0]
    except EOFError:
        pass

    # Wait briefly for server callback if no manual input
    server_thread.join(timeout=60)
    server.server_close()

    if not auth_code:
        print("ERROR: No authorisation code received.")
        sys.exit(1)

    print(f"  PASS: Authorisation code received ({auth_code[:20]}...)")

    # Step 2: Exchange for access token
    print("\n[2/4] Exchanging code for access token...")
    token_resp = requests.post(
        XERO_TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": auth_code,
            "redirect_uri": REDIRECT_URI,
            "client_id": client_id,
            "client_secret": client_secret,
        },
    )

    if token_resp.status_code != 200:
        print(f"  FAIL: Token exchange failed — {token_resp.status_code} — {token_resp.text}")
        sys.exit(1)

    tokens = token_resp.json()
    access_token = tokens["access_token"]
    print("  PASS: Access token acquired")

    # Step 3: Get tenant ID from connections
    print("\n[3/4] Retrieving Xero tenant connections...")
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    conn_resp = requests.get(XERO_CONNECTIONS_URL, headers=headers)

    if conn_resp.status_code != 200:
        print(f"  FAIL: Connections request failed — {conn_resp.status_code}")
        sys.exit(1)

    connections = conn_resp.json()
    if not connections:
        print("  FAIL: No Xero tenants connected")
        sys.exit(1)

    tenant_id = connections[0]["tenantId"]
    tenant_name = connections[0].get("tenantName", "unknown")
    print(f"  PASS: Connected to tenant '{tenant_name}' (id={tenant_id})")

    # Step 4: Retrieve P&L summary
    print("\n[4/4] Retrieving Profit & Loss summary...")
    headers["Xero-tenant-id"] = tenant_id
    pl_resp = requests.get(
        f"{XERO_API_BASE}/Reports/ProfitAndLoss",
        headers=headers,
        params={"periods": 1, "timeframe": "MONTH"},
    )

    if pl_resp.status_code == 200:
        report = pl_resp.json()
        report_name = report.get("Reports", [{}])[0].get("ReportName", "P&L Report")
        print(f"  PASS: Retrieved '{report_name}'")
        # Print summary rows
        for report_item in report.get("Reports", []):
            for row in report_item.get("Rows", []):
                if row.get("RowType") == "Section":
                    title = row.get("Title", "")
                    if title:
                        print(f"    Section: {title}")
    else:
        print(f"  FAIL: P&L request failed — {pl_resp.status_code} — {pl_resp.text}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("Xero API smoke test COMPLETE — all checks passed")
    print("=" * 60)


if __name__ == "__main__":
    run_test()
