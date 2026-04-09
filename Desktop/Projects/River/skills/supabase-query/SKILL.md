# Skill: supabase-query

## Purpose

Query the River knowledge base hosted on Supabase with pgvector. Supports semantic search via the `match_documents` RPC function (1024-dimension Voyage AI voyage-3.5 embeddings) and full-text search as a fallback.

## Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL (e.g. `https://<project-ref>.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key with read access to the `documents` table |

These are injected via `adapterConfig.env` on the agent. Never hardcode credentials.

## Semantic Search — match_documents

Use semantic search as the primary retrieval method. The `match_documents` function accepts a query embedding (1024-dimension float array from Voyage AI voyage-3.5) and returns documents ranked by cosine similarity.

### Python Example

```python
import os
import httpx

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


def semantic_search(query_embedding: list[float], entity: str = None, category: str = None, match_count: int = 10, match_threshold: float = 0.7) -> list[dict]:
    """
    Search the knowledge base using semantic similarity.

    Args:
        query_embedding: 1024-dimension float array from Voyage AI voyage-3.5.
        entity: Filter by entity (e.g. "cbs-group", "waterroads").
        category: Filter by category (e.g. "tender", "governance", "methodology").
        match_count: Maximum number of results to return.
        match_threshold: Minimum cosine similarity threshold (0.0 to 1.0).

    Returns:
        List of matching document chunks with similarity scores.
    """
    payload = {
        "query_embedding": query_embedding,
        "match_count": match_count,
        "match_threshold": match_threshold,
    }
    if entity:
        payload["filter_entity"] = entity
    if category:
        payload["filter_category"] = category

    response = httpx.post(
        f"{SUPABASE_URL}/rest/v1/rpc/match_documents",
        headers=headers,
        json=payload,
    )
    response.raise_for_status()
    return response.json()
```

### Response Format

Each result contains:

```json
{
  "id": "uuid",
  "content": "Document chunk text...",
  "metadata": {
    "source": "cbs-group-capital-methodology.md",
    "entity": "cbs-group",
    "category": "methodology",
    "chunk_index": 3
  },
  "similarity": 0.87
}
```

## Full-Text Search — Fallback

When semantic search returns fewer than 3 results above the threshold, fall back to full-text search using the PostgREST text search operator.

```python
def fulltext_search(query: str, entity: str = None, limit: int = 10) -> list[dict]:
    """
    Full-text search fallback using PostgreSQL tsvector.

    Args:
        query: Natural language search query.
        entity: Optional entity filter.
        limit: Maximum results.

    Returns:
        List of matching document chunks.
    """
    params = {
        "content": f"fts.{query}",
        "limit": limit,
        "order": "created_at.desc",
    }
    if entity:
        params["metadata->>entity"] = f"eq.{entity}"

    response = httpx.get(
        f"{SUPABASE_URL}/rest/v1/documents",
        headers=headers,
        params=params,
    )
    response.raise_for_status()
    return response.json()
```

## Filtered Retrieval by Entity and Category

To retrieve documents for a specific entity and category without embedding search, use direct REST filtering:

```python
def get_documents_by_filter(entity: str, category: str, limit: int = 20) -> list[dict]:
    """
    Retrieve documents filtered by entity and category metadata.

    Args:
        entity: Entity identifier (e.g. "cbs-group", "waterroads").
        category: Document category (e.g. "tender", "governance", "methodology", "board-paper").
        limit: Maximum results.
    """
    params = {
        "metadata->>entity": f"eq.{entity}",
        "metadata->>category": f"eq.{category}",
        "limit": limit,
        "order": "created_at.desc",
    }

    response = httpx.get(
        f"{SUPABASE_URL}/rest/v1/documents",
        headers=headers,
        params=params,
    )
    response.raise_for_status()
    return response.json()
```

## Entity Values

| Entity | Description |
|---|---|
| `cbs-group` | CBS Group Pty Ltd — anchor entity, technical advisory |
| `waterroads` | WaterRoads Pty Ltd — maritime transport, PPP |
| `adventure-safety` | Adventure Safety — provisioned inactive |
| `cobaltblu` | MAF/CobaltBlu — provisioned inactive |

## Category Values

| Category | Description |
|---|---|
| `methodology` | CAPITAL framework, ISO standards, white papers |
| `tender` | Tender submissions, responses, addenda |
| `governance` | Board papers, minutes, resolutions |
| `capability` | Capability statements, CVs, specialisations |
| `financial` | Fee structures, financial models |
| `business-case` | Business cases, feasibility studies |

## Best Practices

1. Always attempt semantic search first. Only fall back to full-text search if semantic results are insufficient (fewer than 3 results above 0.7 similarity).
2. Filter by entity when the task context is clear. A CBS Group tender task should filter by `entity: "cbs-group"`.
3. Filter by category to narrow results. Governance tasks should use `category: "governance"`.
4. Include the retrieval confidence in your output signal: report the number of documents matched, the similarity range, and your assessment of sufficiency.
5. Never fabricate content that was not present in the retrieved documents. If retrieval is insufficient, say so.
6. Respect rate limits — avoid calling the RPC function more than 10 times per heartbeat cycle.
