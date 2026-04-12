# Project River — Agent Roster and Definitions

**Date:** 12 April 2026
**Agents:** 12 (9 CBS Group + 3 WaterRoads)

---

## Architecture Overview

Each agent is defined by a single AGENTS.md file at `agent-instructions/{agent-name}/AGENTS.md`. This file is loaded as the agent's `promptTemplate` (system prompt) in Paperclip. It contains everything the agent needs: identity, hard stops, delegation rules, KB retrieval protocol, tender register usage, correction retrieval, output quality signal, and the full heartbeat protocol.

Supporting files (HEARTBEAT.md, SOUL.md, TOOLS.md) exist in each directory for reference but are NOT automatically read by agents — only the promptTemplate content is injected at runtime.

### Common Sections (all 12 agents)

Every AGENTS.md contains these mandatory sections:

1. **Identity and Mission** — agent name, tier, entity, role description
2. **Hard Stop Prohibitions** — 6 prohibitions (no external comms, no portal submit, no Xero write, no external publish, no approval execution, no financial fabrication)
3. **Escalation with Teams Notification** — escalation path + mandatory Teams notification
4. **Correction Retrieval** — feedback-loop skill query before substantive output
5. **Mandatory KB Retrieval Protocol** — Voyage AI embedding + Supabase match_documents (verifiable citations required)
6. **Output Quality Signal** — exact query terms, source_file names, similarity scores
7. **Heartbeat Protocol** — embedded step-by-step wake protocol ("DO THE WORK")

---

## CBS Group Agents (9)

### Tier 1 — Executive

#### CBS Executive
| Field | Value |
|---|---|
| File | `agent-instructions/cbs-executive/AGENTS.md` |
| Paperclip Role | ceo |
| Model | Opus 4.6 |
| Heartbeat | 21,600s (6 hours) |
| Budget | $25/month |
| Reports To | Jeff Dusting |

**Purpose:** Strategic oversight, delegation, and board-level coordination. Triages incoming work, delegates to functional agents, synthesises reporting. Does NOT perform individual contributor work.

**Key responsibilities:**
- Tender Go/Watch/Pass decisions (reviews scorecards from Tender Intelligence, records decisions in tender_register)
- Delegates to: Tender Intelligence, Tender Coordination, Governance CBS, Office Management CBS
- Does NOT delegate directly to Tier 3 agents — routes through Tier 2
- Automated handoff: Go decision → creates subtask for Tender Coordination with scorecard attached

---

### Tier 2 — Functional Leads

#### Tender Intelligence
| Field | Value |
|---|---|
| File | `agent-instructions/tender-intelligence/AGENTS.md` |
| Paperclip Role | researcher |
| Model | Sonnet 4 |
| Heartbeat | 86,400s (24 hours) |
| Budget | $15/month |
| Reports To | CBS Executive |

**Purpose:** Monitors tender portals for opportunities matching CBS Group's capability profile. Produces structured qualification scorecards.

**Key responsibilities:**
- Daily email scan via Graph API Mail.Read (AusTender, Tenders.NSW, Buying for Victoria, GETS NZ, Inland Rail)
- Deduplication via Supabase tender_register (check before processing, register new tenders)
- 7-dimension weighted scorecard (sector alignment, CAPITAL applicability, contract value, client history, competitive position, resources, strategic value)
- Competitor intelligence: queries KB for competitor profiles before scoring
- Lookback: 14 days first run, 4 days daily
- Delegates deep research to Research CBS Agent

#### Tender Coordination
| Field | Value |
|---|---|
| File | `agent-instructions/tender-coordination/AGENTS.md` |
| Paperclip Role | pm |
| Model | Sonnet 4 |
| Heartbeat | 14,400s (4 hours) |
| Budget | $20/month |
| Reports To | CBS Executive |

**Purpose:** Manages the tender response workflow from Go decision through to submission-ready draft.

**Key responsibilities:**
- Receives Go decision from CBS Executive with scorecard attached
- Creates subtasks for: Technical Writing (methodology), Compliance (mandatory criteria), Pricing and Commercial (fee schedule)
- Each subtask includes scorecard evidence, KB sources, deadlines, evaluation criteria
- Monitors progress, follows up on overdue tasks
- Assembles final response, delivers to SharePoint
- Creates `in_review` approval request — human submits to portal

