# Phase 8: Evaluator Calibration

## Objective

Run the evaluator against the same 10 outputs Jeff scored manually. Compare dimension scores and composite scores. Adjust rubric weights or threshold if systematic divergence found. Produce a calibration report confirming evaluator readiness.

## Prerequisites

- S4-P6 complete. CBS KB rationalised (evaluator scores against clean data).
- Jeff has completed scoring in `docs/hyper-agent-v1/EVALUATOR_CALIBRATION.md`.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` set.

**If Jeff has not yet scored the calibration document, this phase cannot run. Report the dependency and stop.**

## Context

```bash
cat docs/hyper-agent-v1/EVALUATOR_CALIBRATION.md | head -30
cat config/evaluator-rubric-v1.json | python3 -c "import sys,json; r=json.load(sys.stdin); print(f'Rubric: {r[\"version_tag\"]}, threshold: {r[\"pass_threshold\"]}')"
```

## Tasks

### TASK 8.1: Parse Jeff's Scores

```bash
python3 scripts/parse-calibration-scores.py
cat config/calibration-scores.json | python3 -m json.tool | head -30
```

If parser fails on Jeff's formatting, fix the parser to handle the actual format, re-run.

### TASK 8.2: Run Evaluator on Same 10 Outputs

For each output in `config/calibration-scores.json`:
1. If trace_id exists, call evaluator library directly on the trace.
2. If no trace_id (manually pasted), construct a synthetic evaluation context with the output text.
3. Call Claude Sonnet 4 via Anthropic API to score against the active rubric.
4. Store results.

Create `config/calibration-comparison.json` with per-output structure:
```json
{"output_n": 1, "agent_role": "...", "human_scores": {...}, "human_composite": 3.65,
 "evaluator_scores": {...}, "evaluator_composite": 3.52, "delta_per_dimension": {...}, "composite_delta": -0.13}
```

### TASK 8.3: Analyse Divergence

Report:
- Per-output comparison (human vs evaluator composite)
- Per-dimension systematic bias (average delta across all outputs)
- Overall bias (average evaluator composite - average human composite)
- Max single-output delta
- Pass/fail agreement rate (both agree on >= or < threshold)

### TASK 8.4: Adjust Rubric If Needed

- If overall bias < 0.3 and pass/fail agreement >= 80%: no changes.
- If specific dimension has bias > 0.5: adjust weight, redistribute.
- If pass/fail agreement < 80%: adjust threshold.
- If adjustments made: create `config/evaluator-rubric-v1.1.json`, insert to `rubric_versions` with `active=TRUE`, set v1.0 to `active=FALSE`.

### TASK 8.5: Write Calibration Report

Create `docs/hyper-agent-v1/CALIBRATION_REPORT.md`:
1. Methodology
2. Per-output comparison table
3. Per-dimension bias analysis
4. Pass/fail agreement rate
5. Rubric adjustment (if any) with rationale
6. Evaluator readiness conclusion

## Gate Verification

```bash
echo "=== S4-P8 Gate Verification ==="
[ -f "config/calibration-comparison.json" ] && echo "PASS: Comparison data" || echo "FAIL"
[ -f "docs/hyper-agent-v1/CALIBRATION_REPORT.md" ] && echo "PASS: Calibration report" || echo "FAIL"

python3 -c "
import json
with open('config/calibration-comparison.json') as f: d = json.load(f)
agreements = sum(1 for i in d if (i['human_composite'] >= 3.5) == (i['evaluator_composite'] >= 3.5))
print(f'Pass/fail agreement: {agreements}/{len(d)}')
print('PASS: Calibrated' if agreements >= 8 else 'WARN: Low agreement — check rubric adjustment')
" 2>&1
```

## Archive Point

```bash
git add -A && git commit -m "S4-P8: Evaluator calibration — human vs evaluator comparison"
git tag stage4-P8-calibration
```

## TASK_LOG Entry

```markdown
## S4-P8: Evaluator Calibration
- **Status:** COMPLETE
- **Outputs compared:** 10
- **Pass/fail agreement:** [N]/10
- **Overall bias:** [+/- N]
- **Rubric adjusted:** [NO / YES — v1.1]
- **Evaluator readiness:** [CONFIRMED / CONDITIONAL]
- **Next phase:** P9 (Verification + Critique) — requires all prior phases complete
```
