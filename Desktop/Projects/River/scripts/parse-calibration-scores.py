#!/usr/bin/env python3
"""
Parse Jeff's calibration scores from EVALUATOR_CALIBRATION.md.
Outputs config/calibration-scores.json and prints a summary.
"""

import json
import re
import sys
from pathlib import Path

DIMENSIONS = [
    "KB Grounding",
    "Instruction Adherence",
    "Completeness",
    "Actionability",
    "Factual Discipline",
    "Risk Handling",
]

WEIGHTS = {
    "KB Grounding": 0.25,
    "Instruction Adherence": 0.20,
    "Completeness": 0.15,
    "Actionability": 0.15,
    "Factual Discipline": 0.15,
    "Risk Handling": 0.10,
}

PASS_THRESHOLD = 3.5

CALIBRATION_PATH = Path(__file__).parent.parent / "docs" / "hyper-agent-v1" / "EVALUATOR_CALIBRATION.md"
OUTPUT_PATH = Path(__file__).parent.parent / "config" / "calibration-scores.json"


def parse_calibration_doc(text: str) -> list[dict]:
    """Extract scored outputs from the calibration markdown."""
    outputs = []

    # Split on ## Output N headers
    sections = re.split(r"^## Output (\d+)", text, flags=re.MULTILINE)

    # sections[0] is preamble, then pairs of (number, content)
    for i in range(1, len(sections), 2):
        output_num = int(sections[i])
        content = sections[i + 1] if i + 1 < len(sections) else ""

        # Extract metadata
        agent_role = _extract_field(content, "Agent role")
        task_type = _extract_field(content, "Task type")
        date = _extract_field(content, "Date")

        # Extract scores from the scoring table
        scores = {}
        for dim in DIMENSIONS:
            pattern = rf"\|\s*{re.escape(dim)}\s*\|\s*(\d)\s*\|"
            match = re.search(pattern, content)
            if match:
                scores[dim] = int(match.group(1))

        if not scores:
            continue  # Skip unscored outputs

        # Compute weighted composite
        composite = sum(
            scores.get(d, 0) * WEIGHTS[d]
            for d in DIMENSIONS
            if d in scores
        )
        weight_sum = sum(WEIGHTS[d] for d in DIMENSIONS if d in scores)
        if weight_sum > 0:
            composite = composite / weight_sum

        outputs.append({
            "output_number": output_num,
            "agent_role": agent_role,
            "task_type": task_type,
            "date": date,
            "scores": scores,
            "composite": round(composite, 2),
            "pass": composite >= PASS_THRESHOLD,
            "dimensions_scored": len(scores),
        })

    return outputs


def _extract_field(content: str, field: str) -> str:
    pattern = rf"\*\*{re.escape(field)}:\*\*\s*(.+)"
    match = re.search(pattern, content)
    if match:
        val = match.group(1).strip()
        if val.startswith("_") and val.endswith("_"):
            return ""  # Still a placeholder
        return val
    return ""


def print_summary(outputs: list[dict]) -> None:
    scored = [o for o in outputs if o["dimensions_scored"] == len(DIMENSIONS)]
    partial = [o for o in outputs if 0 < o["dimensions_scored"] < len(DIMENSIONS)]

    print(f"\n{'='*60}")
    print(f"  EVALUATOR CALIBRATION SUMMARY")
    print(f"{'='*60}")
    print(f"  Fully scored outputs: {len(scored)} / 10")
    if partial:
        print(f"  Partially scored:     {len(partial)}")
    print()

    if not scored:
        print("  No fully scored outputs found.")
        print("  Fill in the scoring tables in EVALUATOR_CALIBRATION.md first.")
        print(f"{'='*60}\n")
        return

    # Per-dimension averages
    print(f"  {'Dimension':<25} {'Avg':>5}  {'Min':>3}  {'Max':>3}  {'Weight':>6}")
    print(f"  {'-'*25} {'-'*5}  {'-'*3}  {'-'*3}  {'-'*6}")
    for dim in DIMENSIONS:
        vals = [o["scores"][dim] for o in scored if dim in o["scores"]]
        if vals:
            avg = sum(vals) / len(vals)
            print(f"  {dim:<25} {avg:5.1f}  {min(vals):3}  {max(vals):3}  {WEIGHTS[dim]:5.0%}")

    # Overall
    composites = [o["composite"] for o in scored]
    avg_composite = sum(composites) / len(composites)
    passing = sum(1 for c in composites if c >= PASS_THRESHOLD)

    print()
    print(f"  Overall average composite: {avg_composite:.2f}")
    print(f"  Pass rate:                 {passing}/{len(scored)} ({passing/len(scored)*100:.0f}%)")
    print(f"  Pass threshold:            {PASS_THRESHOLD}")
    print(f"{'='*60}\n")

    # Per-output summary
    print(f"  {'#':<3} {'Agent Role':<25} {'Composite':>9} {'Result':>7}")
    print(f"  {'-'*3} {'-'*25} {'-'*9} {'-'*7}")
    for o in scored:
        result = "PASS" if o["pass"] else "FAIL"
        print(f"  {o['output_number']:<3} {o['agent_role']:<25} {o['composite']:9.2f} {result:>7}")
    print()


def main():
    if not CALIBRATION_PATH.exists():
        print(f"Error: {CALIBRATION_PATH} not found", file=sys.stderr)
        sys.exit(1)

    text = CALIBRATION_PATH.read_text()
    outputs = parse_calibration_doc(text)

    # Write JSON
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps({
        "source": str(CALIBRATION_PATH),
        "parsed_at": __import__("datetime").datetime.now().isoformat(),
        "pass_threshold": PASS_THRESHOLD,
        "weights": WEIGHTS,
        "outputs": outputs,
    }, indent=2) + "\n")

    print(f"Wrote {len(outputs)} scored output(s) to {OUTPUT_PATH}")
    print_summary(outputs)


if __name__ == "__main__":
    main()