#### Governance CBS
| Field | Value |
|---|---|
| File | `agent-instructions/governance-cbs/AGENTS.md` |
| Paperclip Role | pm |
| Model | Sonnet 4 |
| Heartbeat | 86,400s (24 hours, routine-driven) |
| Budget | $15/month |
| Reports To | CBS Executive |

**Purpose:** Manages the CBS Group governance cycle: board paper preparation, meeting scheduling, resolution tracking, minute management.

**Key responsibilities:**
- 3-week board paper cycle (routine-triggered on 1st and 22nd of each month)
- Pulls financial data from Xero (read-only) for board paper financials
- 7-section board paper template (executive summary, financial, operations, governance, risks, strategic, resolutions)
- Approval gate: marks `in_review` for Jeff Dusting before SharePoint delivery
- Xero access: read-only, must not create/modify/delete any financial record

#### Office Management CBS
| Field | Value |
|---|---|
| File | `agent-instructions/office-management-cbs/AGENTS.md` |
| Paperclip Role | general |
| Model | Haiku 4.5 |
| Heartbeat | 43,200s (12 hours) |
| Budget | $4/month |
| Reports To | CBS Executive |

**Purpose:** Administrative coordination: meeting scheduling, correspondence flagging, document filing.

**Key responsibilities:**
- Meeting agendas and pre-meeting briefs
- Correspondence categorisation (tender, governance, financial, general)
- Document filing to SharePoint with naming conventions
- Does NOT delegate — routes specialist items to CBS Executive

---

### Tier 3 — Specialists

#### Technical Writing
| Field | Value |
|---|---|
| File | `agent-instructions/technical-writing/AGENTS.md` |
| Paperclip Role | engineer |
| Model | Sonnet 4 |
| Heartbeat | 86,400s (24 hours, on-demand) |
| Budget | $25/month |
| Reports To | Tender Coordination |

**Purpose:** Drafts technical narrative sections for tender responses: methodology descriptions, case study write-ups, capability statements.

**Key responsibilities:**
- Queries KB for CAPITAL framework methodology, past tender content, personnel CVs
- Produces tender sections citing specific KB evidence
- Cannot delegate to other agents

#### Compliance
| Field | Value |
|---|---|
| File | `agent-instructions/compliance/AGENTS.md` |
| Paperclip Role | qa |
| Model | Haiku 4.5 |
| Heartbeat | 86,400s (24 hours, on-demand) |
| Budget | $5/month |
| Reports To | Tender Coordination |

**Purpose:** Reviews tender mandatory criteria, compliance checklists, regulatory requirement mapping.

**Key responsibilities:**
- Maps each mandatory criterion to CBS Group evidence from KB
- Flags gaps where evidence is insufficient
- Produces compliance matrices and condition-of-participation responses
- Cannot delegate

#### Pricing and Commercial
| Field | Value |
|---|---|
| File | `agent-instructions/pricing-commercial/AGENTS.md` |
| Paperclip Role | general |
| Model | Sonnet 4 |
| Heartbeat | 86,400s (24 hours, on-demand) |
| Budget | $10/month |
| Reports To | Tender Coordination |

**Purpose:** Prepares pricing narratives, value-based commercial structures, fee schedule drafts.

**Key responsibilities:**
- Queries KB for CBS Group fee structure methodology and CAPITAL value-based pricing
- Produces conforming and alternative commercial offers
- Xero read access for financial reference data
- Cannot delegate

#### Research CBS
| Field | Value |
|---|---|
| File | `agent-instructions/research-cbs/AGENTS.md` |
| Paperclip Role | researcher |
| Model | Sonnet 4 |
| Heartbeat | 86,400s (24 hours, on-demand) |
| Budget | $10/month |
| Reports To | Tender Intelligence |

**Purpose:** Deep-dive research on specific topics: market analysis, competitor intelligence, client background, technical research.

**Key responsibilities:**
- Receives research briefs from Tender Intelligence or CBS Executive
- Queries KB and web search for information
- Produces structured research summaries
- Cannot delegate

---

## WaterRoads Agents (3)

### Tier 1 — Executive

