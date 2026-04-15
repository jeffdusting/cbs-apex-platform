# Skill: teams-notify

## Purpose

Post notifications to a Microsoft Teams channel via a Power Automate Incoming Webhook. Used by governance and tender agents to notify the team when key tasks complete — board papers delivered, tender responses assembled, approval requests raised, or routine milestones reached.

## Environment Variables

| Variable | Description |
|---|---|
| `TEAMS_WEBHOOK_URL` | Power Automate webhook URL for the target Teams channel |

This is injected via `adapterConfig.env` on the agent. Never hardcode the URL.

## How It Works

The webhook accepts a JSON POST. The Power Automate flow parses the fields and posts to Teams (Adaptive Card with clickable link) and optionally sends an email.

## CRITICAL FORMAT RULES

- **NO MARKDOWN** — do not use `**`, `*`, `#`, `_`, `[]()`, backticks, or any markdown syntax.
- **PLAIN TEXT ONLY** — use UPPERCASE for emphasis instead of bold/italic.
- Always include the `url` field with the direct link to the issue in Paperclip.

## Company IDs and Issue URL Prefixes

| Entity | Company ID | Issue Prefix |
|---|---|---|
| CBS Group | fafce870-b862-4754-831e-2cd10e8b203c | CBSA |
| WaterRoads | 95a248d4-08e7-4879-8e66-5d1ff948e005 | WAT |

Issue URL format: `https://org.cbslab.app/{issuePrefix}/issues/{issueIdentifier}`
Example: `https://org.cbslab.app/CBSA/issues/CBSA-30`

## Posting a Notification

You MUST use this exact function. Copy it verbatim. Do not modify the payload format.

```python
import os
import httpx

TEAMS_WEBHOOK_URL = os.environ["TEAMS_WEBHOOK_URL"]

COMPANY_PREFIXES = {
    "fafce870-b862-4754-831e-2cd10e8b203c": "CBSA",
    "95a248d4-08e7-4879-8e66-5d1ff948e005": "WAT",
}
CBS_COMPANY_ID = "fafce870-b862-4754-831e-2cd10e8b203c"
WR_COMPANY_ID = "95a248d4-08e7-4879-8e66-5d1ff948e005"


def post_notification(
    notification_type: str,
    entity: str,
    issue_id: str,
    issue_identifier: str,
    summary: str,
    action: str,
    company_id: str = CBS_COMPANY_ID,
    file_url: str = None,
    file_name: str = None,
) -> bool:
    """
    Post a structured notification to Teams and email via Power Automate.

    Args:
        notification_type: UPPERCASE type (APPROVAL REQUIRED, TENDER RESPONSE READY, etc.)
        entity: Entity name (CBS Group, WaterRoads)
        issue_id: Paperclip issue UUID
        issue_identifier: Issue display ID (e.g. CBSA-25)
        summary: One sentence describing what happened
        action: What Jeff needs to do
        company_id: Company UUID for prefix lookup
        file_url: Optional SharePoint URL to a generated document
        file_name: Optional display name for the file link

    Returns:
        True if accepted (HTTP 202).

    Example:
        post_notification(
            notification_type="TASK COMPLETE",
            entity="CBS Group",
            issue_id="abc-123-def",
            issue_identifier="CBSA-30",
            summary="Capability statement for M6 AM panel is ready.",
            action="Review the document on SharePoint.",
            company_id=CBS_COMPANY_ID,
            file_url="https://cbsaustralia.sharepoint.com/sites/.../M6-Capability.docx",
            file_name="M6 Capability Statement.docx",
        )
    """
    # Strip markdown
    clean = lambda s: s.replace("**","").replace("*","").replace("`","").replace("#","") if s else ""

    prefix = COMPANY_PREFIXES.get(company_id, "CBSA")
    url = f"https://org.cbslab.app/{prefix}/issues/{issue_identifier or issue_id}"

    payload = {
        "title": clean(f"{notification_type} - {entity}"),
        "issue": clean(issue_identifier),
        "summary": clean(summary),
        "action": clean(action),
        "url": url,
    }

    if file_url:
        payload["file_url"] = file_url
        payload["file_name"] = clean(file_name) if file_name else "Open Document"

    response = httpx.post(TEAMS_WEBHOOK_URL, json=payload, timeout=30)
    return response.status_code == 202
```

## Notification Templates

Use `post_notification()` for all notifications. Examples:

### Governance — Approval Required

```python
post_notification(
    notification_type="APPROVAL REQUIRED",
    entity="CBS Group",
    issue_id=issue["id"],
    issue_identifier=issue["identifier"],
    summary=f"Board paper for {meeting_date} governance cycle ready for review.",
    action="Review and approve the board paper.",
)
```

### Tender — Response Ready (Gold)

```python
post_notification(
    notification_type="TENDER RESPONSE READY",
    entity="CBS Group",
    issue_id=issue["id"],
    issue_identifier=issue["identifier"],
    summary=f"Gold draft for {tender_ref} delivered to SharePoint.",
    action="Review and submit to tender portal.",
)
```

### Tender — New Opportunity (Go/Watch)

```python
post_notification(
    notification_type=f"TENDER OPPORTUNITY - {recommendation}",
    entity="CBS Group",
    issue_id=issue["id"],
    issue_identifier=issue["identifier"],
    summary=f"{tender_ref}: {title} (est. {value})",
    action=f"Review scorecard and confirm {recommendation} decision.",
)
```

### System — Budget Alert

```python
post_notification(
    notification_type="BUDGET ALERT",
    entity="CBS Group",
    issue_id="",  # no specific issue
    issue_identifier=agent_name,
    summary=f"{agent_name} has spent {spent} of {budget}.",
    action="Review agent activity and adjust budget if needed.",
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
