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

**Output mix:** 2 tender intelligence, 1 tender coordination, 1 governance, 1 executive, 2 compliance, 1 technical writing, 1 pricing/commercial, 1 research

---

## Output 1

- **Agent role:** Tender Intelligence
- **Task type:** Opportunity extraction from digest
- **Date:** 2026-04-14
- **Issue:** CBSA-48

### Agent Output

## Tender Opportunities Extraction and Assessment Complete

**Task Summary:** Successfully extracted and assessed individual tender opportunities from digest emails (13 April - 10 April 2026).

### Opportunities Extracted and Assessed

**1. 26HSAPCCATN - Healesville Sanctuary Australian Platypus Conservation Centre**
- Source: Buying for Victoria (13 April)
- Organization: Zoos Victoria
- Category: Animal habitat and enclosure construction
- Closing: 4 May 2026
- **Score: 2.05/5.00 - PASS**
- Rationale: Animal habitat construction outside CBS core sectors (infrastructure, transport, systems engineering)

**2. NMAT 2526-08 - Media Buying Services**
- Source: AusTender (10 April)
- Organization: National Museum of Australia  
- Category: Marketing and distribution services
- **Score: 1.95/5.00 - PASS**
- Rationale: Marketing services outside CBS technical expertise

**3. ATM_2026_6251 - Event Management Services for Pre-COP meetings in Fiji**
- Source: AusTender (10 April)
- Organization: Department of Climate Change, Energy, the Environment and Water
- Category: Events management
- **Score: 2.00/5.00 - PASS**
- Rationale: Event management outside CBS core capabilities

### Assessment Methodology

Assessed each opportunity against CBS Group capability profile using 7 criteria:
1. **Sector alignment** (infrastructure, transport, systems engineering, asset management)
2. **Contract value** (within operating range)
3. **Client relationship** (past engagement history)
4. **CAPITAL framework applicability** (whole-of-life asset management)
5. **Geographic proximity** (NSW, VIC, QLD, NZ regions)
6. **Team availability** (specialist requirements)
7. **Competitive positioning** (market dynamics)

### Knowledge Base Evidence

KB query results confirmed CBS Group core capabilities:
- Infrastructure asset management and technical advisory
- Independent verification services (North East Link project)
- Transport infrastructure (Manila LRT, road projects)
- Systems engineering (toll collection, system integration)
- Reliability-Centered Maintenance (RCM) analysis

### Recommendation

**No opportunities require escalation.** All three opportunities received **PASS** recommendations (scores below 3.0) as they fall outside CBS Group's core technical expertise in infrastructure, transport, and systems engineering.

**KB query:** CBS Group capabilities infrastructure advisory systems engineering asset management  
**Documents retrieved:** 20 documents from tender history showing infrastructure/transport focus  
**Source material:** Sufficient for capability assessment  
**Recommendation:** Proceed with next digest cycle - these opportunities correctly excluded from pursuit

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
- **Task type:** Daily tender report / heartbeat
- **Date:** 2026-04-14
- **Issue:** CBSA-47

### Agent Output

Heartbeat complete. Here's the summary of actions taken:

## Heartbeat Summary — 14 April 2026

### Task Processed
- **CBSA-47** (Tender Intelligence Daily Report) — Reviewed and closed. WATCH assessment acknowledged for 5 digest notifications. Created follow-up [CBSA-48](/CBSA/issues/CBSA-48) for Tender Intelligence to extract individual opportunities.

### Escalations Sent (Teams Notifications)
1. **CRITICAL — CBSA-8 TfNSW AMSS Tender Approval** — Complete tender response has been waiting for board approval for 4 days. Deadline: 23 April (9 days). Financial figures need verification. Teams notification sent to Jeff.

2. **BLOCKER — CBSA-42 Microsoft Graph API Auth** — Tender Intelligence cannot extract email contents due to Graph API authentication failure. Blocked >24 hours. Also affects CBSA-48. Teams notification sent to Jeff.

### Agent Status
| Agent | Status | Budget |
|---|---|---|
| CBS Executive | running | 53.6% |
| Tender Intelligence | idle | 26.8% |
| Tender Coordination | **paused** | 22.4% |
| Technical Writing | idle | 12.2% |
| Research CBS | idle | 21.0% |

### Open Items Requiring Jeff's Action
1. Approve TfNSW AMSS tender response (CBSA-8, 9 days to deadline)
2. Resolve Microsoft Graph API credentials (blocking all email tender extraction)
3. Tender Coordination paused — may need reactivation for future tender work

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
- **Task type:** Tender response assembly (Silver gate)
- **Date:** 2026-04-13
- **Issue:** CBSA-18

