# Skill: tender-scorecard

## Purpose

Produce a structured, weighted qualification scorecard for tender opportunities. The scorecard replaces the simple Go/Watch/Pass recommendation with a quantified assessment that enables trend analysis and consistent decision-making.

## Scorecard Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Sector Alignment | 25% | How closely the opportunity aligns with CBS Group's core sectors |
| CAPITAL Applicability | 20% | Whether the CAPITAL framework methodology can be applied |
| Contract Value | 15% | Whether the value is within CBS Group's operating range |
| Client Relationship History | 15% | Existing relationship, past performance, referenceability |
| Competitive Position | 10% | Known incumbents, consortium dynamics, win probability |
| Resource Availability | 10% | Internal team capacity, specialist requirements |
| Strategic Value | 5% | Long-term value beyond the contract (market entry, capability build) |

## Scoring Scale

Each dimension is scored 1–5:

| Score | Label | Description |
|-------|-------|-------------|
| 5 | Excellent | Strong alignment, clear evidence from KB |
| 4 | Good | Solid alignment with minor gaps |
| 3 | Moderate | Partial alignment, some evidence |
| 2 | Weak | Limited alignment, significant gaps |
| 1 | Poor | No alignment or actively misaligned |

## Weighted Score Calculation

```
weighted_score = sum(dimension_score × dimension_weight for each dimension)
```

Maximum possible: 5.0. Minimum: 1.0.

## Recommendation Thresholds

| Weighted Score | Recommendation | Action |
|---------------|----------------|--------|
| 4.0–5.0 | **Go** | Proceed to tender response workflow |
| 3.0–3.9 | **Watch** | Monitor for further information, reassess if scope changes |
| 1.0–2.9 | **Pass** | Do not pursue |

## Scorecard JSON Schema

Store as structured JSON on the issue for trend analysis:

```json
{
  "scorecard_version": "1.0",
  "tender_id": "AusTender reference",
  "title": "Opportunity title",
  "client": "Procuring entity",
  "value_range": "$X–$Y",
  "close_date": "YYYY-MM-DD",
  "assessed_date": "YYYY-MM-DD",
  "dimensions": {
    "sector_alignment": {
      "score": 4,
      "weight": 0.25,
      "evidence": "CBS has delivered 15+ transport infrastructure projects in NSW, including WestConnex and SHT.",
      "kb_sources": ["cbs-group-capability-part01.md", "cbs-group-tender-tfnsw-amss-part03.md"]
    },
    "capital_applicability": {
      "score": 5,
      "weight": 0.20,
      "evidence": "Scope explicitly requires whole-of-life cost modelling and asset management methodology.",
      "kb_sources": ["cbs-group-capital-methodology-part01.md"]
    },
    "contract_value": {
      "score": 4,
      "weight": 0.15,
      "evidence": "Estimated $2–5M panel, within CBS operating range.",
      "kb_sources": []
    },
    "client_relationship": {
      "score": 5,
      "weight": 0.15,
      "evidence": "Active TfNSW engagement across M6, SHT, and WHT tolling.",
      "kb_sources": ["cbs-group-tender-tfnsw-amss-part01.md"]
    },
    "competitive_position": {
      "score": 3,
      "weight": 0.10,
      "evidence": "Known incumbent: AECOM. CBS has differentiated position via CAPITAL framework.",
      "kb_sources": []
    },
    "resource_availability": {
      "score": 4,
      "weight": 0.10,
      "evidence": "David Harper, Jim Ellwood, Kate Heath available. May need external tolling specialist.",
      "kb_sources": ["cbs-group-personnel-cvs-part01.md"]
    },
    "strategic_value": {
      "score": 4,
      "weight": 0.05,
      "evidence": "Strengthens TfNSW relationship and position for future motorway AM panels.",
      "kb_sources": []
    }
  },
  "weighted_score": 4.25,
  "recommendation": "Go",
  "risks": [
    "May need external tolling specialist for video-only tolling requirement",
    "AECOM incumbency on existing TfNSW AM panel"
  ],
  "next_steps": [
    "CBS Executive to approve Go decision",
    "Tender Coordination to initiate response workflow"
  ]
}
```

## Integration

### Tender Intelligence Agent

When assessing an opportunity:
1. Populate each scorecard dimension using KB evidence and tender metadata.
2. Calculate the weighted score.
3. Apply the recommendation threshold.
4. Store the full scorecard JSON as a comment on the issue.
5. Include the weighted score and recommendation in the summary to CBS Executive.

### CBS Executive Agent

When reviewing a Tender Intelligence assessment:
1. Review the scorecard dimensions and evidence.
2. Override the recommendation if strategic factors warrant it (document the override reason).
3. If Go: create a subtask for Tender Coordination with the scorecard attached.

## Best Practices

1. Always cite KB sources for each dimension score. Unsupported scores must be flagged.
2. Score conservatively — a 3 with strong evidence is better than a 5 with weak evidence.
3. The `risks` field should list specific, actionable risks, not generic concerns.
4. Compare new scorecards against historical ones for the same client to identify trends.
