# Email Intake — Google Apps Script Setup

**Date:** 13 April 2026
**Status:** Replaces the failed Power Automate email trigger approach

## Why Google Apps Script

The Microsoft Power Automate email trigger won't fire in this tenant (cause unknown — likely a licensing or policy restriction). The Teams notification flow via HTTP webhook works fine, but the email trigger does not.

Google Apps Script has reliable Gmail triggers, is free with Google Workspace, and we already have Gmail infrastructure (mail-manager project). This replaces Power Automate for the email intake path only — the Teams notification flow stays as-is.

## Architecture

```
User emails rivertasks@cbs.com.au
        ↓
Forward rule sends to rivertasks@waterroads.com.au (or similar Gmail address)
        ↓
Google Apps Script runs every 5 minutes:
  - Searches for [RIVER-CBS] or [RIVER-WR] subject tags, not yet processed
  - Verifies sender is authorised
  - Saves attachments to Google Drive
  - POSTs to Paperclip API to create issue
  - Replies to sender with confirmation + Paperclip link
  - Labels email as River-Processed (so it's not reprocessed)
        ↓
CBS/WR Executive processes the task on next heartbeat
```

## Setup Steps

### 1. Choose or create the Gmail intake address

Options:
- Existing Google Workspace address at waterroads.com.au (e.g., `rivertasks@waterroads.com.au`)
- Jeff's personal gmail with filters

Decision needed: which address receives the emails?

### 2. Set up forwarding from rivertasks@cbs.com.au

In Microsoft 365 (where the shared mailbox lives):
1. Open Outlook Web → open the rivertasks@cbs.com.au shared mailbox
2. Settings → View all Outlook settings → Mail → Forwarding
3. Enable forwarding to the Gmail address
4. Keep a copy of forwarded messages (for audit)

### 3. Create the Google Apps Script project

1. Go to https://script.google.com
2. Sign in with the Gmail account that will receive the forwarded emails
3. **+ New project**
4. Rename to `River Email Intake`
5. Delete the default Code.gs content
6. Paste the contents of `scripts/river-email-intake.gs`
7. **Save** (Ctrl/Cmd+S)

### 4. Add the Paperclip session cookie

The script needs the same session cookie the agents use to authenticate with Paperclip.

1. In Apps Script editor, left sidebar: **Project Settings** (gear icon)
2. Scroll to **Script Properties** → **Add script property**
3. **Property:** `PAPERCLIP_COOKIE`
4. **Value:** `__Secure-better-auth.session_token=<CURRENT_TOKEN_HERE>`
   - Get the current token from your browser: log into org.cbslab.app → DevTools → Application → Cookies → copy the `__Secure-better-auth.session_token` value
   - Prefix it with `__Secure-better-auth.session_token=` so the final value starts with that string
5. **Save**

### 5. Authorise Gmail and Drive access

1. Back in the Editor, select the `checkInbox` function from the dropdown at the top
2. Click **Run**
3. A dialog appears asking for permissions
4. Review → **Allow** (Gmail read/modify, Drive create files, external URL access)
5. The first run will log "Found 0 unprocessed River email threads" — this is fine

### 6. Set up the 5-minute trigger

1. Left sidebar → **Triggers** (clock icon)
2. **+ Add Trigger** (bottom right)
3. Configure:
   - **Function:** `checkInbox`
   - **Event source:** `Time-driven`
   - **Type of time based trigger:** `Minutes timer`
   - **Minute interval:** `Every 5 minutes`
4. **Save**

Apps Script will now run `checkInbox` every 5 minutes automatically.

### 7. Test

1. Send an email from `jeff@cbs.com.au` to `rivertasks@cbs.com.au`
2. Subject: `[RIVER-CBS] Test task — please ignore`
3. Body: free text describing a simple task
4. Wait 5-10 minutes (allow for forwarding + next Apps Script run)
5. Check Apps Script execution log: Editor → **Executions** (in the left sidebar)
6. Check Paperclip dashboard for a new issue in CBS Group
7. Check your email for a reply confirming the submission

## Cookie Expiry

Paperclip session cookies expire eventually (likely days to weeks). When the Apps Script starts failing with 401/403 errors:

1. Log into org.cbslab.app → DevTools → copy fresh cookie
2. Apps Script → Project Settings → Script Properties → update `PAPERCLIP_COOKIE`
3. Save

A calendar reminder every 30 days is recommended.

## Monitoring

Apps Script Executions log shows every run. Failed runs send you an email (default behaviour) if execution throws an exception.

## Rollback

If this doesn't work: disable the trigger (Triggers → three dots → disable). Emails accumulate in Gmail but don't create issues. Re-enable when ready.
