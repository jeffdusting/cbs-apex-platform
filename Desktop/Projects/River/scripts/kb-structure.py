#!/usr/bin/env python3
"""Phase 4 — Knowledge Base Structuring Script

Reads each .md content file in knowledge-base/, adds YAML front-matter,
splits files >5000 words at H2 boundaries into sub-documents.
Each sub-document gets its own front-matter and a 200-word contextual header.

Non-content files (index.md, QUALITY-GATE-ASSESSMENT.md, etc.) are skipped.
"""

import os
import re
import textwrap

KB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "knowledge-base")

# Files that are process/metadata, not retrieval content
SKIP_FILES = {
    "index.md",
    "manus-session-extraction-pipeline.md",
    "QUALITY-GATE-ASSESSMENT.md",
    "STAGE2-EXTRACTION-GUIDE.md",
    "MANIFEST.md",
    "RETRIEVAL_EVAL.md",
}

# Category mapping based on filename patterns
CATEGORY_MAP = {
    "board-papers": "governance",
    "capital-methodology": "methodology",
    "fee-structure": "financial",
    "capability-statements": "ip",
    "specialisations": "ip",
    "white-papers": "ip",
    "personnel-cvs": "ip",
    "tolling-advisory": "ip",
    "tolling-benchmark": "ip",
    "tfnsw-materials": "ip",
    "downer-alternate-funding": "tender",
    "jv-egis": "tender",
    "post-tender-addenda": "tender",
    "tender-dhs-vic-kpi": "tender",
    "tender-mbsc-mzf2": "tender",
    "tender-nz-mot-tolling": "tender",
    "tender-tfnsw-am-2025": "tender",
    "tender-tfnsw-amss": "tender",
    "tender-vic-pas-panel": "tender",
    "tender-wht-am": "tender",
    "business-case": "financial",
    "financial-model": "financial",
    "ppp-structure": "financial",
}


def infer_entity(filename):
    base = filename.lower()
    if base.startswith("cbs-group"):
        return "cbs-group"
    elif base.startswith("waterroads") or base.startswith("wr-"):
        return "waterroads"
    return "general"


def infer_category(filename):
    base = filename.lower().replace(".md", "")
    # Strip entity prefix
    for prefix in ("cbs-group-", "waterroads-", "wr-"):
        if base.startswith(prefix):
            base = base[len(prefix):]
            break
    for pattern, cat in CATEGORY_MAP.items():
        if pattern in base:
            return cat
    return "ip"


def infer_title(filename):
    base = os.path.splitext(filename)[0]
    for prefix in ("cbs-group-", "waterroads-", "wr-"):
        if base.lower().startswith(prefix):
            base = base[len(prefix):]
            break
    return base.replace("-", " ").replace("_", " ").title()


def word_count(text):
    return len(text.split())


def make_front_matter(entity, category, title):
    return f"---\nentity: {entity}\ncategory: {category}\ntitle: \"{title}\"\n---\n\n"


def extract_h1_title(text):
    """Extract H1 title from start of document."""
    match = re.match(r"^#\s+(.+)", text.strip())
    return match.group(1).strip() if match else None


def split_at_h2(text):
    """Split text into sections at H2 boundaries.
    Returns list of (heading, content) tuples."""
    # Find all H2 positions
    h2_pattern = re.compile(r"^## .+", re.MULTILINE)
    matches = list(h2_pattern.finditer(text))

    if not matches:
        return [("", text)]

    sections = []

    # Content before first H2 (preamble)
    preamble = text[:matches[0].start()].strip()
    if preamble:
        sections.append(("_preamble", preamble))

    for i, match in enumerate(matches):
        heading = match.group(0).lstrip("# ").strip()
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start:end].strip()
        sections.append((heading, content))

    return sections


def build_context_header(parent_title, entity, category, total_sections):
    """Build a 200-word max contextual header for sub-documents."""
    entity_desc = {
        "cbs-group": "CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling",
        "waterroads": "WaterRoads, a maritime transport venture developing electric hydrofoil ferry services in Sydney",
    }.get(entity, entity)

    cat_desc = {
        "governance": "governance and board documentation",
        "methodology": "methodology and framework documentation",
        "financial": "financial and commercial documentation",
        "ip": "intellectual property and capability documentation",
        "tender": "tender submission and procurement documentation",
        "template": "template and standard documentation",
    }.get(category, category)

    return textwrap.dedent(f"""\
        > **Parent document:** {parent_title}
        > **Entity:** {entity_desc}
        > **Category:** {cat_desc}
        > **Total sections in parent:** {total_sections}
        >
        > This is a sub-document extracted from the parent for retrieval optimisation.
        > The parent document contains the complete collection; this section is independently
        > retrievable for targeted queries.
    """).strip()