#### WR Executive
| Field | Value |
|---|---|
| File | `agent-instructions/wr-executive/AGENTS.md` |
| Paperclip Role | ceo |
| Model | Sonnet 4 |
| Heartbeat | 21,600s (6 hours) |
| Budget | $15/month |
| Reports To | Jeff Dusting and Sarah Taylor (joint directors) |

**Purpose:** Strategic oversight, delegation, and board-level coordination for WaterRoads.

**Key responsibilities:**
- Joint director authority: Jeff Dusting and Sarah Taylor both required for resolutions
- WaterRoads mission: zero-emission electric ferry routes, Rhodes to Barangaroo, PPP with NSW Government
- Delegates to: Governance WR (board papers, resolutions), Office Management WR (admin, filing)
- No operations agents active — operational matters marked `in_review` for human handling
- Flags matters involving expenditure, legal commitment, or external representation to both directors

### Tier 2 — Functional

#### Governance WR
| Field | Value |
|---|---|
| File | `agent-instructions/governance-wr/AGENTS.md` |
| Paperclip Role | pm |
| Model | Sonnet 4 |
| Heartbeat | 86,400s (24 hours, routine-driven) |
| Budget | $15/month |
| Reports To | WR Executive |

**Purpose:** WaterRoads governance cycle: board paper preparation, resolution tracking, minute management.

**Key responsibilities:**
- 3-week board paper cycle (routine-triggered, 1st and 22nd of month)
- 7-section WR board paper template: executive summary, financial, PPP progress, operations/route development, investor matters, regulatory/environmental, actions required
- All resolutions require both Jeff Dusting and Sarah Taylor signatures
- Xero read-only access for financial data
- Approval gate: both directors must approve before SharePoint delivery

#### Office Management WR
| Field | Value |
|---|---|
| File | `agent-instructions/office-management-wr/AGENTS.md` |
| Paperclip Role | general |
| Model | Haiku 4.5 |
| Heartbeat | 43,200s (12 hours) |
| Budget | $4/month |
| Reports To | WR Executive |

**Purpose:** Administrative coordination for WaterRoads: meeting scheduling, correspondence flagging, document filing.

**Key responsibilities:**
- Both directors reflected in all governance-related admin
- Document filing to SharePoint: Governance, PPP, Investor Relations, Regulatory, Correspondence folders
- Naming convention: [Type]-[Date]-[Description].[ext]
- Does NOT delegate — routes specialist items to WR Executive

---

## Org Chart

```
CBS Group                           WaterRoads
─────────                           ──────────
Jeff Dusting                        Jeff Dusting + Sarah Taylor
    │                                   │
CBS Executive (Opus 4.6)            WR Executive (Sonnet 4)
    ├── Tender Intelligence             ├── Governance WR (Sonnet 4)
    │       └── Research CBS            └── Office Management WR (Haiku 4.5)
    ├── Tender Coordination
    │       ├── Technical Writing
    │       ├── Compliance
    │       └── Pricing and Commercial
    ├── Governance CBS
    └── Office Management CBS
```

## Budget Summary

| Entity | Agents | Monthly Budget | Model Mix |
|---|---|---|---|
| CBS Group | 9 | $129/month | 1× Opus 4.6, 6× Sonnet 4, 2× Haiku 4.5 |
| WaterRoads | 3 | $34/month | 2× Sonnet 4, 1× Haiku 4.5 |
| **Total** | **12** | **$163/month** | |

---

## File Locations

Each agent has 4 instruction files (AGENTS.md is the authoritative source loaded as `promptTemplate`):

```
agent-instructions/
├── cbs-executive/         AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── tender-intelligence/   AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── tender-coordination/   AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── technical-writing/     AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── compliance/            AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── pricing-commercial/    AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── governance-cbs/        AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── office-management-cbs/ AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── research-cbs/          AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── wr-executive/          AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── governance-wr/         AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
├── office-management-wr/  AGENTS.md  HEARTBEAT.md  SOUL.md  TOOLS.md
└── company-missions.md
```

The full content of all 12 AGENTS.md files is available at:
`/Users/jeffdusting/.claude/projects/-Users-jeffdusting-Desktop-Projects-River/f8fc9063-4824-4563-82b4-a76cd976a28f/tool-results/b9xmza0pn.txt`
