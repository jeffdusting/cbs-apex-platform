# Skill: teams-notify

## Purpose

Post notifications to a Microsoft Teams channel via a Power Automate Incoming Webhook. Used by governance and tender agents to notify the team when key tasks complete — board papers delivered, tender responses assembled, approval requests raised, or routine milestones reached.

## Environment Variables

| Variable | Description |
|---|---|
| `TEAMS_WEBHOOK_URL` | Power Automate webhook URL for the target Teams channel |

This is injected via `adapterConfig.env` on the agent. Never hardcode the URL.

## How It Works

The webhook accepts a JSON POST with a `title` field. Only the `title` field renders in Teams — all other fields are ignored. Use `\n` for line breaks within the title. Do not use markdown formatting (no `**bold**` or `*italic*`).

## Posting a Notification

```python
import os
import httpx

TEAMS_WEBHOOK_URL = os.environ["TEAMS_WEBHOOK_URL"]


def post_teams_notification(lines: list[str]) -> bool:
    """
    Post a notification to the configured Teams channel.

    Args:
        lines: List of text lines. Joined with newlines.

    Returns:
        True if the message was accepted (HTTP 202).
    """
    payload = {
        "title": "\n".join(lines),
    }
    response = httpx.post(TEAMS_WEBHOOK_URL, json=payload, timeout=30)
    return response.status_code == 202
```

## Notification Templates

### Governance — Board Paper Delivered

```python
def notify_board_paper_delivered(entity: str, meeting_date: str, sharepoint_url: str):
    return post_teams_notification([
        f"BOARD PAPER DELIVERED - {entity}",
        f"Meeting date: {meeting_date}",
        f"SharePoint: {sharepoint_url}",
        "Status: Awaiting human review and approval",
    ])
```

### Governance — Approval Required

```python
def notify_approval_required(entity: str, item_type: str, item_title: str):
    return post_teams_notification([
        f"APPROVAL REQUIRED - {entity} {item_type}",
        f"Item: {item_title}",
        "This item will not proceed until approved.",
    ])
```

### Tender — Response Ready for Review

```python
def notify_tender_ready(tender_ref: str, tender_title: str, sharepoint_url: str):
    return post_teams_notification([
        f"TENDER RESPONSE READY - {tender_ref}",
        f"Title: {tender_title}",
        f"SharePoint: {sharepoint_url}",
        "Action: Human submission to tender portal required.",
    ])
```

### Tender — New Opportunity Identified

```python
def notify_tender_opportunity(tender_ref: str, title: str, value: str, recommendation: str):
    return post_teams_notification([
        f"TENDER OPPORTUNITY - {recommendation}: {tender_ref}",
        f"Title: {title}",
        f"Estimated value: {value}",
        f"Recommendation: {recommendation}",
    ])
```

### System — Budget Alert

```python
def notify_budget_alert(agent_name: str, spent: str, budget: str):
    return post_teams_notification([
        f"BUDGET ALERT - {agent_name}",
        f"Spent: {spent} of {budget}",
        "Action: Review agent activity and adjust budget if needed.",
    ])
```

## When to Notify

Call this skill at the end of the following task types:

| Task Type | Notification |
|---|---|
| Board paper preparation complete | Board paper delivered + approval required |
| Resolution drafted | Approval required |
| Tender response assembled | Tender ready for review |
| Tender opportunity assessed as Go or Watch | New opportunity identified |
| Budget warning (agent at 80%+) | Budget alert |
| Xero token refresh failure | Credential alert |

## Error Handling

| HTTP Status | Meaning | Action |
|---|---|---|
| 202 | Accepted | Success — message will appear in Teams |
| 400 | Bad request | Check payload format |
| 403 | Forbidden | Webhook URL may have expired — flag for operator to regenerate |
| 429 | Throttled | Wait 60 seconds and retry once |

## Best Practices

1. Keep notifications concise. First line is the headline — make it scannable.
2. Use UPPERCASE for the notification type prefix (BOARD PAPER DELIVERED, TENDER OPPORTUNITY, APPROVAL REQUIRED).
3. Do not send more than 5 notifications per heartbeat cycle. Batch related updates where possible.
4. Notification failures should not block the primary task. Log the failure and continue.
5. If the webhook returns 403, create an approval ticket for the operator to regenerate the webhook URL in Power Automate.
