# Target KB Structure — Post-Rationalisation

**Date:** 15 April 2026
**Purpose:** Defines the expected file and data structure for both knowledge bases after the kb-rationalization programme completes. This is the target state, not the current state.

---

## 1. WR Knowledge Base — Google Drive Canonical Structure

The WR KB Shared Drive (`0AFIfqhhhv9HjUk9PVA`) was provisioned with a 30-folder canonical structure by `scripts/wr-create-folders.py`. Content currently sits in flat "Imported from Dropbox" and "Imported from SharePoint" layouts. After WR-P1, all content moves into the canonical structure below.

### 1.1 Target Drive Folder Structure

```
WR KB Shared Drive (0AFIfqhhhv9HjUk9PVA)
│
├── Governance/
│   ├── Board Papers/              ← board paper drafts, final versions, presentations
│   ├── Minutes/                   ← meeting minutes (board, committee, shareholder)
│   ├── Resolutions/               ← director resolutions, circular resolutions
│   ├── Registers/                 ← ASIC registers, share register, conflicts register
│   ├── Constitution/              ← company constitution, shareholder agreements
│   └── Compliance/                ← Corporations Act compliance, ASIC filings, annual returns
│
├── PPP/
│   ├── Proposal/                  ← PPP proposal documents, business case, submissions
│   ├── Government Engagement/     ← TfNSW correspondence, NSW Govt submissions, MOUs
│   ├── Route Analysis/            ← Rhodes–Barangaroo analysis, demand modelling, traffic studies
│   ├── Regulatory/                ← maritime licensing, safety management, AMSA, RMS
│   └── Precedents/                ← reference PPP structures, case studies, comparators
│
├── Financial/
│   ├── Models/                    ← financial models, cash flow projections, NPV analysis
│   ├── Budgets/                   ← annual budgets, capex/opex budgets
│   ├── Investor Materials/        ← investor decks, term sheets, ROI analyses
│   ├── Tax and Structure/         ← tax advice, corporate structure, entity setup
│   └── Reports/                   ← monthly/quarterly financial reports, Xero extracts
│
├── Investor Relations/
│   ├── Data Room/                 ← due diligence documents, information memoranda
│   ├── Updates/                   ← investor updates, newsletters, progress reports
│   └── Agreements/                ← subscription agreements, SHA, side letters
│
├── Technical/
│   ├── Fleet/                     ← vessel specifications, electric hydrofoil technical data
│   ├── Infrastructure/            ← wharf design, charging infrastructure, berthing
│   ├── Environmental/             ← environmental assessments, CO2 calculations, EIS
│   ├── Safety/                    ← safety management system, risk assessments, SMS
│   └── Standards/                 ← applicable standards, survey requirements, classification
│
├── Operations/
│   ├── Route Plans/               ← timetables, service frequency, crewing plans
│   ├── Maintenance/               ← maintenance schedules, asset management plans
│   └── Procedures/                ← SOPs, emergency procedures, operational manuals
│
├── Commercial/
│   ├── Market Analysis/           ← congestion cost analysis, market research, 60+ city study
│   ├── Pricing/                   ← fare models, pricing strategy, concession pricing
│   └── Partnerships/              ← technology partners, operator agreements, MOU/LOI
│
├── Legal/
│   ├── Contracts/                 ← supplier contracts, service agreements
│   ├── IP/                        ← trademarks, patents, design registrations
│   └── Insurance/                 ← policy schedules, broker correspondence, claims
│
├── HR/
│   ├── ESOP/                      ← employee share option plans, vesting schedules
│   ├── Policies/                  ← HR policies, employment contracts, handbooks
│   └── Org Charts/                ← organisational structure, reporting lines
│
├── Reference/
│   ├── Industry Reports/          ← maritime transport research, ferry industry benchmarks
│   ├── Templates/                 ← document templates, letterheads, branded formats
│   └── Methodology/               ← CAPITAL framework (WR application), Shipley (response writing)
│
├── Marketing/
│   ├── Branding/                  ← logos, brand guidelines, style guides
│   ├── Presentations/             ← pitch decks, conference presentations
│   └── Website/                   ← web content drafts, media assets
│
└── Archive/
    ├── Imported from Dropbox/     ← EMPTY after reorg (or residual unclassifiable files)
    └── Imported from SharePoint/  ← EMPTY after reorg (or residual unclassifiable files)
```

