#!/usr/bin/env python3
"""Project River — Tender Portal Query (Task 1.7)

Queries AusTender RSS feed from data.gov.au for CBS Group sector keywords.
Outputs structured JSON of matching opportunities.

Usage:
    python scripts/tender-portal-query.py
    python scripts/tender-portal-query.py --output results.json
    python scripts/tender-portal-query.py --keywords "tunnels,transport"
"""

import argparse
import json
import sys
import xml.etree.ElementTree as ET
from datetime import datetime

import requests


# AusTender ATM (Approach to Market) RSS feed
AUSTENDER_RSS_URL = "https://www.tenders.gov.au/atm/rss"

# CBS Group sector keywords
DEFAULT_KEYWORDS = [
    "infrastructure",
    "asset management",
    "systems engineering",
    "transport",
    "tunnels",
    "professional engineering",
    "advisory",
]


def fetch_rss_feed(url: str) -> str:
    """Fetch the RSS feed content."""
    headers = {
        "User-Agent": "ProjectRiver/1.0 (CBS Group tender intelligence)",
        "Accept": "application/rss+xml, application/xml, text/xml",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"ERROR: Failed to fetch RSS feed: {e}", file=sys.stderr)
        # Fallback: try alternative data.gov.au endpoint
        fallback_url = "https://data.gov.au/data/dataset/austender-atm-published/resource/rss"
        try:
            print("Attempting fallback URL...", file=sys.stderr)
            resp = requests.get(fallback_url, headers=headers, timeout=30)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as e2:
            print(f"ERROR: Fallback also failed: {e2}", file=sys.stderr)
            sys.exit(1)


def parse_rss(xml_content: str) -> list[dict]:
    """Parse RSS XML into a list of tender opportunity dicts."""
    items = []
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        print(f"ERROR: Failed to parse RSS XML: {e}", file=sys.stderr)
        return items

    # Handle both RSS 2.0 and Atom namespaces
    ns = {"atom": "http://www.w3.org/2005/Atom"}

    for item in root.iter("item"):
        entry = {
            "title": _get_text(item, "title"),
            "link": _get_text(item, "link"),
            "description": _get_text(item, "description"),
            "pub_date": _get_text(item, "pubDate"),
            "guid": _get_text(item, "guid"),
            "category": _get_text(item, "category"),
        }
        items.append(entry)

    return items


def _get_text(element: ET.Element, tag: str) -> str:
    """Safely extract text from an XML element."""
    child = element.find(tag)
    return child.text.strip() if child is not None and child.text else ""


def filter_by_keywords(items: list[dict], keywords: list[str]) -> list[dict]:
    """Filter tender items by keyword match in title or description."""
    matches = []
    for item in items:
        searchable = f"{item['title']} {item['description']}".lower()
        matched_keywords = [kw for kw in keywords if kw.lower() in searchable]
        if matched_keywords:
            item["matched_keywords"] = matched_keywords
            item["relevance_score"] = len(matched_keywords) / len(keywords)
            matches.append(item)

    # Sort by relevance (most keyword matches first)
    matches.sort(key=lambda x: x["relevance_score"], reverse=True)
    return matches


def main():
    parser = argparse.ArgumentParser(
        description="Query AusTender RSS feed for CBS Group sector opportunities"
    )
    parser.add_argument(
        "--output", "-o",
        help="Output file path (default: stdout)",
    )
    parser.add_argument(
        "--keywords", "-k",
        help="Comma-separated keywords to filter by (overrides defaults)",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Show all tender items without keyword filtering",
    )
    args = parser.parse_args()

    keywords = (
        [k.strip() for k in args.keywords.split(",")]
        if args.keywords
        else DEFAULT_KEYWORDS
    )

    print("Project River — Tender Portal Query", file=sys.stderr)
    print(f"Feed URL: {AUSTENDER_RSS_URL}", file=sys.stderr)
    print(f"Keywords: {', '.join(keywords)}", file=sys.stderr)
    print("", file=sys.stderr)

    # Fetch and parse
    xml_content = fetch_rss_feed(AUSTENDER_RSS_URL)
    all_items = parse_rss(xml_content)
    print(f"Total items in feed: {len(all_items)}", file=sys.stderr)

    if args.all:
        results = all_items
    else:
        results = filter_by_keywords(all_items, keywords)
        print(f"Matching items: {len(results)}", file=sys.stderr)

    # Structure output
    output = {
        "query_timestamp": datetime.utcnow().isoformat() + "Z",
        "feed_url": AUSTENDER_RSS_URL,
        "keywords_used": keywords,
        "total_feed_items": len(all_items),
        "matched_items": len(results),
        "opportunities": results,
    }

    json_output = json.dumps(output, indent=2, ensure_ascii=False)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(json_output)
        print(f"Results written to {args.output}", file=sys.stderr)
    else:
        print(json_output)


if __name__ == "__main__":
    main()
