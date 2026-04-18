# Phase 0: Discovery

## Objective

Verify the current state of the River repository and Supabase projects post-Stage 4. Confirm which critique issues are still present. Write a persistent discovery summary.

## Prerequisites

- All Stage 4 work complete. `stage4/ADVERSARIAL_CRITIQUE.md` and `stage4/INDEPENDENT_VERIFICATION.md` exist.

## Context

```bash
cat stage4/ADVERSARIAL_CRITIQUE.md | head -10
cat stage4/INDEPENDENT_VERIFICATION.md | grep -A2 "Verdict"
cat TASK_LOG.md | tail -30
```

## Tasks

### TASK 0.1: Read the Critique and Verification Report

```bash
cat stage4/ADVERSARIAL_CRITIQUE.md
cat stage4/INDEPENDENT_VERIFICATION.md
```

Extract the full issue list. For each issue, check whether it is still present by inspecting the relevant file, table, or configuration.

### TASK 0.2: Verify task_type Vocabulary State (IV#7)

```bash
python3 -c "
import json
with open('config/evaluation-events.json') as f:
    events = json.load(f)
with open('skills/trace-capture/SKILL.md') as f:
    skill = f.read()

for mode, cfg in events.items():
    for tc in cfg.get('trigger_conditions', []):
        tt = tc['task_type']
        if tt in skill:
            print(f'MATCH: {tt}')
        elif tt.replace('_', '-') in skill:
            print(f'MISMATCH: {tt} (events) vs {tt.replace(\"_\", \"-\")} (skill)')
        else:
            print(f'MISSING: {tt} not found in skill at all')
"
```

### TASK 0.3: Verify Supabase State

```bash
python3 << 'EOF'
import os, httpx

# CBS
url = os.environ['SUPABASE_URL']
key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
h = {'apikey': key, 'Authorization': f'Bearer {key}', 'Prefer': 'count=exact'}

for table in ['documents', 'agent_traces', 'evaluation_scores', 'rubric_versions', 'correction_proposals', 'tender_register']:
    r = httpx.get(f'{url}/rest/v1/{table}?select=id', headers={**h, 'Range': '0-0'})
    count = r.headers.get('Content-Range', '*/ERR').split('/')[-1] if r.status_code == 200 else f'ERR-{r.status_code}'
    print(f'CBS {table}: {count}')

# Check for placeholder skill dirs
import os as _os
placeholders = [d for d in _os.listdir('skills') if ' 2' in d]
print(f'\nPlaceholder skill dirs: {placeholders if placeholders else "none"}')

# Check WR
url2 = os.environ.get('WR_SUPABASE_URL', '')
key2 = os.environ.get('WR_SUPABASE_SERVICE_ROLE_KEY', '')
if url2 and key2:
    h2 = {'apikey': key2, 'Authorization': f'Bearer {key2}', 'Prefer': 'count=exact'}
    for table in ['documents', 'prompt_templates']:
        r = httpx.get(f'{url2}/rest/v1/{table}?select=id', headers={**h2, 'Range': '0-0'})
        count = r.headers.get('Content-Range', '*/ERR').split('/')[-1] if r.status_code == 200 else f'ERR-{r.status_code}'
        print(f'WR {table}: {count}')
    
    # Check legacy waterroads rows in CBS
    r = httpx.get(f'{url}/rest/v1/documents?entity=eq.waterroads&select=id', headers={**h, 'Range': '0-0'})
    wr_in_cbs = r.headers.get('Content-Range', '*/0').split('/')[-1]
    print(f'\nLegacy waterroads rows in CBS: {wr_in_cbs}')
else:
    print('\nWR credentials not loaded — source .secrets/wr-env.sh')
EOF
```

### TASK 0.4: Verify Secrets Posture

```bash
echo "=== Secrets check ==="
if [ -f "scripts/env-setup.sh" ]; then
    secrets_count=$(grep -c "export.*KEY\|export.*SECRET\|export.*TOKEN\|export.*PASSWORD" scripts/env-setup.sh)
    echo "Plaintext secrets in env-setup.sh: $secrets_count"
    echo "File permissions: $(ls -la scripts/env-setup.sh | awk '{print $1}')"
else
    echo "env-setup.sh not found"
fi

# Check if 1Password CLI is available
which op 2>/dev/null && echo "1Password CLI: installed" || echo "1Password CLI: NOT installed"
```

### TASK 0.5: Verify CI State

```bash
echo "=== CI check ==="
[ -d ".github/workflows" ] && echo "GitHub Actions: exists" || echo "GitHub Actions: MISSING"
[ -f "requirements.txt" ] && echo "requirements.txt: exists ($(wc -l < requirements.txt) lines)" || echo "requirements.txt: MISSING"
[ -f "requirements.lock" ] || [ -f "requirements.txt.lock" ] && echo "Lockfile: exists" || echo "Lockfile: MISSING"
```

### TASK 0.6: Write Discovery Summary

Create `stage5/DISCOVERY_SUMMARY.md` with:

1. **Issue status** — for each of the 40 critique issues, confirm PRESENT / ALREADY FIXED / PARTIALLY ADDRESSED
2. **Supabase state** — table row counts, agent_traces rows (production vs test), evaluation_scores production data
3. **Repository state** — uncommitted changes, placeholder dirs, CI presence
4. **Secrets posture** — plaintext count, 1Password availability, file permissions
5. **Operational state** — which routines are producing data, which are dark
6. **Conflicts with PLAN.md** — anything that changes the planned remediation approach

## Confirmation Stop

Report findings. Wait for operator confirmation.

## Gate Verification

```bash
echo "=== S5-P0 Gate ==="
[ -f "stage5/DISCOVERY_SUMMARY.md" ] && echo "PASS: Summary exists" || echo "FAIL"
lines=$(wc -l < stage5/DISCOVERY_SUMMARY.md 2>/dev/null || echo 0)
[ "$lines" -gt 40 ] && echo "PASS: $lines lines" || echo "FAIL: too short"
```

## Archive Point

```bash
git add -A && git commit -m "S5-P0: Discovery — post-Stage 4 state assessment"
git tag stage5-P0-discovery
```

## TASK_LOG Entry

```markdown
## S5-P0: Discovery
- **Status:** COMPLETE
- **Issues still present:** [N]/40
- **Issues already fixed:** [N]
- **agent_traces production rows:** [N]
- **Secrets in plaintext:** [N]
- **1Password CLI:** [installed / not installed]
- **CI:** [exists / missing]
- **Next phase:** P1 (Critical Fixes)
```
