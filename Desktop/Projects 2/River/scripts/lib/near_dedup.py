"""
S5-P5 (CE.6): Near-duplicate detection via k-word shingling + Jaccard similarity.

Stage 4 dedup relied on byte-identical content hashes, which misses documents
that differ in whitespace, headers, or boilerplate re-formatting. Shingling
catches those near-duplicates without a full embedding pass.
"""

from __future__ import annotations

from typing import Iterable


def shingle(text: str, k: int = 5) -> set[str]:
    """Generate k-word shingles from text.

    Lowercased; whitespace-normalised. Returns empty set if text has fewer
    than k tokens.
    """
    words = text.lower().split()
    if len(words) < k:
        return set()
    return {" ".join(words[i:i + k]) for i in range(len(words) - k + 1)}


def jaccard_similarity(set_a: set[str], set_b: set[str]) -> float:
    """Jaccard similarity coefficient. Returns 0.0 if either set is empty."""
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union else 0.0


def find_near_duplicates(
    documents: Iterable[dict],
    threshold: float = 0.85,
    k: int = 5,
) -> list[tuple[str, str, float]]:
    """Find document pairs with Jaccard similarity >= threshold.

    Each document must have `id` and `content` keys. Returns list of
    (id_a, id_b, similarity) tuples, sorted by descending similarity.

    This is O(n^2) in the number of documents; intended for batch audits of
    hundreds of rows, not online use. For larger sets, add MinHash + LSH.
    """
    shingles = [(doc["id"], shingle(doc["content"], k)) for doc in documents]
    duplicates: list[tuple[str, str, float]] = []
    for i in range(len(shingles)):
        for j in range(i + 1, len(shingles)):
            sim = jaccard_similarity(shingles[i][1], shingles[j][1])
            if sim >= threshold:
                duplicates.append((shingles[i][0], shingles[j][0], sim))
    duplicates.sort(key=lambda x: x[2], reverse=True)
    return duplicates
