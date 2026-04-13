# WaterRoads Separate Knowledge Base — Implementation Plan (Option 4a)

**Date:** 13 April 2026
**Status:** FOR REVIEW

## Objective

Move WaterRoads content to a Google-native environment (Google Drive for documents, Google Docs for board papers) while keeping Voyage AI embeddings and Supabase pgvector for semantic search. Enables Sarah to edit WR documents in her native ecosystem, gives WR a self-contained KB that can scale as content grows, and prepares WR for eventual operational independence.

## Architecture

### Dual-Layer Design

```
                         WaterRoads Content Lifecycle
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        │                                                           │
    LAYER 1: LIVE (source of truth)                           LAYER 2: INDEXED
    Google Workspace (waterroads.com.au)                      Supabase (WR project)
                                                                      │
    Shared Drive: "WaterRoads KB"                                     │
    ├── Governance/                                                   │
    │   ├── Board Papers/              ← Sarah/Jeff edit live         │
    │   ├── Minutes/                                                  │
    │   ├── Resolutions/                                              │
    │   └── Register (Sheet)                                          │
    ├── PPP/                                                          │
    │   ├── Programme Documents/                                      │
    │   ├── NSW Government Correspondence/                            │
    │   └── Milestone Tracker (Sheet)                                 │
    ├── Investor Relations/                                           │
    │   ├── Updates/                                                  │
    │   ├── Data Room/                                                │
    │   └── Cap Table (Sheet)                                         │
    ├── Financial/                                                    │
    ├── Regulatory/                                                   │
    ├── Stakeholder Engagement/                                       │
    ├── Operational/  (future)                                        │
    ├── Templates/                                                    │
    └── Shipley (duplicated reference)                                │
                                                                      │
                               ┌──────────────────────────────────────┘
                               │
                               ▼
                      Apps Script Sync Job
                      (every 30 minutes)
                               │
                               ▼
                      Voyage AI (voyage-3.5)
                               │
                               ▼
                      Supabase "waterroads-kb"
                      - documents (embedded chunks)
                      - prompt_templates
                      - governance_register
                      - tender_register
```

### Layer responsibilities

| Layer | Purpose | Access Pattern |
|---|---|---|
| Layer 1 (Google Drive) | Authoritative, editable, current | Humans edit directly. Agents read current state via Drive API when needed for live collaboration. |
| Layer 2 (Supabase) | Semantic search index, historical content | Agents query via supabase-query skill for retrieval, reference, and cross-document analysis. |

### Sync behaviour

- **Auto-ingestion:** Apps Script runs every 30 minutes, detects new/modified files in "Approved" or "Finalised" subfolders (via Drive label or specific folder naming)
- **Change detection:** Drive's `modifiedTime` field — re-embed only changed files
- **Dedup:** source_file path acts as the unique key; update in place rather than creating duplicates
- **Version history:** Google Drive retains version history natively; Supabase keeps only the current embedded version (search is against current)
- **Draft isolation:** content in `/Drafts/` subfolders is NOT ingested until moved to parent folders

### Content flow example — Board Paper

```
Day 1 (cron 0 8 1 * *):
  Governance WR agent wakes
  Queries Supabase for: previous board papers, Xero financial data, PPP status
  Drafts new board paper as a Google Doc in /Governance/Board Papers/Drafts/
  Creates in_review Paperclip issue, notifies Sarah and Jeff via Teams + email with Google Doc link

Day 1-3:
  Sarah and Jeff edit the Google Doc directly
  Comments, suggestions, track changes — native Google Docs collaboration

Day 3:
  Both directors approve (joint authority)
  File moves from /Drafts/ to /Governance/Board Papers/Approved/
  Apps Script sync (within 30 min):
    - Detects new file in /Approved/
    - Extracts text via Docs API
    - Embeds via Voyage AI
    - Writes to Supabase waterroads-kb with entity=waterroads, category=governance

Ongoing:
  Next board paper cycle starts — Governance WR queries Supabase for most recent approved board paper
  Semantic search returns it, cited by source_file
```

## Revised Plan for 31 GB Migration (SharePoint 5.2 + Dropbox 26)

### Two-Tier Architecture

