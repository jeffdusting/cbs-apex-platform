# Mail.ReadWrite Permission Upgrade

**Purpose:** Enable agents to mark emails as read via Microsoft Graph API after processing them. Currently, email intake scripts use a `metadata.email_message_id` workaround to track processed emails. With `Mail.ReadWrite`, agents can mark emails as read directly, providing a cleaner idempotency mechanism.

**Azure AD App:** River-Virtual-Org (see `secrets-manifest.json`)

---

## Step-by-Step: Azure Portal

### 1. Navigate to App Registrations

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **App registrations** in the top search bar
3. Click **App registrations** under Services
4. Find and click **River-Virtual-Org**

### 2. Add Mail.ReadWrite Permission

1. In the left sidebar, click **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Application permissions** (not Delegated)
5. Search for `Mail.ReadWrite`
6. Tick the checkbox for **Mail.ReadWrite** — "Read and write mail in all mailboxes"
7. Click **Add permissions**

### 3. Grant Admin Consent

1. Back on the API permissions page, you should see `Mail.ReadWrite` listed with status "Not granted"
2. Click **Grant admin consent for CBS Australia** (or your tenant name)
3. Confirm the dialog
4. Status should change to **Granted** with a green tick

### 4. Verify

The API permissions page should now show:

| Permission | Type | Status |
|---|---|---|
| Mail.Read | Application | Granted |
| Mail.ReadWrite | Application | Granted |
| Mail.Send | Application | Granted |
| ... (other existing permissions) | | |

---

## Graph API: Mark Email as Read

### Endpoint

```
PATCH https://graph.microsoft.com/v1.0/users/{user-id-or-upn}/messages/{message-id}
```

### Headers

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Body

```json
{
    "isRead": true
}
```

### Response

- **200 OK** — message updated
- **401 Unauthorized** — token expired or missing permission
- **404 Not Found** — message ID invalid or already deleted

---

## Python Function Template

```python
import httpx
import msal
import os

TENANT_ID = os.environ["MICROSOFT_TENANT_ID"]
CLIENT_ID = os.environ["MICROSOFT_CLIENT_ID"]
CLIENT_SECRET = os.environ["MICROSOFT_CLIENT_SECRET"]
USER_EMAIL = "jeff@cbsaustralia.com.au"  # or the mailbox being read


def get_graph_token() -> str:
    """Acquire an application token for Microsoft Graph."""
    app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}",
        client_credential=CLIENT_SECRET,
    )
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
    if "access_token" not in result:
        raise RuntimeError(f"Token acquisition failed: {result.get('error_description', result)}")
    return result["access_token"]


def mark_email_read(message_id: str, user: str = USER_EMAIL) -> bool:
    """
    Mark a single email as read via Microsoft Graph.

    Args:
        message_id: The Graph message ID (from mail listing)
        user: The mailbox owner's UPN or user ID

    Returns:
        True if successful, False otherwise.
    """
    token = get_graph_token()
    r = httpx.patch(
        f"https://graph.microsoft.com/v1.0/users/{user}/messages/{message_id}",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={"isRead": True},
        timeout=15,
    )
    if r.status_code == 200:
        return True
    print(f"  WARN: mark_email_read returned {r.status_code}: {r.text[:200]}")
    return False
```

### Dependencies

Add `msal` to the agent's requirements if not already present:

```
pip install msal
```

---

## Files to Update

Once `Mail.ReadWrite` is granted, update these scripts to use `mark_email_read()` instead of metadata-based tracking:

| File | Current Mechanism | Update |
|---|---|---|
| `scripts/cbs-kb-email-intake.py` | Tracks `email_message_id` in metadata | Add `mark_email_read(msg_id)` after successful processing |
| `scripts/wr-kb-email-intake.py` | Tracks `email_message_id` in metadata | Add `mark_email_read(msg_id)` after successful processing |
| `scripts/tender-inbound-monitor.py` | Tracks processed message IDs | Add `mark_email_read(msg_id)` after filing attachments |

**Note:** Keep the existing `email_message_id` metadata tracking as a secondary idempotency check. The `isRead` flag provides a quick filter (only fetch unread emails), while the metadata check prevents reprocessing if an email is manually marked as unread.

---

## Testing

After granting the permission:

1. Send a test email to jeff@cbsaustralia.com.au
2. Run the Python function against that message ID
3. Verify the email shows as read in Outlook
4. Verify the Graph API returns 200

```python
# Quick test
token = get_graph_token()
# List recent unread messages
r = httpx.get(
    f"https://graph.microsoft.com/v1.0/users/{USER_EMAIL}/messages?$filter=isRead eq false&$top=5&$select=id,subject,receivedDateTime",
    headers={"Authorization": f"Bearer {token}"},
)
messages = r.json().get("value", [])
for m in messages:
    print(f"  {m['subject']} — {m['id'][:20]}...")

# Mark the first one as read
if messages:
    ok = mark_email_read(messages[0]["id"])
    print(f"  Marked as read: {ok}")
```
