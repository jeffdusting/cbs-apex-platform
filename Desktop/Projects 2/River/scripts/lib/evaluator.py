"""
Shared evaluation logic for hyper-agent-v1 evaluation pipeline.

Used by:
  - scripts/evaluate-outputs.py (async batch evaluation)
  - scripts/sync-evaluate.py (sync single-trace evaluation)
"""

import json
import logging
import os
import time
import hashlib
from datetime import datetime, timezone

import anthropic
import httpx


def supabase_headers(key: str) -> dict:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def load_events_config(path: str | None = None) -> dict:
    """Load config/evaluation-events.json. Path defaults to repo-relative."""
    if path is None:
        path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "config",
            "evaluation-events.json",
        )
    with open(path) as f:
        return json.load(f)


def resolve_evaluation_mode(task_type: str, events_config: dict) -> str:
    """Map a trace task_type to its evaluation mode.

    Returns one of: 'sync', 'async', 'self_check'. Unknown task_types emit a
    WARNING and default to 'async' so the trace still gets scored rather than
    silently dropped (IV#7/RA.11 — vocabulary drift must be visible).
    """
    for mode, cfg in events_config.items():
        known_types = [tc["task_type"] for tc in cfg.get("trigger_conditions", [])]
        if task_type in known_types:
            return mode.replace("_evaluation", "").replace("_only", "")
    logging.warning(
        f"Unknown task_type '{task_type}' — defaulting to async evaluation. "
        f"Add it to config/evaluation-events.json to silence this warning."
    )
    return "async"


def load_active_rubric(supabase_url: str, supabase_key: str) -> dict:
    """Load the currently active rubric from Supabase."""
    headers = supabase_headers(supabase_key)
    r = httpx.get(
        f"{supabase_url}/rest/v1/rubric_versions",
        headers=headers,
        params={"active": "eq.true", "order": "created_at.desc", "limit": "1"},
    )
    r.raise_for_status()
    rows = r.json()
    if not rows:
        raise RuntimeError("No active rubric found in rubric_versions table")
    return rows[0]


def get_unscored_traces(
    supabase_url: str,
    supabase_key: str,
    batch_size: int = 50,
    max_age_days: int = 7,
) -> tuple[list[dict], list[dict]]:
    """
    Fetch traces with no corresponding evaluation_scores entry.

    Returns:
        (scorable, stale) — traces within age limit and traces older than max_age_days.
    """
    headers = supabase_headers(supabase_key)

    # Get all traces ordered oldest first
    r = httpx.get(
        f"{supabase_url}/rest/v1/agent_traces",
        headers=headers,
        params={
            "select": "*",
            "order": "created_at.asc",
            "limit": str(batch_size * 2),  # fetch extra to account for stale
        },
    )
    r.raise_for_status()
    all_traces = r.json()

    if not all_traces:
        return [], []

    # Get existing evaluation trace_ids
    trace_ids = [t["id"] for t in all_traces]
    scored_ids = set()
    # Check in batches of 50
    for i in range(0, len(trace_ids), 50):
        batch = trace_ids[i : i + 50]
        id_filter = ",".join(batch)
        r = httpx.get(
            f"{supabase_url}/rest/v1/evaluation_scores",
            headers=headers,
            params={"trace_id": f"in.({id_filter})", "select": "trace_id"},
        )
        r.raise_for_status()
        scored_ids.update(row["trace_id"] for row in r.json())

    # Partition into scorable vs stale
    cutoff = datetime.now(timezone.utc).timestamp() - (max_age_days * 86400)
    scorable = []
    stale = []

    for t in all_traces:
        if t["id"] in scored_ids:
            continue
        created = datetime.fromisoformat(t["created_at"].replace("Z", "+00:00"))
        if created.timestamp() < cutoff:
            stale.append(t)
        else:
            if len(scorable) < batch_size:
                scorable.append(t)

    return scorable, stale


def build_evaluation_prompt(trace: dict, rubric: dict) -> str:
    """Construct the evaluation prompt for the LLM."""
    dimensions_text = ""
    for dim in rubric["dimensions"]:
        guide_lines = "\n".join(
            f"      {k}: {v}" for k, v in dim["scoring_guide"].items()
        )
        dimensions_text += f"""
    - **{dim['name']}** (weight: {dim['weight']})
      Description: {dim['description']}
      Scoring guide:
{guide_lines}
"""

    # Build context from trace
    trace_context = f"""Agent role: {trace.get('agent_role', 'unknown')}
Task type: {trace.get('task_type', 'unknown')}
Decision: {trace.get('decision', 'N/A')}
Confidence: {trace.get('confidence', 'N/A')}
KB queries: {json.dumps(trace.get('kb_queries', []))}
KB results count: {trace.get('kb_results_count', 0)}
KB top similarity: {trace.get('kb_top_similarity', 'N/A')}
Self-check score: {trace.get('self_check_score', 'N/A')}
Self-check flags: {json.dumps(trace.get('self_check_flags', []))}
Corrections applied: {json.dumps(trace.get('corrections_applied', []))}
Error: {trace.get('error', 'None')}"""

    return f"""You are an output quality evaluator for a multi-agent workforce. Score the following agent output against the rubric dimensions below.

## Agent Output Context

{trace_context}

## Rubric (version: {rubric.get('version_tag', 'unknown')})

Pass threshold: {rubric.get('pass_threshold', 3.5)}

Dimensions:
{dimensions_text}

## Instructions

1. Score each dimension from 1.0 to 5.0 (one decimal place).
2. Calculate the weighted composite score.
3. Provide a rationale explaining your scores (2-3 sentences).
4. List specific improvement suggestions if the composite score is below {rubric.get('pass_threshold', 3.5)}.
5. Use Australian English spelling throughout.

Return ONLY a JSON object with this exact structure (no markdown fences, no commentary):

{{
    "scores": {{
        "kb_grounding": <float>,
        "instruction_adherence": <float>,
        "completeness": <float>,
        "actionability": <float>,
        "factual_discipline": <float>,
        "risk_handling": <float>
    }},
    "composite": <float>,
    "rationale": "<string>",
    "improvement_suggestions": ["<string>", ...]
}}"""


