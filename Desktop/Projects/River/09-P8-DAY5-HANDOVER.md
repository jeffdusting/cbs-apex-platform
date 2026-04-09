# Phase 8: Day 5 — Handover, Verification, Final Commit

**Prerequisites:** Day 4 complete. All hard stops validated. Director briefings drafted.
**Context:** Read `TASK_LOG.md` for full sprint status.

---

## Objective

Verify all configuration. Deploy monitoring dashboard. Produce the sprint summary. Ensure every file is committed.

## Tasks

### Task 8.1. File Inventory Verification

Confirm the following exist in river-config:

```
river-config/
├── docker-compose.yml
├── supabase-schema.sql
├── operator-runbook.md
├── future-sprints.md
├── day0-findings.md (or DISCOVERY_SUMMARY.md)
├── RIVER-STATUS.md
├── TASK_LOG.md
├── knowledge-base/
│   ├── MANIFEST.md
│   ├── RETRIEVAL_EVAL.md
│   └── *.md (content files)
├── skills/
│   ├── supabase-query/SKILL.md
│   ├── xero-read/SKILL.md
│   ├── sharepoint-write/SKILL.md
│   ├── teams-notify/SKILL.md
│   ├── cbs-capital-framework/SKILL.md
│   └── tender-portal-query/SKILL.md
├── agent-instructions/
│   ├── company-missions.md
│   ├── cbs-executive/ (4 files)
│   ├── tender-intelligence/ (4 files)
│   ├── tender-coordination/ (4 files)
│   ├── technical-writing/ (4 files)
│   ├── compliance/ (4 files)
│   ├── pricing-commercial/ (4 files)
│   ├── governance-cbs/ (4 files)
│   ├── office-management-cbs/ (4 files)
│   ├── research-cbs/ (4 files)
│   ├── wr-executive/ (4 files)
│   ├── governance-wr/ (4 files)
│   └── office-management-wr/ (4 files)
├── agent-config/
│   └── token-budgets.md
├── prompt-templates/ (9 files)
├── adapters/ (2 reference templates)
├── scripts/ (19+ files)
├── monitoring/
│   └── river-dashboard.html
├── day3-test-tender/
│   └── test-brief.md
├── docs/
│   ├── sarah-taylor-wr-briefing.md
│   ├── jim-ellwood-cbs-briefing.md
│   └── river-sprint/ (phase files)
└── sprint-1-summary.md (created in this phase)
```

List any missing files.

### Task 8.2. Update Monitoring Dashboard

Open `monitoring/river-dashboard.html`. Update the configuration block with:
- Production `PAPERCLIP_URL`: `https://org.cbslab.app`
- Read the API key from a user-configurable field (do not hardcode)

Verify the dashboard HTML is valid and the API polling logic targets the correct endpoints:
- `GET /api/companies/{id}/agents` for agent status
- `GET /api/companies/{id}/costs/by-agent` for budget data
- `GET /api/companies/{id}/activity` for recent activity

### Task 8.3. Update RIVER-STATUS.md

Set `Current Day: Complete`. Fill all remaining TBC fields with actual values from TASK_LOG.md entries across all phases. This should reflect the ground truth of what was accomplished across the sprint.

### Task 8.4. Create Sprint 1 Summary

Create `sprint-1-summary.md` containing:

1. **Entities deployed:** CBS Group (active), WaterRoads (governance active, operations inactive), Adventure Safety (archived), MAF/CobaltBlu (archived).

2. **Agents active:** Table of all 12 agents with entity, Paperclip role, adapter type, model, heartbeat config, budget, and skills.

3. **Integrations confirmed:** M365 Graph (SharePoint write/read, Teams channel post, Calendar, Mail.Read), Xero (CBS read-only, WR read-only), Supabase (pgvector semantic search, governance templates), GitHub (version control).

4. **Hard stop test results:** Layer 1 (instruction compliance — email refusal, Xero refusal), Layer 2 (architectural — Mail.Send permission absent, Xero write blocked), Layer 3 (audit immutability, Teams notification).

5. **Token consumption:** Actuals vs projections per agent. Budget adjustment recommendations.

6. **Routines configured:** Daily tender scan (CBS), 3-week governance cycle (CBS), 3-week governance cycle (WR).

7. **Known issues or adjustments:** Any configuration changes made during the sprint, any agent instruction revisions, any retrieval quality gaps.

8. **Readiness for Sprint 2:** Feedback loop schema prepared, shared knowledge category scoped, tender qualification scorecard scoped, HTTP/OpenClaw adapter activation pending Paperclip release.

9. **Next governance cycle dates:** CBS (date), WR (date).

### Task 8.5. Final Commit

```bash
git add -A
git commit -m "P8: Sprint 1 complete — all configuration committed"
git tag river-sprint-1-complete
```

---

## Gate Verification

```bash
# 1. All critical files exist
for f in docker-compose.yml supabase-schema.sql operator-runbook.md future-sprints.md \
  RIVER-STATUS.md TASK_LOG.md sprint-1-summary.md knowledge-base/MANIFEST.md \
  monitoring/river-dashboard.html; do
  test -f "$f" || echo "MISSING: $f"
done

# 2. Agent instruction count
echo "Agent instruction files: $(find agent-instructions -name '*.md' | wc -l) (expected: 49)"

# 3. Skill count
echo "Skill files: $(find skills -name 'SKILL.md' | wc -l) (expected: 6)"

# 4. Script count
echo "Scripts: $(ls scripts/*.py scripts/*.sh 2>/dev/null | wc -l) (expected: ~20)"

# 5. Git status clean
git status --short | wc -l | xargs test 0 -eq && echo "PASS: clean" || echo "WARN: uncommitted files"

echo "Sprint 1 complete."
```

## Phase 8 Completion

Update TASK_LOG.md:
```markdown
## Project River — Phase 8 (Day 5 — Sprint Complete)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** river-sprint-1-complete

### Sprint Summary
- 4 entities provisioned (2 active, 2 archived)
- 12 agents configured (9 CBS, 3 WR)
- 3 hard stop layers verified
- All integrations confirmed
- Sprint 1 summary committed
- Monitoring dashboard operational

### Next Sprint
- Sprint 2: CBS Client Engagement + Feedback Loop
- See future-sprints.md for scope
```
