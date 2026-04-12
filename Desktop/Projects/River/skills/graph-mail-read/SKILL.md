# Skill: graph-mail-read

## Purpose

Read emails from Microsoft 365 mailboxes via the Microsoft Graph API (Mail.Read application permission). Used for scanning tender notification emails, monitoring correspondence, and extracting structured data from incoming mail.

## Environment Variables

| Variable | Description |
|---|---|
| `MICROSOFT_CLIENT_ID` | Azure AD application client ID |
| `MICROSOFT_CLIENT_SECRET` | Azure AD application client secret |
| `MICROSOFT_TENANT_ID` | Azure AD tenant ID |

These are injected via `adapterConfig.env` on the agent. Never hardcode credentials.

## Authentication

The Graph API uses client credentials flow (application permissions, not delegated). This grants access to all mailboxes in the tenant without user sign-in.

```python
import os
import msal
import httpx

TENANT_ID = os.environ["MICROSOFT_TENANT_ID"]
CLIENT_ID = os.environ["MICROSOFT_CLIENT_ID"]
CLIENT_SECRET = os.environ["MICROSOFT_CLIENT_SECRET"]

GRAPH_BASE = "https://graph.microsoft.com/v1.0"


def get_graph_token() -> str:
    """Acquire an access token via client credentials flow."""
    app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}",
        client_credential=CLIENT_SECRET,
    )
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
    if "access_token" not in result:
        raise RuntimeError(f"Token acquisition failed: {result.get('error_description', result)}")
    return result["access_token"]
```

## Primary Mailbox

Jeff Dusting's mailbox: `jeff@cbs.com.au`

All email queries should target this mailbox unless otherwise specified.

## Reading Messages

### List Recent Messages

```python
def get_messages(token: str, user: str = "jeff@cbs.com.au",
                 filter_query: str = None, top: int = 20,
                 select: str = "subject,from,receivedDateTime,bodyPreview,body") -> list[dict]:
    """
    Retrieve messages from a mailbox.

    Args:
        token: Graph API access token.
        user: User principal name (email address).
        filter_query: OData filter string (optional).
        top: Maximum messages to return.
        select: Fields to include in response.

    Returns:
        List of message objects.
    """
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "$select": select,
        "$top": top,
        "$orderby": "receivedDateTime desc",
    }
    if filter_query:
        params["$filter"] = filter_query

    resp = httpx.get(
        f"{GRAPH_BASE}/users/{user}/messages",
        headers=headers,
        params=params,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json().get("value", [])
```

### Filter by Sender

```python
from datetime import datetime, timedelta, timezone

def get_messages_from_sender(token: str, sender_pattern: str,
                              days_back: int = 7) -> list[dict]:
    """Get messages from a specific sender within a date range."""
    since = (datetime.now(timezone.utc) - timedelta(days=days_back)).strftime("%Y-%m-%dT%H:%M:%SZ")
    filter_q = f"receivedDateTime ge {since} and contains(from/emailAddress/address, '{sender_pattern}')"
    return get_messages(token, filter_query=filter_q)
```

### Filter by Subject Keywords

```python
def get_messages_by_subject(token: str, keywords: list[str],
                             days_back: int = 7) -> list[dict]:
    """Get messages containing any of the keywords in subject."""
    since = (datetime.now(timezone.utc) - timedelta(days=days_back)).strftime("%Y-%m-%dT%H:%M:%SZ")
    keyword_filters = " or ".join(f"contains(subject, '{kw}')" for kw in keywords)
    filter_q = f"receivedDateTime ge {since} and ({keyword_filters})"
    return get_messages(token, filter_query=filter_q)
```

### Read Full Message Body

```python
def get_message_body(token: str, message_id: str,
                     user: str = "jeff@cbs.com.au") -> str:
    """Get the full body content of a specific message."""
    headers = {"Authorization": f"Bearer {token}"}
    resp = httpx.get(
        f"{GRAPH_BASE}/users/{user}/messages/{message_id}",
        headers=headers,
        params={"$select": "body"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json().get("body", {}).get("content", "")
```

## Common Use Cases

### Tender Notification Scanning

See the `tender-portal-query` skill for the complete tender email scanning workflow. This skill provides the underlying Graph API patterns.

```python
# Scan for all tender-related emails in the last 4 days
token = get_graph_token()
tender_emails = get_messages(token, filter_query=(
    f"receivedDateTime ge {since} and ("
    "contains(from/emailAddress/address, 'tenders.gov.au') or "
    "contains(from/emailAddress/address, 'tenders.vic.gov.au') or "
    "contains(from/emailAddress/address, 'gets.govt.nz') or "
    "contains(from/emailAddress/address, 'artc.com.au') or "
    "contains(subject, 'tender') or "
    "contains(subject, 'RFT') or "
    "contains(subject, 'RFQ')"
    ")"
))
```

### Correspondence Monitoring (Office Management)

```python
# Get unread messages from the last 24 hours
token = get_graph_token()
recent = get_messages(token, filter_query=(
    f"receivedDateTime ge {since} and isRead eq false"
), top=50)
```

### Client Communication Tracking

```python
# Find emails from/to a specific client
token = get_graph_token()
client_emails = get_messages(token, filter_query=(
    "contains(from/emailAddress/address, 'transport.nsw.gov.au') or "
    "contains(toRecipients/any(r: contains(r/emailAddress/address, 'transport.nsw.gov.au')))"
))
```

## Permissions

| Permission | Scope | Granted |
|---|---|---|
| Mail.Read | Application | YES — read all mailboxes |
| Mail.Send | Application | **NO — intentionally excluded (hard stop)** |

The application can read email but CANNOT send email. This is enforced at the Azure AD permission level, not just in agent instructions.

## Rate Limits

Microsoft Graph API throttling:
- 10,000 requests per 10 minutes per application
- Individual mailbox: 10,000 requests per 10 minutes

For agent use, stay well under these limits. A daily tender scan uses ~5-10 requests.

## Best Practices

1. Always filter by date range — do not scan entire mailbox history.
2. Use `$select` to retrieve only needed fields — reduces response size and latency.
3. Parse email body as HTML — Graph returns HTML content. Use simple text extraction or regex for structured data.
4. Cache the access token for the duration of the heartbeat run — do not acquire a new token per request.
5. Log the number of emails scanned and results found in your output quality signal.
