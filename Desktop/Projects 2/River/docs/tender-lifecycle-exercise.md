# Tender Lifecycle End-to-End Exercise (IV#10)

**Audience:** Jeff Dusting (operator)
**Purpose:** Drive one real tender through the full lifecycle (`interest_passed` → `go` or `no_go`) so the Stage 4 + Stage 5 machinery is exercised under production conditions.
**Produced by:** Stage 5 — P2 operational activation.

## Why this matters

Independent verification (IV#10) flagged that no tender has moved past `interest_passed`. The Tender Coordination agent's CA fill workflow, the CA approval gate delivered in Stage 4, the CA sender Apps Script, and the Go/No-Go sync evaluation path have never all run on the same real record. Until one complete traversal occurs we cannot claim the lifecycle is "live" — only that each component passes its unit or simulation test.

## Pre-flight checks (run before you start the exercise)

Run each check and confirm the expected result before clicking anything on the dashboard.

| # | Check | Command | Expected |
|---|---|---|---|
| 1 | Paperclip cookie fresh | `python3 -c "import os,httpx; r=httpx.get('https://org.cbslab.app/api/companies', headers={'Cookie': f'__Secure-better-auth.session_token={os.environ[\"PAPERCLIP_SESSION_COOKIE\"]}'}); print(r.status_code)"` | `200` |
| 2 | Anthropic key loaded | `echo $ANTHROPIC_API_KEY \| cut -c1-12` | `sk-ant-api03` |
| 3 | CA approval gate trigger present | Inspect `tender_register` in Supabase — column `ca_send_approved` exists | column present |
| 4 | CA sender Apps Script reachable | `curl -sS -o /dev/null -w "%{http_code}" "$RIVER_CA_SENDER_URL"` | `200` or `405` (405 = POST-only, still alive) |
| 5 | River Monitor agent heartbeat | Paperclip UI → River Monitor issue list shows an entry within the last hour | recent heartbeat |
| 6 | Unscored trace backlog is empty | `python3 scripts/evaluate-outputs.py --batch-size 1 --dry-run` | "No unscored traces" |

If any check fails, **stop** — fix the broken component first. A half-broken pre-flight will corrupt the exercise results.

## Tender selection

1. Open the CBS dashboard → Tenders view.
2. Filter to `lifecycle_stage = interest_passed`.
3. Prefer a tender that:
   - Has ≥ 3 attached documents (so the later Go/No-Go has enough grounding).
   - Is not time-critical (do not exercise on a tender the business actually wants to pursue urgently — choose one where you have slack).
   - Has a clearly identified tender contact email (CA sender needs it).
4. Record the tender id, title, and selection reasoning in `docs/tender-exercise-log.md` (create that file on first run).

## Stages to drive

### Stage A — Pursue decision

1. On the dashboard, click **Pursue** for the selected tender.
2. **Expect:** `lifecycle_stage` moves to `pursue`; a new issue appears for the Tender Coordination agent titled along the lines of `"CA fill: <tender title>"`.
3. **Watch for:** Tender Coordination agent heartbeat within ~15 min.
4. **Roll back:** If the issue never lands, run `python3 scripts/paperclip-validate.py` to confirm the Tender Coordination agent is alive and has the tender-coordination routine assigned. If the agent is dead, restart via Paperclip UI and re-click Pursue.

### Stage B — CA fill

1. Tender Coordination agent emits a trace block when it fills the CA.
2. **Expect:** Within ~30 min, the CA pdf appears in the tender's document list with a correction proposal or a clean fill.
3. **Watch for:**
   - A comment on the issue containing `---TRACE-START---...---TRACE-END---`.
   - Run `python3 scripts/ingest-traces.py --since 1` after the trace block posts. `agent_traces` row count should increase by at least 1.
   - Run `python3 scripts/evaluate-outputs.py --batch-size 5`. The `ca-fill` trace should be scored (sync task_type).
4. **Roll back:** If the agent fails to produce a CA fill in 60 min, abort the issue via the dashboard and reassign to manual. Log the failure mode.

### Stage C — CA approval + send

1. On the dashboard, open the tender and review the CA draft.
2. Click **Approve CA send**.
3. **Expect:** `tender_register.ca_send_approved` flips to `true`; CA sender Apps Script receives the payload and sends the CA from `jeff@cbsaustralia.com.au`.
4. **Watch for:**
   - A `202 Accepted` in the Apps Script execution log.
   - The sent email in the `jeff@cbsaustralia.com.au` Sent folder.
   - Tender stage advances to `ca_sent`.
5. **Roll back:** If the CA is not sent within 10 min, inspect the Apps Script logs (`script.google.com` → My Deployments → Executions). If the script errored, DO NOT resend without correcting the error — duplicate CA sends are embarrassing. Log the failure and escalate to manual send.

### Stage D — Documents received

1. The tender contact replies with documents (this is the step where the exercise leaves Claude and waits on a human counterparty).
2. **Expect:** Tender Coordination agent ingests the reply, stores documents in Supabase Storage, and advances stage to `documents_received`.
3. **Watch for:** `tender_register.doc_count` increases; documents visible in dashboard.
4. **Roll back:** If the agent misses the reply (classifier false negative), ingest manually via the dashboard upload. Log the miss as a `tender-intake` correction proposal.

### Stage E — Go/No-Go assessment

1. On the dashboard, click **Run Go/No-Go**.
2. **Expect:** A sync evaluation fires — the agent produces a scorecard, the evaluator runs a second pass (sync routing from P1), and both results are recorded in `evaluation_scores`.
3. **Watch for:**
   - `tender_register.go_no_go_scorecard` populates.
   - `evaluation_scores` has two rows with the same `trace_id` — one self-check, one independent evaluator pass.
   - Sync latency ≤ 45 sec (if longer, flag as IB.5 cost signal).
4. **Roll back:** If the evaluator 500s, check `ANTHROPIC_API_KEY` credit balance and the `rubric_versions` row for v1.0 active.

### Stage F — Go or No-Go decision

1. Review the scorecard on the dashboard.
2. Click **Go** or **No-Go** based on the recommendation and your own judgement.
3. **Expect:** `lifecycle_stage` moves to `go` or `no_go`. For `go`, a board paper issue is created for the Board Paper agent.
4. If `go`, optionally continue the exercise through board paper generation — but the exercise's primary goal (drive past `interest_passed`) is already met at this point.

## What to capture while running

Keep `docs/tender-exercise-log.md` open and jot:

- Timings between each stage transition (establishes realistic SLAs for IB.5 cost modelling).
- Every deviation from expected behaviour, however small.
- Every manual intervention that had to happen.
- Evaluator scores at stages B and E — these become the first production-scoring data points.
- Cookie refreshes required during the exercise (informs IB.3 cookie-auth runbook severity).

## Exit criteria

The exercise is complete when:

1. A real tender has moved from `interest_passed` through to `go` or `no_go` without manual stage-flipping in the database.
2. At least one sync evaluation (Stage E) has landed in `evaluation_scores`.
3. At least one trace has been ingested and scored via the standard pipeline (`ingest-traces.py` + `evaluate-outputs.py`).
4. The `docs/tender-exercise-log.md` file has a full narrative of the run.

## Known risks before starting

- **Cookie expiry mid-run.** Paperclip cookies expire quickly. Refresh before Stage A and again at Stage D.
- **Tender contact silence.** Stage D depends on a human counterparty. Pick a tender where you already have a relationship or the contact is responsive.
- **Evaluator cost.** A full sync evaluation at Stage E costs ~$0.01. Exercising the full lifecycle is safe from a cost standpoint.
- **CA send is irreversible.** Stage C sends a real email to a real counterparty. Do not exercise on a tender you are not actually willing to engage with.

## After the exercise

1. Commit `docs/tender-exercise-log.md`.
2. Raise a Stage 5 follow-up issue for every failure mode encountered.
3. Feed the evaluator scores from Stage E into the calibration dataset (re-run `scripts/calibrate-evaluator.py` if scores diverge materially from Jeff's own scoring).
4. Close out IV#10 in the Stage 5 verification phase (P9) by referencing this exercise log.
