# Project River — Backlog
**Compiled:** 2026-04-14
**Source:** Full review of session conversation + audit artefacts
**Owner:** Jeff Dusting

---

## Status legend
- ✅ **DONE** — completed and verified
- 🟢 **RUNNING** — automated process executing in background
- 🟡 **READY** — built and waiting on a one-time user action to activate
- 🟠 **PENDING DECISION** — needs user input before proceeding
- 🔵 **NOT STARTED** — known work, not yet begun
- ⚪ **DEFERRED** — explicitly parked
- ⚠️ **KNOWN ISSUE** — recognised limitation with no immediate fix

---

## A. WaterRoads KB Migration (original Option 4a plan)

The full multi-phase migration of WR content from Dropbox + SharePoint into Google Drive Shared Drive, then selectively into the WR Supabase project for vector search.

### Phase 1 — Infrastructure Setup
- ✅ Google Cloud project `river-waterroads-kb` created
- ✅ Google APIs enabled (Drive, Docs, Sheets)
- ✅ Service account `river-wr-agent@river-waterroads-kb.iam.gserviceaccount.com` + JSON key
- ✅ WaterRoads KB Shared Drive (id `0AFIfqhhhv9HjUk9PVA`) + members
- ✅ Folder structure created via `scripts/wr-create-folders.py` (30 folders)
- ✅ Supabase WR project `imbskgjkqvadnazzhbiw` created
- ✅ Schema deployed via `scripts/wr-supabase-schema.sql`

### Phase 2 — Bulk Content Transfer (rclone)
- ✅ rclone installed + remotes configured (gdrive via service account, dropbox via OAuth, sharepoint via OAuth)
- ✅ SharePoint remote drive_id corrected from personal OneDrive to LGGwaterroads document library
- ✅ Test transfer (10 files Pictures folder) verified
- ✅ **SharePoint full transfer COMPLETE** — 585 files, 4.94 GB
- ✅ **Dropbox full transfer COMPLETE** — 4,066 files, 24.5 GB

### Phase 3 — Selective Indexer
- ✅ Indexer script `scripts/wr-index-drive-content.py` built
  - Walks Drive, classifies, extracts text (.pdf .docx .xlsx .pptx .md .txt + Google native)
  - Skips: images, videos, zips, files >200 MB, paths matching `Pictures/`, `Logos/`, `Recordings/`
  - Embeds via Voyage AI voyage-3.5 (1024 dim), inserts to WR Supabase
  - Idempotent via `drive_file_id` + `drive_modified` check