**Tier 1 (Drive): Everything.** All 31 GB migrated to Google Drive. Complete archive. Accessible via Drive search, folder browsing, human lookup. No indexing cost — just Drive storage (free with Workspace).

**Tier 2 (Supabase): Curated index.** Selected high-signal content gets embedded and indexed in Supabase. Agents semantic-search against this layer. Initial index ~5-10% of total volume.

### Selective Indexing Criteria

The indexer script applies these rules:

| Include | Why |
|---|---|
| Board papers, minutes, resolutions | Governance history is core reference |
| WR correspondence (last 2 years) | Stakeholder context, client/govt history |
| Financial reports, models, business case | Decision basis |
| PPP programme documents | Core operational planning |
| Regulatory submissions | Compliance history |
| Investor updates, DD responses | Investor context |
| Operational content (post-Sprint 4) | Future operational reference |
| Shipley reference (duplicated) | Methodology |

| Exclude | Why |
|---|---|
| Drafts with track changes | Final versions exist elsewhere |
| Photos, diagrams, images | Not text-searchable |
| External PDFs from other firms | Reference, not WR IP |
| Archive >5 years (unless specifically relevant) | Stale, high noise |
| Exact duplicates (by content hash) | Dedup |
| Temporary files (~$, .tmp) | Junk |

### Migration Tooling

**Bulk transfer: Google Workspace Migrate**
Google's official free tool, designed for SharePoint and Dropbox migrations. Handles:
- Folder structure preservation
- Permission mapping
- Conflict resolution
- Rate limiting
- Progress tracking

Requirements:
- Google Workspace admin access on waterroads.com.au
- Dropbox Business admin access (to authorise the migration app)
- SharePoint admin access (read permissions on WR site)

Run time: 1-3 days for 31 GB (Google handles throttling).

**Selective indexer: custom Apps Script**
After bulk migration completes, Apps Script runs through the Drive hierarchy and indexes only content matching the inclusion criteria. Components:
- File classifier (board paper, correspondence, financial, etc.)
- Content extractor (handles .md, .docx, .xlsx, .pptx, .pdf)
- Chunking (H2-boundary or 1000-token boundary)
- Voyage AI embedding
- Supabase upsert with category metadata

Run time: 4-8 hours for initial curated index (~5,000-10,000 chunks).

## Implementation Phases

### Phase 1: Infrastructure (Day 1)

1. **Create Google Cloud project** under the waterroads.com.au workspace
2. **Enable APIs:** Drive, Docs, Sheets, Gmail, Admin SDK
3. **Create service account** `river-wr-agent@{project}.iam.gserviceaccount.com` with:
   - Drive file access (scoped to WR Shared Drive)
   - Docs read/write
   - Sheets read/write
   - Gmail read (for tender email scan — if WR uses this)
4. **Create Supabase project** `waterroads-kb` (Free tier initially)
5. **Run schema SQL** (adapted for WR-specific categories)
6. **Set up Shared Drive** "WaterRoads KB" with folder structure
7. **Grant access:** Jeff, Sarah, service account as Content Manager

### Phase 2: Bulk Content Migration (Days 2-4)

**2a. Set up Google Workspace Migrate (Day 2 morning)**
1. Admin Console → Apps → Google Workspace → Workspace Migrate → Set up
2. Install migration node on a VM (Google provides image)
3. Configure Dropbox source connection (admin OAuth)
4. Configure SharePoint source connection (admin OAuth)
5. Configure Drive destination (WR Shared Drive)

**2b. Run bulk migration (Days 2-4)**
1. Dropbox: 26 GB WaterRoads folder → `/Imported from Dropbox/` in WR Shared Drive
2. SharePoint: 5.2 GB WaterRoads site → `/Imported from SharePoint/` in WR Shared Drive
3. Google Workspace Migrate handles the transfer in the background over 1-3 days
4. Preserves folder structure, file metadata, permissions where possible

**2c. Handle existing Supabase WR content**
1. **Retire 103 WR docs from current Supabase** — move to `waterroads-kb-archive` schema for 30-day retention
2. Content is NOT lost — it will be re-indexed from Drive if the corresponding files exist there
3. If any WR Supabase content has NO counterpart in Drive/SharePoint/Dropbox (agent-generated content), export to Drive first

