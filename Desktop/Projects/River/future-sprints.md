# Project River — Future Sprints (Sprint 2–5) and Runtime Expansion

**Version:** 1.0
**Date:** 8 April 2026

---

## Sprint 1 Recap (Current)

Sprint 1 establishes the core River infrastructure: Paperclip deployment on Railway, Supabase knowledge base, M365 Graph API integration, Xero read-only OAuth, 12 agents across CBS Group and WaterRoads (governance only), 6 custom skills, and governance templates. All agents use the `claude_local` adapter exclusively.

---

## Sprint 2 — Feedback Loop Activation and Shared Knowledge

**Estimated Duration:** 2 weeks
**Prerequisites:** Sprint 1 complete, 2 weeks of production data from agent heartbeats

### 2.1 Agent Feedback Loop

**Objective:** Enable agents to learn from operator feedback on their outputs, improving quality over time without retraining.

**Scope:**
- Implement a feedback tagging system on issues — operators tag approved outputs as "exemplar" or "needs improvement" with structured annotations.
- Create a `feedback-loop` skill that agents read during heartbeat to check for recent feedback on their own outputs.
- Agents adjust their approach based on annotated feedback: "exemplar" outputs reinforce the approach; "needs improvement" outputs include the operator's correction.
- Feedback is stored as issue metadata, not in the knowledge base (avoids polluting the KB with operational data).

**Correction Ingestion Protocol (Designed Sprint 1, Day 4):**

When Jeff corrects an agent's output, the correction should be captured as a knowledge base document:

1. Export the original output and the correction as a markdown file
2. Tag with YAML front-matter: `category: correction`, `metadata.agent_role: {role}`, `metadata.task_type: {type}`
3. Ingest into Supabase with entity-level scoping

```sql
-- Feedback loop: corrections ingested for agent learning
-- Category 'correction' in documents table
-- Tagged with agent_role for targeted retrieval
-- Agent AGENTS.md directive: "Before producing output, query for corrections
--   matching your role and task type"
```

Each agent's AGENTS.md will include a retrieval step: before producing substantive output, query the KB for `category: correction` documents matching the agent's role. This allows agents to learn from past corrections without retraining.

**Deliverables:**
- `skills/feedback-loop/SKILL.md` — skill definition
- `scripts/feedback-report.py` — weekly feedback summary per agent
- Updated HEARTBEAT.md files to include feedback check step

### 2.2 Shared Knowledge Category

**Objective:** Enable cross-entity knowledge sharing where appropriate, while maintaining entity-level access boundaries.

**Scope:**
- Add a `shared` entity category to the Supabase documents table.
- Shared documents are accessible to agents from any entity.
- Use cases: CAPITAL framework methodology (relevant to both CBS and WR), ISO standards references, general Australian regulatory guidance.
- Entity-specific content (financials, board papers, tender responses) remains entity-filtered.

**Deliverables:**
- Supabase schema update for shared category
- Updated `supabase-query` skill with shared category support
- Migration script to move applicable documents to shared category

### 2.3 HTTP Adapter Activation (Manus)

**Objective:** Activate the Manus HTTP adapter when Paperclip ships HTTP adapter support.

**Scope:**
- Paperclip's HTTP adapter is currently listed as "Coming soon" in the adapter list.
- When available, configure a Manus agent using the HTTP adapter template at `adapters/manus-http-template.json`.
- Manus would handle long-running research tasks that benefit from autonomous web browsing and multi-step investigation.
- Initial deployment: single Manus research agent reporting to CBS Executive, with a tight budget cap.

**Deliverables:**
- Manus agent configuration and instruction files
- Budget monitoring procedure specific to HTTP adapter agents
- Integration testing protocol

### 2.4 OpenClaw Gateway Activation

**Objective:** Activate the OpenClaw gateway adapter when Paperclip ships gateway support.

**Scope:**
- OpenClaw gateway enables external API access for agents via a controlled gateway.
- When available, configure using the template at `adapters/openclaw-gateway-template.json`.
- Initial use case: controlled access to external data sources for the Tender Intelligence agent.

**Deliverables:**
- OpenClaw gateway configuration
- Access control policy definition
- Integration testing protocol

---

## Sprint 3 — Tender Qualification Scorecard

**Estimated Duration:** 2 weeks
**Prerequisites:** Sprint 2 complete, at least 20 tender opportunities assessed by the Tender Intelligence agent

### 3.1 Qualification Scorecard Model

**Objective:** Develop a structured scoring model for tender opportunities that goes beyond the Go/Watch/Pass recommendation.

**Scope:**
- Define a weighted scorecard with dimensions: sector alignment (25%), CAPITAL applicability (20%), contract value (15%), client relationship history (15%), competitive position (10%), resource availability (10%), strategic value (5%).
- Scorecard is populated automatically by the Tender Intelligence agent using KB evidence and tender metadata.
- Scores are stored as structured JSON on the issue, enabling trend analysis over time.

**Deliverables:**
- `skills/tender-scorecard/SKILL.md` — scorecard skill definition
- Scorecard schema definition (JSON)
- Updated Tender Intelligence agent instructions to use the scorecard
- Historical backfill script for previously assessed opportunities

### 3.2 Tender Pursuit Workflow Automation

**Objective:** Automate the handoff from Go decision to tender response workflow.

**Scope:**
- When the CBS Executive approves a Go recommendation, automatically create a structured tender response workflow: subtasks for Technical Writing, Compliance, and Pricing agents.
- Each subtask includes the relevant scorecard data, deadline, and evaluation criteria extracted from the tender documents.
- The Tender Coordination agent manages the assembled workflow.

**Deliverables:**
- Workflow template definition
- Updated Tender Coordination agent instructions
- Automated subtask creation logic in CBS Executive heartbeat

