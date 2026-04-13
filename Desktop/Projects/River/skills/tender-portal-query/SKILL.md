# Skill: tender-portal-query

## Purpose

Monitor Australian government tender portals for opportunities matching CBS Group's capability profile. This skill provides patterns for querying the AusTender RSS feed and the OCDS (Open Contracting Data Standard) API, filtering by sector keywords, and structuring opportunity assessments.

## Data Sources

### Primary: AusTender Email Notifications

AusTender and Tenders.NSW email notifications are configured for CBS Group's UNSPSC categories (infrastructure, engineering, advisory, transport). These arrive automatically when new matching tenders are published. Email notifications are the primary monitoring channel.

### Secondary: AusTender Web Search

| Field | Value |
|---|---|
| Search URL | `https://www.tenders.gov.au/Search/AtmSearch` |
| Format | HTML (requires parsing) |

Use web search via Claude Code's browser capability to search AusTender directly when email notifications need supplementing or when investigating specific opportunities.

### AusTender RSS Feed (CURRENTLY BLOCKED)

| Field | Value |
|---|---|
| RSS Feed | `https://www.tenders.gov.au/Search/RssAtomFeed` |
| Status | **BLOCKED — returns HTTP 403** (WAF/bot protection as of April 2026) |

The RSS feed and OCDS API (`api.tenders.gov.au`) are both blocked by server-side bot protection. Do not rely on these endpoints for automated queries. Use email notifications and web search instead.

### OCDS API (CURRENTLY BLOCKED)

| Field | Value |
|---|---|
| Base URL | `https://api.tenders.gov.au/ocds/` |
| Status | **BLOCKED — returns HTTP 403** |

## Email-Based Tender Scanning (Primary Method)

Government tender portals send email notifications to Jeff Dusting's inbox when new matching tenders are published. Use the Microsoft Graph API (Mail.Read permission) to scan for these emails and extract tender details.

### Monitored Tender Sources

| Source | Portal | Email Sender Pattern | Jurisdictions |
|---|---|---|---|
| AusTender | tenders.gov.au | `*tenders.gov.au`, `*austender*` | Australian Federal Government |
| Tenders.NSW / buy.NSW | buy.nsw.gov.au | `buy.nsw@customerservice.nsw.gov.au`, `noreply.buynsw@customerservice.nsw.gov.au`, `tenders.nsw.gov.au` | NSW State Government |
| Buying for Victoria | buying.vic.gov.au | `*tenders.vic.gov.au`, `*buying.vic.gov.au` | Victorian State Government |
| GETS NZ | gets.govt.nz | `*gets.govt.nz`, `*GETS*` | New Zealand Government |
| Inland Rail | inlandrail.artc.com.au | `*inlandrail*`, `*artc.com.au*` | ARTC Inland Rail Programme |

### Step 1: Query Inbox for AusTender Emails

