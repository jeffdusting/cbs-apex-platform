# Skill: teams-notify

## Purpose

Post notifications to Microsoft Teams channels via the Microsoft Graph API. Used by governance and tender agents to notify the team when key tasks complete — board papers delivered, tender responses assembled, approval requests raised, or routine milestones reached.

## Environment Variables

| Variable | Description |
|---|---|
| `MICROSOFT_CLIENT_ID` | Azure AD application (client) ID |
| `MICROSOFT_CLIENT_SECRET` | Azure AD application client secret |
| `MICROSOFT_TENANT_ID` | Azure AD tenant ID |
| `TEAMS_CHANNEL_ID` | Target Teams channel ID for notifications |
| `TEAMS_TEAM_ID` | Parent team ID containing the notification channel |

These are injected via `adapterConfig.env` on the agent. Never hardcode credentials.

## Required Graph API Permissions

The Azure AD application registration must have the following **application** permission:

| Permission | Purpose |
|---|---|
| `ChannelMessage.Send` | Send messages to Teams channels on behalf of the application |

This permission requires admin consent from the tenant administrator.

## Authentication

Uses the same client credentials flow as the sharepoint-write skill.

```python
import os
import httpx

MICROSOFT_CLIENT_ID = os.environ["MICROSOFT_CLIENT_ID"]
MICROSOFT_CLIENT_SECRET = os.environ["MICROSOFT_CLIENT_SECRET"]
MICROSOFT_TENANT_ID = os.environ["MICROSOFT_TENANT_ID"]
TEAMS_TEAM_ID = os.environ["TEAMS_TEAM_ID"]
TEAMS_CHANNEL_ID = os.environ["TEAMS_CHANNEL_ID"]

GRAPH_BASE = "https://graph.microsoft.com/v1.0"
TOKEN_URL = f"https://login.microsoftonline.com/{MICROSOFT_TENANT_ID}/oauth2/v2.0/token"


def get_graph_token() -> str:
    """Acquire an access token using client credentials."""
    response = httpx.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": MICROSOFT_CLIENT_ID,
            "client_secret": MICROSOFT_CLIENT_SECRET,
            "scope": "https://graph.microsoft.com/.default",
        },
    )
    response.raise_for_status()
    return response.json()["access_token"]
```

## Posting a Channel Message

### Step-by-Step

1. Authenticate with client credentials to obtain an access token.
2. Construct the message body in HTML format.
3. POST to the channel messages endpoint.
4. Log the message ID from the response for audit trail.

### Python Example

```python
def post_teams_notification(
    access_token: str,
    subject: str,
    body_html: str,
    importance: str = "normal",
) -> dict:
    """
    Post a notification message to the configured Teams channel.

    Args:
        access_token: Valid Graph API access token.
        subject: Message subject line.
        body_html: Message body in HTML format.
        importance: Message importance — "normal" or "high".

    Returns:
        Graph API chatMessage response.
    """
    url = (
        f"{GRAPH_BASE}/teams/{TEAMS_TEAM_ID}"
        f"/channels/{TEAMS_CHANNEL_ID}/messages"
    )

    payload = {
        "subject": subject,
        "body": {
            "contentType": "html",
            "content": body_html,
        },
        "importance": importance,
    }

    response = httpx.post(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json=payload,
    )
    response.raise_for_status()
    return response.json()
```

## Notification Templates

### Governance — Board Paper Delivered

```python
def notify_board_paper_delivered(access_token: str, entity: str, meeting_date: str, sharepoint_url: str):
    """Notify that a board paper has been uploaded to SharePoint."""
    subject = f"{entity} Board Paper — {meeting_date}"
    body = (
        f"<p>The <strong>{entity}</strong> board paper for <strong>{meeting_date}</strong> "
        f"has been prepared and uploaded to SharePoint.</p>"
        f'<p><a href="{sharepoint_url}">View Board Paper</a></p>'
        f"<p><em>Status: Awaiting human review and approval.</em></p>"
    )
    return post_teams_notification(access_token, subject, body)
```

### Governance — Approval Required

```python
def notify_approval_required(access_token: str, entity: str, item_type: str, item_title: str, dashboard_url: str):
    """Notify that an item requires human approval."""
    subject = f"Approval Required — {entity} {item_type}"
    body = (
        f"<p>A <strong>{item_type}</strong> for <strong>{entity}</strong> requires your approval:</p>"
        f"<p><strong>{item_title}</strong></p>"
        f'<p><a href="{dashboard_url}">Review in Dashboard</a></p>'
        f"<p><em>This item will not proceed until approved.</em></p>"
    )
    return post_teams_notification(access_token, subject, body, importance="high")
```

### Tender — Response Ready for Review

```python
def notify_tender_ready(access_token: str, tender_ref: str, tender_title: str, sharepoint_url: str):
    """Notify that a tender response is assembled and ready for review."""
    subject = f"Tender Response Ready — {tender_ref}"
    body = (
        f"<p>The tender response for <strong>{tender_ref}: {tender_title}</strong> "
        f"has been assembled and uploaded to SharePoint.</p>"
        f'<p><a href="{sharepoint_url}">View Tender Response</a></p>'
        f"<p><strong>Reminder:</strong> Human submission to the tender portal is required. "
        f"The agent will not submit externally.</p>"
    )
    return post_teams_notification(access_token, subject, body, importance="high")
```

### Tender — New Opportunity Identified

```python
def notify_tender_opportunity(access_token: str, tender_ref: str, title: str, value: str, recommendation: str):
    """Notify of a new tender opportunity from portal monitoring."""
    colour = {"Go": "#28a745", "Watch": "#ffc107", "Pass": "#dc3545"}.get(recommendation, "#6c757d")
    subject = f"Tender Opportunity — {recommendation}: {tender_ref}"
    body = (
        f"<p>New opportunity identified from AusTender:</p>"
        f"<p><strong>{title}</strong></p>"
        f"<p>Reference: {tender_ref} | Estimated value: {value}</p>"
        f'<p>Recommendation: <span style="color:{colour};font-weight:bold">{recommendation}</span></p>'
        f"<p><em>Full assessment available in the dashboard.</em></p>"
    )
    return post_teams_notification(access_token, subject, body)
```

## When to Notify

Call this skill at the end of the following task types:

| Task Type | Notification |
|---|---|
| Board paper preparation complete | Board paper delivered + approval required |
| Resolution drafted | Approval required |
| Tender response assembled | Tender ready for review |
| Tender opportunity assessed as Go or Watch | New opportunity identified |
| Budget warning (agent at 80%+) | High-importance budget alert |
| Xero token refresh failure | High-importance credential alert |

## Error Handling

| HTTP Status | Meaning | Action |
|---|---|---|
| 401 | Token expired | Re-authenticate with `get_graph_token()` and retry once |
| 403 | Insufficient permissions | Check ChannelMessage.Send permission and admin consent |
| 404 | Team or channel not found | Verify TEAMS_TEAM_ID and TEAMS_CHANNEL_ID env vars |
| 429 | Throttled | Respect the `Retry-After` header |

## Best Practices

1. Keep notifications concise. The subject line should convey the key fact. The body provides context and a link.
2. Use `importance: "high"` only for items requiring urgent human action (approvals, credential failures, budget alerts).
3. Always include a link to the relevant SharePoint document or dashboard page.
4. Do not send more than 5 notifications per heartbeat cycle. Batch related updates into a single notification where possible.
5. Notification failures should not block the primary task. Log the failure and continue.
