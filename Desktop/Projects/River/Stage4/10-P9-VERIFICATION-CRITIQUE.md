# Phase 9: Independent Verification + Adversarial Critique

## Objective

Fresh-session independent audit of everything built across hyper-agent-v1 and stage4. Find problems, not fix them. Produce adversarial critique from three hostile perspectives. Map each critique point to a concrete remediation for the advancement programme.

## Prerequisites

- ALL prior phases (S4-P0 through S4-P8) complete.
- All environment variables set.

**This session is an AUDITOR, not a developer. Do not modify any files except the two reports created in this phase.**

## Context

Read everything fresh — no assumptions from prior sessions:

```bash
cat stage4/PLAN.md
cat docs/hyper-agent-v1/DISCOVERY_SUMMARY.md
cat stage4/WR-DISCOVERY-SUMMARY.md
cat stage4/CBS-DISCOVERY-SUMMARY.md
cat TASK_LOG.md
cat BACKLOG.md | head -100
```

## Tasks

### TASK 9.1: Structural Verification

Check existence of all files created across both programmes. Python syntax check all `.py` files newer than `stage4/PLAN.md`. JSON validity check all `.json` config and data files. SQL file existence check.

### TASK 9.2: Supabase Data Integrity — CBS

Check all 9 tables exist with expected columns. Verify `ca_send_approved` column on `tender_register`. Test `match_documents` with `match_threshold`. Verify active rubric exists. Check no NULL entities in `documents`. Confirm post-dedup row count is reasonable (1,500–5,000 range, not 15,655).

### TASK 9.3: Supabase Data Integrity — WR

Check all 4 tables exist. Verify no "Imported from" paths in `source_file`. Verify `drive_file_id` coverage. Test `match_documents` with `match_threshold`.

### TASK 9.4: Cross-File Consistency

Verify:
- Rubric dimensions in config match `evaluation_scores` columns in schema
- Task types in `evaluation-events.json` match trace-capture skill
- Monitoring agent references existing tables and scripts
- Rubric weights sum to 1.0
- WR agents reference `WR_SUPABASE_URL` not `SUPABASE_URL`
- CA preflight script checks the column that the approval schema creates

### TASK 9.5: Behavioural Verification

Run E2E smoke test (`scripts/test-evaluator-e2e.py`). Dry-run all pipeline scripts. Run retrieval spot checks on both CBS and WR Supabase. Check entity isolation (WR query on CBS returns minimal, CBS query on WR returns minimal).

### TASK 9.6: Adversarial Critique — Investment Banker

"If I were evaluating this platform for acquisition or investment, what would concern me?"

Focus: data governance, single points of failure, vendor lock-in (Railway, Paperclip, Anthropic), scalability limits, cost predictability, IP protection, bus factor (Jeff as sole operator), cookie auth fragility, no backup/DR strategy.

### TASK 9.7: Adversarial Critique — Competitor's Engineer

"If I were trying to build a better version, where would I attack the weaknesses?"

Focus: architectural fragility (Railway SPOF, no failover), untested paths (no real tender has gone through full lifecycle), evaluation pipeline not yet proven at scale, trace ingestion depends on text parsing (brittle), Paperclip version pinning, no CI/CD, dependency on cookie auth.

### TASK 9.8: Adversarial Critique — Regulator / Auditor

"If I were auditing for governance compliance, what gaps would I find?"

Focus: audit trail completeness (do traces actually capture everything?), CA sender approval gate (bypassable if agent ignores preflight?), correction proposal review (weekly cadence — is that adequate?), data retention policy (none defined), access control (service role key = full access), separation of duties (agents self-evaluate via Layer B).

### TASK 9.9: Critique-to-Advancement Mapping

For every critique point across all three perspectives, produce:

| Ref | Issue | Severity | Remediation | Effort | Dependency |
|---|---|---|---|---|---|
| D1.1 | ... | Critical/High/Medium/Low | Specific fix | S/M/L/XL | ... |

Group by severity. Identify the top 5 highest-priority items for the advancement programme.

## Output

Create exactly two files. Modify nothing else.

### File 1: `stage4/INDEPENDENT_VERIFICATION.md`

1. Structural integrity results
2. CBS data integrity results
3. WR data integrity results
4. Cross-file consistency results
5. Behavioural verification results
6. Numbered issue list
7. **Verdict: PASS / PASS WITH CAVEATS / FAIL**

### File 2: `stage4/ADVERSARIAL_CRITIQUE.md`

1. Investment banker perspective
2. Competitor's engineer perspective
3. Regulator/auditor perspective
4. Critique-to-advancement mapping table
5. Top 5 remediation priorities

## Gate Verification

```bash
echo "=== S4-P9 Gate Verification ==="
[ -f "stage4/INDEPENDENT_VERIFICATION.md" ] && echo "PASS: Verification report" || echo "FAIL"
[ -f "stage4/ADVERSARIAL_CRITIQUE.md" ] && echo "PASS: Critique report" || echo "FAIL"
grep -qi "verdict" stage4/INDEPENDENT_VERIFICATION.md 2>/dev/null && echo "PASS: Verdict present" || echo "FAIL: No verdict"
grep -qi "top 5" stage4/ADVERSARIAL_CRITIQUE.md 2>/dev/null && echo "PASS: Top 5 priorities present" || echo "FAIL: Missing"
```

## Archive Point

```bash
git add -A && git commit -m "S4-P9: Independent verification + adversarial critique"
git tag stage4-P9-verification-critique
```

## TASK_LOG Entry

```markdown
## S4-P9: Verification + Critique
- **Status:** COMPLETE
- **Verification verdict:** [PASS / PASS WITH CAVEATS / FAIL]
- **Issues found:** [N]
- **Critique points:** [N] across 3 perspectives
- **Top 5 remediation priorities:** [list]
- **Programme status:** STAGE 4 COMPLETE
- **Next step:** Return to Claude chat with ADVERSARIAL_CRITIQUE.md for advancement planning
```