```python
import os
import httpx
import msal

TENANT_ID = os.environ["MICROSOFT_TENANT_ID"]
CLIENT_ID = os.environ["MICROSOFT_CLIENT_ID"]
CLIENT_SECRET = os.environ["MICROSOFT_CLIENT_SECRET"]


def get_graph_token() -> str:
    """Get Microsoft Graph API access token via client credentials."""
    app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}",
        client_credential=CLIENT_SECRET,
    )
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
    return result["access_token"]


def get_tender_emails(token: str, days_back: int = 1, max_results: int = 20) -> list[dict]:
    """
    Search inbox for AusTender and Tenders.NSW notification emails.

    Args:
        token: Graph API access token.
        days_back: How many days back to search.
        max_results: Maximum emails to return.

    Returns:
        List of email objects with subject, body preview, received date.
    """
    from datetime import datetime, timedelta, timezone
    since = (datetime.now(timezone.utc) - timedelta(days=days_back)).strftime("%Y-%m-%dT%H:%M:%SZ")

    headers = {"Authorization": f"Bearer {token}"}

    # Search for tender notification emails from all monitored sources
    # Jeff's email: jeff@cbs.com.au (Microsoft 365 / Exchange Online)
    filter_query = (
        f"receivedDateTime ge {since} and ("
        # AusTender (Federal)
        "contains(from/emailAddress/address, 'tenders.gov.au') or "
        "contains(from/emailAddress/address, 'austender') or "
        # Tenders.NSW / buy.NSW
        "contains(from/emailAddress/address, 'tenders.nsw.gov.au') or "
        "contains(from/emailAddress/address, 'buynsw') or "
        "contains(from/emailAddress/address, 'buy.nsw') or "
        "contains(from/emailAddress/address, 'customerservice.nsw.gov.au') or "
        # Buying for Victoria (sender: noreply@tenders.vic.gov.au)
        "contains(from/emailAddress/address, 'tenders.vic.gov.au') or "
        "contains(from/emailAddress/address, 'buying.vic.gov.au') or "
        # GETS NZ
        "contains(from/emailAddress/address, 'gets.govt.nz') or "
        # Inland Rail / ARTC
        "contains(from/emailAddress/address, 'inlandrail') or "
        "contains(from/emailAddress/address, 'artc.com.au') or "
        # Catch-all subject patterns
        "contains(subject, 'AusTender') or "
        "contains(subject, 'Tender Notification') or "
        "contains(subject, 'GETS') or "
        "contains(subject, 'Buying for Victoria') or "
        "contains(subject, 'Inland Rail') or "
        "contains(subject, 'ATM') or "
        "contains(subject, 'RFT') or "
        "contains(subject, 'RFQ')"
        ")"
    )

    # Query Jeff's mailbox directly
    all_emails = []
    for user_id in ["jeff@cbs.com.au"]:
        mail_resp = httpx.get(
            f"https://graph.microsoft.com/v1.0/users/{user_id}/messages",
            headers=headers,
            params={
                "$filter": filter_query,
                "$select": "subject,bodyPreview,body,receivedDateTime,from",
                "$top": max_results,
                "$orderby": "receivedDateTime desc",
            },
            timeout=30,
        )
        if mail_resp.status_code == 200:
            messages = mail_resp.json().get("value", [])
            for msg in messages:
                all_emails.append({
                    "subject": msg.get("subject", ""),
                    "from": msg.get("from", {}).get("emailAddress", {}).get("address", ""),
                    "received": msg.get("receivedDateTime", ""),
                    "preview": msg.get("bodyPreview", ""),
                    "body": msg.get("body", {}).get("content", ""),
                    "user": user_id,
                })

    return all_emails
```

### Step 2: Parse Tender Details from Email

```python
import re

def parse_tender_from_email(email: dict) -> dict | None:
    """
    Extract tender details from an AusTender notification email.

    Returns a structured dict or None if the email doesn't contain tender info.
    """
    subject = email.get("subject", "")
    body = email.get("body", "") or email.get("preview", "")

    # Extract common fields from AusTender email format
    # Identify source portal
    from_addr = email.get("from", "").lower()
    if "tenders.vic.gov.au" in from_addr or "buying.vic.gov.au" in from_addr or "vic.gov.au" in from_addr:
        source = "buying_for_victoria"
    elif "gets.govt.nz" in from_addr:
        source = "gets_nz"
    elif "inlandrail" in from_addr or "artc.com.au" in from_addr:
        source = "inland_rail"
    elif "buynsw" in from_addr or "buy.nsw" in from_addr or "customerservice.nsw.gov.au" in from_addr or "tenders.nsw.gov.au" in from_addr:
        source = "buy_nsw"
    else:
        source = "austender"

    tender = {
        "source": source,
        "email_subject": subject,
        "received": email.get("received", ""),
    }

    # Try to extract reference number (ATM/RFT/RFQ/EOI/RFP formats)
    ref_match = re.search(r"(ATM|RFT|RFQ|EOI|RFP|GETS)[-\s]?(\d+)", subject + " " + body, re.IGNORECASE)
    if ref_match:
        tender["reference"] = f"{ref_match.group(1)}-{ref_match.group(2)}"

    # Extract agency
    agency_match = re.search(r"(?:Agency|Organisation|Department):\s*(.+?)(?:\n|<)", body)
    if agency_match:
        tender["agency"] = agency_match.group(1).strip()

    # Extract title
    title_match = re.search(r"(?:Title|Subject|Description):\s*(.+?)(?:\n|<)", body)
    if title_match:
        tender["title"] = title_match.group(1).strip()
    else:
        tender["title"] = subject  # Fall back to email subject

    # Extract closing date
    close_match = re.search(r"(?:Closing|Close|Closes|Due)[\s:]+(\d{1,2}[\s/-]\w+[\s/-]\d{2,4})", body, re.IGNORECASE)
    if close_match:
        tender["close_date"] = close_match.group(1).strip()

    # Extract value if present
    value_match = re.search(r"\$[\d,]+(?:\.\d{2})?(?:\s*-\s*\$[\d,]+(?:\.\d{2})?)?", body)
    if value_match:
        tender["estimated_value"] = value_match.group(0)

    return tender
```

