# Phase 6: Day 3 — WaterRoads Preparation and Test Support

**Prerequisites:** Day 2 complete. CBS agents configured. KB retrieval test passed.
**Context:** Read `TASK_LOG.md` for Day 2 outcomes.

---

## Objective

While Jeff tests the CBS tender workflow and governance activation, prepare all WaterRoads assets for Day 4 deployment. Support Day 3 testing by setting heartbeat intervals and creating test tickets.

## Tasks

### Task 6.1. Set CBS Test Heartbeats

Run `python scripts/paperclip-set-heartbeats.py --company-id <cbs-company-id> --mode test`.

This sets all CBS tender workflow agents to `runtimeConfig.heartbeat.intervalSec: 1800` (30 minutes). Report the original intervals stored for restoration.

### Task 6.2. Create Test Tender Ticket

Run `python scripts/paperclip-create-ticket.py --company-id <cbs-company-id> --title "Test Tender — [name from test-brief.md]" --file day3-test-tender/test-brief.md --assignee-agent-id <cbs-executive-id> --project-id <tender-ops-project-id> --priority high`.

Report the ticket ID and URL.

### Task 6.3. Review and Finalise WR Agent Instructions

The WR agent instruction files were created in P2. Review them for:
- WaterRoads mission context (zero-emission ferry services, PPP, Sydney waterways)
- Joint director authority (Jeff Davidson + Sarah Taylor; both required for resolutions)
- WR-specific board paper sections: PPP progress, investor matters, regulatory/environmental compliance, ferry route development, funding position
- Hard stop prohibitions present in all AGENTS.md files

### Task 6.4. Create WR Governance Templates

If not already created in P3, create WaterRoads-specific governance templates in `prompt-templates/`:
- `waterroads-board-paper-template.md`
- `waterroads-board-agenda-template.md`
- `waterroads-board-minutes-template.md`
- `waterroads-resolution-template.md` (joint authority language)

### Task 6.5. Write WR Template Ingest Script

Create `scripts/ingest-wr-templates.py` — inserts WaterRoads governance templates into the Supabase `prompt_templates` table with entity `waterroads`. Reads credentials from env vars.

### Task 6.6. Prepare WR Deployment Script Configs

Verify `scripts/paperclip-hire-wr-agents.py` has the correct:
- Company ID placeholder (to be filled when the WR company exists in production)
- 3 agents: WR Executive (ceo, 21600s, Sonnet 4), Governance WR (pm, routine-driven, Sonnet 4), Office Management WR (general, 43200s, Haiku 4.5)
- reportsTo hierarchy (Governance and Office Management report to WR Executive)
- adapterConfig.env with type-wrapped credentials

Verify `scripts/paperclip-create-projects-routines.py --entity wr` will create:
- Project: "WR Governance"
- Routine: 3-week governance cycle (cron `0 8 1,22 * *`), assigned to Governance WR agent

### Task 6.7. Restore CBS Production Heartbeats

After Jeff confirms Day 3 testing is complete (he will signal this), run:

`python scripts/paperclip-set-heartbeats.py --company-id <cbs-company-id> --mode production`

Confirm all intervals restored. Report the restored values.

---

## Gate Verification

```bash
# 1. WR instruction files complete
for agent in wr-executive governance-wr office-management-wr; do
  for file in AGENTS.md HEARTBEAT.md SOUL.md TOOLS.md; do
    test -f "agent-instructions/$agent/$file" || echo "MISSING: $agent/$file"
  done
done

# 2. WR templates exist
for tpl in waterroads-board-paper-template waterroads-resolution-template; do
  test -f "prompt-templates/$tpl.md" || echo "MISSING: $tpl"
done

# 3. WR ingest script exists
test -f scripts/ingest-wr-templates.py && echo "PASS" || echo "FAIL"

# 4. CBS heartbeats restored (if Day 3 testing complete)
python scripts/paperclip-validate.py --check agents-cbs 2>&1 | head -20
```

**Archive point:** `git add -A && git commit -m "P6: Day 3 — WR preparation complete, CBS test support" && git tag river-p6-day3`

## Phase 6 Completion

Update TASK_LOG.md:
```markdown
## Project River — Phase 6 (Day 3)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** river-p6-day3

### Tasks Completed
- CBS test heartbeats set (30min) and test tender ticket created
- WR agent instructions reviewed and finalised
- WR governance templates created
- WR template ingest script written
- WR deployment scripts verified
- CBS production heartbeats restored [if testing complete]

### Day 3 Test Results (from Jeff's review)
- Tender workflow: [pending Jeff's review / passed / issues noted]
- Governance test: [pending / passed / deferred to Day 4]

### Next Phase
- Read `docs/river-sprint/08-P7-DAY4-ANALYSIS.md`
- Prerequisites: Jeff has completed Day 3 testing review
```
