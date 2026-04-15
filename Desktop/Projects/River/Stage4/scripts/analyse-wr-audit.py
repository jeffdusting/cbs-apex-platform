#!/usr/bin/env python3
"""Analyse the WR documents cache and produce Task 1.1-1.4 outputs.

Inputs:  stage4/data/wr-documents-cache.jsonl
Outputs: stage4/data/wr-audit-raw.json       (Task 1.1)
         stage4/data/wr-duplicate-report.json (Task 1.2)
         stage4/data/wr-path-analysis.json    (Task 1.3)
         stage4/data/wr-cross-dupes.json      (Task 1.4)
"""
import json
from pathlib import Path
from collections import Counter, defaultdict

DATA = Path(__file__).resolve().parents[1] / "data"
CACHE = DATA / "wr-documents-cache.jsonl"


def load():
    with CACHE.open() as f:
        for line in f:
            yield json.loads(line)


def classify_source(sf: str) -> str:
    if not sf:
        return "null_path"
    s = sf.lstrip("/")
    if s.startswith("Imported from Dropbox"):
        return "dropbox"
    if s.startswith("Imported from SharePoint"):
        return "sharepoint"
    if s.startswith("Archive/"):
        return "archive"
    # Canonical top-level folder check
    top = s.split("/", 1)[0]
    canonical_tops = {
        "Governance", "PPP", "Financial", "Investor Relations", "Technical",
        "Operations", "Commercial", "Legal", "HR", "Reference", "Marketing",
    }
    if top in canonical_tops:
        return "canonical"
    return "other"


def top_prefix(sf: str, depth: int = 2) -> str:
    if not sf:
        return "(null)"
    parts = sf.lstrip("/").split("/")
    return "/".join(parts[:depth])


def basename(sf: str) -> str:
    if not sf:
        return ""
    return sf.rstrip("/").split("/")[-1]


def main():
    rows = list(load())
    n = len(rows)
    print(f"Loaded {n} rows")

    # ---------- Task 1.1: audit-raw ----------
    distinct_sources = Counter(r["source_file"] for r in rows)
    entities = Counter(r["entity"] for r in rows)
    categories = Counter(r["category"] for r in rows)
    top_paths = distinct_sources.most_common(30)

    audit_raw = {
        "total_rows": n,
        "distinct_source_files": len(distinct_sources),
        "entity_distribution": dict(entities),
        "category_distribution": {str(k): v for k, v in categories.items()},
        "top_30_source_files": [{"source_file": p, "rows": c} for p, c in top_paths],
    }
    (DATA / "wr-audit-raw.json").write_text(json.dumps(audit_raw, indent=2))
    print(f"  distinct source_files: {len(distinct_sources)}")
    print(f"  entities: {dict(entities)}")

    # ---------- Task 1.2: duplicates by content hash ----------
    hash_groups = defaultdict(list)
    for r in rows:
        hash_groups[r["content_sha256"]].append(r)
    unique_hashes = len(hash_groups)
    dup_groups = {h: g for h, g in hash_groups.items() if len(g) > 1}
    excess_rows = sum(len(g) - 1 for g in dup_groups.values())
    pct_reduction = excess_rows / n * 100 if n else 0

    top_dups = sorted(dup_groups.values(), key=len, reverse=True)[:10]
    top_dups_out = []
    for g in top_dups:
        sources = Counter(r["source_file"] for r in g)
        top_dups_out.append({
            "hash": g[0]["content_sha256"][:16],
            "count": len(g),
            "content_len": g[0].get("content_len"),
            "distinct_source_files": len(sources),
            "sample_source_files": [{"source_file": p, "rows": c} for p, c in sources.most_common(10)],
        })

    dup_report = {
        "total_rows": n,
        "unique_content_hashes": unique_hashes,
        "duplicate_hash_groups": len(dup_groups),
        "excess_rows_removable": excess_rows,
        "percentage_reduction": round(pct_reduction, 2),
        "top_10_duplicate_groups": top_dups_out,
    }
    (DATA / "wr-duplicate-report.json").write_text(json.dumps(dup_report, indent=2))
    print(f"  unique hashes: {unique_hashes}, dup groups: {len(dup_groups)}, excess: {excess_rows} ({pct_reduction:.1f}%)")

    # ---------- Task 1.3: source path pattern analysis ----------
    sources_by_class = Counter(classify_source(r["source_file"]) for r in rows)
    distinct_by_class = defaultdict(set)
    for r in rows:
        distinct_by_class[classify_source(r["source_file"])].add(r["source_file"])
    prefix_counts_top = Counter(top_prefix(r["source_file"], 1) for r in rows)
    prefix_counts_depth2 = Counter(top_prefix(r["source_file"], 2) for r in rows)

    path_analysis = {
        "rows_by_import_source": dict(sources_by_class),
        "distinct_source_files_by_import_source": {k: len(v) for k, v in distinct_by_class.items()},
        "top_level_prefix_counts": dict(prefix_counts_top.most_common(20)),
        "depth_2_prefix_counts": dict(prefix_counts_depth2.most_common(40)),
    }
    (DATA / "wr-path-analysis.json").write_text(json.dumps(path_analysis, indent=2))
    print(f"  path classes: {dict(sources_by_class)}")

    # ---------- Task 1.4: cross-source duplicates by basename ----------
    # For each basename, collect the set of import sources it appears in.
    by_name = defaultdict(lambda: defaultdict(set))  # basename -> source_class -> set(source_file)
    for r in rows:
        sf = r["source_file"]
        if not sf:
            continue
        bn = basename(sf)
        cls = classify_source(sf)
        by_name[bn][cls].add(sf)

    cross = []
    for bn, bysrc in by_name.items():
        if "dropbox" in bysrc and "sharepoint" in bysrc:
            cross.append({
                "basename": bn,
                "dropbox_paths": sorted(bysrc["dropbox"]),
                "sharepoint_paths": sorted(bysrc["sharepoint"]),
                "dropbox_path_count": len(bysrc["dropbox"]),
                "sharepoint_path_count": len(bysrc["sharepoint"]),
            })
    cross.sort(key=lambda x: x["dropbox_path_count"] + x["sharepoint_path_count"], reverse=True)

    cross_report = {
        "cross_source_duplicate_filenames": len(cross),
        "top_20": cross[:20],
    }
    (DATA / "wr-cross-dupes.json").write_text(json.dumps(cross_report, indent=2))
    print(f"  cross-source dup filenames: {len(cross)}")

    print("ALL ANALYSES WRITTEN")


if __name__ == "__main__":
    main()