### 3.3 Competitor Intelligence Integration

**Objective:** Add competitor tracking to the tender assessment process.

**Scope:**
- Maintain a competitor profile knowledge base category with known competitors, their specialisations, and historical bid outcomes.
- The Tender Intelligence agent references competitor profiles when assessing competitive position.
- Competitor data is sourced from public tender outcome records and operator input.

**Deliverables:**
- Competitor profile KB category and initial data
- Updated Tender Intelligence instructions
- Competitor tracking dashboard view

---

## Sprint 4 — WaterRoads Operational Expansion

**Estimated Duration:** 3 weeks
**Prerequisites:** Sprint 3 complete, WaterRoads governance agents stable for 4+ weeks

### 4.1 WaterRoads Investor Relations Agent

**Objective:** Add a dedicated agent for investor communications and data room management.

**Scope:**
- New Tier 2 agent reporting to WR Executive.
- Manages investor update preparation, data room document currency, and due diligence response coordination.
- Read-only access to WaterRoads financial data.
- All investor-facing communications require human approval (hard stop enforced).

**Deliverables:**
- Agent instruction files (4-file bundle)
- Data room folder structure in SharePoint
- Investor update template in prompt-templates/

### 4.2 WaterRoads Technical Research Agent

**Objective:** Add a research agent for hydrofoil technology, environmental compliance, and maritime regulation monitoring.

**Scope:**
- New Tier 3 agent reporting to WR Executive.
- Monitors maritime regulatory changes, environmental compliance requirements, and zero-emission vessel technology developments.
- Produces research briefings on demand.

**Deliverables:**
- Agent instruction files (4-file bundle)
- Maritime regulation monitoring skill
- Research briefing template

### 4.3 Cross-Entity Reporting

**Objective:** Enable the CBS Executive to produce consolidated reporting across both entities where Jeff Dusting has visibility.

**Scope:**
- CBS Executive can query WaterRoads high-level status (with appropriate access controls).
- Consolidated dashboard view showing both entities' health metrics.
- Cross-entity reporting template for Jeff's personal oversight.

**Deliverables:**
- Cross-entity reporting skill
- Consolidated report template
- Access control configuration

---

## Sprint 5 — Operational Maturity and Optimisation

**Estimated Duration:** 2 weeks
**Prerequisites:** Sprint 4 complete, 8+ weeks of production operation

### 5.1 Token Optimisation

**Objective:** Analyse token consumption patterns and optimise agent efficiency.

**Scope:**
- Analyse 8 weeks of token consumption data by agent, task type, and complexity.
- Identify agents that can be downgraded to Haiku without quality loss.
- Identify agents that benefit from Opus for specific task types.
- Implement dynamic model selection: agent uses Haiku for routine tasks and Sonnet/Opus for complex tasks.

**Deliverables:**
- Token analysis report
- Model assignment recommendations
- Dynamic model selection skill (if supported by Paperclip)

### 5.2 Quality Metrics Dashboard

**Objective:** Build a quality tracking system based on operator feedback data.

**Scope:**
- Aggregate feedback loop data from Sprint 2 into quality metrics per agent.
- Track: approval rate (first-pass vs revision needed), confidence signal accuracy, KB citation quality.
- Publish a weekly quality report via Teams notification.

**Deliverables:**
- Quality metrics calculation script
- Weekly quality report template
- Teams notification integration for quality reports

### 5.3 Disaster Recovery Test

**Objective:** Execute a full disaster recovery test to validate backup and recovery procedures.

**Scope:**
- Perform a controlled full rollback (Railway PostgreSQL restore + Supabase PITR).
- Verify all agents resume correctly after restoration.
- Measure recovery time objective (RTO) and recovery point objective (RPO).
- Document any gaps in the runbook based on test findings.

**Deliverables:**
- DR test plan and execution log
- Updated operator runbook with DR test findings
- RTO/RPO measurements

### 5.4 Adventure Safety and CobaltBlu Activation Assessment

**Objective:** Assess readiness to activate the two dormant entities.

**Scope:**
- Review whether Adventure Safety and MAF/CobaltBlu have sufficient knowledge base content and operational need to justify agent activation.
- If yes, define the agent structure, instruction files, and skill assignments.
- If no, document the prerequisites for future activation.

**Deliverables:**
- Activation readiness assessment
- Agent structure proposal (if proceeding)
- Prerequisites list (if deferring)

---

## Ongoing Runtime Expansion Plan

Beyond Sprint 5, Project River enters a continuous improvement cycle:

| Cadence | Activity |
|---|---|
| Weekly | Review agent quality metrics, approve/reject outputs, rotate credentials as needed |
| Monthly | Review token consumption, adjust budgets, update knowledge base with new content |
| Quarterly | Review agent structure — add, remove, or reassign agents based on business needs |
| Bi-annually | Platform upgrade assessment — evaluate new Paperclip features, adapter availability, model releases |
| Annually | Full DR test, comprehensive quality review, strategic alignment check |

### Expansion Triggers

| Trigger | Response |
|---|---|
| New business entity activated | Add company in Paperclip, deploy minimum viable agent set (Executive + Governance + Office Management) |
| New integration available (e.g. HTTP adapter) | Evaluate using the reference templates in `adapters/`, deploy if beneficial |
| New Claude model release | Test on one agent, evaluate quality/cost tradeoff, roll out if positive |
| Knowledge base grows beyond 1000 documents | Review chunking strategy, consider category restructuring |
| Agent count exceeds 20 | Review delegation hierarchy, consider adding coordinator agents |

---

*This document will be updated at the end of each sprint with actuals, learnings, and scope adjustments.*