def process_file(filepath):
    """Process a single KB file. Returns list of (filename, content) for output files."""
    filename = os.path.basename(filepath)
    if filename in SKIP_FILES or not filename.endswith(".md"):
        return []

    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    entity = infer_entity(filename)
    category = infer_category(filename)
    base_title = infer_title(filename)
    h1_title = extract_h1_title(text) or base_title
    wc = word_count(text)

    # Strip any existing front-matter (shouldn't exist yet, but be safe)
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            text = text[end + 3:].strip()

    if wc <= 5000:
        # Small file — just add front-matter
        fm = make_front_matter(entity, category, h1_title)
        return [(filename, fm + text)]

    # Large file — split at H2 boundaries
    sections = split_at_h2(text)
    total_sections = len([s for s in sections if s[0] != "_preamble"])

    # Group sections to target ~5000 words per sub-document
    groups = []
    current_group = []
    current_wc = 0

    for heading, content in sections:
        sec_wc = word_count(content)

        # If a single section exceeds 5000 words, it becomes its own group
        if sec_wc > 5000 and current_group:
            groups.append(current_group)
            groups.append([(heading, content)])
            current_group = []
            current_wc = 0
        elif sec_wc > 5000:
            groups.append([(heading, content)])
        elif current_wc + sec_wc > 5000 and current_group:
            groups.append(current_group)
            current_group = [(heading, content)]
            current_wc = sec_wc
        else:
            current_group.append((heading, content))
            current_wc += sec_wc

    if current_group:
        groups.append(current_group)

    # If only one group, no need to split
    if len(groups) == 1:
        fm = make_front_matter(entity, category, h1_title)
        return [(filename, fm + text)]

    # Generate sub-documents
    stem = os.path.splitext(filename)[0]
    results = []
    context_header = build_context_header(h1_title, entity, category, total_sections)

    for i, group in enumerate(groups, 1):
        # Determine sub-title from first non-preamble heading in group
        sub_headings = [h for h, _ in group if h != "_preamble"]
        if sub_headings:
            first_heading = sub_headings[0]
            if len(sub_headings) > 1:
                sub_title = f"{h1_title} — {first_heading} (+{len(sub_headings) - 1} more)"
            else:
                sub_title = f"{h1_title} — {first_heading}"
        else:
            sub_title = f"{h1_title} — Introduction"

        # Truncate title if too long
        if len(sub_title) > 120:
            sub_title = sub_title[:117] + "..."

        fm = make_front_matter(entity, category, sub_title)
        body_parts = [fm, context_header, "\n\n"]

        for heading, content in group:
            body_parts.append(content)
            body_parts.append("\n\n")

        sub_filename = f"{stem}-part{i:02d}.md"
        results.append((sub_filename, "".join(body_parts).rstrip() + "\n"))

    return results


def main():
    """Process all KB files and write results."""
    # Get all content files
    files = sorted(
        f for f in os.listdir(KB_DIR)
        if f.endswith(".md") and f not in SKIP_FILES
    )

    print(f"Found {len(files)} content files to process")

    all_outputs = []
    files_to_remove = []

    for filename in files:
        filepath = os.path.join(KB_DIR, filename)
        outputs = process_file(filepath)

        if not outputs:
            continue

        if len(outputs) == 1 and outputs[0][0] == filename:
            # File wasn't split — update in place
            print(f"  {filename}: front-matter added (no split needed)")
        else:
            # File was split — mark original for removal
            files_to_remove.append(filename)
            print(f"  {filename}: split into {len(outputs)} sub-documents")

        all_outputs.extend(outputs)

    # Write all output files
    for out_name, out_content in all_outputs:
        out_path = os.path.join(KB_DIR, out_name)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(out_content)

    # Remove original files that were split (only if sub-docs were written)
    for filename in files_to_remove:
        orig_path = os.path.join(KB_DIR, filename)
        if os.path.exists(orig_path):
            os.remove(orig_path)
            print(f"  Removed original: {filename}")

    # Summary
    print(f"\nDone. Wrote {len(all_outputs)} files, removed {len(files_to_remove)} originals.")
    print(f"Net KB content files: {len(all_outputs)}")


if __name__ == "__main__":
    main()
