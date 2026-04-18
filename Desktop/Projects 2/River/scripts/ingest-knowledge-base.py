#!/usr/bin/env python3
"""Project River — Knowledge Base Ingest Script (Task 1.4)

Reads all .md files from knowledge-base/, infers entity from filename prefix,
generates embeddings via Voyage AI voyage-3.5 (1024 dimensions),
inserts into Supabase documents table.

Usage:
    source scripts/env-setup.sh
    pip install --break-system-packages -r scripts/requirements.txt
    python scripts/ingest-knowledge-base.py
"""

import os
import sys
import glob
import json
import time

import voyageai
from supabase import create_client, Client


def get_env(key: str) -> str:
    """Retrieve an environment variable or exit with an error."""
    value = os.environ.get(key)
    if not value:
        print(f"ERROR: Environment variable {key} is not set.")
        sys.exit(1)
    return value


def infer_entity(filename: str) -> str:
    """Infer entity from filename prefix."""
    basename = os.path.basename(filename).lower()
    if basename.startswith("cbs-group") or basename.startswith("cbs_group"):
        return "cbs-group"
    elif basename.startswith("waterroads") or basename.startswith("wr-") or basename.startswith("wr_"):
        return "waterroads"
    elif basename.startswith("adventure-safety") or basename.startswith("as-"):
        return "adventure-safety"
    elif basename.startswith("maf") or basename.startswith("cobaltblu"):
        return "maf-cobaltblu"
    else:
        return "general"


def infer_title(filename: str) -> str:
    """Generate a human-readable title from the filename."""
    basename = os.path.basename(filename)
    name = os.path.splitext(basename)[0]
    # Remove entity prefix
    for prefix in ["cbs-group-", "waterroads-", "wr-", "adventure-safety-", "maf-", "cobaltblu-"]:
        if name.lower().startswith(prefix):
            name = name[len(prefix):]
            break
    return name.replace("-", " ").replace("_", " ").title()


def chunk_text(text: str, max_chars: int = 8000) -> list[str]:
    """Split text into chunks, respecting paragraph boundaries where possible."""
    if len(text) <= max_chars:
        return [text]

    chunks = []
    paragraphs = text.split("\n\n")
    current_chunk = ""

    for paragraph in paragraphs:
        if len(current_chunk) + len(paragraph) + 2 > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = paragraph
        else:
            current_chunk = current_chunk + "\n\n" + paragraph if current_chunk else paragraph

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks if chunks else [text[:max_chars]]


def main():
    # Configuration from environment
    voyage_api_key = get_env("VOYAGE_API_KEY")
    supabase_url = get_env("SUPABASE_URL")
    supabase_key = get_env("SUPABASE_SERVICE_ROLE_KEY")

    # Initialise clients
    vo = voyageai.Client(api_key=voyage_api_key)
    supabase: Client = create_client(supabase_url, supabase_key)

    # Find all .md files in knowledge-base/
    kb_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "knowledge-base")
    md_files = sorted(glob.glob(os.path.join(kb_dir, "*.md")))

    if not md_files:
        print(f"WARNING: No .md files found in {kb_dir}")
        sys.exit(0)

    print(f"Found {len(md_files)} markdown files in {kb_dir}")

    total_inserted = 0
    total_errors = 0

    for filepath in md_files:
        filename = os.path.basename(filepath)

        # Skip non-content files
        if filename in ["index.md", "QUALITY-GATE-ASSESSMENT.md", "STAGE2-EXTRACTION-GUIDE.md"]:
            print(f"  Skipping {filename} (non-content file)")
            continue

        # Skip Python files that happen to be in the directory
        if filename.endswith(".py"):
            continue

        entity = infer_entity(filename)
        title = infer_title(filename)

        print(f"  Processing: {filename} (entity={entity})")

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"    ERROR reading file: {e}")
            total_errors += 1
            continue

        if not content.strip():
            print(f"    Skipping empty file")
            continue

        # Chunk the content for large files
        chunks = chunk_text(content)
        print(f"    {len(chunks)} chunk(s), {len(content)} chars total")

        # Idempotency fix (S4-P4 §8.1) — wipe any prior rows for this
        # source_file before inserting new chunks so re-runs don't accumulate
        # duplicates. Corrections live in a separate ingest path
        # (ingest-correction.py) so are untouched.
        try:
            supabase.table("documents").delete().eq(
                "source_file", filename
            ).execute()
        except Exception as e:
            print(f"    WARNING: pre-delete failed for {filename}: {e}")

        for i, chunk in enumerate(chunks):
            try:
                # Generate embedding via Voyage AI
                result = vo.embed([chunk], model="voyage-3.5", input_type="document")
                embedding = result.embeddings[0]

                # Insert into Supabase
                record = {
                    "entity": entity,
                    "source_file": filename,
                    "title": f"{title} (Part {i + 1})" if len(chunks) > 1 else title,
                    "content": chunk,
                    "embedding": embedding,
                    "category": "knowledge",
                    "metadata": json.dumps({
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                        "original_file": filename,
                        "embedding_model": "voyage-3.5",
                    }),
                }
                supabase.table("documents").insert(record).execute()
                total_inserted += 1
                print(f"    Inserted chunk {i + 1}/{len(chunks)}")

                # Rate limiting — Voyage AI has request limits
                time.sleep(0.2)

            except Exception as e:
                print(f"    ERROR processing chunk {i + 1}: {e}")
                total_errors += 1

    print(f"\n{'=' * 60}")
    print(f"Ingestion complete.")
    print(f"  Files processed: {len(md_files)}")
    print(f"  Documents inserted: {total_inserted}")
    print(f"  Errors: {total_errors}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