- ✅ Live test (4 files, 28 chunks) — semantic search returns correct ESOP docs (sim 0.49–0.53)
- ✅ **SharePoint indexing** — ~291 files, ~1,100 chunks
- 🟢 **Dropbox indexing RUNNING** — 2,866 indexable files, ~338 done so far. ETA: overnight (8-10 hrs)
- 🔵 Cleanup leftover `_test_pictures` folder in Drive (service account couldn't delete; needs manual)

### Phase 4 — Reconfigure WR Agents
*Not started*
- 🔵 Update WR Executive agent env to use WR_SUPABASE_URL / WR_SUPABASE_SERVICE_ROLE_KEY
- 🔵 Update Governance WR agent env (same)
- 🔵 Update any other WR-scoped agents
- 🔵 Verify supabase-query skill works against new WR project (entity scoping)
- 🔵 Add `wr-drive-read` skill (or extend supabase-query) for direct Drive file fetch when KB hit references it

### Phase 3.5 — Re-organise WR Drive content into nominated folder structure
*Surfaced after the bulk import — content currently sits in `Imported from Dropbox` and `Imported from SharePoint` flat-ish layouts, not in the canonical Phase 1 folder structure (Governance/, PPP/, Financial/, etc.)*
- 🔵 Define mapping rules from imported folder names → canonical folders (e.g. `Diligence Docs/` → `Investor Relations/Data Room/`, `IM/` → `Investor Relations/Updates/`)
- 🔵 Build a Drive-move script that takes the mapping and physically relocates files (Drive API supports move via parent change)
- 🔵 Keep `drive_file_id` stable through moves (Drive preserves IDs on move) so the indexer treats it as unchanged — no re-embedding needed
- 🔵 Run the re-organisation
- 🔵 Update `source_file` paths in WR Supabase documents to reflect new locations (the path is just metadata; rewrite via SQL or re-index)
- 🔵 Verify WR Executive agent KB queries still work after reorganisation

### Phase 7 — Incremental Drive change detection + auto-index
*New requirement — keep WR KB current as Sarah edits/adds Drive docs*
- 🔵 Build `scripts/wr-drive-sync.py` — uses Drive API `changes.list` (delta token) to find files modified since last run
- 🔵 For each changed file: re-run extract + embed + replace existing chunks (idempotent code already exists in indexer)
- 🔵 For deleted files: remove corresponding chunks from `documents`
- 🔵 Persist the Drive change page token in `metadata` of a known config row (or new `kv_state` table) so deltas pick up where they left off
- 🔵 Register as a Paperclip routine — daily 4 AM (off-hours, no contention with morning routines)
- 🔵 Surface sync stats (added/changed/removed counts) on a "WR KB health" panel — could extend manager dashboard or new one

### WR KB Email Intake (NEW — built this session)
- ✅ `scripts/wr-kb-email-intake.py` — email jeff@cbs.com.au with subject "WR KB: <category> | <title>", attachments get uploaded to Drive + embedded + indexed
- ✅ Paperclip routine registered: `WR KB Email Intake` (id `4a57a02e-b20c-4e44-b40c-1cf0241b930c`), WR Executive, every 2 hours AEST business hours
- ✅ Supports: PDF, DOCX, XLSX, PPTX, MD, TXT, CSV attachments + body-only emails
- ✅ Auto-creates Drive folders matching category from subject line
- ✅ Marks processed emails as read (idempotent)
- 🔵 Test with a real email (send one with a test attachment)

### CBS KB Email Intake (NEW — built this session)
- ✅ `scripts/cbs-kb-email-intake.py` — email jeff@cbs.com.au with subject "CBS KB: <category> | <title>"
- ✅ Paperclip routine registered: `CBS KB Email Intake` (id `262af754-549d-4533-b171-442c40c0426c`), CBS Executive, every 2 hours AEST business hours
- ✅ Embeds directly into CBS Supabase (entity='cbs-group') — no Drive intermediary
- 🔵 Test with a real email

### URL Following (LinkedIn + News) — both WR and CBS intake scripts
- ✅ Detects LinkedIn posts/articles, major news sources, and infrastructure/government sites in email body
- ✅ Fetches page via httpx, extracts article text via BeautifulSoup
- ✅ Generates clean PDF (title, source URL, capture date, article text) via fpdf2
- ✅ WR: uploads PDF to Drive + embeds text into WR Supabase
- ✅ CBS: embeds text directly into CBS Supabase (no Drive)
- ✅ Capped at 5 URLs per email to prevent runaway
- 🔵 Test with a LinkedIn article link

### Phase 5 — Testing
*Not started*
- 🔵 Run a representative WR query through the WR Executive agent and confirm KB retrieval works
- 🔵 Verify entity scoping (WR query must NOT return CBS docs and vice versa)
- 🔵 Test Drive file resolution (clicking a KB hit takes you to the Drive doc)

### Phase 6 — Documentation Handover
*Not started*
- 🔵 Write WR-team-facing operating guide (how to add docs, how the sync works, how Sarah uses the dashboard)
- 🔵 Document the Drive-to-Supabase sync cadence (proposed: nightly re-index of changed files)

---

## B. Tender Lifecycle System (emerged this session)

End-to-end automation from email notification through go/no-go decision.

### Schema + Data
- ✅ `tender_register` extended with 21 lifecycle columns (`scripts/tender-lifecycle-schema.sql` applied)
- ✅ `tender_lifecycle_log` audit table created
- ✅ Backfill: existing `decision='go'` rows mapped to `lifecycle_stage='go'`

### Tender Intelligence agent
- ✅ Replaced 7-dim qualification scorecard at intake with cheap binary Interest Test
- ✅ Added `project management` to sector keywords (alongside existing `asset management`)
- ✅ Hard exclusions list (catering, cleaning, IT hardware, etc.)
- ✅ Inline Python extracted to `scripts/tender-scan.py` (audit finding #2)
- ✅ Live tested — 36 emails, 12 interest_passed, 11 interest_failed, 13 dupes
- 🔵 Refine SECTOR_KEYWORDS / GEOGRAPHY_OK based on first month of real Pursue/Skip decisions
- 🔵 Add WR-specific tender filtering once WR Executive starts assessing tenders

### Tender Coordination agent
- ✅ Added Pre-Response Lifecycle (Steps A–E) before existing Bronze/Silver/Gold workflow
- ✅ Step A: Pursue handling (looks for CA in Drive, runs ca-fill, transitions to ca_drafted)
- ✅ Step D: Go/No-Go assessment (7-dim scorecard now in correct place, after docs received)

### CA Workflow
- ✅ `skills/ca-fill/SKILL.md` — python-docx field substitution + signature insertion
- ✅ Signature image at `.secrets/jeff-signature.png` (renamed from "jeff-signature image.png")
- ✅ CBS standard values defined (company, ABN, address, signatory, position, email, phone)
- ✅ Apps Script `scripts/river-ca-sender.gs` deployed by user
- ✅ Web app URL stored in `.secrets/river-ca-sender-env.sh`
- ✅ Shared token generated and embedded
- ✅ Mail.ReadWrite Outlook drafts dropped (per user direction — Apps Script Gmail send is sole external send)
- 🔵 Test CA fill against a real client CA template once first tender is pursued
- 🔵 Verify signature insertion heuristic works for varied template layouts (may need refinement)

### Inbound Monitor
- ✅ `scripts/tender-inbound-monitor.py` built — two passes (sent CA detection + reply-with-attachments filing)
- ✅ Filing logic creates `Tenders/{REF}/` Drive folders, downloads attachments
- ✅ **Daily Tender Inbound Monitor registered** — routine id `286c2cd7-d561-423e-934d-b993f955da7c`, 8 AM daily, tested live (0 transitions as expected — no tenders at ca_drafted/ca_sent yet)

### Dashboard
- ✅ `monitoring/tender-dashboard.html` — lifecycle-aware view with Pursue/Skip/Withdraw/GO/NO-GO buttons
- ✅ Source colour-coding, sidebar stats, filter (active/all/resolved)
- ✅ `monitoring/manager-dashboard.html` linked to it
- ✅ `monitoring/serve.sh` for local hosting (avoids `file://` CORS issue)
- ✅ **Hosted on Vercel** — `https://monitoring-virid.vercel.app/tender-dashboard.html` (key server-side via proxy)

### End-to-end
- ✅ Real scan populated dashboard with 12 interest_passed tenders ready for Pursue/Skip
- 🔵 First real Pursue → CA fill → send → docs received → Go/No-Go cycle (needs human action when a tender qualifies)
- 🔵 Refine flow based on first 2-3 real cycles

---

## C. Hyper-Agent Audit Follow-ups

Audit at `docs/current-state-audit/` produced 5 top architecture implications. Status:

- ✅ **#1 Feedback loop unused** — 4 corrections seeded, JSONB metadata bug fixed, `feedback-loop` skill enhanced to also fetch `agent_role='all'`
- ✅ **#2 Tender Intel inline Python** — extracted to `scripts/tender-scan.py`, AGENTS.md slimmed
- 🔵 **#3 No output evaluator** — biggest remaining gap. No agent currently scores other agents' work or enforces the mandatory KB retrieval protocol. Would require a new evaluator agent + scoring schema.
- 🟢 **#4 WR agents have no KB content** — being addressed by the migration above (Phases 2 + 3)
- ⚠️ **#5 Apps Script cookie auth fragility** — known issue; rivertasks@cbs.com.au intake works but cookie expires periodically. No fix until Paperclip adds API key support for external integrations.

### Audit re-run
- ✅ **Audit v2 completed** (2026-04-14) — 7 artefacts in `docs/current-state-audit-v2/`, 77 backlog items validated. Top finding unchanged: output evaluator is the #1 gap.

---

## D. Cross-Cutting / Infrastructure

### Dashboard hosting — Vercel (DEPLOYED)
- ✅ Hosting platform decision: Vercel
- ✅ Built `vercel.json` + `api/supabase.js` edge serverless proxy
- ✅ Deployed to Vercel — `https://monitoring-virid.vercel.app`
- ✅ Supabase env vars set server-side (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- ✅ Proxy verified — returns live tender data, HTTP 200
- ✅ Service role key removed from deployed HTML (localhost fallback only for local dev)
- ✅ Tender dashboard: `https://monitoring-virid.vercel.app/tender-dashboard.html`
- ✅ Manager dashboard: `https://monitoring-virid.vercel.app/manager-dashboard.html`
- 🔵 Add Vercel deployment protection (password gate) for access control
- 🔵 Pick custom domain (e.g. `dashboards.cbs.com.au`) or keep `monitoring-virid.vercel.app`
- 🔵 Update agent Teams notification URLs to point at Vercel URLs
- 🔵 Smoke-test that Sarah Taylor can access
- ⚠️ Manager dashboard Paperclip API calls use `credentials: include` — cookie auth won't work cross-origin from Vercel. Manager dashboard works locally only until Paperclip adds CORS support for the Vercel domain. Tender dashboard works fully on Vercel.

### Paperclip routines (cron jobs)
- ✅ Daily tender opportunity scan (Tender Intelligence, 7am) — already exists
- ✅ Board paper preparation cycle (Governance CBS, 8am 1st & 22nd) — already exists
- ✅ Board paper preparation cycle (Governance WR) — already exists
- ✅ Weekly Agent Governance Audit — already exists
- ✅ **Daily Tender Inbound Monitor (8 AM)** — registered (routine id `286c2cd7-d561-423e-934d-b993f955da7c`, assigned to Tender Coordination, in Tender Pipeline project)
- 🔵 Nightly WR Drive change-detector — re-runs indexer for files where `drive_modified` has changed (idempotent script supports this; needs routine)
- 🔵 Monthly KB health check — count documents by category, flag empty buckets

### Authentication / Security
- ⚠️ Service role keys in environment files, shared with developer machine. Acceptable for current 1-2 user scope; revisit if team grows.
- ⚠️ Apps Script email intake (rivertasks@cbs.com.au) cookie auth — has alerting on 401/403, but rotation is manual
- ✅ Dashboard service role key removed from deployed HTML — Vercel proxy handles auth server-side. Localhost fallback retains key for local dev only.

### Monitoring & observability
- 🔵 Centralise script logs (currently scattered: `/tmp/rclone-*.log`, `/tmp/wr-indexer-*.log`)
- 🔵 Cost tracking dashboard (Voyage AI usage, Anthropic API per-agent cost)
- 🔵 Heartbeat liveness panel on manager dashboard (which agents fired today, which missed)

---

## E. Ongoing / Awaiting Verification

- ⚠️ **ARTC tender notifications NOT arriving** — verified 2026-04-14: zero emails from tenderlink/artc in last 14 days despite user confirming registration. Either: (a) registration didn't fully complete, (b) no matching tenders posted, or (c) notifications going to a different email. User should log into portal.tenderlink.com/artc and verify notification settings + check which email they registered.
- ✅ **CBS Executive 2 terminated** (2026-04-14) — Paperclip uses `status='terminated'` as soft-delete; record retained for audit, agent removed from dashboards and won't run heartbeat
- ✅ **Orphan "CBS Group" company neutralised** (2026-04-14) — `f353f31a-...` was already at company `status='archived'`. Terminated its sole CEO agent (`640c0e30-...`). Hard-delete via API returns 500 (likely FK constraints from billing/audit records); soft-delete is the achievable end-state.
- 🔵 If full hard-delete of archived companies is desired, raise with Paperclip support — needs DB-level intervention.
- 🔵 First end-to-end tender flow with a real opportunity (best validation; happens organically when something qualifies)
- 🔵 Test Sarah Taylor's access to dashboard (once hosted)
- 🔵 Verify Apps Script test email landed in jeff@cbsaustralia.com.au inbox after deployment

---

## F. Future Capabilities

### F1. Email-Driven CRM + Governance Correspondence Workflow
*Founder-defined capability — corporate governance context*

**Concept:** The founder defines a set of Google email addresses that agents are authorised to read. Agents then use email content to drive two core corporate workflows.

#### F1a. CRM Update from Email
- 🔵 **Founder configures authorised email addresses** (e.g. jeff@cbsaustralia.com.au, sarah@cbs.com.au) via a governance-controlled allow-list (not hardcoded)
- 🔵 **Agent reads email via Gmail API** (service account with domain-wide delegation, or OAuth per-user)
- 🔵 **Classifies correspondence** — client relationship, prospect, supplier, partner, regulatory
- 🔵 **Extracts CRM-relevant data** — contact names, organisations, topics, action items, sentiment, dates
- 🔵 **Updates CRM.cbslab.app** — creates/updates contacts, logs interactions, attaches email metadata (NOT full body — privacy boundary)
- 🔵 **Governance controls:** opt-out list for sensitive senders, redaction rules for privileged content, audit log of every CRM write

#### F1b. Board Correspondence Review (Corporations Act compliance)
- 🔵 **Agent reviews authorised mailboxes** for correspondence relevant to board governance: material contracts, regulatory notices, legal communications, stakeholder issues, financial commitments
- 🔵 **Filters with regard to:** confidentiality (suppress privileged content), probity (flag conflicts of interest), corporate governance (identify matters requiring board awareness under the Corporations Act 2001)
- 🔵 **Produces a "Correspondence for Board Attention" register** — items flagged for inclusion in next board meeting pack
- 🔵 **Classification categories:** material contract correspondence, regulatory/compliance notices, shareholder/investor communications, legal matters, risk events, stakeholder escalations
- 🔵 **Hard stops:** agent NEVER forwards or quotes privileged legal correspondence without explicit human approval; agent flags but does not decide on materiality thresholds — the board makes that call
- 🔵 **Output:** structured register entry per flagged item (date, parties, topic, governance category, recommended board action, confidentiality rating)

#### F1c. Board Meeting Lifecycle (invitations, agendas, minutes)
- 🔵 **Meeting scheduling** — agent creates Google Calendar invitations for board meetings using authorised calendar access, includes dial-in/location, distributes standing agenda template
- 🔵 **Agenda generation** — agent compiles agenda from: standing items, items from Correspondence Register (F1b), open action items from prior minutes, items flagged by CEO agent, items from governance register
- 🔵 **Agenda approval gate** — draft agenda set to `in_review` on dashboard for chair/secretary approval before distribution
- 🔵 **Minutes drafting** — after meeting, agent produces structured minutes from: agenda items, decisions recorded, action items with owners and due dates
- 🔵 **Minutes approval workflow** — draft minutes → chair review (`in_review`) → approved → filed to Drive (Governance/Minutes/) + SharePoint + governance_register
- 🔵 **Action item tracking** — extracted actions assigned as Paperclip issues to CEO agent, who delegates to appropriate Tier 2/3 agents; tracked to completion and reported in next meeting's agenda

#### Prerequisites
- 🔵 Gmail API integration with domain-wide delegation (or per-user OAuth) for cbsaustralia.com.au and cbs.com.au accounts
- 🔵 CRM.cbslab.app API documentation and auth mechanism
- 🔵 Governance allow-list schema (which emails, which agents, what scope)
- 🔵 Legal review of automated email reading under Australian Privacy Act + Corporations Act
- 🔵 Board meeting cadence and standing agenda template from Jeff/Sarah

---

### F2. Read.ai Meeting Intelligence Workflow
*Founder-defined capability — meeting transcript → actions pipeline*

**Concept:** Read.ai captures meeting transcripts automatically. The agent workforce ingests these transcripts and produces structured meeting outputs that feed into the governance and delegation systems.

#### F2a. Transcript Ingestion
- 🔵 **Integration with Read.ai** — determine delivery mechanism: Read.ai webhook, email delivery of transcript, or API pull. Read.ai supports email delivery of transcripts + summaries to a nominated address.
- 🔵 **Ingest pipeline** — transcript arrives (email attachment or API) → agent parses into structured format: participants, timestamps, topics, decisions, action items
- 🔵 **Storage** — raw transcript filed in Drive (Governance/Minutes/ or meeting-specific folder), structured data stored in Supabase for retrieval
- 🔵 **Entity detection** — identify which entity (CBS, WR, etc.) the meeting relates to based on participants and calendar event metadata

#### F2b. Minutes Generation from Transcript
- 🔵 **Agent produces formal minutes** from transcript + agenda: attendance, apologies, declaration of interests, matters arising, agenda item discussion summaries, resolutions, action items
- 🔵 **Minutes conform to Corporations Act requirements** for board meetings: proper form, resolution wording, voting records where applicable
- 🔵 **Cross-reference with agenda** — each agenda item mapped to transcript discussion segment; items not discussed flagged as "deferred to next meeting"
- 🔵 **Approval workflow** — draft minutes → `in_review` on dashboard → chair approves → filed to Drive + governance_register
- 🔵 **Version control** — minutes stored with version history; corrections tracked

#### F2c. Action Item Extraction and Delegation
- 🔵 **Extract action items** from transcript with: description, owner (human name), due date (explicit or inferred from context), priority, related agenda item
- 🔵 **Map human owners to agent delegation** — action items owned by Jeff → assigned to CEO agent as Paperclip issues; CEO agent decomposes and delegates to appropriate Tier 2/3 agents
- 🔵 **Action tracking** — each action tracked through lifecycle: assigned → in_progress → done → reported back in next meeting's "matters arising"
- 🔵 **Overdue alerting** — actions approaching or past due date trigger Teams notification to owner + CEO agent
- 🔵 **Reporting** — next meeting's agenda automatically includes "Action Item Status" section compiled from issue tracker

#### F2d. Agenda Management for Future Meetings
- 🔵 **Rolling agenda** — as actions are completed, new items surface, and correspondence is flagged (F1b), the agent maintains a draft agenda for the next scheduled meeting
- 🔵 **Standing items** populated automatically: previous minutes approval, matters arising, action item review, financial report, governance report
- 🔵 **Ad-hoc items** added by: CEO agent (from delegation outcomes), Governance agent (from compliance events), humans (via dashboard or email)
- 🔵 **Pre-meeting pack generation** — N days before meeting, agent compiles: agenda, board papers (from Governance agent), financial summary, outstanding actions, correspondence register items → distributed via email or Drive link

#### Prerequisites
- 🔵 Read.ai account integration — confirm delivery method (email vs API vs webhook)
- 🔵 Standing agenda template for each meeting type (board, executive, project)
- 🔵 Mapping of human participants → Paperclip agent delegation targets
- 🔵 Minutes template conforming to Corporations Act s 251A requirements
- 🔵 Calendar integration (already have Google Calendar via service account — extend to meeting-specific events)

---

### F3. White Paper Authoring + Publishing Workflow
*Founder-defined capability — thought leadership content pipeline*

**Concept:** Agents draft white papers using CBS or WR branded templates, then publish to the company website (Webflow) and promote via LinkedIn.

#### F3a. White Paper Drafting
- 🔵 **Template library** — CBS and WR branded Word/Google Docs templates stored in Drive (Templates/ folder), each with standard cover page, headers, footer, styles
- 🔵 **Agent produces draft** — Technical Writing agent (or Research CBS) given a topic brief, researches via KB + external sources, produces structured white paper (executive summary, problem statement, methodology, findings, recommendations, about CBS)
- 🔵 **Mandatory KB grounding** — all claims must cite CBS project history, CAPITAL methodology evidence, or industry standards from the knowledge base
- 🔵 **Review workflow** — draft → `in_review` on dashboard → Jeff/Sarah review → feedback loop → Gold draft → filed to Drive (Reference/ or appropriate folder)
- 🔵 **Version tracking** — each draft version stored with diff; corrections fed back as agent corrections for future papers

#### F3b. Webflow Publishing
- 🔵 **Webflow CMS API integration** — authenticate to CBS Group Webflow site via API token
- 🔵 **Upload white paper** — agent converts approved white paper to PDF, uploads as a Webflow CMS item (blog post / resources section)
- 🔵 **Metadata completion** — agent fills CMS fields: title, slug, excerpt, author, publish date, category/tags, featured image (from template or generated), SEO description, download link
- 🔵 **Approval gate** — CMS item created in draft state → preview link sent to Jeff for review → Jeff approves → agent publishes (or Jeff publishes manually)
- 🔵 **Hard stop:** agent NEVER publishes to live Webflow without explicit human approval

#### F3c. LinkedIn Promotion
- 🔵 **Draft LinkedIn post** — agent produces 2-3 LinkedIn post variants per white paper: different hooks, different angles, appropriate length (1300 chars for standard, 3000 for articles)
- 🔵 **Include:** key insight from the paper, a question or provocation, relevant hashtags, link to Webflow-hosted paper
- 🔵 **Approval gate** — drafts presented on dashboard → Jeff/Sarah pick preferred variant or edit → approve
- 🔵 **Publishing options:** (a) agent posts via LinkedIn API (requires LinkedIn app + OAuth), (b) agent drafts the post and Jeff/Sarah paste into LinkedIn manually (simpler, no API risk)
- 🔵 **Hard stop:** agent NEVER posts to LinkedIn without explicit human approval — reputational risk boundary

#### Prerequisites
- 🔵 CBS and WR Word/Docs templates with branding
- 🔵 Webflow API token + CMS collection structure for resources/blog
- 🔵 LinkedIn decision: API publishing (needs LinkedIn developer app + OAuth + company page admin) vs manual paste workflow
- 🔵 SEO keyword strategy / content calendar (optional — agent can propose topics from KB gaps and tender intelligence trends)

---

## I. Hyper-Agent v1 Programme (hyper-agent-v1)

### Evaluator Infrastructure
- ✅ Supabase schema: agent_traces, evaluation_scores, rubric_versions, correction_proposals
- ✅ Rubric v1.0 seeded (6 dimensions, pass threshold 3.5)
- ✅ Evaluation event definitions (sync/async/self-check classification)

### Evaluation Pipeline
- ✅ Async evaluator: scripts/evaluate-outputs.py
- ✅ Sync review gate: scripts/sync-evaluate.py
- ✅ Self-check skill: skills/self-check/SKILL.md
- ✅ Correction proposal generator (integrated in evaluator)
- ✅ Correction proposal review tool: scripts/review-correction-proposals.py
- ✅ Evaluator library: scripts/lib/evaluator.py

### Agent Trace Instrumentation
- ✅ Trace-capture skill: skills/trace-capture/SKILL.md
- ✅ Trace ingestion: scripts/ingest-traces.py
- ✅ Heartbeat extension templates (3 tiers)
- ✅ Skill sync preparation: scripts/prepare-trace-skill-sync.py
- 🔵 Apply heartbeat extensions to 12 agents (human review + Paperclip API update)
- 🔵 Execute skill sync for trace-capture + self-check on all agents

### Governance Gates
- ✅ CA sender approval gate: ca_send_approved column + preflight script
- ✅ Dashboard approval toggle: scripts/ca-approval-dashboard-patch.js
- 🔵 Integrate CA approval toggle into Vercel dashboard

### Monitoring
- ✅ Monitoring agent instructions: agent-instructions/monitoring/AGENTS.md
- ✅ Monitoring agent creation script: scripts/create-monitoring-agent.py
- ✅ Blocked-work detection: scripts/check-blocked-work.py
- 🔵 Create monitoring agent via Paperclip API (--execute)
- 🔵 Verify monitoring agent produces first daily digest

### Integration
- ✅ Evaluator routine registration script
- ✅ Trace ingestion routine registration script
- ✅ End-to-end smoke test: scripts/test-evaluator-e2e.py (8/8 PASS)
- ✅ Dashboard evaluator panel component
- 🔵 Register evaluator routine in Paperclip (--execute)
- 🔵 Register trace ingestion routine in Paperclip (--execute)
- 🔵 Embed evaluator panel in Vercel dashboard
- 🔵 Calibrate evaluator against 10 human-scored outputs (founder task)

---

## G. Deferred / Out-of-scope (for reference)

- ⚪ **Portal scraping for tender details** — investigated; 3 of 4 portals have Incapsula WAFs blocking scripted access. Decided to stay with email-based discovery + manual portal viewing for documents.
- ⚪ **Mail.ReadWrite Outlook draft creation** — dropped per user direction; Apps Script Gmail send is sole external send mechanism
- ⚪ **PDF CA fill with form fields** — phase 1 of ca-fill skill is .docx only; PDFs flagged for manual completion
- ⚪ **Hermes / LangGraph migration** — audit explicitly said don't over-index on this; stay with current Claude-on-Paperclip architecture

---

## H. Audit Artefacts Created (for reference)

Located at `docs/current-state-audit/` (v1) and `docs/current-state-audit-v2/` (v2):

**v1:**
- `current_state_report.md` — 590-line narrative report
- `system_inventory.csv` — 61 rows
- `hyper_agent_gap_matrix.md` — 15 capabilities assessed
- `architecture_map.md` — 320 lines of text diagrams
- `questions_for_founder.md` — 15 prioritised questions

**v2 (refreshed 2026-04-14):**
- `current_state_report.md` — 616 lines, 15 sections
- `system_inventory.csv` — 61 components
- `hyper_agent_gap_matrix.md` — 15 capabilities with quality/autonomy priority
- `architecture_map.md` — 480 lines, 8 diagrams
- `questions_for_founder.md` — 14 prioritised questions
- `delta_from_v1.md` — material changes since v1
- `backlog_validation.md` — 77 items validated (46 confirmed, 6 partial, 19 not-started)

14 founder questions from v2 audit are pending review and answers.

---

## Quick prioritisation for next session

If time-boxed, suggested order:
1. ~~Vercel dashboard deployment~~ ✅ DONE
2. ~~Audit finding #3 — output evaluator~~ ✅ DONE — hyper-agent-v1 programme complete
3. Hyper-agent activation — run --execute scripts (monitoring agent, routines, skill sync, heartbeat extensions)
4. WR Phase 4 — reconfigure WR agents (indexer done, Drive restructure pending)
5. F1 scoping — Gmail integration prerequisites + CRM API investigation
6. Evaluator calibration — Jeff manually scores 10 tender outputs against rubric v1.0

---

## File location

This backlog: `/Users/jeffdusting/Desktop/Projects/River/BACKLOG.md`
Update it as work progresses or when new items emerge.
