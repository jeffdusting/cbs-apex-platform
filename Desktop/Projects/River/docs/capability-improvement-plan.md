# Project River — Capability Improvement Plan

**Date:** 12 April 2026

---

## 1. Budget and Heartbeat Changes (Applied)

| Agent | Old Budget | New Budget | Old Heartbeat | New Heartbeat |
|---|---|---|---|---|
| CBS Executive | $25 | **$100** | 6h | **2h** |
| Tender Coordination | $20 | **$90** | 4h | **2h** |
| WR Executive | $15 | **$50** | 6h | 6h |
| Tender Intelligence | $15 | **$25** | 24h | 24h |
| Governance WR | $15 | **$25** | 24h | 24h |
| Others | unchanged | unchanged | unchanged | unchanged |

**Impact:** Tender pipeline cycle time reduced from ~18-24 hours to ~6-8 hours.

---

## 2. SOUL.md, TOOLS.md, and Skill Improvements

### Current State

SOUL.md files define voice and communication style but are NOT loaded by agents (only promptTemplate/AGENTS.md is read). TOOLS.md files list available skills but are similarly unread.

### Recommendations

#### A. Merge SOUL.md Directives into AGENTS.md

Since agents only read the promptTemplate, key SOUL.md content should be embedded in AGENTS.md:

| Current SOUL.md Directive | Where to Embed | Impact |
|---|---|---|
| "Lead with the conclusion, then provide supporting evidence" | Embed in Output Quality Signal section | Better structured outputs |
| "Use plain language. Avoid jargon unless precise technical term" | Embed after identity section | Clearer communications |
| "Flag uncertainty explicitly rather than hedging" | Embed in KB retrieval protocol | More honest confidence signals |
| Australian spelling directive | Embed at top of AGENTS.md | Consistent spelling |

#### B. Enhance Skills with Domain Knowledge

Current skills are functional (API patterns). They should also encode domain expertise:

| Skill | Current | Enhancement |
|---|---|---|
| **cbs-capital-framework** | Framework description | Add decision trees for when to apply CAPITAL vs other methodologies, pricing multiplier tables, outcome measurement criteria |
| **tender-portal-query** | Email scanning patterns | Add Shipley-aligned opportunity qualification criteria (see Section 4 below) |
| **supabase-query** | Embedding + search | Add query strategy guidance: when to use category filters, how to chain queries for complex topics, minimum result thresholds |
| **tender-scorecard** | 7-dimension scoring | Add Shipley Bid/No-Bid criteria mapping, P(win) estimation heuristics |

#### C. New Skills to Create

| Skill | Purpose | Priority |
|---|---|---|
| **shipley-process** | Encodes the Shipley tender lifecycle: Opportunity → Qualify → Capture → Propose → Review → Submit | High |
| **tender-workflow** | Defines Bronze/Silver/Gold quality tiers and review gates (see Section 3 below) | High |
| **graph-mail-read** | Formalises email scanning patterns for all agents (not just Tender Intelligence) | Medium |
| **competitor-analysis** | Structured competitor assessment framework: SWOT, win themes, ghost team | Medium |

---

## 3. Tender Workflow Definition — Go/NoGo → Bronze/Silver/Gold

### Current Flow (Linear)

```
Tender Intelligence → Scorecard → CBS Executive (Go/NoGo) → Tender Coordination → Specialists → Assembly → in_review
```

**Problem:** Single pass, one quality level, no structured review gates.

### Proposed Flow (Shipley-Aligned with Quality Tiers)