### Agent Output

## Objective

Assemble a complete tender response for the Sydney Metro West Tunnelling Systems Engineering Advisory opportunity.

## Executive Decision: GO ✅

The CBS Executive has reviewed the Tender Intelligence scorecard ([CBSA-16](/CBSA/issues/CBSA-16)) and authorized pursuit.

**Score:** 8.65/10 | **Decision:** GO

## Tender Summary

| Field | Detail |
|---|---|
| Tender Title | Sydney Metro West — Tunnelling Systems Engineering Advisory |
| RFP Number | TEST-SMW-2026-001 (simulated) |
| Issuing Agency | Sydney Metro (Transport for NSW) |
| Estimated Value | $3–5M over 3 years |
| Simulated Deadline | 30 April 2026 |
| Category | Professional engineering advisory services |

## Scope

- Independent systems engineering verification for TBM operations
- Geotechnical risk assessment and ground movement monitoring advisory
- Construction-to-operations transition planning for underground stations
- Asset management framework development for tunnel infrastructure (30-year lifecycle)
- Safety assurance and regulatory compliance advisory (WHS Act 2011)

## Evaluation Criteria

| Criterion | Weighting |
|---|---|
| Technical methodology and approach | 40% |
| Relevant experience (tunnelling, rail, systems engineering) | 30% |
| Key personnel qualifications | 20% |
| Value for money | 10% |

## Required Subtasks

Create and delegate the following subtasks:

### 1. Technical Writing — Methodology & Experience Section
Assigned via Technical Writing Agent. Must include:
- CAPITAL framework methodology adapted for tunnelling/systems engineering scope
- Relevant experience: Western Harbour Tunnel, Sydney Metro asset management, comparable tunnelling projects
- Key personnel: David Harper (Pursuit Director), Jim Ellwood (Systems Engineering), other named team members from KB
- Technical methodology for TBM verification, geotechnical risk, construction-to-operations transition

### 2. Compliance — Mandatory Criteria Mapping
Assigned via Compliance Agent. Must include:
- WHS Act 2011 compliance mapping
- Systems engineering standards compliance
- ISO 55001 (Asset Management) alignment
- Conditions of participation mapping

### 3. Pricing & Commercial — Fee Schedule
Assigned via Pricing and Commercial Agent. Must include:
- Conforming fixed-fee proposal for $3–5M over 3 years
- Value-based pricing alternative (CBS Group competitive advantage)
- Fee structure following methodology from KB (cbs-group-fee-structure parts)

## Assembly

Once all three subtasks are complete, assemble the full tender response and set status to `in_review` for executive/human review.

## Key References from Scorecard

- CAPITAL Framework: 10/10 applicability
- Existing Sydney Metro engagement: proven performance (95%+ asset availability)
- Western Harbour Tunnel: $180M lifecycle savings
- Named personnel with direct project experience
- Competitive differentiation: CAPITAL + relationship + proven outcomes

Parent task: [CBSA-15](/CBSA/issues/CBSA-15)
Scorecard: [CBSA-16](/CBSA/issues/CBSA-16)
Executive briefing: [CBSA-17](/CBSA/issues/CBSA-17)

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
- **Task type:** Agent governance framework
- **Date:** 2026-04-15
- **Issue:** CBSA-43

### Agent Output

Agent Governance Framework — define critical attributes, audit compliance, build enforcement, schedule ongoing protection.

## Context

Recent diagnostics revealed 9 of 12 agents were missing critical environment variables, causing silent failures (Tender Intelligence unable to scan emails, WR agents unable to query their KB, agents unable to send Teams notifications). This was discovered reactively. We need proactive governance.

Existing tooling you should use:
- scripts/agent_standards.py — current REQUIRED_ENV_VARS and ROLE_SPECIFIC_ENV_VARS constants
- scripts/validate-agent-env.py — current env var validator (run with --fix)

## Deliverables

### Part A: Define Critical Attributes (Bronze)

Produce a comprehensive list of EVERY attribute that constitutes a correctly configured agent. Go beyond env vars. Categories to cover:

1. Identity attributes
   - name present and unique
   - role matches Paperclip role enum
   - reportsTo points to a valid parent agent (or null for Tier 1)
   - budget non-zero (or explicitly disabled)

2. Configuration attributes
   - adapterType correct
   - model current and supported
   - heartbeat settings appropriate for role
   - promptTemplate present and non-trivial

3. Environment attributes
   - All REQUIRED_ENV_VARS present with non-empty values
   - Role-specific env vars present where applicable
   - No plaintext credentials that should be secrets

