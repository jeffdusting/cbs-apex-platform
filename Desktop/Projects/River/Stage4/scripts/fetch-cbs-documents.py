#!/usr/bin/env python3
"""Fetch all CBS documents and cache to disk as JSONL.

Produces stage4/data/cbs-documents-cache.jsonl with one row per line:
{id, entity, source_file, title, category, content_sha256, content_len,
 created_at, metadata_keys, email_message_id, chunk_index, total_chunks,
 original_file}
"""
import hashlib
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

URL = os.environ["SUPABASE_URL"].rstrip("/") + "/rest/v1/documents"
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

PAGE_SIZE = 1000
OUT = Path(__file__).resolve().parents[1] / "data" / "cbs-documents-cache.jsonl"
OUT.parent.mkdir(parents=True, exist_ok=True)


def fetch_page(offset: int, limit: int):
    qs = urllib.parse.urlencode({
        "select": "id,entity,source_file,title,category,content,created_at,metadata",
        "order": "id",
        "limit": limit,
        "offset": offset,
    })
    req = urllib.request.Request(
        f"{URL}?{qs}",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"},
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


def parse_meta(m):
    if not m:
        return {}
    if isinstance(m, dict):
        return m
    try:
        return json.loads(m)
    except Exception:
        return {}


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
                meta = parse_meta(row.get("metadata"))
                f.write(json.dumps({
                    "id": row.get("id"),
                    "entity": row.get("entity"),
                    "source_file": row.get("source_file"),
                    "title": row.get("title"),
                    "category": row.get("category"),
                    "content_sha256": h,
                    "content_len": len(content),
                    "created_at": row.get("created_at"),
                    "metadata_keys": sorted(meta.keys()),
                    "email_message_id": meta.get("email_message_id"),
                    "chunk_index": meta.get("chunk_index"),
                    "total_chunks": meta.get("total_chunks"),
                    "original_file": meta.get("original_file"),
                }) + "\n")
            total += len(page)
            print(f"  fetched {total} rows", file=sys.stderr)
            if len(page) < PAGE_SIZE:
                break
            offset += PAGE_SIZE
    print(f"DONE: {total} rows written to {OUT}")


if __name__ == "__main__":
    main()
