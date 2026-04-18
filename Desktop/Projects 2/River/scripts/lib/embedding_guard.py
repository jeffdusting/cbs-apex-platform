"""
S5-P5 (CE.3): Embedding model guard.

The WR KB had a silent failure where voyage-3 and voyage-3.5 vectors produced
identical dimensions (1024) but incompatible embedding spaces. This module
gives ingestion and retrieval code a single source of truth for the active
model and helpers to verify that documents and queries agree on it.
"""

from __future__ import annotations

from typing import Any

ACTIVE_MODEL = "voyage-3.5"


def verify_embedding_model(metadata: dict[str, Any] | None) -> bool:
    """Returns True if the document was embedded with the active model.

    Documents without an `embedding_model` metadata key are treated as
    unverified (return False). Callers decide how strict to be — async
    retrieval may tolerate unverified legacy rows; sync retrieval should not.
    """
    if not metadata:
        return False
    return metadata.get("embedding_model") == ACTIVE_MODEL


def assert_query_model(model_used: str) -> None:
    """Raises ValueError if a query was embedded with a model other than ACTIVE_MODEL."""
    if model_used != ACTIVE_MODEL:
        raise ValueError(
            f"Query model '{model_used}' != active model '{ACTIVE_MODEL}'. "
            "Retrieval across incompatible embedding spaces is unsafe."
        )


def tag_document_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    """Returns a new metadata dict with embedding_model set to ACTIVE_MODEL.

    Call this immediately before inserting into `documents`. If the caller
    supplied an embedding_model key, it is overwritten — only the active
    model should ever be written, and only by code that called the Voyage
    API using ACTIVE_MODEL.
    """
    out = dict(metadata or {})
    out["embedding_model"] = ACTIVE_MODEL
    return out