### 1.2 Mapping Rules (from current import paths)

These are the expected mappings from WR-P0 path analysis. The actual mappings will be confirmed by the discovery phase and stored in `docs/kb-rationalization/wr-path-mapping.json`.

| Current path prefix | Target folder | Confidence |
|---|---|---|
| `Imported from Dropbox/Governance` | `Governance/` | High |
| `Imported from Dropbox/Board` | `Governance/Board Papers/` | High |
| `Imported from Dropbox/Minutes` | `Governance/Minutes/` | High |
| `Imported from Dropbox/Diligence Docs` | `Investor Relations/Data Room/` | High |
| `Imported from Dropbox/IM` | `Investor Relations/Updates/` | Medium |
| `Imported from Dropbox/Financial` | `Financial/` | High |
| `Imported from Dropbox/Models` | `Financial/Models/` | High |
| `Imported from Dropbox/PPP` | `PPP/Proposal/` | Medium |
| `Imported from Dropbox/ESOP` | `HR/ESOP/` | High |
| `Imported from Dropbox/Legal` | `Legal/` | High |
| `Imported from Dropbox/Technical` | `Technical/` | High |
| `Imported from Dropbox/Fleet` | `Technical/Fleet/` | High |
| `Imported from Dropbox/Safety` | `Technical/Safety/` | Medium |
| `Imported from Dropbox/Marketing` | `Marketing/` | High |
| `Imported from Dropbox/Branding` | `Marketing/Branding/` | High |
| `Imported from SharePoint/Board Papers` | `Governance/Board Papers/` | High |
| `Imported from SharePoint/Governance` | `Governance/` | High |
| `Imported from SharePoint/Financial` | `Financial/` | High |
| `Imported from SharePoint/Operations` | `Operations/` | Medium |
| Unclassifiable / ambiguous | `Archive/Unclassified/` | — |

### 1.3 WR Supabase — Post-Rationalisation

| Metric | Before | After (target) |
|---|---|---|
| Total rows in `documents` | 19,301 | ~10,000–14,000 (estimated 25–45% reduction from dedup) |
| Distinct `source_file` values | ~3,021 | ~2,000–2,500 (after removing true duplicates) |
| Paths referencing "Imported from" | ~19,000+ | 0 |
| `drive_file_id` coverage | ~100% | 100% (preserved through moves) |
| IVFFlat index `lists` | 40 | recalculated: `sqrt(final_rows)` |
| Retrieval: duplicate sources in top-5 | likely present | 0 |

### 1.4 WR Supabase `documents` Row Structure (unchanged)

```
id              UUID        (primary key)
entity          TEXT        'waterroads' (all rows)
source_file     TEXT        'Governance/Board Papers/2025-03-Board-Pack.pdf'  ← canonical path
title           TEXT        'March 2025 Board Pack'
content         TEXT        (extracted text chunk)
embedding       VECTOR(1024) (Voyage AI voyage-3.5)
category        TEXT        NULL or 'correction'
metadata        JSONB       {chunk_index, total_chunks, ...}
drive_file_id   TEXT        'abc123xyz'  ← preserved through Drive moves
drive_modified   TEXT        '2025-03-01T10:00:00Z'
created_at      TIMESTAMPTZ
```

---

## 2. CBS Knowledge Base — Post-Rationalisation

The CBS KB lives in `knowledge-base/` in the git repository and is ingested to CBS Supabase via `scripts/ingest-knowledge-base.py`. Unlike WR, there is no Google Drive intermediary (unless the CBS-P0 discovery recommends migration — see §2.4).

### 2.1 Current Source File Structure

