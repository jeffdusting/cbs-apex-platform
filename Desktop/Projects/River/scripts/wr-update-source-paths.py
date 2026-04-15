#!/usr/bin/env python3
"""
Update WR Supabase `documents.source_file` after Drive reorg — S4-P3 TASK 3.4.

For each move in stage4/data/wr-reorg-moves.json, PATCH every Supabase row
whose `drive_file_id` matches to the new canonical path
(`{target_canonical}/{basename}`). drive_file_id is the join key — it is
preserved by Drive API on parent change.
"""
from __future__ import annotations

import json
import os
import sys
import time

import httpx

WR_URL = os.environ["WR_SUPABASE_URL"].rstrip("/")
WR_KEY = os.environ["WR_SUPABASE_SERVICE_ROLE_KEY"]
HEADERS = {
    "apikey": WR_KEY,
    "Authorization": f"Bearer {WR_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def main() -> int:
    with open("stage4/data/wr-reorg-moves.json") as f:
        moves = json.load(f)["moves"]

    updated_rows = 0
    unmatched_files = 0
    touched_files = 0
    errors: list[dict] = []

    with httpx.Client(timeout=60.0) as client:
        for i, m in enumerate(moves, 1):
            filename = m["source_path"].rsplit("/", 1)[-1]
            new_source_file = f"{m['target_canonical']}/{filename}"
            r = client.patch(
                f"{WR_URL}/rest/v1/documents",
                params={"drive_file_id": f"eq.{m['file_id']}"},
                headers=HEADERS,
                json={"source_file": new_source_file},
            )
            if r.status_code >= 400:
                errors.append({
                    "file_id": m["file_id"],
                    "new_source_file": new_source_file,
                    "status": r.status_code,
                    "body": r.text[:300],
                })
                continue
            rows = r.json()
            n = len(rows) if isinstance(rows, list) else 0
            if n == 0:
                unmatched_files += 1
            else:
                updated_rows += n
                touched_files += 1
            if i % 200 == 0:
                print(f"  {i}/{len(moves)}  files_touched={touched_files} "
                      f"rows_updated={updated_rows} unmatched_files={unmatched_files}",
                      flush=True)
            time.sleep(0.015)

    print(f"[update-paths] done. files touched (had supabase rows): {touched_files}")
    print(f"[update-paths] files with no supabase rows: {unmatched_files}")
    print(f"[update-paths] rows updated: {updated_rows}")
    print(f"[update-paths] errors: {len(errors)}")

    out = {
        "moves_processed": len(moves),
        "files_with_supabase_rows_updated": touched_files,
        "files_without_supabase_rows": unmatched_files,
        "rows_updated_total": updated_rows,
        "errors": errors[:50],
        "error_count": len(errors),
    }
    with open("stage4/data/wr-source-path-updates.json", "w") as f:
        json.dump(out, f, indent=2)
    print("[update-paths] report written: stage4/data/wr-source-path-updates.json")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
