# Skill: tender-workflow

## Purpose

Defines the structured Shipley-aligned tender response workflow with three quality tiers (Bronze, Silver, Gold) and review gates. Used by Tender Coordination to manage pursuit from Go decision through to submission-ready document.

## Workflow Phases

### Phase 1: QUALIFY (Tender Intelligence)

Tender Intelligence scans email notifications, registers opportunities in the `tender_register`, produces qualification scorecards. CBS Executive reviews and makes Go/Watch/Pass decision. Recorded in register.

This phase is handled by the tender-scorecard skill. The tender-workflow skill takes over at Phase 2.

### Phase 2: CAPTURE (CBS Executive → Tender Coordination)

When CBS Executive approves a **Go** decision:

1. CBS Executive creates a parent issue: `Tender Pursuit — [Client] [Tender Name]`
2. Assigns to Tender Coordination with the scorecard, deadline, and strategic direction
3. Records the Go decision in the tender_register

Tender Coordination takes ownership from here.

### Phase 3: BRONZE — Skeleton and Gap Analysis

**Objective:** Establish the response structure, identify what we have and what's missing.

Tender Coordination creates subtasks:

| Subtask | Agent | Deliverable |
|---|---|---|
| Bronze: Technical Methodology Outline | Technical Writing | Skeleton structure mapping CBS CAPITAL framework to tender requirements. Key themes identified. Which KB content applies to which section. |
| Bronze: Compliance Gap Analysis | Compliance | Mandatory criteria checklist. Each criterion mapped to CBS evidence (PRESENT/GAP/PARTIAL). Gaps flagged for resolution. |
| Bronze: Pricing Strategy Memo | Pricing and Commercial | Pricing approach (conforming + alternative). Value-based positioning strategy. No detailed numbers yet. |
| Bronze: Competitor Assessment | Research CBS | Who are we competing against? What are our win themes vs each competitor? Ghost team analysis. |

**Bronze output:** A response plan document containing:
- Response structure with section headings matched to evaluation criteria
- Compliance matrix with evidence status
- Win themes and competitive positioning
- Pricing approach
- Resource plan (which personnel for which sections)
- Risk register (gaps, unknowns, dependencies)

**Bronze gate:** CBS Executive reviews the response plan. Approves to proceed to Silver, or redirects (change win themes, address gaps, adjust pricing approach).

### Phase 4: SILVER — Full First Draft

**Objective:** Complete first draft of all sections with KB evidence and specific content.

Tender Coordination creates subtasks:

| Subtask | Agent | Deliverable |
|---|---|---|
| Silver: Technical Narrative | Technical Writing | Full methodology section citing CAPITAL framework. Case studies from KB with quantified outcomes. Personnel CVs matched to role requirements. Standards compliance narrative (ISO 55001, ISO 44001). |
| Silver: Compliance Responses | Compliance | Complete response to every mandatory criterion. Evidence citations for each. Conditions of participation addressed. Information security / WHS requirements mapped. |
| Silver: Draft Fee Schedule | Pricing and Commercial | Conforming fee schedule with rates and totals. Alternative value-based offer with outcome metrics. Payment milestone schedule. |
| Silver: Win Theme Integration | Research CBS | Review all sections for consistent win theme threading. Competitor differentiation points embedded in technical narrative. |

**Silver output:** Complete tender response draft — all sections populated, all criteria addressed, all evidence cited.

**Silver gate:** CBS Executive reviews the full draft. Provides specific feedback:
- Sections to strengthen or rewrite
- Evidence gaps to fill
- Pricing adjustments
- Win theme emphasis changes
- Compliance concerns

### Phase 5: GOLD — Submission-Ready

**Objective:** Incorporate CBS Executive feedback, quality review, final assembly.

Tender Coordination:
1. Distributes CBS Executive feedback to relevant agents as revision subtasks
2. Agents produce revised sections
3. Tender Coordination assembles final document:
   - Consistency review (voice, terminology, formatting)
   - Evidence citation verification (every claim traceable to KB source)
   - Compliance coverage check (every criterion addressed)
   - Executive summary alignment with win themes
   - Page/word count compliance with tender requirements
4. Delivers Gold draft to SharePoint via sharepoint-write skill
5. Creates in_review approval for CBS Executive
6. Sends Teams notification: `TENDER RESPONSE READY — [ref] — Gold draft delivered to SharePoint`

**Gold gate:** CBS Executive and/or Jeff Dusting reviews the final document. Human submits to tender portal. Agent must NOT submit.

### Phase 6: POST-SUBMISSION

After human submission:
1. Tender Coordination updates tender_register with submission date
2. Tender Intelligence monitors for outcome (award notification)
3. When outcome known, CBS Executive records result and conducts debrief

## Issue Structure

```
CBSA-XX  Tender Pursuit — [Client] [Tender Name]              (parent, assigned: Tender Coordination)
│
├── CBSA-XX  Phase 3 Bronze — [Tender Name]                    (subtask)
│   ├── CBSA-XX  Bronze: Technical Methodology Outline         (sub-subtask → Technical Writing)
│   ├── CBSA-XX  Bronze: Compliance Gap Analysis               (sub-subtask → Compliance)
│   ├── CBSA-XX  Bronze: Pricing Strategy Memo                 (sub-subtask → Pricing and Commercial)
│   └── CBSA-XX  Bronze: Competitor Assessment                 (sub-subtask → Research CBS)
│
├── CBSA-XX  Phase 4 Silver — [Tender Name]                    (subtask)
│   ├── CBSA-XX  Silver: Technical Narrative                   (sub-subtask → Technical Writing)
│   ├── CBSA-XX  Silver: Compliance Responses                  (sub-subtask → Compliance)
│   ├── CBSA-XX  Silver: Draft Fee Schedule                    (sub-subtask → Pricing and Commercial)
│   └── CBSA-XX  Silver: Win Theme Integration                 (sub-subtask → Research CBS)
│
├── CBSA-XX  Phase 5 Gold — [Tender Name]                      (subtask)
│   └── CBSA-XX  Gold: Final Assembly + Quality Review         (sub-subtask → Tender Coordination)
│
└── CBSA-XX  Phase 6 Post-Submission — [Tender Name]           (subtask, after human submit)
```

## Timelines

| Phase | Duration Target | Notes |
|---|---|---|
| Bronze | 1-2 heartbeat cycles (2-4 hours) | Skeleton work, fast turnaround |
| Bronze Gate | 1 cycle (2 hours) | CBS Executive review |
| Silver | 2-4 cycles (4-8 hours) | Full drafting, KB-intensive |
| Silver Gate | 1 cycle (2 hours) | CBS Executive review with feedback |
| Gold | 1-2 cycles (2-4 hours) | Revisions + assembly |
| Gold Gate | Human review | Jeff Dusting reviews and submits |
| **Total** | **~12-20 hours** | Down from 18-24 hours with single-pass |

## Quality Criteria by Tier

| Criterion | Bronze | Silver | Gold |
|---|---|---|---|
| Structure complete | YES | YES | YES |
| All sections populated | NO (skeleton) | YES | YES |
| KB evidence cited | Key sources identified | Full citations with source_files | Verified citations |
| Compliance matrix | Gap analysis | Complete responses | Cross-checked |
| Win themes | Identified | Threaded through sections | Consistent across document |
| Pricing | Strategy memo | Draft schedule | Final numbers |
| Executive summary | Not yet | Draft | Polished, aligned to win themes |
| Formatting | N/A | Draft formatting | Submission-ready |
