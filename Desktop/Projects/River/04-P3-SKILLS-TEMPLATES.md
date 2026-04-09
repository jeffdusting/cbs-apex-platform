# Phase 3: Skills, Templates, and Documentation (CC-0C)

**Prerequisites:** DISCOVERY_SUMMARY.md exists. Phase 0 complete.
**Context:** Read `DISCOVERY_SUMMARY.md` — particularly the skills system section (skill structure, sync mechanism, trust levels).

---

## Objective

Generate all custom River skills, governance templates, the operator runbook, and future sprint documentation.

## Tasks

### Task 3.1. Custom Skills

Create one directory per skill under `skills/`, each with a `SKILL.md`. Skills follow the Paperclip convention: a markdown file with structured instructions the agent reads during heartbeat execution.

**skills/supabase-query/SKILL.md** — Supabase REST API patterns, semantic search via `match_documents` function (1024-dimension query embedding), full-text search fallback, Python code examples for retrieval filtered by entity and category. Includes the Supabase project URL placeholder and credential references (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` from agent env vars).

**skills/xero-read/SKILL.md** — Xero API endpoint, OAuth token refresh pattern, example read-only queries (P&L summary, cash position, budget vs actual). Explicitly states: "You have read-only access. You cannot create, modify, or delete any financial records. Any attempt to write to Xero will fail."

**skills/sharepoint-write/SKILL.md** — Graph API endpoint, client credentials auth using env vars (`MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`), folder structure per entity (Board Papers/, Minutes/, Resolutions/, Tender Documents/), file naming conventions, example Python code for file upload.

**skills/teams-notify/SKILL.md** — Graph API pattern for posting to a Teams channel using the `ChannelMessage.Send` application permission. Includes the channel ID placeholder and a step-by-step guide: authenticate with client credentials, POST to the channel messages endpoint. The agent calls this skill at the end of governance and tender-submission task completions.

**skills/cbs-capital-framework/SKILL.md** — Concise CAPITAL methodology summary: principles (value-based commercial structures, whole-of-life lifecycle thinking, systems engineering rigour, collaborative safety assurance), key application areas, the $180M WHT saving reference, ISO 55001 and ISO 44001 standards integration. Guidance: "Apply framework language based on knowledge base evidence. Do not invent credentials, past projects, or capabilities not evidenced in the knowledge base."

**skills/tender-portal-query/SKILL.md** — AusTender RSS feed URL (data.gov.au), OCDS API endpoint (api.tenders.gov.au), sector keyword filters, reference to `scripts/tender-portal-query.py`, output format specification. Includes instructions for parsing RSS XML and structuring opportunities.

### Task 3.2. Governance Templates

Create governance templates in `prompt-templates/`:

- `board-paper-template.md` — Seven-section structure: Executive Summary, Financial Performance (Xero data), Operational Update, Strategic Matters, Risk and Compliance, Resolutions for Consideration, Next Meeting Date.
- `board-agenda-template.md` — Standard agenda with standing items.
- `board-minutes-template.md` — Attendance, apologies, matters arising, resolutions, action items, next meeting.
- `resolution-template.md` — Consistent with Australian Corporations Act. Includes: resolution number, date, moved by, seconded by, resolution text, carried/not carried, signature blocks.
- `agm-notice-template.md` — 21-day notice period, agenda items, proxy form reference.
- `agm-agenda-template.md` — Statutory items, special resolutions, ordinary business.

Create WaterRoads variants in `prompt-templates/`:

- `waterroads-board-paper-template.md` — WR-specific sections: PPP Progress, Investor Matters, Regulatory/Environmental Compliance, Ferry Route Development, Funding Position, Resolutions.
- `waterroads-board-minutes-template.md`
- `waterroads-resolution-template.md` — Joint authority language (Jeff Davidson + Sarah Taylor; both required).

### Task 3.3. Operator Runbook

Create `operator-runbook.md` covering:

- Dashboard access and navigation (org.cbslab.app)
- Reviewing and approving agent tickets (issue → in_review → approve/reject)
- Responding to budget warnings (80% soft alert) and auto-pauses (100%)
- Adding content to the knowledge base (export to knowledge-base/, run ingest script)
- Rotating the GitHub PAT (every 90 days)
- Adding a new agent (via dashboard or direct API)
- Switching an agent to a different model (PATCH adapterConfig.model)
- Claude Code CLI update (update Docker image tag)
- Backup verification and recovery (Railway PostgreSQL, Supabase PITR)
- Token consumption monitoring and anomaly detection
- Hard stop enforcement layers and activity log review
- Skills maintenance — adding or updating skills, syncing to agents
- Wet signature workflow — print, sign, scan, upload to SharePoint, update governance register
- Lightweight rollback — pause agent, fix instructions, re-test
- Full rollback — restore from Railway/Supabase backups
- Xero OAuth token renewal (browser-based re-authorisation)
- Day 3 failure mode decision tree

### Task 3.4. Future Sprints Document

Create `future-sprints.md` documenting Sprint 2–5 scope and the ongoing runtime expansion plan, including: feedback loop activation, shared knowledge category, tender qualification scorecard, HTTP/OpenClaw adapter activation when available.

### Task 3.5. Adapter Templates (Reference Only)

Create `adapters/manus-http-template.json` — HTTP adapter configuration template for Manus (for use when the HTTP adapter ships in Paperclip). Mark as "Sprint 2+ — not available in current Paperclip version."

Create `adapters/openclaw-gateway-template.json` — OpenClaw gateway adapter template. Same caveat.

---

## Gate Verification

```bash
# 1. All skill directories
for skill in supabase-query xero-read sharepoint-write teams-notify cbs-capital-framework tender-portal-query; do
  test -f "skills/$skill/SKILL.md" || echo "MISSING: skills/$skill/SKILL.md"
done

# 2. All templates
for tpl in board-paper-template board-agenda-template board-minutes-template resolution-template \
  agm-notice-template agm-agenda-template waterroads-board-paper-template \
  waterroads-board-minutes-template waterroads-resolution-template; do
  test -f "prompt-templates/$tpl.md" || echo "MISSING: prompt-templates/$tpl.md"
done

# 3. Documentation
test -f operator-runbook.md && echo "PASS: runbook" || echo "FAIL: runbook missing"
test -f future-sprints.md && echo "PASS: future sprints" || echo "FAIL: future sprints missing"

echo "Total files: $(find skills prompt-templates adapters -name '*.md' -o -name '*.json' | wc -l)"
```

**Archive point:** `git add -A && git commit -m "P3: Skills, templates, runbook, documentation" && git tag river-p3-skills-templates`

## Phase 3 Completion

Update TASK_LOG.md:
```markdown
## Project River — Phase 3 (Skills and Templates)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** river-p3-skills-templates

### Files Created
- skills/ (6 skill directories)
- prompt-templates/ (9 template files)
- operator-runbook.md
- future-sprints.md
- adapters/ (2 reference templates)

### Next Phase
- Read `docs/river-sprint/05-P4-KB-STRUCTURE.md`
- Prerequisites: Jeff has exported KB content to knowledge-base/
```