### Step 3: Deduplication via Tender Register

Before processing any tender, check the Supabase `tender_register` table to see if it has already been recorded. This prevents re-assessing the same opportunity every scan cycle.

```python
def check_already_registered(reference: str, source: str) -> bool:
    """
    Check if a tender is already in the register.

    Args:
        reference: Tender reference number (e.g. ATM-12345).
        source: Source portal identifier.

    Returns:
        True if the tender is already registered (skip it).
    """
    SUPABASE_URL = os.environ["SUPABASE_URL"]
    SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    resp = httpx.get(
        f"{SUPABASE_URL}/rest/v1/tender_register",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
        params={"reference": f"eq.{reference}", "source": f"eq.{source}", "select": "id", "limit": 1},
        timeout=15,
    )
    return resp.status_code == 200 and len(resp.json()) > 0


def register_tender(tender: dict) -> dict | None:
    """
    Write a new tender to the register. Returns the created record or None.
    """
    SUPABASE_URL = os.environ["SUPABASE_URL"]
    SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    record = {
        "reference": tender.get("reference", f"UNREFERENCED-{tender.get('received', '')[:10]}"),
        "source": tender.get("source", "unknown"),
        "title": tender.get("title", ""),
        "agency": tender.get("agency"),
        "estimated_value": tender.get("estimated_value"),
        "close_date": tender.get("close_date"),
        "email_subject": tender.get("email_subject"),
        "email_date": tender.get("received"),
    }

    resp = httpx.post(
        f"{SUPABASE_URL}/rest/v1/tender_register",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        json=record,
        timeout=15,
    )
    if resp.status_code in (200, 201):
        return resp.json()[0] if resp.json() else None
    return None


def record_decision(reference: str, source: str, decision: str, decision_by: str,
                    scorecard: dict = None, weighted_score: float = None,
                    issue_id: str = None, issue_identifier: str = None, notes: str = None):
    """
    Record a Go/Watch/Pass decision in the tender register.
    Called by CBS Executive after reviewing a Tender Intelligence assessment.
    """
    SUPABASE_URL = os.environ["SUPABASE_URL"]
    SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    update = {
        "decision": decision,
        "decision_date": "now()",
        "decision_by": decision_by,
    }
    if scorecard:
        update["scorecard"] = scorecard
    if weighted_score is not None:
        update["weighted_score"] = weighted_score
    if issue_id:
        update["issue_id"] = issue_id
    if issue_identifier:
        update["issue_identifier"] = issue_identifier
    if notes:
        update["decision_notes"] = notes

    resp = httpx.patch(
        f"{SUPABASE_URL}/rest/v1/tender_register",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
        },
        params={"reference": f"eq.{reference}", "source": f"eq.{source}"},
        json=update,
        timeout=15,
    )
    return resp.status_code in (200, 204)
```

### Step 4: Complete Scan Workflow with Deduplication

```python
def scan_for_tenders(days_back: int = 4) -> list[dict]:
    """
    Complete tender scan with deduplication.

    Default lookback: 4 days (provides overlap protection).
    On first run after deployment, use days_back=14 to catch up.

    Returns only NEW tenders not already in the register.
    """
    token = get_graph_token()
    emails = get_tender_emails(token, days_back=days_back)

    new_opportunities = []
    skipped = 0

    for email in emails:
        tender = parse_tender_from_email(email)
        if not tender:
            continue

        ref = tender.get("reference", f"UNREFERENCED-{tender.get('received', '')[:10]}")
        src = tender.get("source", "unknown")

        # Dedup check
        if check_already_registered(ref, src):
            skipped += 1
            continue

        # Register the new tender
        registered = register_tender(tender)
        if registered:
            tender["register_id"] = registered.get("id")
            new_opportunities.append(tender)

    print(f"Scan: {len(emails)} emails, {skipped} already registered, {len(new_opportunities)} new")
    return new_opportunities


# Usage in heartbeat:
# First run (catch-up): scan_for_tenders(days_back=14)
# Daily routine: scan_for_tenders(days_back=4)
tenders = scan_for_tenders(days_back=4)
for t in tenders:
    print(f"[NEW] [{t.get('reference', 'N/A')}] {t['title']} — closes {t.get('close_date', 'TBC')}")
```

### Querying the Tender Register

