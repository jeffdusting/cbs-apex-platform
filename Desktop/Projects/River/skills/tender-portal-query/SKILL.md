# Skill: tender-portal-query

## Purpose

Monitor Australian government tender portals for opportunities matching CBS Group's capability profile. This skill provides patterns for querying the AusTender RSS feed and the OCDS (Open Contracting Data Standard) API, filtering by sector keywords, and structuring opportunity assessments.

## Data Sources

### AusTender RSS Feed

| Field | Value |
|---|---|
| Base URL | `https://data.gov.au/data/dataset/austender-open-data/resource/` |
| RSS Feed | `https://www.tenders.gov.au/Search/RssAtomFeed` |
| Format | Atom XML |
| Update Frequency | Near real-time (new opportunities appear within hours of publication) |

### OCDS API

| Field | Value |
|---|---|
| Base URL | `https://api.tenders.gov.au/ocds/` |
| Release endpoint | `https://api.tenders.gov.au/ocds/releases` |
| Format | JSON (OCDS 1.1) |
| Authentication | None required (public API) |

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