```
PHASE 1: QUALIFY
  Tender Intelligence scans emails → registers in tender_register
  Tender Intelligence produces qualification scorecard
  CBS Executive reviews → Go / Watch / Pass (recorded in register)

PHASE 2: CAPTURE (Go decisions only)
  CBS Executive creates "Tender Pursuit — [Name]" issue
  Tender Coordination owns the pursuit from here

PHASE 3: PROPOSE — BRONZE
  Tender Coordination creates subtasks:
    - Technical Writing: methodology outline + capability mapping (skeleton)
    - Compliance: mandatory criteria checklist (gap analysis)
    - Pricing: pricing strategy memo (approach, not numbers)
  Output: Bronze Draft — structure + key themes + compliance gaps identified
  Gate: CBS Executive reviews Bronze, approves progression or redirects

PHASE 4: PROPOSE — SILVER
  Tender Coordination creates refined subtasks:
    - Technical Writing: full narrative sections with KB evidence
    - Compliance: complete criteria responses with evidence mapping
    - Pricing: draft fee schedule with conforming + alternative offers
    - Research: competitor analysis + win theme refinement
  Output: Silver Draft — complete first draft, all sections populated
  Gate: CBS Executive reviews Silver, provides feedback, approves for Gold

PHASE 5: PROPOSE — GOLD
  Tender Coordination:
    - Integrates CBS Executive feedback
    - Quality review: consistency, voice, evidence citations, compliance coverage
    - Assembles final document
  Output: Gold Draft — submission-ready document
  Gate: Delivered to SharePoint, CBS Executive marks in_review
  Teams notification: "TENDER RESPONSE READY — [ref]"
  Human reviews and submits to portal

PHASE 6: POST-SUBMISSION
  Tender Intelligence: track outcome in tender_register
  CBS Executive: debrief and lessons learned (if outcome known)
```

### Implementation

This requires updating three agent instructions:

1. **Tender Coordination AGENTS.md** — replace the linear workflow with the 6-phase structure, including Bronze/Silver/Gold gate definitions
2. **CBS Executive AGENTS.md** — add review gate responsibilities (approve Bronze→Silver, Silver→Gold)
3. **tender-scorecard SKILL.md** — add Shipley qualification criteria

### Issue Naming Convention

```
CBSA-XX  Tender Pursuit — [Client] [Name]                     (parent)
  CBSA-XX  Phase 3 Bronze — [Client] [Name]                   (subtask)
    CBSA-XX  Bronze: Technical Methodology Outline             (sub-subtask)
    CBSA-XX  Bronze: Compliance Gap Analysis                   (sub-subtask)
    CBSA-XX  Bronze: Pricing Strategy Memo                     (sub-subtask)
  CBSA-XX  Phase 4 Silver — [Client] [Name]                   (subtask)
    CBSA-XX  Silver: Technical Narrative                       (sub-subtask)
    CBSA-XX  Silver: Compliance Responses                      (sub-subtask)
    CBSA-XX  Silver: Draft Fee Schedule                        (sub-subtask)
    CBSA-XX  Silver: Competitor Analysis                       (sub-subtask)
  CBSA-XX  Phase 5 Gold — [Client] [Name]                     (subtask)
    CBSA-XX  Gold: Final Assembly + Quality Review             (sub-subtask)
```

---

## 4. Knowledge Base Optimisation — Shipley Framework + CBS Content

### Current KB State

- 1,422 documents, 1,308,775 words
- Categories: tender (1,016), ip (170), governance (154), financial (57), methodology (16), knowledge (9)
- CAPITAL methodology is 16 chunks (entity=shared)
- No Shipley framework content
- No structured competitor profiles
- No win/loss analysis data

### Content to Ingest

#### Priority 1: Shipley Framework (create new)

Create `knowledge-base/shipley-framework.md` covering:

| Section | Content |
|---|---|
| Shipley Bid/No-Bid criteria | Qualification checklist aligned to CBS scorecard |
| Capture planning | Client engagement, incumbent analysis, solution development |
| Proposal structure | Executive summary, technical approach, management, past performance, pricing |
| Quality review gates | Pink Team (Bronze), Red Team (Silver), Gold Team (Gold) |
| Win themes | How to identify and thread win themes through a proposal |
| Price-to-win | How to develop competitive pricing strategy |

This can be authored by Claude using Shipley public methodology documentation and CBS Group's specific application of it.

#### Priority 2: CBS Win/Loss History

Export from CBS records:

| Content | Format | Ingestion |
|---|---|---|
| Past tender outcomes (won/lost/withdrew) | Structured table with client, value, outcome, reason | `category: tender-outcome` |
| Debrief notes (if available) | Narrative summaries | `category: tender-debrief` |
| Client relationship map | Client name → relationship status, key contacts, history | `category: client-intelligence` |

#### Priority 3: Enhanced CAPITAL Framework Content

The current 16 chunks cover CAPITAL methodology but are sparse on:

| Gap | What to add |
|---|---|
| Case studies with quantified outcomes | "$X savings on Project Y" — specific, verifiable |
| Decision tree for CAPITAL applicability | When to lead with CAPITAL vs when it's secondary |
| CAPITAL pricing methodology | How value-based pricing ties to CAPITAL outcomes |
| Comparison to competitors' methodologies | What differentiates CAPITAL from standard AM approaches |

#### Priority 4: Competitor Intelligence

Create profiles in `knowledge-base/competitors/` for key competitors:

| Competitor | Sectors | Geography | Notes |
|---|---|---|---|
| AECOM | Infrastructure AM, transport advisory | National + NZ | Incumbent on many TfNSW panels |
| GHD | Engineering advisory, tunnels, water | National | Strong in VIC |
| WSP | Transport planning, systems engineering | National + NZ | Large scale |
| Jacobs | Tunnelling, transport, AM | National | WestConnex incumbent |
| Mott MacDonald | Rail, tunnels, international | National + UK | Inland Rail work |

#### Priority 5: Industry Standards

| Document | Entity | Category |
|---|---|---|
| ISO 55001 summary (asset management) | shared | methodology |
| ISO 44001 summary (collaborative business) | shared | methodology |
| WHS Act 2011 summary (relevant to tender compliance) | shared | methodology |
| Australian procurement standards | shared | methodology |
| NZ procurement guidelines (for GETS tenders) | shared | methodology |

### Ingestion Process

```bash
# For each new document:
# 1. Create .md file with YAML front-matter in knowledge-base/
# 2. Run ingestion:
python scripts/ingest-knowledge-base.py --file knowledge-base/{filename}.md --entity {entity} --category {category}
# 3. Verify:
python scripts/test-semantic-search.py
```

### KB Architecture After Enhancement

```
knowledge-base/
├── cbs-group-*                  (existing: 212 files, tender + IP + financial)
├── waterroads-*                 (existing: 13 files, business case + governance)
├── competitors/                 (new: 5-10 competitor profiles)
│   ├── competitor-aecom.md
│   ├── competitor-ghd.md
│   └── ...
├── shipley-framework.md         (new: Shipley methodology for CBS context)
├── shipley-quality-gates.md     (new: Bronze/Silver/Gold definitions)
├── cbs-win-loss-history.md      (new: tender outcomes register)
├── iso-55001-summary.md         (new: shared entity)
├── iso-44001-summary.md         (new: shared entity)
└── nz-procurement-guide.md      (new: shared entity, for GETS tenders)
```

---

## 5. Implementation Sequence

| Phase | Items | Effort | Dependency |
|---|---|---|---|
| **Now** | Budget + heartbeat changes | Done | — |
| **Phase A** | Create Shipley framework KB content, create tender-workflow skill, update Tender Coordination with Bronze/Silver/Gold | 1 session | — |
| **Phase B** | Merge SOUL.md directives into AGENTS.md, enhance cbs-capital-framework skill | 1 session | — |
| **Phase C** | Author competitor profiles, ingest industry standards | 1 session + Jeff input for competitor data |
| **Phase D** | Ingest CBS win/loss history | Requires Jeff to export from CBS records |
| **Phase E** | Create new skills (shipley-process, graph-mail-read, competitor-analysis) | 1 session | Phase A + C |

Phases A and B can be done now. Phases C and D need your input on competitor data and win/loss records.

---

*Want me to proceed with Phase A (Shipley + Bronze/Silver/Gold workflow) now?*