def call_evaluator(
    prompt: str,
    api_key: str,
    model: str = "claude-sonnet-4-20250514",
) -> dict:
    """Call the Anthropic API and parse the structured response."""
    client = anthropic.Anthropic(api_key=api_key)

    start = time.time()
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    duration = time.time() - start

    raw_text = response.content[0].text.strip()

    # Strip markdown fences if present
    if raw_text.startswith("```"):
        lines = raw_text.split("\n")
        # Remove first and last fence lines
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        raw_text = "\n".join(lines)

    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Evaluator returned invalid JSON: {e}\nRaw: {raw_text[:500]}")

    # Validate required fields
    required_score_keys = [
        "kb_grounding",
        "instruction_adherence",
        "completeness",
        "actionability",
        "factual_discipline",
        "risk_handling",
    ]
    scores = parsed.get("scores", {})
    for k in required_score_keys:
        if k not in scores:
            raise ValueError(f"Missing score dimension: {k}")
        val = float(scores[k])
        if not (1.0 <= val <= 5.0):
            raise ValueError(f"Score {k}={val} outside valid range 1.0-5.0")

    if "composite" not in parsed:
        raise ValueError("Missing 'composite' field")
    if "rationale" not in parsed:
        raise ValueError("Missing 'rationale' field")

    parsed["_duration_seconds"] = round(duration, 2)
    parsed["_tokens_used"] = response.usage.input_tokens + response.usage.output_tokens

    return parsed


def calculate_composite(dimension_scores: dict, rubric: dict) -> float:
    """Calculate the weighted composite score from dimension scores."""
    total = 0.0
    for dim in rubric["dimensions"]:
        name = dim["name"]
        weight = dim["weight"]
        score = float(dimension_scores.get(name, 1.0))
        total += score * weight
    return round(total, 2)


def write_evaluation_score(
    supabase_url: str,
    supabase_key: str,
    trace_id: str,
    evaluation: dict,
    rubric_id: str,
    mode: str,
) -> str:
    """Write an evaluation score to Supabase. Returns the evaluation ID."""
    headers = supabase_headers(supabase_key)
    headers["Prefer"] = "return=representation"

    scores = evaluation["scores"]
    # Recalculate composite from our rubric weights for consistency
    # (don't trust the LLM's arithmetic)
    composite = evaluation.get("composite", 0)

    payload = {
        "trace_id": trace_id,
        "evaluator_model": "claude-sonnet-4",
        "rubric_version_id": rubric_id,
        "score_kb_grounding": float(scores["kb_grounding"]),
        "score_instruction_adherence": float(scores["instruction_adherence"]),
        "score_completeness": float(scores["completeness"]),
        "score_actionability": float(scores["actionability"]),
        "score_factual_discipline": float(scores["factual_discipline"]),
        "score_risk_handling": float(scores["risk_handling"]),
        "score_composite": float(composite),
        "rationale": evaluation.get("rationale", ""),
        "improvement_suggestions": evaluation.get("improvement_suggestions", []),
        "evaluation_mode": mode,
        "evaluation_duration_seconds": evaluation.get("_duration_seconds"),
        "evaluator_tokens_used": evaluation.get("_tokens_used"),
    }

    r = httpx.post(
        f"{supabase_url}/rest/v1/evaluation_scores",
        headers=headers,
        json=payload,
    )
    r.raise_for_status()
    return r.json()[0]["id"]


def generate_correction_proposal(
    trace: dict,
    evaluation: dict,
    supabase_url: str,
    supabase_key: str,
    evaluation_id: str,
) -> str | None:
    """Generate a correction proposal for a low-scoring evaluation. Returns proposal ID or None."""
    scores = evaluation["scores"]
    composite = float(evaluation.get("composite", 5.0))

    # Find lowest-scoring dimensions
    sorted_dims = sorted(scores.items(), key=lambda x: float(x[1]))
    worst = sorted_dims[0]
    worst_name, worst_score = worst[0], float(worst[1])

    # Determine severity
    if composite < 2.0:
        severity = "critical"
    elif composite < 3.0:
        severity = "major"
    else:
        severity = "minor"

    suggestions = evaluation.get("improvement_suggestions", [])
    rationale = evaluation.get("rationale", "")

    proposed_correction = (
        f"Lowest dimension: {worst_name} ({worst_score}/5.0). "
        f"Composite score: {composite}/5.0. "
        f"Evaluator rationale: {rationale}"
    )

    proposed_guidance = "; ".join(suggestions) if suggestions else (
        f"Improve {worst_name} — review the scoring guide for this dimension "
        f"and ensure future outputs address the criteria."
    )

    headers = supabase_headers(supabase_key)
    headers["Prefer"] = "return=representation"

    payload = {
        "trace_id": trace["id"],
        "evaluation_id": evaluation_id,
        "agent_role": trace.get("agent_role", "unknown"),
        "task_type": trace.get("task_type", "unknown"),
        "original_output_excerpt": f"[Trace {trace['id'][:8]}] task_type={trace.get('task_type')}",
        "proposed_correction": proposed_correction,
        "proposed_guidance": proposed_guidance,
        "severity": severity,
        "status": "pending",
    }

    r = httpx.post(
        f"{supabase_url}/rest/v1/correction_proposals",
        headers=headers,
        json=payload,
    )
    r.raise_for_status()
    return r.json()[0]["id"]