```python
def get_pending_decisions() -> list[dict]:
    """Get all tenders awaiting a Go/Watch/Pass decision."""
    SUPABASE_URL = os.environ["SUPABASE_URL"]
    SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    resp = httpx.get(
        f"{SUPABASE_URL}/rest/v1/tender_register",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
        params={"decision": "eq.pending", "order": "created_at.desc", "limit": 50},
        timeout=15,
    )
    return resp.json() if resp.status_code == 200 else []


def get_decision_history(limit: int = 20) -> list[dict]:
    """Get recent Go/Watch/Pass decisions for reporting."""
    SUPABASE_URL = os.environ["SUPABASE_URL"]
    SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    resp = httpx.get(
        f"{SUPABASE_URL}/rest/v1/tender_register",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
        params={"decision": "neq.pending", "order": "decision_date.desc", "limit": limit},
        timeout=15,
    )
    return resp.json() if resp.status_code == 200 else []
```

### Lookback Configuration

| Scenario | days_back | Purpose |
|---|---|---|
| First run after deployment | 14 | Catch up on recent opportunities |
| Daily routine (steady state) | 4 | 4-day overlap protects against missed scans |
| Manual catch-up after outage | 14+ | Recover missed period |

### Fallback: Web Search

If no email notifications are found, use Claude Code's web search capability to search AusTender directly:
1. Search `site:tenders.gov.au` with CBS Group's primary sector keywords
2. Parse the search results for tender titles, references, and closing dates
3. Note that web search results may be less structured than email notifications

## Reference Script

The full query implementation is in `scripts/tender-portal-query.py`. This skill provides the patterns and guidance for using that script or implementing equivalent logic during heartbeat execution.

## Sector Keyword Filters

CBS Group's capability profile maps to the following search terms. Use these when filtering tender opportunities:

### Primary Keywords (high relevance)

- asset management
- infrastructure maintenance
- road tunnel
- tunnel operations
- tolling
- electronic tolling
- traffic management systems
- ITS (Intelligent Transport Systems)
- operations and maintenance
- O&M contract
- performance-based contract

### Secondary Keywords (moderate relevance)

- transport infrastructure
- public-private partnership
- PPP
- lifecycle management
- commercial advisory
- procurement advisory
- systems engineering
- safety assurance
- KPI framework
- asset condition assessment

### Geographic and Programme Keywords

| Source | Additional Keywords |
|---|---|
| Buying for Victoria | VicRoads, Major Road Projects Victoria, MRPV, Level Crossing Removal, Metro Tunnel, North East Link |
| GETS NZ | NZTA, Waka Kotahi, KiwiRail, Auckland Transport, rail infrastructure NZ |
| Inland Rail | ARTC, Inland Rail, Melbourne to Brisbane, rail freight, intermodal |
| Tenders.NSW | Transport for NSW, TfNSW, Sydney Metro, WestConnex, motorway, M6, Western Harbour Tunnel |

### Sector Codes (UNSPSC)

| Code | Description |
|---|---|
| 72101500 | Building and facility maintenance and repair services |
| 72141000 | Heavy equipment maintenance and repair |
| 73152100 | Highway and road maintenance |
| 78111800 | Transport management |
| 81101500 | Engineering management |
| 81101700 | Civil engineering |

## Querying the AusTender RSS Feed

```python
import xml.etree.ElementTree as ET
import httpx
from datetime import datetime, timedelta


RSS_URL = "https://www.tenders.gov.au/Search/RssAtomFeed"
ATOM_NS = "http://www.w3.org/2005/Atom"


def fetch_recent_opportunities(keywords: list[str], days_back: int = 7) -> list[dict]:
    """
    Fetch recent tender opportunities from the AusTender RSS feed.

    Args:
        keywords: List of search keywords to match against title and summary.
        days_back: Number of days to look back for new opportunities.

    Returns:
        List of matching opportunity dicts.
    """
    response = httpx.get(RSS_URL, timeout=30)
    response.raise_for_status()

    root = ET.fromstring(response.text)
    cutoff = datetime.utcnow() - timedelta(days=days_back)
    opportunities = []

    for entry in root.findall(f"{ATOM_NS}entry"):
        title = entry.findtext(f"{ATOM_NS}title", "")
        summary = entry.findtext(f"{ATOM_NS}summary", "")
        link_el = entry.find(f"{ATOM_NS}link")
        link = link_el.get("href", "") if link_el is not None else ""
        updated = entry.findtext(f"{ATOM_NS}updated", "")

        # Parse date
        try:
            entry_date = datetime.fromisoformat(updated.replace("Z", "+00:00"))
            if entry_date.replace(tzinfo=None) < cutoff:
                continue
        except (ValueError, TypeError):
            pass

        # Keyword match (case-insensitive)
        text = f"{title} {summary}".lower()
        matched_keywords = [kw for kw in keywords if kw.lower() in text]

        if matched_keywords:
            opportunities.append({
                "title": title,
                "summary": summary,
                "link": link,
                "updated": updated,
                "matched_keywords": matched_keywords,
                "keyword_count": len(matched_keywords),
            })

    # Sort by number of keyword matches (most relevant first)
    opportunities.sort(key=lambda x: x["keyword_count"], reverse=True)
    return opportunities
```