4. Instructions attributes
   - AGENTS.md contains all 6 hard stop prohibitions
   - Mandatory KB retrieval protocol present
   - Correction retrieval (feedback-loop) present
   - Teams notification step with inline code present
   - Embedded heartbeat protocol present (steps 1-N)
   - Escalation path with Teams notification directive

5. Skills attributes
   - Required skills synced (supabase-query, teams-notify, feedback-loop minimum)
   - Role-specific skills synced (e.g. xero-read for governance agents)

6. Operational attributes
   - Status is idle or running (not error or paused)
   - lastHeartbeatAt within expected cadence
   - spentMonthlyCents below 80% of budget
   - No stuck checkout

Document each attribute with: name, category, check method, severity (critical/warning/info), remediation action.

Output as a markdown file: docs/agent-critical-attributes.md

### Part B: Audit All 12 Agents

Run a full audit against the attribute list from Part A. For each agent, report compliance with each attribute. Identify gaps.

Output as a markdown file: docs/agent-audit-2026-04-13.md

### Part C: Build Enforcement

Extend or create scripts so that:

1. scripts/agent_standards.py — update REQUIRED_ENV_VARS and ROLE_SPECIFIC_ENV_VARS if Part A identifies additional ones
2. scripts/validate-agent-env.py — extend to check ALL attributes from Part A, not just env vars. Rename to scripts/validate-agents.py or create a new script. Should be runnable with --fix for auto-remediable issues.
3. skills/agent-recruitment/SKILL.md — update to reference the full attribute list, so new agents are created with complete compliance from day 1.

### Part D: Schedule Weekly Audit

Create a Paperclip routine that runs weekly (cron "0 9 * * 1" — Mondays 9am AEST):
- Name: "Weekly Agent Governance Audit"
- Assignee: CBS Executive
- Behaviour: run the full attribute audit, send Teams notification if any non-compliance detected, create subtask for CBS Executive to review and remediate

## Cost Estimate

