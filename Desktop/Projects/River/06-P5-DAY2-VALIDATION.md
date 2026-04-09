# Phase 5: Day 2 — Ingestion, Agent Configuration, Validation

**Prerequisites:** Day 1 infrastructure complete. All env vars set. Supabase schema deployed. All P1–P4 files committed.
**Context:** Read `DISCOVERY_SUMMARY.md` and `TASK_LOG.md`.

---

## Objective

Ingest knowledge base with embeddings. Create all CBS Group agents via API. Configure projects, routines, and skills. Run validation checks. Prepare the Day 3 test tender brief.

## Tasks

### Task 5.1. Install Dependencies and Ingest

```bash
pip install -r scripts/requirements.txt --break-system-packages
python scripts/ingest-knowledge-base.py
```

Verify the output reports: number of documents ingested, embedding dimensions (should be 1024), any errors.

### Task 5.2. Run Retrieval Quality Evaluation

Write and run `scripts/test-semantic-search.py`:

For each of the 5 queries in `knowledge-base/RETRIEVAL_EVAL.md`:
1. Generate an embedding via Voyage AI voyage-3.5
2. Call `match_documents` function in Supabase for the correct entity
3. Print top 3 results with titles, categories, and similarity scores
4. Flag any query that returns zero results above 0.7 threshold

If any query fails, report the gap and recommend what additional content Jeff should export.

### Task 5.3. Insert Governance Templates

Write and run `scripts/insert-governance-templates.py`:

Read all .md files from `prompt-templates/`, determine entity and agent_role from filename, insert into Supabase `prompt_templates` table.

### Task 5.4. Create CBS Group Agents

Run `python scripts/paperclip-hire-cbs-agents.py`.

This creates all 9 CBS agents via `POST /api/companies/{companyId}/agents` with:
- Correct roles from the role mapping
- Full adapterConfig (cwd, model, dangerouslySkipPermissions, env with type-wrapped credentials)
- Full runtimeConfig.heartbeat (intervalSec, enabled, cooldownSec, wakeOnDemand)
- budgetMonthlyCents
- reportsTo hierarchy

After creation, write the 4-file instruction bundles to each agent's instructionsRootPath.

Sync skills to each agent via `POST /api/agents/{agentId}/skills/sync`.

Report: agent IDs, names, roles, heartbeat config, budget, skills count.

### Task 5.5. Create CBS Projects and Routines

Run `python scripts/paperclip-create-projects-routines.py --entity cbs`.

Creates 3 projects and 2 routines (daily tender scan, 3-week governance cycle). Reports project IDs and routine IDs with next scheduled execution times.

### Task 5.6. Run Validation Checks

Run `python scripts/paperclip-validate.py --check companies --check agents-cbs --check kb-count`.

All checks must pass.

### Task 5.7. Prepare Day 3 Test Tender Brief

Create `day3-test-tender/test-brief.md`:

Review `knowledge-base/MANIFEST.md` to identify the most suitable CBS Group tender submission for the test. Create a brief containing:
- Tender reference and issuing agency (use the actual historical tender details)
- Scope of work summary
- Key requirements
- Simulated submission deadline (14 days from today)
- Expected output quality benchmark: "The response should reference CAPITAL framework methodology, cite specific CBS Group capabilities from the KB, and follow the value-based pricing approach. Compare against the original submission in the KB."

---

## Gate Verification

```bash
# 1. Documents ingested
python -c "
import os, requests
url = os.environ['SUPABASE_URL'] + '/rest/v1/documents?select=count'
headers = {'apikey': os.environ['SUPABASE_SERVICE_ROLE_KEY'], 'Authorization': 'Bearer ' + os.environ['SUPABASE_SERVICE_ROLE_KEY'], 'Prefer': 'count=exact'}
r = requests.get(url, headers=headers)
print(f'Document count: {r.headers.get(\"content-range\", \"unknown\")}')
"

# 2. Retrieval eval passed
python scripts/test-semantic-search.py 2>&1 | grep -c "PASS"

# 3. CBS agents created
python scripts/paperclip-validate.py --check agents-cbs

# 4. Projects and routines exist
python -c "
import os, requests
url = f'{os.environ[\"PAPERCLIP_URL\"]}/api/companies/CBS_COMPANY_ID/projects'
# Verify projects exist
"

# 5. Test brief exists
test -f day3-test-tender/test-brief.md && echo "PASS" || echo "FAIL"
```

**Archive point:** `git add -A && git commit -m "P5: Day 2 — KB ingested, CBS agents created, validation passed" && git tag river-p5-day2`

## Phase 5 Completion

Update TASK_LOG.md:
```markdown
## Project River — Phase 5 (Day 2)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** river-p5-day2

### Tasks Completed
- KB ingested with embeddings (N documents)
- Retrieval eval: N/5 queries passed
- Governance templates inserted
- 9 CBS agents created with instructions, skills, and heartbeat config
- 3 CBS projects created
- 2 CBS routines created (daily tender, 3-week governance)
- Validation checks passed
- Day 3 test tender brief prepared

### Known Issues
- [any retrieval gaps, agent config issues]

### Next Phase
- Read `docs/river-sprint/07-P6-DAY3-WR-PREP.md`
- Prerequisites: Jeff has verified CBS Executive heartbeat and KB retrieval test
```
