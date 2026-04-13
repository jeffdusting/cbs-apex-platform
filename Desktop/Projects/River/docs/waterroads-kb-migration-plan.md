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

### Phase 2: Content Migration (Day 2)

1. **Export 103 WR documents** from current Supabase project
2. **Convert to Google Docs** where appropriate (board papers, minutes, resolutions become native Docs; financial models and registers become Sheets; reference material stays as .md in Drive)
3. **Folder placement:** migrate content to the structured folders
4. **Duplicate Shipley content** (4 documents) into WR Drive under `/Reference/Shipley/`
5. **Retire WR content from current Supabase** — move to `waterroads-kb-archive` schema for 30-day retention, then delete

### Phase 3: Sync Pipeline (Day 2-3)

Build Apps Script: `wr-kb-sync.gs`

```javascript
// Runs every 30 min
function syncKnowledgeBase() {
    const lastSync = PropertiesService.getScriptProperties().getProperty('LAST_SYNC') || '2026-01-01T00:00:00Z';
    const files = findModifiedFiles(lastSync);

    for (const file of files) {
        if (isInApprovedFolder(file)) {
            const content = extractContent(file);  // Docs, Sheets, or raw text
            const embedding = voyageEmbed(content);
            upsertSupabase(file, content, embedding);
        }
    }

    PropertiesService.getScriptProperties().setProperty('LAST_SYNC', new Date().toISOString());
}
```

Components:
- `findModifiedFiles(since)` — query Drive for files modified after last sync
- `extractContent(file)` — handle Doc, Sheet, PDF, .md files
- `voyageEmbed(content)` — chunk (H2-boundary, ~1000 tokens) + embed via Voyage API
- `upsertSupabase(file, content, embedding)` — write to WR Supabase, keyed on Drive file ID

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

| Component | Monthly |
|---|---|
| Google Cloud project | $0 (free tier) |
| Supabase WR project | $0 (free tier, keeps active via sync) or $25 (Pro) |
| Voyage AI embeddings | ~$1-2 (additional embedding cost for WR volume) |
| Apps Script | $0 (included in Workspace) |
| Google Drive storage | $0 (included in Workspace) |
| **Total additional cost** | **$1-27/month** |

## Timeline

| Phase | Days | Deliverable |
|---|---|---|
| 1. Infrastructure | 1 | Google Cloud + Supabase + Drive set up |
| 2. Content migration | 1 | All WR content in Drive, retired from shared Supabase |
| 3. Sync pipeline | 1-2 | Apps Script sync running every 30 min |
| 4. Agent reconfig | 1 | 3 WR agents pointing at new stack |
| 5. Testing | 0.5 | End-to-end validation |
| 6. Documentation | 0.5 | Committed and pushed |
| **Total** | **5 days** | Full migration |

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
