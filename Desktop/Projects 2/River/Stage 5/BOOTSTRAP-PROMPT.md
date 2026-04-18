# Bootstrap — paste this into Claude Code

You are executing a structured remediation programme for Project River. This programme addresses all 40 issues identified in the Stage 4 adversarial critique. Begin immediately.

## Step 1: Read the programme README

```bash
cat stage5/00-README.md
```

## Step 2: Read the strategic plan

```bash
cat stage5/PLAN.md
```

## Step 3: Determine which phase to execute

```bash
cat TASK_LOG.md 2>/dev/null | grep -E "^## S5-P|Next phase" | tail -20 || echo "NO_S5_ENTRIES"
```

- If stage5 entries exist, find the most recent "Next phase" field. That is the phase you execute now.
- If no stage5 entries exist, your phase is **P0**.
- If "Next phase" lists multiple parallel options, run the first one listed.

## Step 4: Read the phase specification

| Phase | File |
|---|---|
| P0 | `stage5/01-P0-DISCOVERY.md` |
| P1 | `stage5/02-P1-CRITICAL-FIXES.md` |
| P2 | `stage5/03-P2-ACTIVATION.md` |
| P3 | `stage5/04-P3-SECRETS.md` |
| P4 | `stage5/05-P4-GOVERNANCE.md` |
| P5 | `stage5/06-P5-CI-QUALITY.md` |
| P6 | `stage5/07-P6-OBSERVABILITY.md` |
| P7 | `stage5/08-P7-DR-RESILIENCE.md` |
| P8 | `stage5/09-P8-DEFERRED-DESIGNS.md` |
| P9 | `stage5/10-P9-VERIFICATION.md` |

Read the phase file in full before writing any code.

## Step 5: Execute every task in the phase

Work through each TASK in order. Do not skip. Do not stop for confirmation unless the phase has a documented confirmation stop (P0 only).

## Step 6: Run gate verification

Run the gate verification script at the end of the phase file. Fix any FAIL before proceeding.

## Step 7: Commit and tag

```bash
git add -A
git commit -m "S5-P{N}: {description from phase file}"
git tag stage5-P{N}-{name}
```

## Step 8: Update TASK_LOG.md

Append the TASK_LOG entry template from the phase file. Fill in actual results. The "Next phase" field tells the next session which phase to run.

## Step 9: Report

Print summary: phase completed, files created/modified, gate results, known issues, next phase.

---

**Start now. Read the README (Step 1), then the plan (Step 2), then determine your phase (Step 3), then execute.**
