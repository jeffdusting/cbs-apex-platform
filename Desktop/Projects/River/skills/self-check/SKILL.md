# Skill: self-check

## Purpose

Pre-submission quality check that agents run before producing substantive output. This is Layer B of the evaluation system — lightweight, inline, no external API call. It ensures basic quality hygiene before the output reaches async or sync evaluation.

## When to Use

Run this self-check before every substantive output:
- Tender assessments, scorecards, and lifecycle transitions
- Board papers, governance documents, and resolutions
- Research briefs and capability statements
- CA fill operations and client-facing artefacts
- Any output that will be stored, forwarded, or acted upon

**Skip** for:
- Simple status updates or progress comments
- Delegation actions (creating/assigning subtasks)
- Heartbeat idle responses (no work to do)

## Self-Check Protocol

Before finalising your output, work through each check in order:

### 1. Completeness Check

Does the output contain all sections required by your heartbeat protocol and task type?

- For tender assessments: interest test result, source reference, scoring rationale, lifecycle transition
- For board papers: all template sections populated, financial data sourced, recommendations present
- For CA fill: all fields substituted, signature inserted, contact details verified
- For delegated tasks: clear brief, deadline, expected output format

If any required section is missing or stub-only, add it before submission.

### 2. KB Grounding Check

Does the output reference specific KB documents?

- Count the number of KB documents cited (source_file names, similarity scores)
- If **zero KB documents cited** and the task requires domain knowledge: flag `no_kb_grounding`
- If **fewer than 3 documents** for a substantive task: flag `low_kb_grounding`
- If KB retrieval returned no relevant results: state this explicitly and flag `kb_retrieval_empty`

### 3. Confidence Assessment

Rate your confidence in this output:

- **high** — strong KB evidence (3+ documents, similarity > 0.5), clear task requirements, no ambiguity
- **medium** — some KB evidence but gaps, or task requirements partially ambiguous
- **low** — weak or no KB evidence, significant uncertainty, operating near edge of expertise

If confidence is **low**, flag `low_confidence` and recommend human review.

### 4. Escalation Check

Does the output involve any of the following?

- Financial commitments or cost estimates → flag `sync_evaluation_recommended`
- Legal documents (CAs, contracts, resolutions) → flag `sync_evaluation_recommended`
- Client-facing communications → flag `sync_evaluation_recommended`
- Board governance documents → flag `sync_evaluation_recommended`
- Decisions that change tender lifecycle stage → flag `lifecycle_transition`

If any escalation flag is set, the output should go through sync evaluation (Layer A) before delivery.

### 5. Correction Check

Were any active corrections relevant to this output?

- If you retrieved corrections via the feedback-loop skill, confirm each was considered
- List which corrections were applied and how they influenced the output
- If a correction was retrieved but not applicable, note why

### 6. Factual Discipline Check

Review the output for:

- Any claim not grounded in KB content or verified data → remove or flag as assumption
- Any financial figure not sourced from Xero or KB → remove (hard stop: must not fabricate financials)
- Any speculation presented as fact → rephrase with appropriate hedging
- Any reference to a document, person, or entity not in the KB → verify or remove

## Output Format

Append this JSON block to the end of every substantive output:

```json
{
    "self_check": {
        "score": <float 1.0-5.0>,
        "flags": ["<flag_name>", ...],
        "escalation_recommended": <boolean>,
        "corrections_applied": ["<correction_filename>", ...],
        "kb_documents_cited": <integer>
    }
}
```

### Scoring Guide

Calculate your self-check score by averaging these sub-scores:

| Check | 5 (excellent) | 3 (adequate) | 1 (poor) |
|---|---|---|---|
| Completeness | All sections present and thorough | All required sections present, some thin | Major sections missing |
| KB grounding | 5+ docs cited, high similarity | 2-4 docs cited | No docs cited |
| Confidence | High — strong evidence | Medium — some gaps | Low — weak evidence |
| Factual discipline | All claims sourced | Most claims sourced, minor gaps | Unsourced claims present |
| Correction compliance | All relevant corrections applied | Corrections retrieved but partially applied | Corrections not checked |

### Flag Reference

| Flag | Meaning | Action |
|---|---|---|
| `no_kb_grounding` | No KB documents cited | Must query KB before submission |
| `low_kb_grounding` | Fewer than 3 KB documents cited | Consider additional queries |
| `kb_retrieval_empty` | KB returned no relevant results | State explicitly in output |
| `low_confidence` | Confidence rated low | Recommend human review |
| `sync_evaluation_recommended` | High-value output type | Route through sync evaluation gate |
| `lifecycle_transition` | Tender stage change | Ensure transition is logged |
| `outside_expertise` | Operating beyond core competence | Flag for specialist review |
| `corrections_not_checked` | Feedback loop not consulted | Check before finalising |

## Integration with Trace Capture

When trace capture is active (P3), the self-check JSON is recorded in:
- `agent_traces.self_check_score` — the numeric score
- `agent_traces.self_check_flags` — the flags array

The async evaluator (Layer C) uses self-check data as context when scoring the full output.
