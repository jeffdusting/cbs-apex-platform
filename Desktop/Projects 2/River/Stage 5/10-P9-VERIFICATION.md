# Phase 9: Independent Verification

## Objective

Fresh-session audit of all Stage 5 work. Verify every critique issue was addressed. Confirm operational state. Produce a verification report with a verdict and an issue-to-resolution traceability matrix.

## Prerequisites

- ALL prior phases (S5-P0 through S5-P8) complete.
- All environment variables set.

**This session is an AUDITOR. Do not modify any files except the verification report.**

## Context

Read everything fresh:

```bash
cat stage5/PLAN.md
cat stage5/DISCOVERY_SUMMARY.md
cat TASK_LOG.md | grep -E "^## S5" -A5
```

## Tasks

### TASK 9.1: Issue Traceability Matrix

For every issue in the critique (IV#1–10, IB.1–9, CE.1–10, RA.1–11), verify the remediation was applied:

```bash
python3 << 'EOF'
import os, json

# Define the full issue list and expected evidence
issues = {
    "IV#1": {"desc": "Placeholder skill dirs", "check": "find skills/ -type d -name '* 2' | wc -l", "pass": "0"},
    "IV#7": {"desc": "task_type vocabulary", "check": "python3 -c \"import json; [print('SNAKE' if '_' in tc['task_type'] else 'OK') for m in json.load(open('config/evaluation-events.json')).values() for tc in m.get('trigger_conditions',[])]\""},
    "RA.2": {"desc": "Secrets plaintext", "check": "test -f scripts/env-op.env && echo 'MIGRATED' || echo 'PLAINTEXT'"},
    "RA.6": {"desc": "CA approval constraint", "check": "test -f scripts/ca-approval-constraint.sql && echo 'EXISTS' || echo 'MISSING'"},
    "CE.4": {"desc": "CI pipeline", "check": "test -f .github/workflows/ci.yml && echo 'EXISTS' || echo 'MISSING'"},
    "IB.2": {"desc": "Backup script", "check": "test -f scripts/backup-supabase.sh && echo 'EXISTS' || echo 'MISSING'"},
    "IB.1": {"desc": "Absence runbook", "check": "test -f docs/absence-runbook.md && echo 'EXISTS' || echo 'MISSING'"},
    "CE.1": {"desc": "Trace channel design", "check": "test -f docs/designs/structured-trace-channel.md && echo 'DESIGNED' || echo 'MISSING'"},
}

# Run checks (subset — full list in the verification report)
for ref, info in issues.items():
    result = os.popen(info['check']).read().strip()
    status = 'PASS' if 'MISSING' not in result and 'PLAINTEXT' not in result and 'SNAKE' not in result else 'CHECK'
    print(f"{ref:8s} {status:6s} {info['desc']:40s} {result}")
EOF
```

Build the complete matrix (all 40 issues) in the verification report.

### TASK 9.2: Structural Verification

Check existence of all files created in S5-P1 through S5-P8:

```bash
echo "=== S5 File Existence ==="
for f in \
    config/evaluation-events.json \
    config/retrieval-baselines.json \
    scripts/lib/evaluator.py \
    scripts/lib/embedding_guard.py \
    scripts/lib/near_dedup.py \
    scripts/wr-kb-dedup.py \
    scripts/cbs-kb-dedup.py \
    scripts/wr-ivfflat-rebuild.sql \
    scripts/ca-approval-constraint.sql \
    scripts/cbs-match-documents-upgrade.sql \
    scripts/retention-purge.py \
    scripts/agent-cost-report.py \
    scripts/trace-reconciliation.py \
    scripts/check-near-duplicates.py \
    scripts/retrieval-regression.py \
    scripts/backup-supabase.sh \
    scripts/railway-health-check.sh \
    scripts/export-tenant.py \
    scripts/op-setup.sh \
    scripts/env-op.env \
    scripts/supabase-limited-role.sql \
    .github/workflows/ci.yml \
    requirements.lock \
    docs/architecture-decisions/ADR-001-duplicate-routine.md \
    docs/architecture-decisions/ADR-002-schema-divergence.md \
    docs/architecture-decisions/ADR-003-cookie-auth.md \
    docs/policies/data-retention-policy.md \
    docs/policies/incident-response-plan.md \
    docs/policies/data-handling-policy.md \
    docs/policies/access-control-policy.md \
    docs/policies/change-management-policy.md \
    docs/designs/structured-trace-channel.md \
    docs/designs/separation-of-duties.md \
    docs/designs/mail-readwrite-test-plan.md \
    docs/designs/load-test-spec.md \
    docs/tender-lifecycle-exercise.md \
    docs/secrets-audit.md \
    docs/absence-runbook.md \
    docs/dr-drill-plan.md \
    docs/vendor-migration-costs.md; do
    [ -f "$f" ] && echo "OK   $f" || echo "MISS $f"
done
```

### TASK 9.3: Python Syntax Check

```bash
find scripts/ -name "*.py" -newer stage5/PLAN.md -exec python3 -m py_compile {} + 2>&1
```

### TASK 9.4: Supabase State Check

Verify CBS and WR Supabase tables, row counts, match_documents threshold, CA constraint trigger, active rubric, agent_traces production rows.

### TASK 9.5: Operational Verification

1. Run `scripts/retrieval-regression.py` (if baselines exist) — all queries within tolerance.
2. Dry-run `scripts/evaluate-outputs.py --dry-run --batch-size 1`.
3. Dry-run `scripts/ingest-traces.py --dry-run --since 1`.
4. Dry-run `scripts/check-blocked-work.py --since 1`.
5. Dry-run `scripts/retention-purge.py --dry-run` (if it exists).
6. Check CI workflow YAML validity.

### TASK 9.6: Write Verification Report

Create `stage5/VERIFICATION_REPORT.md`:

1. **Issue traceability matrix** — all 40 issues with: reference, description, severity, phase, action taken, evidence, status (RESOLVED / DESIGNED / PARTIAL / UNRESOLVED)
2. **Structural integrity** — file existence, syntax, config validity
3. **Data integrity** — Supabase state post-Stage 5
4. **Operational state** — which pipelines are producing data, which are still dark
5. **Numbered issue list** — any new issues found
6. **Critique coverage summary:**
   - Issues directly fixed: [N]
   - Issues with design document (deferred execution): [N]
   - Issues documented as accepted (ADR): [N]
   - Issues unresolved: [N] (should be 0)
7. **Verdict: PASS / PASS WITH CAVEATS / FAIL**

## Gate Verification

```bash
echo "=== S5-P9 Gate ==="
[ -f "stage5/VERIFICATION_REPORT.md" ] && echo "PASS: Report exists" || echo "FAIL"
grep -qi "verdict" stage5/VERIFICATION_REPORT.md 2>/dev/null && echo "PASS: Verdict present" || echo "FAIL"
grep -qi "traceability" stage5/VERIFICATION_REPORT.md 2>/dev/null && echo "PASS: Traceability matrix present" || echo "FAIL"
```

## Archive Point

```bash
git add -A && git commit -m "S5-P9: Independent verification — all 40 critique issues traced"
git tag stage5-P9-verification
```

## TASK_LOG Entry

```markdown
## S5-P9: Verification
- **Status:** COMPLETE
- **Verdict:** [PASS / PASS WITH CAVEATS / FAIL]
- **Issues directly fixed:** [N]
- **Issues designed (deferred):** [N]
- **Issues accepted (ADR):** [N]
- **Issues unresolved:** [N]
- **New issues found:** [N]
- **Programme status:** STAGE 5 COMPLETE
- **Next step:** Return to Claude chat with VERIFICATION_REPORT.md for advancement planning
```