```
knowledge-base/                               ~225 files, 1,308,775 words
│
├── MANIFEST.md                               225 entries with entity, category, title
├── RETRIEVAL_EVAL.md                         5 test queries for KB quality validation
│
├── corrections/                              4 files (grows via evaluator)
│   ├── 2026-04-14-tender-intel-no-fake-missing-capability.md
│   ├── 2026-04-14-tender-intel-emails-are-titles-only.md
│   ├── 2026-04-14-tender-coord-shipley-belongs-in-response-not-intake.md
│   └── 2026-04-14-all-agents-paste-script-output-verbatim.md
│
├── competitors/                              5 profiles + template
│   ├── competitor-template.md
│   ├── competitor-arcadis.md
│   ├── competitor-aecom.md
│   ├── competitor-wsp.md
│   ├── competitor-jacobs.md
│   └── competitor-ghd.md
│
├── Shipley/                                  Source Shipley methodology files
│   └── (xls, doc, potx files)
│
└── (remaining ~210 structured content files)
    ├── cbs-group-capability-statement.md
    ├── cbs-group-capital-framework-overview.md
    ├── cbs-group-capital-framework-detailed.md
    ├── cbs-group-western-harbour-tunnel-case-study.md
    ├── cbs-group-sydney-harbour-tunnel-case-study.md
    ├── cbs-group-m6-stage1-case-study.md
    ├── cbs-group-team-profiles.md
    ├── cbs-group-cake-model.md
    ├── waterroads-ppp-business-case.md
    ├── waterroads-rhodes-barangaroo-route.md
    ├── waterroads-financial-model-summary.md
    ├── (tender history, methodology docs, governance templates, etc.)
    └── ...
```

### 2.2 Target Source File Structure (post CBS-P1)

The file structure on disk is largely unchanged — CBS-P1 cleans the Supabase data, not the source files. The main structural changes are:

```
knowledge-base/
│
├── MANIFEST.md                               UPDATED — reflects actual indexed content
├── RETRIEVAL_EVAL.md                         UPDATED — additional tender-domain test queries
│
├── corrections/                              grows via evaluator → correction proposals
│
├── competitors/                              unchanged
│
├── Shipley/                                  unchanged (or consolidated if duplicates found)
│
└── (remaining content files)
    └── unchanged on disk — dedup happens in Supabase, not in source files
```

**The key changes are in Supabase, not on disk:**

### 2.3 CBS Supabase `documents` — Post-Rationalisation

| Metric | Before | After (target) |
|---|---|---|
| Total rows | 15,655 | ~1,500–3,000 (estimated 75–90% reduction — most excess is re-ingestion) |
| Source: initial KB ingest | ~1,422 | ~1,422 (deduplicated to originals) |
| Source: email intake accumulated | ~10,000+ | ~500–1,000 (genuine new content only, dupes removed) |
| Source: Shipley docs | ~500+ | ~200–300 (consolidated) |
| Source: corrections | 4 | 4+ (preserved, never deleted) |
| Source: competitors | ~30 | ~30 (preserved) |
| NULL entity tags | unknown | 0 |
| `match_documents` threshold | absent | present (default 0.0, recommended 0.3) |
| IVFFlat index `lists` | 100 | recalculated: `sqrt(final_rows)` |
| Retrieval: low-similarity noise | present | filtered by threshold |

### 2.4 CBS Supabase `documents` Row Structure — Post-Rationalisation

```
id              UUID        (primary key)
entity          TEXT        'cbs-group' | 'shared' | 'waterroads'  ← cleaned, no NULLs
source_file     TEXT        'knowledge-base/cbs-group-capital-framework-overview.md'
                            OR 'CBS KB Email: Infrastructure Advisory | 2026-04-15'
title           TEXT        'CAPITAL Framework Overview'
content         TEXT        (extracted text chunk)
embedding       VECTOR(1024) (Voyage AI voyage-3.5)
category        TEXT        'methodology' | 'tender' | 'governance' | 'template' |
                            'financial' | 'ip' | 'correction' | 'competitor' | NULL
metadata        JSONB       {chunk_index, total_chunks, email_message_id (if from intake)}
created_at      TIMESTAMPTZ

match_documents() NOW ACCEPTS:
  - match_threshold (default 0.0) — filters results below similarity threshold
  - Recommended usage: match_threshold = 0.3 for agent queries
```

### 2.5 CBS Drive Migration — Conditional

