#!/usr/bin/env python3
"""Analyse the CBS documents cache — produces Task 2.1/2.2/2.3 outputs.

Inputs:  stage4/data/cbs-documents-cache.jsonl
         knowledge-base/ (on-disk KB for orphan check)
Outputs: stage4/data/cbs-audit-raw.json          (Task 2.1)
         stage4/data/cbs-duplicate-report.json   (Task 2.2)
         stage4/data/cbs-orphan-analysis.json    (Task 2.3)
"""
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = Path(__file__).resolve().parents[1] / "data"
CACHE = DATA / "cbs-documents-cache.jsonl"
KB_DIR = ROOT / "knowledge-base"


def load():
    with CACHE.open() as f:
        for line in f:
            yield json.loads(line)


def classify_source(sf: str) -> str:
    if not sf:
        return "null"
    if sf.startswith("CBS KB Email:") or sf.startswith("Email:"):
        return "email_intake"
    if sf.startswith("knowledge-base/"):
        return "kb_repo_prefixed"
    # Most rows are plain filenames like 'cbs-group-foo.md'
    if "/" not in sf:
        return "kb_repo_flat"
    return "other"


def main():
    rows = list(load())
    n = len(rows)
    print(f"Loaded {n} rows")

    # ---------- Task 2.1: audit ----------
    entities = Counter(r.get("entity") or "(null)" for r in rows)
    categories = Counter(r.get("category") or "(null)" for r in rows)
    sources = Counter(classify_source(r.get("source_file")) for r in rows)
    src_files = Counter(r.get("source_file") for r in rows)
    top_sources = src_files.most_common(20)

    # Ingestion timeline by year-month
    timeline = Counter()
    for r in rows:
        ts = r.get("created_at") or ""
        ym = ts[:7] if ts else "(null)"
        timeline[ym] += 1

    email_rows = sum(1 for r in rows if r.get("email_message_id"))
    distinct_email_msgids = len({r.get("email_message_id") for r in rows if r.get("email_message_id")})

    null_entity = sum(1 for r in rows if r.get("entity") is None)
    null_category = sum(1 for r in rows if r.get("category") is None)

    audit = {
        "total_rows": n,
        "distinct_source_files": len(src_files),
        "entity_distribution": dict(entities),
        "category_distribution": dict(categories),
        "source_classification": dict(sources),
        "top_20_source_files": [{"source_file": s, "rows": c} for s, c in top_sources],
        "ingestion_timeline_by_month": dict(sorted(timeline.items())),
        "rows_with_email_message_id": email_rows,
        "distinct_email_message_ids": distinct_email_msgids,
        "null_entity_rows": null_entity,
        "null_category_rows": null_category,
    }
    (DATA / "cbs-audit-raw.json").write_text(json.dumps(audit, indent=2))
    print(f"  entities: {dict(entities)}")
    print(f"  null entity: {null_entity}, null category: {null_category}")
    print(f"  email_message_id rows: {email_rows} (distinct messages: {distinct_email_msgids})")

    # ---------- Task 2.2: duplicates by content hash ----------
    hash_groups = defaultdict(list)
    for r in rows:
        hash_groups[r["content_sha256"]].append(r)
    unique_hashes = len(hash_groups)
    dup_groups = {h: g for h, g in hash_groups.items() if len(g) > 1}
    excess = sum(len(g) - 1 for g in dup_groups.values())
    pct = excess / n * 100 if n else 0

    # Categorise each dup group
    def categorise(g):
        sources = {r.get("source_file") for r in g}
        has_email = any(r.get("email_message_id") for r in g)
        if has_email and len(sources) == 1:
            return "email_intake_duplicate"
        if has_email:
            return "email_intake_cross_source"
        if len(sources) == 1:
            return "same_source_file_reingest"
        return "cross_source_duplicate"

    group_cats = Counter()
    group_excess = Counter()
    for g in dup_groups.values():
        c = categorise(g)
        group_cats[c] += 1
        group_excess[c] += len(g) - 1

    top_dups = sorted(dup_groups.values(), key=len, reverse=True)[:15]
    top_out = []
    for g in top_dups:
        sfiles = Counter(r.get("source_file") for r in g)
        top_out.append({
            "hash": g[0]["content_sha256"][:16],
            "count": len(g),
            "content_len": g[0].get("content_len"),
            "category": categorise(g),
            "distinct_source_files": len(sfiles),
            "has_email_message_id": any(r.get("email_message_id") for r in g),
            "sample_source_files": [{"source_file": s, "rows": c} for s, c in sfiles.most_common(10)],
        })

    dup = {
        "total_rows": n,
        "unique_content_hashes": unique_hashes,
        "duplicate_hash_groups": len(dup_groups),
        "excess_rows_removable": excess,
        "percentage_reduction": round(pct, 2),
        "category_breakdown_groups": dict(group_cats),
        "category_breakdown_excess_rows": dict(group_excess),
        "top_15_duplicate_groups": top_out,
    }
    (DATA / "cbs-duplicate-report.json").write_text(json.dumps(dup, indent=2))
    print(f"  unique hashes: {unique_hashes}, dup groups: {len(dup_groups)}, excess: {excess} ({pct:.1f}%)")
    print(f"  group categorisation: {dict(group_cats)}")

    # ---------- Task 2.3: orphan file analysis ----------
    # Build set of actual on-disk KB files (flat + subfolders, relative to repo root)
    disk_files = set()
    if KB_DIR.is_dir():
        for p in KB_DIR.rglob("*"):
            if p.is_file():
                disk_files.add(p.name)                              # flat basename
                disk_files.add(str(p.relative_to(ROOT)))              # repo-relative path
                disk_files.add(str(p.relative_to(KB_DIR)))            # KB-relative path

    source_classification = defaultdict(Counter)  # class -> (exists_on_disk counter)
    by_class = defaultdict(Counter)
    missing_examples = defaultdict(list)

    for r in rows:
        sf = r.get("source_file") or ""
        cls = classify_source(sf)
        by_class[cls]["total"] += 1
        # Match attempt
        found = sf in disk_files or sf.lstrip("knowledge-base/") in disk_files
        if not found:
            # Try bare basename
            bn = sf.split("/")[-1]
            found = bn in disk_files
        status = "on_disk" if found else "missing"
        by_class[cls][status] += 1
        if status == "missing" and len(missing_examples[cls]) < 10:
            missing_examples[cls].append(sf)

    # Rows per on-disk KB file (how much re-ingest bloat)
    on_disk_dupe = Counter()
    for r in rows:
        sf = r.get("source_file") or ""
        cls = classify_source(sf)
        if cls in ("kb_repo_flat", "kb_repo_prefixed"):
            on_disk_dupe[sf] += 1
    # distribution
    dupe_hist = Counter()
    for sf, c in on_disk_dupe.items():
        bucket = "1" if c == 1 else "2-5" if c <= 5 else "6-10" if c <= 10 else "11-20" if c <= 20 else "21-50" if c <= 50 else "51-100" if c <= 100 else "100+"
        dupe_hist[bucket] += 1

    top_reingest = on_disk_dupe.most_common(15)

    orphan = {
        "on_disk_kb_files_indexed": len(disk_files) // 3,  # rough — each file tallied 3x above
        "by_source_class": {k: dict(v) for k, v in by_class.items()},
        "missing_examples_by_class": dict(missing_examples),
        "rows_per_kb_file_distribution": dict(dupe_hist),
        "top_15_most_reingested_kb_files": [{"source_file": s, "rows": c} for s, c in top_reingest],
    }
    (DATA / "cbs-orphan-analysis.json").write_text(json.dumps(orphan, indent=2))
    print(f"  source classes: {[(k, dict(v)) for k, v in by_class.items()]}")
    print(f"  rows-per-kb-file hist: {dict(dupe_hist)}")

    print("ALL ANALYSES WRITTEN")


if __name__ == "__main__":
    main()
