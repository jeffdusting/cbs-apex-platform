#!/usr/bin/env python3
"""
Run the active evaluator against the 10 calibration outputs Jeff scored manually.

Reads:
  - config/calibration-scores.json         (Jeff's scores, produced by parse-calibration-scores.py)
  - docs/hyper-agent-v1/EVALUATOR_CALIBRATION.md  (agent output text per output)
  - config/evaluator-rubric-v1.json         (active rubric, local copy mirroring rubric_versions)

Writes:
  - config/calibration-comparison.json     (per-output human vs evaluator comparison)

Requires ANTHROPIC_API_KEY in environment.

Usage:
    source scripts/env-setup.sh
    python3 scripts/calibrate-evaluator.py [--dry-run]
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import anthropic


REPO_ROOT = Path(__file__).parent.parent
CALIBRATION_MD = REPO_ROOT / "docs" / "hyper-agent-v1" / "EVALUATOR_CALIBRATION.md"
SCORES_JSON = REPO_ROOT / "config" / "calibration-scores.json"
RUBRIC_JSON = REPO_ROOT / "config" / "evaluator-rubric-v1.json"
COMPARISON_JSON = REPO_ROOT / "config" / "calibration-comparison.json"

# Human-readable → rubric snake_case
DIM_TO_KEY = {
    "KB Grounding": "kb_grounding",
    "Instruction Adherence": "instruction_adherence",
    "Completeness": "completeness",
    "Actionability": "actionability",
    "Factual Discipline": "factual_discipline",
    "Risk Handling": "risk_handling",
}
KEY_TO_DIM = {v: k for k, v in DIM_TO_KEY.items()}


def extract_agent_outputs(md_text: str) -> dict[int, str]:
    """Return {output_number: agent_output_text} parsed from the calibration markdown."""
    outputs: dict[int, str] = {}
    # Split into per-output sections at `## Output N`
    sections = re.split(r"^## Output (\d+)\s*$", md_text, flags=re.MULTILINE)
    # sections[0] is preamble, then pairs
    for i in range(1, len(sections), 2):
        num = int(sections[i])
        body = sections[i + 1] if i + 1 < len(sections) else ""
        # Agent Output starts after "### Agent Output" and ends before "### Scoring"
        m = re.search(r"### Agent Output\s*(.*?)\s*### Scoring", body, flags=re.DOTALL)
        if m:
            outputs[num] = m.group(1).strip()
    return outputs


def build_prompt(agent_role: str, task_type: str, output_text: str, rubric: dict) -> str:
    """Build a synthetic-context evaluation prompt.

    Where an entry is a manually pasted output (no trace), embed the full output
    text so the evaluator can score it directly. Mirrors the instructions used by
    the live evaluator (lib/evaluator.py) so rubric behaviour is comparable.
    """
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

    return f"""You are an output quality evaluator for a multi-agent workforce. Score the following agent output against the rubric dimensions below.

## Agent Output Context

Agent role: {agent_role}
Task type: {task_type}

### Full Agent Output (verbatim)

{output_text}

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


def call_evaluator(client: anthropic.Anthropic, prompt: str, model: str) -> dict:
    start = time.time()
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    duration = time.time() - start

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        raw = "\n".join(lines)

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Evaluator returned invalid JSON: {e}\nRaw: {raw[:500]}")

    required = list(DIM_TO_KEY.values())
    for k in required:
        if k not in parsed.get("scores", {}):
            raise ValueError(f"Missing score dimension: {k}")
        v = float(parsed["scores"][k])
        if not (1.0 <= v <= 5.0):
            raise ValueError(f"Score {k}={v} out of range")

    parsed["_duration_seconds"] = round(duration, 2)
    parsed["_tokens_used"] = response.usage.input_tokens + response.usage.output_tokens
    return parsed


def rubric_weights(rubric: dict) -> dict[str, float]:
    return {d["name"]: float(d["weight"]) for d in rubric["dimensions"]}