## Querying the OCDS API

```python
OCDS_BASE = "https://api.tenders.gov.au/ocds"


def fetch_ocds_releases(
    from_date: str = None,
    buyer_name: str = None,
    limit: int = 50,
) -> list[dict]:
    """
    Fetch tender releases from the OCDS API.

    Args:
        from_date: ISO date string (YYYY-MM-DD) to filter releases from.
        buyer_name: Filter by buyer/procuring entity name.
        limit: Maximum number of releases to return.

    Returns:
        List of OCDS release objects.
    """
    params = {"limit": limit}
    if from_date:
        params["from"] = from_date
    if buyer_name:
        params["buyer.name"] = buyer_name

    response = httpx.get(
        f"{OCDS_BASE}/releases",
        params=params,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    return data.get("releases", [])


def extract_opportunity_details(release: dict) -> dict:
    """
    Extract key opportunity details from an OCDS release.

    Args:
        release: OCDS release object.

    Returns:
        Structured opportunity dict.
    """
    tender = release.get("tender", {})
    buyer = release.get("buyer", {})

    return {
        "ocid": release.get("ocid", ""),
        "title": tender.get("title", ""),
        "description": tender.get("description", ""),
        "status": tender.get("status", ""),
        "buyer_name": buyer.get("name", ""),
        "value_amount": tender.get("value", {}).get("amount"),
        "value_currency": tender.get("value", {}).get("currency", "AUD"),
        "submission_deadline": tender.get("tenderPeriod", {}).get("endDate", ""),
        "documents": [
            {"title": doc.get("title", ""), "url": doc.get("url", "")}
            for doc in tender.get("documents", [])
        ],
    }
```

## Output Format Specification

Each opportunity assessment must be structured as follows:

```json
{
  "reference": "ATM-2026-XXXX",
  "title": "Opportunity title",
  "buyer": "Procuring entity name",
  "estimated_value": "$X.XM",
  "submission_deadline": "YYYY-MM-DD",
  "sector_alignment": "high|medium|low",
  "matched_keywords": ["keyword1", "keyword2"],
  "capital_applicability": "direct|adjacent|limited",
  "recommendation": "Go|Watch|Pass",
  "rationale": "Brief narrative explaining the recommendation",
  "capability_gaps": ["List any gaps requiring attention"],
  "source_url": "https://..."
}
```

### Recommendation Criteria

| Recommendation | Criteria |
|---|---|
| **Go** | High sector alignment + direct CAPITAL applicability + no critical capability gaps + value > $500K |
| **Watch** | Medium sector alignment OR adjacent CAPITAL applicability OR minor capability gaps |
| **Pass** | Low sector alignment OR limited CAPITAL applicability OR critical capability gaps OR value < $100K |

### Sector Alignment Assessment

| Rating | Definition |
|---|---|
| **High** | Directly within CBS Group's core sectors (road tunnels, tolling, asset management O&M) |
| **Medium** | Related transport or infrastructure sector where CAPITAL principles transfer |
| **Low** | Outside CBS Group's established sectors — would require significant new capability |

### CAPITAL Applicability Assessment

| Rating | Definition |
|---|---|
| **Direct** | The opportunity explicitly calls for long-term asset management, performance-based contracts, or lifecycle approaches |
| **Adjacent** | The opportunity would benefit from CAPITAL principles but does not explicitly require them |
| **Limited** | The opportunity is primarily operational or transactional with limited scope for CAPITAL application |

## Best Practices

1. Run portal queries once per daily heartbeat cycle. Do not query more frequently.
2. De-duplicate against previously assessed opportunities. Use the tender reference number as the unique key.
3. For Go recommendations, automatically create a subtask for the CBS Executive Agent with the full assessment attached.
4. For Watch recommendations, include them in the daily summary but do not create individual subtasks.
5. Pass recommendations should be logged but not escalated.
6. Always verify capability claims against the knowledge base using the `supabase-query` skill before making Go or Watch recommendations.
7. Include the source URL for every opportunity so the human operator can access the original listing.
