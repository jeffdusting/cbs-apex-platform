# Skill: teams-notify

## Purpose

Post notifications to a Microsoft Teams channel via a Power Automate Incoming Webhook. Used by governance and tender agents to notify the team when key tasks complete — board papers delivered, tender responses assembled, approval requests raised, or routine milestones reached.

## Environment Variables

| Variable | Description |
|---|---|
| `TEAMS_WEBHOOK_URL` | Power Automate webhook URL for the target Teams channel |

This is injected via `adapterConfig.env` on the agent. Never hardcode the URL.

## How It Works

The webhook accepts a JSON POST and delivers the message to the configured Teams channel. No Azure AD permissions are required — the webhook URL contains its own authentication token.

## Posting a Notification

### Simple Text Message

```python
import os
import httpx

TEAMS_WEBHOOK_URL = os.environ["TEAMS_WEBHOOK_URL"]


def post_teams_notification(subject: str, body_text: str) -> bool:
    """
    Post a notification to the configured Teams channel.

    Args:
        subject: Message subject/title (shown in bold).
        body_text: Message body in markdown format.

    Returns:
        True if the message was accepted (HTTP 202).
    """
    payload = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": subject,
                            "weight": "Bolder",
                            "size": "Medium",
                        },
                        {
                            "type": "TextBlock",
                            "text": body_text,
                            "wrap": True,
                        },
                    ],
                },
            }
        ],
    }

    response = httpx.post(TEAMS_WEBHOOK_URL, json=payload, timeout=30)
    return response.status_code == 202
```

### Notification with Facts (Key-Value Pairs)

```python
def post_teams_notification_with_facts(
    subject: str,
    body_text: str,
    facts: list[dict],
    importance: str = "normal",
) -> bool:
    """
    Post a notification with structured facts to Teams.

    Args:
        subject: Message subject/title.
        body_text: Message body.
        facts: List of {"title": "Key", "value": "Value"} dicts.
        importance: "normal" or "high" — high adds a red accent.

    Returns:
        True if accepted (HTTP 202).
    """
    colour = "attention" if importance == "high" else "default"

    card_body = [
        {
            "type": "TextBlock",
            "text": subject,
            "weight": "Bolder",
            "size": "Medium",
            "color": colour,
        },
        {
            "type": "TextBlock",
            "text": body_text,
            "wrap": True,
        },
    ]

    if facts:
        card_body.append({
            "type": "FactSet",
            "facts": facts,
        })

    payload = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": card_body,
                },
            }
        ],
    }

    response = httpx.post(TEAMS_WEBHOOK_URL, json=payload, timeout=30)
    return response.status_code == 202
```

## Notification Templates

### Governance — Board Paper Delivered

```python
def notify_board_paper_delivered(entity: str, meeting_date: str, sharepoint_url: str):
    return post_teams_notification_with_facts(
        subject=f"{entity} Board Paper — {meeting_date}",
        body_text=f"The {entity} board paper for {meeting_date} has been prepared and uploaded to SharePoint. Awaiting human review and approval.",
        facts=[
            {"title": "Entity", "value": entity},
            {"title": "Meeting Date", "value": meeting_date},
            {"title": "SharePoint", "value": sharepoint_url},
            {"title": "Status", "value": "Awaiting Review"},
        ],
    )
```

### Governance — Approval Required

```python
def notify_approval_required(entity: str, item_type: str, item_title: str):
    return post_teams_notification_with_facts(
        subject=f"Approval Required — {entity} {item_type}",
        body_text=f"A {item_type} for {entity} requires your approval: {item_title}. This item will not proceed until approved.",
        facts=[
            {"title": "Entity", "value": entity},
            {"title": "Type", "value": item_type},
            {"title": "Item", "value": item_title},
        ],
        importance="high",
    )
```

### Tender — Response Ready for Review

```python
def notify_tender_ready(tender_ref: str, tender_title: str, sharepoint_url: str):
    return post_teams_notification_with_facts(
        subject=f"Tender Response Ready — {tender_ref}",
        body_text=f"The tender response for {tender_ref}: {tender_title} has been assembled and uploaded to SharePoint. Human submission to the tender portal is required.",
        facts=[
            {"title": "Reference", "value": tender_ref},
            {"title": "Title", "value": tender_title},
            {"title": "SharePoint", "value": sharepoint_url},
            {"title": "Action", "value": "Human submission required"},
        ],
        importance="high",
    )
```

### Tender — New Opportunity Identified

```python
def notify_tender_opportunity(tender_ref: str, title: str, value: str, recommendation: str):
    return post_teams_notification_with_facts(
        subject=f"Tender Opportunity — {recommendation}: {tender_ref}",
        body_text=f"New opportunity identified from AusTender: {title}",
        facts=[
            {"title": "Reference", "value": tender_ref},
            {"title": "Estimated Value", "value": value},
            {"title": "Recommendation", "value": recommendation},
        ],
    )
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
| 202 | Accepted | Success — message will appear in Teams |
| 400 | Bad request | Check payload format |
| 403 | Forbidden | Webhook URL may have expired — flag for operator to regenerate |
| 429 | Throttled | Wait 60 seconds and retry once |

## Best Practices

1. Keep notifications concise. The subject line should convey the key fact.
2. Use `importance: "high"` only for items requiring urgent human action.
3. Do not send more than 5 notifications per heartbeat cycle. Batch related updates where possible.
4. Notification failures should not block the primary task. Log the failure and continue.
5. If the webhook returns 403, create an approval ticket for the operator to regenerate the webhook URL in Power Automate.
