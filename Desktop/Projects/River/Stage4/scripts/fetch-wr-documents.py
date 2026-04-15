#!/usr/bin/env python3
"""Fetch all WR documents and cache to disk as JSONL.

Produces stage4/data/wr-documents-cache.jsonl with one row per line:
{id, entity, source_file, category, content_sha256, content_len}

We do NOT cache the raw content (could be very large). Instead we hash it
streamingly and keep only metadata + sha256 for dedup analysis.
"""
import os
import sys
import json
import hashlib
import urllib.request
import urllib.parse
from pathlib import Path

URL = os.environ["WR_SUPABASE_URL"].rstrip("/") + "/rest/v1/documents"
KEY = os.environ["WR_SUPABASE_SERVICE_ROLE_KEY"]

PAGE_SIZE = 1000
OUT = Path(__file__).resolve().parents[1] / "data" / "wr-documents-cache.jsonl"
OUT.parent.mkdir(parents=True, exist_ok=True)


def fetch_page(offset: int, limit: int):
    qs = urllib.parse.urlencode({
        "select": "id,entity,source_file,category,content",
        "order": "id",
        "limit": limit,
        "offset": offset,
    })
    req = urllib.request.Request(
        f"{URL}?{qs}",
        headers={
            "apikey": KEY,
            "Authorization": f"Bearer {KEY}",
        },
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())


def main():
    total = 0
    with OUT.open("w") as f:
        offset = 0
        while True:
            page = fetch_page(offset, PAGE_SIZE)
            if not page:
                break
            for row in page:
                content = row.get("content") or ""
                h = hashlib.sha256(content.encode("utf-8", errors="replace")).hexdigest()
                f.write(json.dumps({
                    "id": row.get("id"),
                    "entity": row.get("entity"),
                    "source_file": row.get("source_file"),
                    "category": row.get("category"),
                    "content_sha256": h,
                    "content_len": len(content),
                }) + "\n")
            total += len(page)
            print(f"  fetched {total} rows", file=sys.stderr)
            if len(page) < PAGE_SIZE:
                break
            offset += PAGE_SIZE
    print(f"DONE: {total} rows written to {OUT}")


if __name__ == "__main__":
    main()