def weighted_composite_over(dims: list[str], scores: dict[str, float], weights: dict[str, float]) -> float:
    """Re-normalise weights over the listed dimensions only."""
    if not dims:
        return 0.0
    total = sum(scores[d] * weights[d] for d in dims if d in scores)
    w = sum(weights[d] for d in dims if d in scores)
    return total / w if w else 0.0


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Skip API calls, print what would be evaluated")
    ap.add_argument("--model", default="claude-sonnet-4-20250514", help="Anthropic model ID")
    args = ap.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key and not args.dry_run:
        print("ERROR: ANTHROPIC_API_KEY must be set (or use --dry-run)", file=sys.stderr)
        sys.exit(2)

    if not SCORES_JSON.exists():
        print(f"ERROR: {SCORES_JSON} not found. Run parse-calibration-scores.py first.", file=sys.stderr)
        sys.exit(2)
    if not RUBRIC_JSON.exists():
        print(f"ERROR: {RUBRIC_JSON} not found", file=sys.stderr)
        sys.exit(2)
    if not CALIBRATION_MD.exists():
        print(f"ERROR: {CALIBRATION_MD} not found", file=sys.stderr)
        sys.exit(2)

    scores_bundle = json.loads(SCORES_JSON.read_text())
    rubric = json.loads(RUBRIC_JSON.read_text())
    md_text = CALIBRATION_MD.read_text()
    agent_outputs = extract_agent_outputs(md_text)

    weights = rubric_weights(rubric)
    all_dim_keys = list(DIM_TO_KEY.values())

    results: list[dict] = []
    client = anthropic.Anthropic(api_key=api_key) if not args.dry_run else None

    for o in scores_bundle["outputs"]:
        num = o["output_number"]
        agent_role = o["agent_role"]
        task_type = o["task_type"]
        output_text = agent_outputs.get(num, "")
        if not output_text:
            print(f"  WARN: no agent output text found for Output {num}; skipping", file=sys.stderr)
            continue

        # Human scores keyed by snake_case dim, only for dims Jeff actually scored
        human_scores_by_key: dict[str, float] = {}
        for dim_human, val in o["scores"].items():
            key = DIM_TO_KEY.get(dim_human)
            if key:
                human_scores_by_key[key] = float(val)
        human_scored_dims = list(human_scores_by_key.keys())

        print(f"\nOutput {num} — {agent_role} / {task_type}")
        print(f"  Human composite: {o['composite']:.2f} (dims scored: {len(human_scored_dims)}/6)")

        if args.dry_run:
            print(f"  DRY-RUN: would call {args.model} with {len(output_text)} char output")
            continue

        prompt = build_prompt(agent_role, task_type, output_text, rubric)
        try:
            ev = call_evaluator(client, prompt, args.model)
        except Exception as e:
            print(f"  ERROR: {e}")
            continue

        eval_scores_full: dict[str, float] = {k: float(v) for k, v in ev["scores"].items()}
        # Evaluator composite recomputed from our weights across ALL 6 dims:
        evaluator_composite_full = weighted_composite_over(all_dim_keys, eval_scores_full, weights)
        # Evaluator composite recomputed over the SAME dims Jeff scored (for fair comparison):
        evaluator_composite_aligned = weighted_composite_over(human_scored_dims, eval_scores_full, weights)

        # Per-dim deltas (evaluator minus human) over scored dims
        delta_per_dim = {
            KEY_TO_DIM[k]: round(eval_scores_full[k] - human_scores_by_key[k], 2)
            for k in human_scored_dims
        }

        composite_delta = round(evaluator_composite_aligned - float(o["composite"]), 2)
        both_pass = (float(o["composite"]) >= 3.5) == (evaluator_composite_aligned >= 3.5)

        print(
            f"  Evaluator composite: {evaluator_composite_aligned:.2f} (aligned) / "
            f"{evaluator_composite_full:.2f} (full 6)  delta={composite_delta:+.2f}  "
            f"agree={'Y' if both_pass else 'N'}  ({ev['_duration_seconds']:.1f}s)"
        )

        results.append({
            "output_number": num,
            "issue": o.get("issue", ""),
            "agent_role": agent_role,
            "task_type": task_type,
            "human_scores": o["scores"],
            "human_composite": float(o["composite"]),
            "human_dims_scored": len(human_scored_dims),
            "evaluator_scores": {KEY_TO_DIM[k]: round(v, 1) for k, v in eval_scores_full.items()},
            "evaluator_composite": round(evaluator_composite_aligned, 2),
            "evaluator_composite_full_6": round(evaluator_composite_full, 2),
            "delta_per_dimension": delta_per_dim,
            "composite_delta": composite_delta,
            "pass_fail_agreement": both_pass,
            "evaluator_rationale": ev.get("rationale", ""),
            "evaluator_suggestions": ev.get("improvement_suggestions", []),
            "evaluation_duration_seconds": ev.get("_duration_seconds"),
            "evaluator_tokens_used": ev.get("_tokens_used"),
        })

    if args.dry_run:
        return

    COMPARISON_JSON.parent.mkdir(parents=True, exist_ok=True)
    COMPARISON_JSON.write_text(json.dumps(results, indent=2) + "\n")
    print(f"\nWrote {len(results)} comparison record(s) to {COMPARISON_JSON}")

    # Summary
    if results:
        agreements = sum(1 for r in results if r["pass_fail_agreement"])
        overall_bias = sum(r["composite_delta"] for r in results) / len(results)
        max_abs_delta = max(abs(r["composite_delta"]) for r in results)

        per_dim_bias: dict[str, list[float]] = {}
        for r in results:
            for dim, delta in r["delta_per_dimension"].items():
                per_dim_bias.setdefault(dim, []).append(delta)

        print("\n=== Calibration Summary ===")
        print(f"Pass/fail agreement: {agreements}/{len(results)}")
        print(f"Overall composite bias (evaluator − human): {overall_bias:+.3f}")
        print(f"Max absolute single-output delta: {max_abs_delta:.2f}")
        print("Per-dimension average bias (evaluator − human):")
        for dim, deltas in per_dim_bias.items():
            avg = sum(deltas) / len(deltas)
            print(f"  {dim:<25} {avg:+.2f}  (n={len(deltas)})")


if __name__ == "__main__":
    main()
