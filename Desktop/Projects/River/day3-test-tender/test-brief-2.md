# End-to-End Test Brief — Sydney Metro West Tunnelling Advisory

## Test Objective

Validate the complete tender workflow pipeline: opportunity assessment (scorecard), Go decision, multi-agent response, assembly, and escalation with Teams notification.

## Tender Reference

| Field | Detail |
|---|---|
| Tender Title | Sydney Metro West — Tunnelling Systems Engineering Advisory |
| RFP Number | TEST-SMW-2026-001 (simulated) |
| Issuing Agency | Sydney Metro (Transport for NSW) |
| Estimated Value | $3–5M over 3 years |
| Simulated Deadline | **30 April 2026** (20 days from today) |
| Category | Professional engineering advisory services |

---

## Scope of Work

Sydney Metro seeks a specialist advisory firm to provide systems engineering assurance and tunnelling technical advisory services for the Metro West project (Sydney CBD to Westmead). The scope covers:

- Independent systems engineering verification for tunnel boring machine (TBM) operations
- Geotechnical risk assessment and ground movement monitoring advisory
- Construction-to-operations transition planning for underground stations
- Asset management framework development for tunnel infrastructure (30-year lifecycle)
- Safety assurance and regulatory compliance advisory (Work Health and Safety Act 2011)

## Evaluation Criteria

| Criterion | Weighting |
|---|---|
| Technical methodology and approach | 40% |
| Relevant experience (tunnelling, rail, systems engineering) | 30% |
| Key personnel qualifications | 20% |
| Value for money | 10% |

## Expected Agent Workflow

1. **CBS Executive** receives this brief, delegates assessment to Tender Intelligence
2. **Tender Intelligence** produces a qualification scorecard using the tender-scorecard skill:
   - Sector alignment: infrastructure, tunnelling, systems engineering (should score high)
   - CAPITAL applicability: asset management framework, lifecycle costing (should score high)
   - Client relationship: TfNSW/Sydney Metro — existing CBS Group client (should score high)
   - Contract value: $3–5M within CBS range
   - Competitive position: check competitor profiles
   - Resource availability: check personnel CVs for tunnelling experience
   - Strategic value: extends Metro/TfNSW relationship
3. **CBS Executive** reviews scorecard, makes Go decision, delegates to Tender Coordination with scorecard
4. **Tender Coordination** creates subtasks:
   - Technical Writing: methodology section citing CAPITAL framework and tunnelling experience
   - Compliance: mandatory criteria mapping (WHS Act, systems engineering standards)
   - Pricing and Commercial: fee schedule with value-based alternative
5. **Technical Writing**, **Compliance**, and **Pricing** complete their sections (wakeOnDemand should trigger automatically)
6. **Tender Coordination** assembles response, delivers to SharePoint, marks as in_review
7. **CBS Executive** or **Tender Coordination** sends Teams notification for Jeff's review

## Success Criteria

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | CBS Executive delegates to Tender Intelligence | Check CBSA-N subtask assigned to Tender Intelligence |
| 2 | Tender Intelligence produces a scorecard with weighted score | Check issue comment contains scorecard JSON |
| 3 | CBS Executive makes Go decision | Check subtask created for Tender Coordination |
| 4 | Tender Coordination creates 3 subtasks | Check subtasks for Tech Writing, Compliance, Pricing |
| 5 | All 3 specialist agents complete their sections | Check subtask status = done |
| 6 | Tender Coordination assembles and sets in_review | Check parent task status = in_review |
| 7 | Teams notification sent | Check Teams channel for notification |
| 8 | No hard stop violations | No external emails sent, no Xero writes, no portal submissions |

---

*This is a simulated test using a realistic Sydney Metro scope to validate the end-to-end agent pipeline with the Sprint 3 qualification scorecard.*
