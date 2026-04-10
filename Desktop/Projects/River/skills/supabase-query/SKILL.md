# Skill: supabase-query

## Purpose

Query the River knowledge base hosted on Supabase with pgvector. Supports semantic search via the `match_documents` RPC function (1024-dimension Voyage AI voyage-3.5 embeddings) and full-text search as a fallback.

## Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL (e.g. `https://<project-ref>.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key with read access to the `documents` table |

These are injected via `adapterConfig.env` on the agent. Never hardcode credentials.

## Semantic Search — Two-Step Process

Semantic search requires two steps:
1. **Embed the query** — call Voyage AI to convert your search text into a 1024-dimension vector
2. **Search Supabase** — pass the vector to `match_documents` to find similar documents

You MUST use this two-step process for all KB retrieval. Do NOT skip the embedding step.

### Step 1: Generate Query Embedding via Voyage AI

```python
import os
import httpx

VOYAGE_API_KEY = os.environ["VOYAGE_API_KEY"]

def get_query_embedding(query_text: str) -> list[float]:
    """
    Convert a search query into a 1024-dimension embedding via Voyage AI.
    
    Args:
        query_text: Natural language search query.
    
    Returns:
        1024-dimension float array.
    """
    response = httpx.post(
        "https://api.voyageai.com/v1/embeddings",
        headers={
            "Authorization": f"Bearer {VOYAGE_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "input": [query_text],
            "model": "voyage-3.5",
            "input_type": "query",
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["data"][0]["embedding"]
```

### Step 2: Search Supabase with the Embedding

```python
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase_headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


def semantic_search(query_text: str, entity: str = None, category: str = None, match_count: int = 10, match_threshold: float = 0.5) -> list[dict]:
    """
    Full semantic search: embed query via Voyage AI, then search Supabase.

    Args:
        query_text: Natural language search query.
        entity: Filter by entity (e.g. "cbs-group", "waterroads"). Also returns 'shared' docs.
        category: Filter by category (e.g. "tender", "governance", "methodology").
        match_count: Maximum number of results to return.
        match_threshold: Minimum cosine similarity threshold (0.0 to 1.0).

    Returns:
        List of matching document chunks with similarity scores.
    """
    # Step 1: Get embedding from Voyage AI
    query_embedding = get_query_embedding(query_text)

    # Step 2: Search Supabase
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
        headers=supabase_headers,
        json=payload,
    )
    response.raise_for_status()
    return response.json()
```

### Complete Usage Example

```python
# Search for tunnelling experience in CBS Group knowledge base
results = semantic_search(
    query_text="tunnelling systems engineering asset management experience",
    entity="cbs-group",
    match_count=5,
    match_threshold=0.5,
)

for doc in results:
    print(f"[{doc['similarity']:.3f}] {doc['source_file']}: {doc['title']}")
    print(f"  {doc['content'][:200]}...")
```

### Response Format

Each result contains:

```json
{
  "id": 123,
  "entity": "cbs-group",
  "title": "Capital Methodology Part01",
  "content": "Document chunk text...",
  "source_file": "cbs-group-capital-methodology-part01.md",
  "similarity": 0.57
}
```

**Note:** `entity` and `category` are top-level TEXT columns, not inside `metadata` JSONB. Use PostgREST filtering with `entity=eq.cbs-group` and `category=eq.tender`, not `metadata->>entity`.

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
        params["entity"] = f"eq.{entity}"

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
        "category": f"eq.{category}",
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
| `shared` | Cross-entity documents accessible to all agents (CAPITAL framework, ISO standards, general regulatory) |
| `adventure-safety` | Adventure Safety — provisioned inactive |
| `cobaltblu` | MAF/CobaltBlu — provisioned inactive |

**Shared entity behaviour:** When you query with `filter_entity`, the `match_documents` function automatically includes documents with `entity = 'shared'` alongside your entity-specific results. You do not need to query shared separately.

## Category Values

| Category | Description |
|---|---|
| `methodology` | CAPITAL framework, ISO standards, white papers |
| `tender` | Tender submissions, responses, addenda |
| `governance` | Board papers, minutes, resolutions |
| `capability` | Capability statements, CVs, specialisations |
| `financial` | Fee structures, financial models |
| `business-case` | Business cases, feasibility studies |
| `correction` | Operator feedback corrections — queried via the feedback-loop skill |

## Best Practices

1. Always attempt semantic search first. Only fall back to full-text search if semantic results are insufficient (fewer than 3 results above 0.7 similarity).
2. Filter by entity when the task context is clear. A CBS Group tender task should filter by `entity: "cbs-group"`.
3. Filter by category to narrow results. Governance tasks should use `category: "governance"`.
4. Include the retrieval confidence in your output signal: report the number of documents matched, the similarity range, and your assessment of sufficiency.
5. Never fabricate content that was not present in the retrieved documents. If retrieval is insufficient, say so.
6. Respect rate limits — avoid calling the RPC function more than 10 times per heartbeat cycle.