**2d. Duplicate Shipley reference content**
- Copy 4 Shipley documents from CBS Supabase into WR Drive under `/Reference/Shipley/`

### Phase 3a: Initial Selective Indexer (Day 4-5)

One-off bulk indexer that classifies every file in the Drive and embeds high-signal content:

```javascript
// One-off: index all priority content after bulk migration
function initialBulkIndex() {
    const rootFolder = DriveApp.getFolderById(WR_DRIVE_ROOT_ID);
    const files = walkFolder(rootFolder);  // recursive file list

    for (const file of files) {
        const classification = classifyFile(file);
        if (classification.index) {
            const content = extractContent(file);  // handles .md, .docx, .xlsx, .pptx, .pdf
            const chunks = chunkContent(content);  // H2-boundary or 1000-token
            for (const chunk of chunks) {
                const embedding = voyageEmbed(chunk);
                upsertSupabase({
                    source_file: file.getName(),
                    drive_file_id: file.getId(),
                    entity: 'waterroads',
                    category: classification.category,
                    content: chunk,
                    embedding: embedding,
                });
            }
        }
    }
}

function classifyFile(file) {
    const path = getFilePath(file);
    const name = file.getName().toLowerCase();
    const mime = file.getMimeType();
    const age = daysSinceModified(file);

    // Exclusion rules
    if (name.startsWith('~$') || name.startsWith('.')) return {index: false};
    if (mime.startsWith('image/') || mime.startsWith('video/')) return {index: false};
    if (name.includes('draft') && name.includes('track')) return {index: false};
    if (age > 1825 /* 5 years */) return {index: false};  // too old

    // Inclusion rules by folder
    if (path.includes('Board Papers') || path.includes('Minutes') || path.includes('Resolutions'))
        return {index: true, category: 'governance'};
    if (path.includes('PPP') || path.includes('NSW Government'))
        return {index: true, category: 'ppp'};
    if (path.includes('Financial') || path.includes('Business Case'))
        return {index: true, category: 'financial'};
    if (path.includes('Investor'))
        return {index: true, category: 'investor'};
    if (path.includes('Regulatory') || path.includes('Environmental'))
        return {index: true, category: 'regulatory'};
    if (path.includes('Correspondence') && age < 730 /* 2 years */)
        return {index: true, category: 'correspondence'};
    if (path.includes('Shipley') || path.includes('Reference'))
        return {index: true, category: 'methodology'};

    // Default: don't index (leaves content in Drive for human browsing)
    return {index: false};
}
```

### Phase 3b: Ongoing Sync Pipeline (Day 5)

Apps Script: `wr-kb-sync.gs` — runs every 30 min, handles new/modified files:

```javascript
function syncKnowledgeBase() {
    const lastSync = PropertiesService.getScriptProperties().getProperty('LAST_SYNC') || '2026-01-01T00:00:00Z';
    const files = findModifiedFiles(lastSync);

    for (const file of files) {
        const classification = classifyFile(file);
        if (classification.index) {
            const content = extractContent(file);
            const chunks = chunkContent(content);
            // Delete old chunks for this file, re-insert
            deleteByDriveFileId(file.getId());
            for (const chunk of chunks) {
                const embedding = voyageEmbed(chunk);
                upsertSupabase({source_file: file.getName(), drive_file_id: file.getId(), ...});
            }
        }
    }

    // Handle deletions
    handleDriveDeletions();

    PropertiesService.getScriptProperties().setProperty('LAST_SYNC', new Date().toISOString());
}
```

Components:
- `walkFolder(folder)` — recursive depth-first traversal
- `findModifiedFiles(since)` — Drive API search with `modifiedTime > since`
- `classifyFile(file)` — inclusion/exclusion logic (same as initial indexer)
- `extractContent(file)` — handles all 5 formats via Drive's export API
- `chunkContent(content)` — H2-boundary or 1000-token chunks with 200-token overlap
- `voyageEmbed(content)` — Voyage AI voyage-3.5, input_type=document
- `upsertSupabase(record)` — write to WR Supabase with drive_file_id as unique key

### Phase 4: Agent Reconfiguration (Day 3)

Update 3 WR agents:

1. **New env vars:**
   - `WR_SUPABASE_URL` — new project URL
   - `WR_SUPABASE_SERVICE_ROLE_KEY` — new project key
   - `GOOGLE_SERVICE_ACCOUNT_KEY` — for Drive/Docs/Sheets access
   - `WR_DRIVE_ROOT_ID` — Shared Drive ID

2. **Keep existing env vars:**
   - VOYAGE_API_KEY (same)
   - TEAMS_WEBHOOK_URL (same)
   - XERO_CLIENT_ID/SECRET (still reads Xero for financials)
   - MICROSOFT_* (for any cross-entity work)

3. **New skills:**
   - `google-drive-read` — list, read, search Drive files
   - `google-docs-write` — create/edit Google Docs (replaces sharepoint-write for WR)
   - `google-sheets-query` — read Sheets (registers, trackers)
   - `wr-supabase-query` — queries new WR Supabase project (same pattern as supabase-query, different URL)

4. **Retire skills from WR agents:**
   - `sharepoint-write` — no longer used for WR (SharePoint can stay for CBS)

5. **Update AGENTS.md** for all 3 WR agents:
   - Point to WR Drive for document retrieval and delivery
   - Use wr-supabase-query for semantic search
   - Board papers are native Google Docs, not Word-formatted uploads
   - Governance register is a Google Sheet, not a Supabase table (human-editable)

### Phase 5: Testing (Day 3)

1. **Semantic search parity test:** query "PPP Rhodes to Barangaroo progress" against new WR Supabase. Confirm results match or exceed current retrieval quality.
2. **Board paper test:** trigger Governance WR manually, verify it creates a Google Doc in the right folder
3. **Live edit test:** Sarah edits a draft board paper, Governance WR picks up the latest content on next query
4. **Sync test:** upload a new PDF to the Drive, confirm it's embedded and searchable within 30 minutes
5. **Cross-entity test:** CBS Executive should NOT have access to WR content (verify with a query that tries)
6. **Joint approval test:** resolution requiring both directors — agent waits for both approvals before considering complete

### Phase 6: Documentation and Handover (Day 4)

1. Update RIVER-STATUS.md — WR architecture changes
2. Update operator-runbook.md — new section on WR Google stack maintenance
3. Update Sarah's briefing email — Google-native workflow explanation
4. Document cookie/token refresh procedures for both Google and Supabase WR credentials
5. Commit everything, tag `river-wr-google-migration`

## What This Enables

### Immediate benefits

- Sarah edits board papers as Google Docs — no more "download, edit, re-upload" cycles
- Native Google Docs collaboration (comments, suggestions, version history)
- WR's governance register is a living Google Sheet Sarah can update directly
- Investor data room lives in Drive with standard Google sharing controls
- Cap table and financial models as Sheets — computable, shareable, current

### Growth capabilities

- **Any new WR content automatically flows through the KB** — drop it in the right folder, sync ingests it, agents can retrieve it
- **No bottleneck at ingestion** — humans add content at human pace, Apps Script handles indexing
- **Sarah can bulk-add** an entire investor data room in one drop
- **Operational content (post-activation)** drops into `/Operational/` folders and becomes immediately retrievable — vessel specs, route timetables, crew rosters

### Agent behaviour changes

