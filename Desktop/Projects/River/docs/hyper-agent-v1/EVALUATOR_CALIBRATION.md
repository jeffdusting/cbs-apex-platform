# Evaluator Calibration Document

**Purpose:** Jeff scores 10 real agent outputs against the rubric below. The `scripts/parse-calibration-scores.py` script then extracts scores and compares them against the automated evaluator's scores (P8).

**Instructions:**
1. For each output below, read the agent's response in full
2. Score each dimension 1-5 using the rubric guide
3. Add brief notes explaining your reasoning
4. Run `python3 scripts/parse-calibration-scores.py` when done

---

## Rubric Scoring Guide

| Dimension | Weight | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| **KB Grounding** | 25% | No KB content referenced. Output appears entirely fabricated or based on general knowledge only. | Mentions KB content exists but does not cite specific documents or passages. | References KB content but citations are vague or incomplete. Some claims ungrounded. | Most claims grounded in specific KB documents. Minor gaps in citation. | All substantive claims grounded in cited KB content. Retrieval evidence clear. |
| **Instruction Adherence** | 20% | Output ignores the heartbeat protocol and produces ad hoc content. | Follows some protocol steps but skips mandatory sections or checks. | Follows the protocol structure but misses nuances or ordering requirements. | Follows the protocol with minor deviations that do not affect output quality. | Strict adherence to all protocol steps, formatting requirements, and output structure. |
| **Completeness** | 15% | Major sections or required fields missing. | Several required elements missing or stub-only. | Most required elements present but some are thin or placeholder. | All required elements present with adequate detail. | All required elements present with thorough detail and no gaps. |
| **Actionability** | 15% | Output is vague, abstract, or requires significant clarification. | Some actionable content but key details missing (who, when, how). | Actionable for someone with context but missing specifics for delegation. | Clear actions with owners, deadlines, and next steps. Minor gaps. | Fully self-contained: a reader can execute every recommendation without further input. |
| **Factual Discipline** | 15% | Contains fabricated data, invented references, or false claims. | Mixes factual content with unattributed speculation or assumptions. | Mostly factual but includes hedged speculation without flagging it. | Factual claims are accurate and sourced. Speculation clearly flagged. | All claims are evidence-based. Uncertainty explicitly stated. No fabrication. |
| **Risk Handling** | 10% | No risk awareness. Presents recommendations without caveats. | Acknowledges risk exists but does not specify or quantify. | Identifies key risks but does not flag escalation triggers or mitigations. | Identifies risks with mitigations. Escalation triggers present for high-impact items. | Comprehensive risk handling: identified, quantified where possible, mitigated, escalation criteria clear. |

**Pass threshold:** Weighted composite >= 3.5

---

## Output 1

- **Agent role:** Tender Coordination
- **Task type:** CA drafting / pre-response lifecycle
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here. Navigate to the issue, expand the agent's response, and copy the complete text._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## Output 2

- **Agent role:** Tender Intelligence
- **Task type:** Opportunity assessment / interest test
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## Output 3

- **Agent role:** Tender Coordination
- **Task type:** Tender response (Bronze/Silver/Gold)
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## Output 4

- **Agent role:** Governance CBS
- **Task type:** Board paper preparation
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## Output 5

- **Agent role:** Governance WR
- **Task type:** Board paper or governance review
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## Output 6

- **Agent role:** CBS Executive
- **Task type:** Executive briefing / delegation
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## Output 7

- **Agent role:** WR Executive
- **Task type:** Executive briefing / KB query
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## Output 8

- **Agent role:** Technical Writing
- **Task type:** Document drafting
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## Output 9

- **Agent role:** Research CBS
- **Task type:** Research / analysis
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## Output 10

- **Agent role:** Pricing and Commercial
- **Task type:** Pricing / commercial analysis
- **Date:** _paste date_

### Agent Output

_Paste the full agent output from the Paperclip dashboard here._

### Scoring

| Dimension | Your Score (1-5) | Notes |
|---|---|---|
| KB Grounding | | |
| Instruction Adherence | | |
| Completeness | | |
| Actionability | | |
| Factual Discipline | | |
| Risk Handling | | |

---

## How to Find Outputs

1. Go to [Paperclip Dashboard](https://org.cbslab.app)
2. Select CBS Group or WaterRoads
3. Open recent completed issues
4. Copy the agent's full response text (the comment/output, not the issue description)
5. Paste into the "Agent Output" section above
6. Choose outputs that span different agent roles and task types for a representative sample

**Target mix:** 3 tender, 2 governance, 2 executive, 3 mixed (technical writing, research, pricing)
