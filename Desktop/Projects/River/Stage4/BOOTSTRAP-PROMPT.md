# Bootstrap — paste this into Claude Code

You are executing a structured development programme for Project River. Begin immediately.

## Step 1: Read the programme README

```bash
cat stage4/00-README.md
```

## Step 2: Read the strategic plan

```bash
cat stage4/PLAN.md
```

## Step 3: Determine which phase to execute

```bash
cat TASK_LOG.md 2>/dev/null | grep -E "^## S4-P|Next phase" | tail -20 || echo "NO_TASK_LOG_ENTRIES"
```

- If stage4 entries exist in TASK_LOG.md, find the most recent "Next phase" field. That is the phase you execute now.
- If no stage4 entries exist, your phase is **P0**. 
- If the "Next phase" lists multiple options (parallel tracks), run the first one listed.

## Step 4: Read the phase specification

| Phase | File |
|---|---|
| P0 | `stage4/01-P0-COMPLETION.md` |
| P1 | `stage4/02-P1-WR-DISCOVERY.md` |
| P2 | `stage4/03-P2-CBS-DISCOVERY.md` |
| P3 | `stage4/04-P3-WR-DEDUP-REORG.md` |
| P4 | `stage4/05-P4-CBS-CLEANUP.md` |
| P5 | `stage4/06-P5-WR-VERIFY.md` |
| P6 | `stage4/07-P6-CBS-VERIFY.md` |
| P7 | `stage4/08-P7-WR-RECONFIG.md` |
| P8 | `stage4/09-P8-CALIBRATION.md` |
| P9 | `stage4/10-P9-VERIFICATION-CRITIQUE.md` |

Read the phase file in full before writing any code.

## Step 5: Execute every task in the phase

Work through each TASK in order. Do not skip. Do not stop for confirmation unless the phase is a discovery phase (P1 or P2) with a documented confirmation stop.

## Step 6: Run gate verification

Every phase ends with a gate verification script. Run it. Fix any FAIL before proceeding.

## Step 7: Commit and tag

```bash
git add -A
git commit -m "S4-P{N}: {description from phase file}"
git tag stage4-P{N}-{name}
```

## Step 8: Update TASK_LOG.md

Append the TASK_LOG entry template from the phase file. Fill in actual results. The "Next phase" field tells the next session which phase to run.

## Step 9: Report

Print summary: phase completed, files created/modified, gate results, known issues, next phase.

---

**Start now. Read the README (Step 1), then the plan (Step 2), then determine your phase (Step 3), then execute.**
