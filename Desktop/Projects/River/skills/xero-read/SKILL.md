# Skill: xero-read

## Purpose

Retrieve financial data from the Xero accounting platform for CBS Group. This skill provides read-only access to Xero via the Xero API with OAuth 2.0 authentication.

## CRITICAL RESTRICTION

**You have read-only access. You cannot create, modify, or delete any financial records in Xero. Any attempt to write to Xero will fail.**

This restriction is enforced at the OAuth scope level (`accounting.reports.read`, `accounting.contacts.read`, `accounting.transactions.read`). The token does not carry write permissions.

Do not attempt to:
- Create invoices, bills, or credit notes
- Modify contacts, accounts, or tax rates
- Delete any record
- Approve payments or batch payments
- Post manual journals

If a task requires writing to Xero, create an approval ticket and flag it for human action.

## Environment Variables

| Variable | Description |
|---|---|
| `XERO_CLIENT_ID` | OAuth 2.0 client ID |
| `XERO_CLIENT_SECRET` | OAuth 2.0 client secret |
| `XERO_TENANT_ID` | Xero tenant (organisation) ID |
| `XERO_REFRESH_TOKEN` | OAuth 2.0 refresh token (browser-authorised) |

These are injected via `adapterConfig.env` on the agent. Never hardcode credentials.

## OAuth Token Refresh

The Xero access token expires every 30 minutes. Always refresh the token before making API calls.

```python
import os
import httpx

XERO_CLIENT_ID = os.environ["XERO_CLIENT_ID"]
XERO_CLIENT_SECRET = os.environ["XERO_CLIENT_SECRET"]
XERO_TENANT_ID = os.environ["XERO_TENANT_ID"]
XERO_REFRESH_TOKEN = os.environ["XERO_REFRESH_TOKEN"]

TOKEN_URL = "https://identity.xero.com/connect/token"
API_BASE = "https://api.xero.com/api.xro/2.0"


def refresh_access_token() -> str:
    """
    Exchange the refresh token for a new access token.
    Returns the access token string.

    Note: The refresh token is single-use. Each refresh returns a new
    refresh token. In this agent context, the refresh token in the env var
    is the current valid token. If token refresh fails, flag for human
    re-authorisation (see Xero OAuth Renewal in the operator runbook).
    """
    response = httpx.post(
        TOKEN_URL,
        data={
            "grant_type": "refresh_token",
            "refresh_token": XERO_REFRESH_TOKEN,
            "client_id": XERO_CLIENT_ID,
            "client_secret": XERO_CLIENT_SECRET,
        },
    )
    if response.status_code != 200:
        raise RuntimeError(
            "Xero token refresh failed. The refresh token may have expired. "
            "Flag this for human re-authorisation via the Xero developer app."
        )
    data = response.json()
    # The new refresh token should be stored for subsequent use.
    # In agent context, update the env var or flag for operator rotation.
    return data["access_token"]


def xero_headers(access_token: str) -> dict:
    return {
        "Authorization": f"Bearer {access_token}",
        "Xero-Tenant-Id": XERO_TENANT_ID,
        "Accept": "application/json",
    }
```

## Read-Only Query Examples

### Profit and Loss Summary

```python
def get_profit_and_loss(access_token: str, from_date: str = None, to_date: str = None) -> dict:
    """
    Retrieve the Profit and Loss report.

    Args:
        access_token: Valid Xero access token.
        from_date: Start date (YYYY-MM-DD). Defaults to start of current financial year.
        to_date: End date (YYYY-MM-DD). Defaults to today.

    Returns:
        Xero ProfitAndLoss report object.
    """
    params = {}
    if from_date:
        params["fromDate"] = from_date
    if to_date:
        params["toDate"] = to_date

    response = httpx.get(
        f"{API_BASE}/Reports/ProfitAndLoss",
        headers=xero_headers(access_token),
        params=params,
    )
    response.raise_for_status()
    return response.json()
```

### Cash Position (Balance Sheet)

```python
def get_balance_sheet(access_token: str, date: str = None) -> dict:
    """
    Retrieve the Balance Sheet report for cash position analysis.

    Args:
        access_token: Valid Xero access token.
        date: Report date (YYYY-MM-DD). Defaults to today.

    Returns:
        Xero BalanceSheet report object.
    """
    params = {}
    if date:
        params["date"] = date

    response = httpx.get(
        f"{API_BASE}/Reports/BalanceSheet",
        headers=xero_headers(access_token),
        params=params,
    )
    response.raise_for_status()
    return response.json()
```

### Budget vs Actual

```python
def get_budget_summary(access_token: str, date: str = None) -> dict:
    """
    Retrieve the Budget Summary report to compare budget vs actual figures.

    Args:
        access_token: Valid Xero access token.
        date: Report month (YYYY-MM-DD, day is ignored). Defaults to current month.

    Returns:
        Xero BudgetSummary report object.
    """
    params = {}
    if date:
        params["date"] = date

    response = httpx.get(
        f"{API_BASE}/Reports/BudgetSummary",
        headers=xero_headers(access_token),
        params=params,
    )
    response.raise_for_status()
    return response.json()
```

### Aged Receivables

```python
def get_aged_receivables(access_token: str, date: str = None) -> dict:
    """
    Retrieve the Aged Receivables report.

    Args:
        access_token: Valid Xero access token.
        date: Report date (YYYY-MM-DD). Defaults to today.
    """
    params = {}
    if date:
        params["date"] = date

    response = httpx.get(
        f"{API_BASE}/Reports/AgedReceivablesByContact",
        headers=xero_headers(access_token),
        params=params,
    )
    response.raise_for_status()
    return response.json()
```

## Report Parsing Guidance

Xero reports return a nested structure under `Reports[0].Rows`. Each row has a `RowType` (`Header`, `Section`, `SummaryRow`, `Row`) and `Cells` containing `Value` fields.

To extract the net profit from a P&L report:

```python
def extract_net_profit(report: dict) -> str:
    """Extract the net profit figure from a Xero P&L report."""
    for row in report.get("Reports", [{}])[0].get("Rows", []):
        if row.get("RowType") == "Section" and row.get("Title") == "Net Profit":
            for sub_row in row.get("Rows", []):
                if sub_row.get("RowType") == "SummaryRow":
                    cells = sub_row.get("Cells", [])
                    if len(cells) >= 2:
                        return cells[1].get("Value", "N/A")
    return "N/A"
```

## Error Handling

| HTTP Status | Meaning | Action |
|---|---|---|
| 401 | Token expired or invalid | Refresh the access token and retry once |
| 403 | Insufficient scope | You are attempting a write operation. Stop. |
| 404 | Resource not found | Check the tenant ID and endpoint path |
| 429 | Rate limited | Wait 60 seconds and retry. Xero allows 60 calls per minute. |
| 503 | Xero service unavailable | Wait 5 minutes and retry once. If persistent, flag for operator. |

## Token Expiry Workflow

1. Before each heartbeat's Xero calls, call `refresh_access_token()`.
2. If refresh fails with a 400 or 401 error, the refresh token has expired (Xero refresh tokens expire after 60 days of non-use).
3. Create an approval ticket titled "Xero OAuth Re-authorisation Required" and assign it to the operator.
4. Do not retry. Continue the heartbeat with whatever data is already available.
