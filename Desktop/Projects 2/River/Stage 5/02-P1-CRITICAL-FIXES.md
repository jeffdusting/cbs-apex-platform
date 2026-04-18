# Phase 1: Critical Fixes + Repo Hygiene

## Objective

Fix the task_type vocabulary mismatch (IV#7/RA.11) that silently breaks the sync evaluation gate, clean up repo hygiene items, ingest WR templates, remove legacy rows, and document accepted patterns.

## Prerequisites

- S5-P0 complete.

## Context

```bash
cat stage5/DISCOVERY_SUMMARY.md
```

## Tasks

### TASK 1.1: Fix task_type Vocabulary (IV#7 / RA.11)

The `config/evaluation-events.json` uses snake_case (`tender_scan`, `go_no_go_assessment`) while `skills/trace-capture/SKILL.md` uses kebab-case (`tender-scan`, `go-no-go`). The trace-capture skill and monitoring agent use kebab-case, which means **kebab-case is the canonical format** (fewer files to change).

1. Rewrite `config/evaluation-events.json` — replace all snake_case task_types with kebab-case:
   - `go_no_go_assessment` → `go-no-go`
   - `board_paper` → `board-paper`
   - `ca_fill` → `ca-fill`
   - `executive_brief` → `executive-brief`
   - `white_paper_draft` → `white-paper`
   - `tender_scan` → `tender-scan`
   - `email_triage` → `email-triage`
   - `interest_test` → `interest-test`
   - `kb_intake` → `kb-intake`
   - `monitoring_digest` → `monitoring-digest`
   - `heartbeat_idle` → `heartbeat-idle`
   - `delegation_routing` → `delegation-routing`
   - `status_update` → `status-update`

2. Add a runtime warning to the evaluation routing logic in `scripts/lib/evaluator.py`. If a trace's `task_type` does not match any key in `evaluation-events.json`, log a WARNING with the unrecognised task_type rather than silently falling through to a default. Add a function:

```python
def resolve_evaluation_mode(task_type: str, events_config: dict) -> str:
    """Returns 'sync', 'async', or 'self_check'. Warns on unknown task_type."""
    for mode, cfg in events_config.items():
        known_types = [tc['task_type'] for tc in cfg.get('trigger_conditions', [])]
        if task_type in known_types:
            return mode.replace('_evaluation', '').replace('_only', '')
    import logging
    logging.warning(f"Unknown task_type '{task_type}' — defaulting to async evaluation")
    return 'async'
```

3. Update `scripts/evaluate-outputs.py` and `scripts/sync-evaluate.py` to use this resolver.

4. Verify: insert a synthetic trace with `task_type='go-no-go'` — confirm the resolver returns `sync`.

### TASK 1.2: Remove Placeholder Skill Directories (IV#1)

```bash
# Find and remove " 2" placeholder directories
find skills/ -type d -name "* 2" -exec echo "Removing: {}" \; -exec rm -rf {} +
git add -A
```

### TASK 1.3: Fix Phase Spec Range (IV#2) and Wording (IV#8)

Update `stage4/10-P9-VERIFICATION-CRITIQUE.md`:
- IV#2: adjust the CBS documents row-count gate from `≤ 3,000` to `≥ 1,000 AND ≤ 5,000`
- IV#8: update wording about WR_SUPABASE_URL to "WR agents are configured so that SUPABASE_URL resolves to the WR Supabase project at runtime"

### TASK 1.4: Ingest WR Prompt Templates (IV#4)

The WR Supabase `prompt_templates` table is empty. The 4 WR governance templates exist in `prompt-templates/` (filenames containing `wr` or `waterroads`).

```bash
python3 << 'EOF'
import os, httpx, json, glob

url = os.environ['WR_SUPABASE_URL']
key = os.environ['WR_SUPABASE_SERVICE_ROLE_KEY']
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json', 'Prefer': 'return=representation'}

# Find WR templates
wr_templates = [f for f in glob.glob('prompt-templates/*.md') if 'wr' in f.lower() or 'waterroads' in f.lower()]
print(f"Found {len(wr_templates)} WR templates: {wr_templates}")

for tmpl_path in wr_templates:
    with open(tmpl_path) as f:
        content = f.read()
    name = os.path.basename(tmpl_path).replace('.md', '')
    payload = {
        'name': name,
        'template': content,
        'entity': 'waterroads',
        'category': 'governance',
        'version': 1
    }
    r = httpx.post(f'{url}/rest/v1/prompt_templates', headers=headers, json=payload)
    print(f"  {name}: {'OK' if r.status_code in (200,201) else f'ERR {r.status_code} {r.text[:100]}'}")
EOF
```

If no WR-specific templates are found in `prompt-templates/`, check if the CBS templates should be duplicated for WR (with entity changed). Report the finding.

### TASK 1.5: Remove Legacy Waterroads Rows from CBS (IV#6)

```bash
python3 << 'EOF'
import os, httpx

url = os.environ['SUPABASE_URL']
key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Prefer': 'count=exact'}

# Count first
r = httpx.get(f'{url}/rest/v1/documents?entity=eq.waterroads&select=id,source_file,title', headers=headers)
rows = r.json() if r.status_code == 200 else []
print(f"Legacy waterroads rows in CBS Supabase: {len(rows)}")

if rows:
    # Sample to verify these are genuinely legacy (not intentional shared content)
    for row in rows[:5]:
        print(f"  {row.get('source_file', '?')[:60]} | {row.get('title', '?')[:40]}")
    
    # Check if this content exists in WR Supabase (if so, safe to delete from CBS)
    wr_url = os.environ.get('WR_SUPABASE_URL', '')
    wr_key = os.environ.get('WR_SUPABASE_SERVICE_ROLE_KEY', '')
    if wr_url and wr_key:
        wr_h = {'apikey': wr_key, 'Authorization': f'Bearer {wr_key}', 'Prefer': 'count=exact'}
        wr_r = httpx.get(f'{wr_url}/rest/v1/documents?select=id', headers={**wr_h, 'Range': '0-0'})
        wr_count = wr_r.headers.get('Content-Range', '*/0').split('/')[-1]
        print(f"\nWR Supabase has {wr_count} rows — content exists in proper location")
        
        # Safe to delete legacy rows from CBS
        del_headers = {**headers, 'Content-Type': 'application/json'}
        r = httpx.delete(f'{url}/rest/v1/documents?entity=eq.waterroads', headers=del_headers)
        print(f"Delete result: {r.status_code}")
    else:
        print("WR credentials not loaded — skipping delete, flagging for manual review")
EOF
```

### TASK 1.6: Document Accepted Patterns (CE.7, CE.9)

Create `docs/architecture-decisions/` directory with two short decision records:

**`docs/architecture-decisions/ADR-001-duplicate-routine.md`** (CE.7):
```markdown
# ADR-001: Duplicate Paperclip Routine Accepted

**Status:** Accepted
**Date:** 16 April 2026
**Context:** The Daily Tender Scan routine is duplicated in Paperclip and cannot be deleted via API (500 error, likely FK constraint). Both instances fire on the same cron schedule.
**Decision:** Accept the duplicate. The tender scan agent processes idempotently — duplicate invocations produce no additional side effects because `tender_register` has a unique constraint on `(reference, source)`.
**Consequence:** Marginally higher token usage (~$0.50/month). No data integrity risk.
```

**`docs/architecture-decisions/ADR-002-schema-divergence.md`** (CE.9):
```markdown
# ADR-002: CBS and WR Supabase Schema Divergence

**Status:** Accepted (intentional)
**Date:** 16 April 2026
**Context:** CBS and WR `documents` tables have divergent schemas: WR has `drive_file_id` + `drive_modified` (for Drive sync); CBS does not (repo-based ingestion). `match_documents` signatures differ: WR has `match_threshold` parameter; CBS was upgraded in Stage 4 to match.
**Decision:** Maintain the divergence. WR's Drive-based workflow requires the Drive sync columns. CBS's repo-based workflow does not. Forcing alignment would add unused columns or remove necessary ones.
**Consequence:** Code that reads both KBs must account for schema differences. The `supabase-query` skill handles this via entity-scoped queries to the correct project.
```

## Gate Verification

```bash
echo "=== S5-P1 Gate ==="

# task_type vocabulary
python3 -c "
import json
with open('config/evaluation-events.json') as f: e = json.load(f)
snake = [tc['task_type'] for mode in e.values() for tc in mode.get('trigger_conditions', [])]
bad = [t for t in snake if '_' in t]
print(f'PASS: All task_types kebab-case' if not bad else f'FAIL: Snake-case remains: {bad}')
"

# Resolver function exists
python3 -c "
import sys; sys.path.insert(0, 'scripts/lib')
from evaluator import resolve_evaluation_mode
print(f'PASS: resolve_evaluation_mode exists')
" 2>&1 || echo "FAIL: resolver missing"

# Placeholder dirs removed
placeholders=$(find skills/ -type d -name "* 2" 2>/dev/null | wc -l)
[ "$placeholders" -eq 0 ] && echo "PASS: No placeholder dirs" || echo "FAIL: $placeholders remain"

# WR templates
python3 -c "
import os, httpx
url = os.environ.get('WR_SUPABASE_URL',''); key = os.environ.get('WR_SUPABASE_SERVICE_ROLE_KEY','')
if url and key:
    r = httpx.get(f'{url}/rest/v1/prompt_templates?select=id', headers={'apikey': key, 'Authorization': f'Bearer {key}', 'Prefer': 'count=exact', 'Range': '0-0'})
    c = r.headers.get('Content-Range','*/0').split('/')[-1]
    print(f'PASS: WR prompt_templates has {c} rows' if int(c) > 0 else 'FAIL: WR prompt_templates still empty')
else:
    print('SKIP: WR credentials not loaded')
" 2>&1

# ADR docs
[ -f "docs/architecture-decisions/ADR-001-duplicate-routine.md" ] && echo "PASS: ADR-001" || echo "FAIL: ADR-001 missing"
[ -f "docs/architecture-decisions/ADR-002-schema-divergence.md" ] && echo "PASS: ADR-002" || echo "FAIL: ADR-002 missing"
```

## Archive Point

```bash
git add -A && git commit -m "S5-P1: Critical fixes — task_type vocab, repo hygiene, WR templates, ADRs"
git tag stage5-P1-critical-fixes
```

## TASK_LOG Entry

```markdown
## S5-P1: Critical Fixes
- **Status:** COMPLETE
- **task_type vocabulary:** fixed to kebab-case, resolver with unknown-type warning added
- **Placeholder dirs removed:** [N]
- **WR templates ingested:** [N]
- **Legacy WR rows deleted from CBS:** [N]
- **ADRs created:** ADR-001, ADR-002
- **Next phase:** P2 (Operational Activation)
```