CBS-P0 discovery will assess whether migrating CBS KB to Google Drive is warranted. The decision depends on the root cause analysis:

**If CBS-P0 finds the primary problem is re-ingestion by the email intake routine** (likely), the fix is dedup + idempotency controls on the intake script, not a Drive migration. The current repo-based approach is simpler and works for 225 source files.

**If CBS-P0 finds the content management burden justifies Drive** (less likely for 225 files), the target CBS Drive structure would mirror WR:

```
CBS KB Shared Drive (hypothetical — only if migration proceeds)
│
├── Methodology/
│   ├── CAPITAL Framework/         ← CAPITAL methodology docs
│   ├── Shipley/                   ← proposal methodology
│   └── Standards/                 ← ISO 55001, ISO 44001, systems engineering
│
├── Tender History/
│   ├── Case Studies/              ← WHT, SHT, M6, completed tenders
│   ├── Capability Statements/     ← firm capability docs
│   └── Competitor Profiles/       ← competitor intelligence
│
├── Governance/
│   ├── Board Papers/              ← CBS board papers
│   ├── Templates/                 ← governance templates (currently in prompt-templates/)
│   └── Policies/                  ← corporate policies
│
├── Commercial/
│   ├── Pricing/                   ← value-based pricing models, CAKE model
│   ├── Proposals/                 ← historical proposals (sanitised)
│   └── Client Relationships/      ← client engagement history
│
├── Team/
│   ├── Profiles/                  ← team member CVs, capability summaries
│   └── Org Structure/             ← reporting lines, team composition
│
├── Financial/
│   ├── Reports/                   ← Xero extracts, financial summaries
│   └── Budgets/                   ← operational budgets
│
├── Reference/
│   ├── Industry/                  ← infrastructure industry reference material
│   └── Regulatory/                ← NSW transport regulatory docs
│
└── Corrections/                   ← evaluator-generated corrections (mirrors knowledge-base/corrections/)
```

**Recommendation:** Unless CBS-P0 finds a compelling operational reason, defer CBS Drive migration. The 225-file repo-based approach with the email intake fix is sufficient. The Drive migration adds complexity (new service account, new indexer instance, changed intake scripts) for a content set that Jeff directly manages.

---

## 3. Supabase `documents` Category Taxonomy

Both KBs should use a consistent category taxonomy after rationalisation.

| Category | Meaning | Used by |
|---|---|---|
| `methodology` | CAPITAL framework, Shipley, ISO standards, engineering methods | CBS |
| `tender` | Tender history, case studies, capability statements, scorecards | CBS |
| `governance` | Board papers, minutes, resolutions, compliance docs | CBS, WR |
| `template` | Prompt templates, document templates, standard formats | CBS, WR |
| `financial` | Financial models, budgets, reports, Xero extracts | CBS, WR |
| `ip` | Intellectual property, proprietary methods, trade secrets | CBS |
| `correction` | Evaluator-generated corrections (PROTECTED — never deleted by dedup) | CBS |
| `competitor` | Competitor profiles and intelligence | CBS |
| `operations` | Route plans, maintenance, SOPs, safety management | WR |
| `commercial` | Market analysis, pricing, partnership agreements | WR |
| `legal` | Contracts, IP registrations, insurance | WR |
| `investor` | Data room, investor updates, subscription agreements | WR |
| `technical` | Fleet specs, infrastructure design, environmental assessments | WR |
| `hr` | ESOP, employment policies, org charts | WR |
| NULL | Uncategorised — should be rare after rationalisation | Either |

---

## 4. Retrieval Quality Targets

After both KB rationalisations complete, retrieval should meet these benchmarks.

| Metric | Target |
|---|---|
| Duplicate sources in top-5 results | 0 |
| Results below 0.3 similarity returned | 0 (with threshold enabled) |
| Tender-domain queries returning relevant CAPITAL content | 100% (at least 2 hits above 0.4) |
| WR governance queries returning board paper content | 100% |
| Cross-entity leakage (WR query returns CBS-only content) | 0 |
| Average top similarity for domain-specific queries | > 0.5 |
| Source file paths referencing import folders | 0 (WR) |
| NULL entity tags | 0 (CBS) |