This is a multi-agent coordination task. You will:
- Analyse current state and define attributes (your work, ~30min)
- Audit 12 agents (you run scripts, ~20min)
- Write documentation (your work, ~20min)
- Update Python scripts (delegate to Technical Writing? Or handle yourself since it's a script, not narrative)
- Create routine via API (~5min)

Estimated cost: -8. Under threshold. Execute directly.

## Success Criteria

- docs/agent-critical-attributes.md committed to repo
- docs/agent-audit-2026-04-13.md committed with findings for all 12 agents
- Updated scripts in repo
- Weekly routine active in Paperclip with next run date visible
- Teams notification confirming completion
- All gaps from audit either fixed or documented with remediation plan

## Do Not

- Do not make structural changes to the platform (no new infrastructure)
- Do not delete or disable any agent
- Do not modify credentials beyond adding missing env vars via validate-agent-env.py --fix
- Do not create new agents


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

- **Agent role:** CBS Executive
- **Task type:** Strategic decision — compliance gaps
- **Date:** 2026-04-13
- **Issue:** CBSA-27

### Agent Output

## Strategic Recommendation — Sydney Metro West Compliance Decision

**Status**: Escalated to Jeff Dusting for Go/No-Go decision on compliance package development.

### Executive Summary

The Sydney Metro West tender (TEST-SMW-2026-001) has strong qualification strength (8.65/10 scorecard) but the compliance review identified 5 critical gaps. The Compliance Agent recommends DO NOT SUBMIT until gaps are resolved. I concur that submitting with partial compliance is inadvisable — it risks disqualification on a $3-5M opportunity.

### My Recommendation: Option 2 — Develop Compliance Packages (with caveats)

**Rationale:**
- Scorecard strength (8.65/10) justifies the investment in compliance remediation
- 19 days to deadline (April 30) is tight but feasible for prioritised packages
- Option 1 (partial compliance) is too risky — likely disqualification
- Option 3 (skip) wastes the strong technical and pricing work already completed

**Critical Caveat — Human Action Required:**
Several compliance packages CANNOT be generated by agents alone:
- **Insurance & Financial Package** — requires actual $20M indemnity certificate, liability insurance docs, audited financials. These must come from CBS Group corporate records or insurers.
- **Personnel Qualifications Package** — requires real Engineers Australia registration verification and authorised CVs. Must be sourced from HR/personnel.
- **WHS Compliance Package** — if CBS Group has existing safety policies, they need to be provided; agents cannot fabricate safety management systems.

**Agent-Feasible Packages:**
- Systems Engineering Standards Package — can be drafted using CAPITAL framework and existing KB content
- Asset Management Standards Package — can leverage existing ISO 55001 methodology documentation

### Recommended Next Steps (Pending Jeff Approval)

1. Jeff to confirm Go/No-Go on compliance package development
2. Jeff to provide or arrange: insurance certificates, audited financials, personnel CVs, WHS policies
3. If Go: delegate Systems Engineering and Asset Management packages to Tender Coordination → Technical Writing
4. Target: compliance packages complete by April 23 for final assembly and review

### KB Quality Signal
- KB query: CBS Group compliance capabilities WHS policies ISO certifications insurance coverage
- Documents retrieved: 0 via semantic search; direct REST shows 50 docs in KB but none cover compliance/WHS/insurance specifically
- Source material: **insufficient** for compliance gap remediation
- Recommendation: **Human review required** — Jeff must decide on resource allocation and provide corporate compliance documents

### Budget Alert
CBS Executive Agent budget: 2371/2500 cents (94.8%). **Above 80% threshold.** Restricting to critical tasks only.

Parent: [CBSA-18](/CBSA/issues/CBSA-18) | Compliance: [CBSA-24](/CBSA/issues/CBSA-24) | Root E2E: [CBSA-15](/CBSA/issues/CBSA-15)

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

- **Agent role:** Compliance
- **Task type:** Systems engineering standards package
- **Date:** 2026-04-14
- **Issue:** CBSA-34

### Agent Output

## Objective

Develop a comprehensive Systems Engineering Standards compliance package for the Sydney Metro West Tunnelling Advisory tender (TEST-SMW-2026-001).

## Package Requirements

### 1. ISO 15288 Systems Lifecycle Compliance
- Document CBS Group methodology alignment with ISO 15288 systems and software engineering lifecycle processes
- Map CAPITAL framework stages to ISO 15288 lifecycle stages
- Provide evidence of systems engineering capability and process compliance
- Include verification and validation approach documentation

### 2. AS 7000 Railway Systems Engineering Standards
- Demonstrate compliance with Australian Standard AS 7000 for railway safety management
- Map CBS Group rail systems engineering approach to AS 7000 requirements
- Provide examples from Sydney Metro and other rail engagements
- Address safety integrity levels (SIL) and risk management frameworks

### 3. CENELEC SIL Compliance Framework
- Document approach to CENELEC standards (EN 50126/8/9 series) for rail systems
- Map Safety Integrity Level (SIL) assessment methodology
- Provide evidence of SIL compliance experience from previous projects
- Address functional safety management throughout system lifecycle

### 4. CAPITAL Framework Integration
- Demonstrate how CBS Group CAPITAL framework aligns with systems engineering standards
- Map CAPITAL methodology to required systems engineering processes
- Show integration approach for tunnelling systems and TBM operations
- Provide case study examples from Western Harbour Tunnel and Sydney Metro work

## Content Structure

### Executive Summary (1 page)
- CBS Group systems engineering standards compliance overview
- Methodology integration summary
- Relevance to Sydney Metro West scope

### Standards Compliance Documentation (3-4 pages)
- **ISO 15288 Compliance**: Process mapping and evidence
- **AS 7000 Compliance**: Railway-specific methodology alignment
- **CENELEC Compliance**: SIL framework and safety management
- **Integration Framework**: How standards work together in CBS approach

### CAPITAL Framework Mapping (2-3 pages)
- Detailed mapping of CAPITAL stages to systems engineering standards
- Process flow diagrams showing integration points
- Quality gates and verification checkpoints
- Risk management and safety assurance integration

### Case Study Evidence (2-3 pages)
- Sydney Metro engagement: systems engineering standards applied
- Western Harbour Tunnel: lifecycle management and standards compliance
- Other relevant projects demonstrating standards compliance
- Quantified outcomes and performance metrics

## KB Research Requirements

**Priority KB Queries to Run:**
1. **CAPITAL Framework Documentation**
   - Search: "CAPITAL framework methodology systems engineering"
   - Search: "CAPITAL lifecycle stages process documentation"
   - Search: "CAPITAL verification validation approach"

2. **Standards Compliance Documentation**
   - Search: "ISO 15288 compliance CBS Group methodology"
   - Search: "AS 7000 railway systems engineering standards"
   - Search: "CENELEC SIL safety integrity levels rail"
   - Search: "systems engineering standards compliance certification"

3. **Project Evidence and Case Studies**
   - Search: "Sydney Metro systems engineering methodology outcomes"
   - Search: "Western Harbour Tunnel systems lifecycle management"
   - Search: "rail systems engineering project case studies"
   - Search: "tunnelling systems engineering standards compliance"

4. **Integration and Methodology**
   - Search: "CAPITAL framework systems engineering integration"
   - Search: "CBS Group systems engineering approach methodology"
   - Search: "safety management systems engineering standards"

## Quality Criteria

- **Standards Alignment**: Clear demonstration of compliance with all three standards frameworks
- **Evidence-Based**: All claims supported by KB evidence and project examples
- **Integration Clarity**: Clear explanation of how standards work together in CBS approach
- **Tender Relevance**: Direct application to Sydney Metro West scope and requirements
- **Professional Format**: Suitable as standalone compliance attachment for tender submission

## Deliverable Format

- **Document Title**: "CBS Group Systems Engineering Standards Compliance Package"
- **Length**: 8-10 pages including diagrams and process maps
- **Format**: Professional compliance document suitable for tender attachment
- **Sections**: Clearly structured with headers matching package requirements
- **Evidence**: KB citations and project references throughout

## Target Completion

**Due Date: April 21, 2026** — allows 2 days for quality review and SharePoint delivery before CBSA-31 deadline.

## Context

- **Parent Task**: [CBSA-31](/CBSA/issues/CBSA-31) Compliance Package Development
- **Main Tender**: [CBSA-18](/CBSA/issues/CBSA-18) Sydney Metro West Assembly
- **Approval Source**: [CBSA-27](/CBSA/issues/CBSA-27) Strategic decision by Jeff Dusting
- **Tender Deadline**: April 30, 2026
- **Importance**: Critical for tender compliance - 8.65/10 Go decision

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

- **Agent role:** Compliance
- **Task type:** Asset management standards package
- **Date:** 2026-04-13
- **Issue:** CBSA-35

### Agent Output

## Objective

Develop a comprehensive Asset Management Standards compliance package for the Sydney Metro West Tunnelling Advisory tender (TEST-SMW-2026-001).

## Package Requirements

### 1. ISO 55001 Certification Documentation
- Demonstrate CBS Group alignment with ISO 55001 Asset Management standards
- Document asset management system capability and certification status
- Map CBS Group asset management methodology to ISO 55001 requirements
- Provide evidence of asset management maturity and governance

### 2. CAPITAL Framework Asset Management Mapping
- Map CAPITAL methodology to asset management lifecycle stages
- Demonstrate integration of asset management with systems engineering
- Show how CAPITAL supports 30-year lifecycle planning for tunnel infrastructure
- Provide methodology for asset condition assessment and optimization

### 3. Asset Condition Assessment Methodology
- Document CBS Group approach to asset condition monitoring and assessment
- Provide framework for tunnel infrastructure condition assessment
- Map condition assessment to maintenance planning and lifecycle optimization
- Include predictive maintenance and asset performance monitoring approaches

### 4. Sydney Metro Integration Framework
- Show how CBS Group asset management integrates with Sydney Metro existing systems
- Demonstrate data integration and performance monitoring alignment
- Provide approach for asset handover from construction to operations
- Address asset register development and maintenance

## Content Structure

### Executive Summary (1 page)
- CBS Group asset management standards compliance overview
- CAPITAL framework asset management integration
- Relevance to Sydney Metro West 30-year lifecycle requirements

### ISO 55001 Compliance Documentation (3-4 pages)
- **Certification Status**: CBS Group ISO 55001 alignment and certification evidence
- **Asset Management System**: Governance, processes, and organizational capability
- **Lifecycle Management**: Asset planning, acquisition, operation, and disposal processes
- **Performance Management**: Asset performance monitoring and continuous improvement

### CAPITAL Framework Asset Management Integration (2-3 pages)
- CAPITAL methodology mapping to asset management lifecycle
- Asset management planning integration with systems engineering
- Tunnel infrastructure lifecycle planning using CAPITAL approach
- Risk-based asset management and condition assessment integration

### Sydney Metro Specific Approach (2-3 pages)
- Integration with Sydney Metro asset management systems and processes
- Asset data standards and information management approach
- Performance monitoring and reporting framework
- Construction-to-operations asset handover methodology
- Case study: Sydney Metro asset management outcomes and performance

## KB Research Requirements

**Priority KB Queries to Run:**
1. **Asset Management Framework Documentation**
   - Search: "ISO 55001 asset management CBS Group certification"
   - Search: "CAPITAL framework asset management lifecycle"
   - Search: "asset management methodology CBS Group approach"
   - Search: "asset condition assessment methodology framework"

2. **Sydney Metro Asset Management**
   - Search: "Sydney Metro asset management system integration"
   - Search: "Sydney Metro asset performance monitoring outcomes"
   - Search: "rail asset management lifecycle planning"
   - Search: "Sydney Metro construction operations asset handover"

3. **Tunnel Infrastructure Asset Management**
   - Search: "tunnel infrastructure asset management lifecycle"
   - Search: "underground infrastructure condition assessment"
   - Search: "tunnel asset maintenance optimization"
   - Search: "30-year lifecycle planning tunnel infrastructure"

4. **CAPITAL Integration and Outcomes**
   - Search: "CAPITAL framework asset management integration"
   - Search: "Western Harbour Tunnel asset lifecycle management"
   - Search: "CBS Group asset management case studies outcomes"
   - Search: "asset performance optimization CAPITAL methodology"

## Quality Criteria

- **Standards Compliance**: Clear demonstration of ISO 55001 alignment and capability
- **Methodology Integration**: Seamless integration of CAPITAL with asset management standards
- **Sydney Metro Relevance**: Direct application to Sydney Metro context and existing systems
- **30-Year Lifecycle Focus**: Comprehensive approach to long-term tunnel infrastructure management
- **Evidence-Based**: All claims supported by KB evidence, certifications, and project examples
- **Professional Format**: Suitable as standalone compliance attachment for tender submission

## Deliverable Format

- **Document Title**: "CBS Group Asset Management Standards Compliance Package"
- **Length**: 8-10 pages including process diagrams and integration frameworks
- **Format**: Professional compliance document suitable for tender attachment
- **Sections**: Clearly structured with headers matching package requirements
- **Evidence**: KB citations, certification evidence, and project references throughout

## Target Completion

**Due Date: April 21, 2026** — allows 2 days for quality review and SharePoint delivery before CBSA-31 deadline.

## Context

- **Parent Task**: [CBSA-31](/CBSA/issues/CBSA-31) Compliance Package Development
- **Main Tender**: [CBSA-18](/CBSA/issues/CBSA-18) Sydney Metro West Assembly
- **Approval Source**: [CBSA-27](/CBSA/issues/CBSA-27) Strategic decision by Jeff Dusting
- **Tender Deadline**: April 30, 2026
- **Scope Focus**: 30-year lifecycle planning for tunnel infrastructure
- **Integration**: Must align with Sydney Metro existing asset management systems

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
- **Task type:** Methodology and experience section
- **Date:** 2026-04-11
- **Issue:** CBSA-23

### Agent Output

## Objective

Prepare the technical methodology and experience section for Sydney Metro West Tunnelling Systems Engineering Advisory tender response (TEST-SMW-2026-001).

## Tender Context

- **Client**: Sydney Metro (Transport for NSW)
- **Value**: $3-5M over 3 years
- **Deadline**: April 30, 2026
- **Opportunity**: Independent systems engineering advisory for TBM operations and tunnel infrastructure

## Scope Requirements

### Technical Methodology (40% evaluation weight)
Develop comprehensive methodology covering:

1. **CAPITAL Framework Application**
   - Adapt CAPITAL methodology specifically for tunnelling/systems engineering scope
   - TBM operations verification processes
   - Systems integration approach for underground rail infrastructure
   - Construction-to-operations transition methodology

2. **Geotechnical Risk Assessment**
   - Ground movement monitoring advisory framework
   - Risk assessment methodology for tunnelling operations
   - Integration with TBM operational parameters

3. **Asset Management Framework**
   - 30-year lifecycle planning for tunnel infrastructure
   - ISO 55001 alignment
   - Integration with Sydney Metro existing asset management systems

### Relevant Experience Section (30% evaluation weight)
Showcase relevant project experience:

1. **Sydney Metro Engagement**
   - Existing relationship and proven performance (95%+ asset availability)
   - Asset management advisory experience
   - Systems engineering capabilities demonstrated

2. **Western Harbour Tunnel**
   - $180M lifecycle savings achievement
   - Tunnelling project experience
   - Systems engineering and risk management

3. **Comparable Projects**
   - Other tunnelling, rail, and systems engineering projects from KB
   - Quantified outcomes where available
   - Relevance to TBM operations and underground infrastructure

### Key Personnel (20% evaluation weight)
Profile key team members with direct relevant experience:

1. **David Harper** (Pursuit Director)
   - Leadership role and relevant experience
   - Tunnelling and systems engineering background

2. **Jim Ellwood** (Systems Engineering Lead)
   - Technical expertise in systems engineering
   - Rail and infrastructure experience

3. **Additional Team Members**
   - Source other named personnel from KB with relevant tunnelling/rail experience
   - Match expertise to specific scope requirements

## Quality Criteria

- **Evidence-Based**: All claims supported by specific project examples from KB
- **Quantified Outcomes**: Include measurable results where available ($180M savings, 95% availability, etc.)
- **Methodology Detail**: Sufficient technical depth to demonstrate capability without revealing proprietary processes
- **Personnel Matching**: Clear alignment between individual expertise and role requirements
- **Compliance Ready**: Content structured for easy compliance verification

## KB References to Query

Search knowledge base for:
- CAPITAL framework documentation and case studies
- Sydney Metro project details and outcomes
- Western Harbour Tunnel project summary and savings
- David Harper and Jim Ellwood profiles and experience
- Tunnelling project case studies and methodologies
- Systems engineering frameworks and tools
- Asset management approach and ISO 55001 compliance

## Deliverables

1. **Technical Methodology Section** (2-3 pages)
   - CAPITAL framework adapted for scope
   - Detailed approach for each scope element
   - Integration and quality assurance processes

2. **Relevant Experience Section** (2-3 pages)
   - Project summaries with quantified outcomes
   - Relevance mapping to current opportunity
   - Client testimonials or performance metrics

3. **Key Personnel Profiles** (1-2 pages)
   - Individual CVs focused on relevant experience
   - Role assignments and responsibilities
   - Team structure and capability matrix

## Due Date

**April 25, 2026** — allows 3 days for quality review and final assembly before tender deadline.

Parent Task: [CBSA-18](/CBSA/issues/CBSA-18)
Scorecard Reference: [CBSA-16](/CBSA/issues/CBSA-16)

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

- **Agent role:** Pricing and Commercial
- **Task type:** Fee schedule and value proposition
- **Date:** 2026-04-10
- **Issue:** CBSA-25

### Agent Output

## Objective

Develop pricing strategy and commercial proposal for Sydney Metro West Tunnelling Systems Engineering Advisory tender (TEST-SMW-2026-001).

## Tender Context

- **Client**: Sydney Metro (Transport for NSW)
- **Value**: $3-5M over 3 years
- **Deadline**: April 30, 2026
- **Evaluation**: Value for money (10% weight)
- **Scope**: Independent systems engineering advisory for TBM operations and tunnel infrastructure

## Commercial Requirements

### 1. Conforming Fixed-Fee Proposal
**Requirement**: Primary proposal within $3-5M range over 3 years.

**Tasks**:
- Develop detailed cost breakdown structure
- Map scope elements to resource requirements and costs
- Apply CBS Group standard rates and multipliers
- Include contingency and risk provisions
- Ensure competitive positioning within specified range
- Address payment milestones and terms

### 2. Value-Based Pricing Alternative
**Requirement**: CBS Group competitive advantage through value-based commercial model.

**Tasks**:
- Develop outcome-based fee structure
- Link pricing to performance metrics and value delivery
- Reference comparable CBS Group value-based arrangements
- Quantify client value proposition ($180M Western Harbour Tunnel savings model)
- Structure risk-sharing and incentive mechanisms
- Address performance measurement and reporting

### 3. Fee Structure Methodology
**Requirement**: Apply CBS Group proven fee structure approach.

**Tasks**:
- Reference KB fee structure methodology and precedents
- Apply standard CBS Group commercial framework
- Include resource loading and skill mix optimization
- Address project phases and milestone-based payments
- Include variation and scope change mechanisms
- Ensure alignment with CBS Group commercial policies

## Scope Breakdown for Costing

### Systems Engineering Advisory (40% of effort)
- TBM operations verification and advisory
- Systems integration methodology and oversight
- Construction-to-operations transition planning
- Quality assurance and verification processes

### Geotechnical Risk Management (25% of effort)
- Ground movement monitoring advisory
- Geotechnical risk assessment and management
- Integration with TBM operational parameters
- Risk mitigation strategy development

### Asset Management Framework (25% of effort)
- 30-year lifecycle planning development
- Integration with Sydney Metro asset management systems
- Performance monitoring framework design
- Asset optimization and maintenance strategy

### Safety and Compliance (10% of effort)
- WHS Act 2011 compliance assurance
- Safety management system advisory
- Regulatory compliance verification
- Safety performance monitoring and reporting

## Resource Planning

### Key Personnel Loading
- **Pursuit Director (David Harper)**: 15% allocation
- **Systems Engineering Lead (Jim Ellwood)**: 30% allocation
- **Senior Systems Engineers**: 2.0 FTE average
- **Geotechnical Specialists**: 1.0 FTE average
- **Asset Management Experts**: 0.8 FTE average
- **Project Administration**: 0.2 FTE average

### Rate Structure
- Apply current CBS Group rate schedule
- Include overhead and profit margins
- Address escalation over 3-year period
- Account for skill mix and seniority levels

## Value Proposition Elements

### Quantified Benefits
- Reference $180M lifecycle savings from Western Harbour Tunnel
- 95%+ asset availability achievement with Sydney Metro
- Risk reduction through proven CAPITAL methodology
- Early identification and mitigation of operational risks

### Competitive Differentiators
- Existing Sydney Metro relationship and performance
- Proven CAPITAL framework application
- Value-based commercial model option
- Integrated systems engineering and asset management approach

## Quality Criteria

- **Competitive Positioning**: Pricing competitive within specified range
- **Value Justification**: Clear link between price and value delivery
- **Risk Management**: Appropriate contingency and risk provisions
- **Commercial Clarity**: Clear terms, conditions, and payment structure
- **Compliance Ready**: Pricing format matches tender requirements

## KB References to Query

Search knowledge base for:
- CBS Group fee structure methodology and frameworks
- Historical pricing for comparable systems engineering projects
- Value-based commercial arrangement precedents
- Sydney Metro engagement commercial terms and outcomes
- Western Harbour Tunnel commercial structure and savings model
- Standard CBS Group rates and commercial policies
- Resource loading models for systems engineering work

## Deliverables

1. **Primary Fixed-Fee Proposal** (2-3 pages)
   - Detailed cost breakdown by scope element
   - Resource loading and timeline
   - Payment milestone schedule
   - Terms and conditions summary

2. **Value-Based Pricing Alternative** (2 pages)
   - Outcome-based fee structure
   - Performance metrics and incentive mechanisms
   - Risk-sharing provisions
   - Value delivery framework

3. **Commercial Summary** (1 page)
   - Executive summary of pricing approach
   - Value proposition highlights
   - Competitive advantages and differentiators
   - Implementation and contract management approach

## Due Date

**April 25, 2026** — synchronize with other sections for integrated quality review and final assembly.

Parent Task: [CBSA-18](/CBSA/issues/CBSA-18)
Scorecard Reference: [CBSA-16](/CBSA/issues/CBSA-16)

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

- **Agent role:** Research CBS
- **Task type:** KB retrieval verification
- **Date:** 2026-04-10
- **Issue:** CBSA-20

### Agent Output

## KB Retrieval Verification — Complete

**Voyage AI Embedding:** OK — dimension 1024, model `voyage-3.5`, query: `CBS Group CAPITAL framework methodology`

**Supabase `match_documents` RPC:** OK — 5 results returned (entity filter: `cbs-group`, threshold: `0.0`)

### Results

| # | source_file | similarity | id |
|---|-------------|------------|----|  
| 1 | `cbs-group-tender-dhs-vic-kpi-part03.md` | 0.5650 | 805 |
| 2 | `cbs-group-tender-dhs-vic-kpi-part13.md` | 0.5611 | 878 |
| 3 | `cbs-group-tender-dhs-vic-kpi-part12.md` | 0.5611 | 866 |
| 4 | `cbs-group-tender-dhs-vic-kpi-part15.md` | 0.5544 | 900 |
| 5 | `cbs-group-tender-dhs-vic-kpi-part17.md` | 0.5544 | 913 |

### Top Result Quote (id 805, source: `cbs-group-tender-dhs-vic-kpi-part03.md`)

> At the heart of our service delivery is the award-winning CAPITAL Framework, our signature methodology for strategic asset management advisory services. With 15 years of refinement through infrastructure project delivery, CAPITAL has achieved $1.049B in validated savings across a $10b asset portfolio – delivering an impressive 31% average optimisation of contract values.

> The CAPITAL Framework's seven core capabilities, originally developed for transport infrastructure, will be applied directly to the Department's KPI implementation challenge.

### Observations

- All 5 results are from the DHS VIC KPI tender documents
- Similarity scores range 0.554–0.565 (moderate — query targeted CAPITAL framework broadly; top hits contain CAPITAL framework content within tender response context)
- KB pipeline is functional: Voyage AI → embedding → Supabase RPC → results returned correctly
- No errors encountered

### Quality Signal

- **KB query:** `CBS Group CAPITAL framework methodology`
- **Documents retrieved:** `cbs-group-tender-dhs-vic-kpi-part03.md` (0.565), `cbs-group-tender-dhs-vic-kpi-part13.md` (0.561), `cbs-group-tender-dhs-vic-kpi-part12.md` (0.561), `cbs-group-tender-dhs-vic-kpi-part15.md` (0.554), `cbs-group-tender-dhs-vic-kpi-part17.md` (0.554)
- **Source material:** sufficient for this task
- **Recommendation:** proceed — KB retrieval pipeline verified operational

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