| Current (Supabase-only) | Future (Drive + Supabase) |
|---|---|
| Agent generates Word doc, uploads to SharePoint | Agent generates Google Doc, places in Drive folder |
| Agent queries Supabase for content snapshot | Agent queries Supabase for historical content, Drive API for live/current |
| Board paper approval = SharePoint file upload | Board paper approval = move Google Doc to /Approved/ folder |
| Resolution workflow = Word → SharePoint → print → sign → scan | Resolution workflow = Google Doc → e-signature option (Docusign) OR print/sign/scan |

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Apps Script sync fails silently | Send Teams alert on exception (same pattern as email intake) |
| Drive API rate limits | Exponential backoff, stay well under 10,000 requests/day |
| Service account credentials leak | Scope to WR Drive only; rotate every 90 days |
| Supabase WR project pauses on free tier (7 days inactivity) | Sync job keeps it active; upgrade to Pro if inactivity becomes routine |
| CBS agent accidentally queries WR content | Separate credentials (CBS agents don't have WR Supabase keys) — structurally impossible |
| Drive document deleted but Supabase entry remains | Sync job also detects deletions, removes corresponding Supabase entries |
| Embedding drift when Shipley content updated | Shipley is duplicated in both projects; update both when changed |

## Cost

### One-Time

| Component | Cost |
|---|---|
| Google Workspace Migrate | $0 (free tool) |
| Initial Voyage AI embedding (~5-10% of 31 GB indexable) | $20-100 |
| Developer time (you approved budget) | (already accounted) |
| **Total one-time** | **$20-100** |

### Ongoing Monthly

| Component | Monthly |
|---|---|
| Google Cloud project | $0 (free tier) |
| Supabase WR project — Pro plan recommended (database size may exceed free tier with 5-10K chunks) | $25 |
| Voyage AI embeddings (new/modified content only) | $1-5 |
| Apps Script | $0 (included in Workspace) |
| Google Drive storage | $0 (included in Workspace) — 31 GB fits well within 5 TB Business Standard allocation |
| **Total additional ongoing** | **$26-30/month** |

### File Format Support

| Format | Extraction Method | Quality | Notes |
|---|---|---|---|
| .md | Direct text read | Perfect | Native format |
| .docx | Drive export as plain text | Very good | Loses heading hierarchy, preserves body |
| .xlsx | Drive export per sheet as CSV | Good | Formulas flattened to values; multi-sheet iteration required |
| .pptx | Drive export as plain text | Good | Speaker notes included; images lost |
| .pdf (text-based) | Drive built-in extraction | Very good | Works well for native PDFs |
| .pdf (scanned) | Drive OCR fallback | Moderate | May need Cloud Document AI for complex scans (~$1.50/1000 pages) |
| Google Docs/Sheets/Slides | Native Apps Script API | Perfect | Richest extraction |

## Timeline

| Phase | Days | Deliverable |
|---|---|---|
| 1. Infrastructure setup | 1 | Google Cloud + Supabase + Drive structure |
| 2a. Google Workspace Migrate setup | 0.5 | Migration tool configured |
| 2b. Bulk migration (31 GB) | 1-3 (runs in background) | All content in Drive |
| 2c. Supabase WR retire + Shipley duplicate | 0.5 | Current Supabase entity=waterroads archived |
| 3a. Initial selective indexer | 1 | 5-10K curated chunks in WR Supabase |
| 3b. Ongoing sync pipeline | 1 | 30-min sync trigger running |
| 4. Agent reconfig (3 WR agents) | 1 | New env vars, new skills, updated AGENTS.md |
| 5. Testing | 0.5 | Semantic search, live edit, sync, dedup validated |
| 6. Documentation | 0.5 | RIVER-STATUS, runbook, Sarah's briefing updated |
| **Total active days** | **7 days** | Full migration |
| **Elapsed time** | **~10 days** | Allowing for background bulk migration |

## Rollback Plan

If migration fails at any phase:
- **Phase 1-2 (setup):** delete new projects, no impact on existing system
- **Phase 3-4 (pipeline/agent reconfig):** revert agent env vars to point back at current Supabase. WR content in old Supabase still present (not deleted until Phase 2 completes 30-day retention)
- **Phase 5 (testing):** if tests fail, keep both systems running parallel. WR content exists in both Drive (new) and Supabase (old). Agents can stay on old Supabase until issues resolved.

## Prerequisites Before Starting

Confirm:
1. **Google Cloud billing** enabled on waterroads.com.au Workspace (free tier available without billing but limited)
2. **Google Workspace plan** supports Shared Drives (Business Standard and above — likely already in place)
3. **Budget authorisation** for the migration week
4. **Sarah's availability** for 1-2 hours during Phase 5 testing (she validates the Docs-based workflow)

## Go/No-Go Decision Points

- **After Phase 1:** confirm infrastructure works before migrating content
- **After Phase 2:** confirm content is accessible in Drive before building sync
- **After Phase 3:** confirm sync runs reliably before agent reconfig
- **After Phase 4:** one-week parallel run with old system as fallback before full cutover

---

*Awaiting approval to proceed. This plan does not affect CBS Group operations.*
