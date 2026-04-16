# Adversarial Critique — Project River

**Phase:** S4-P9
**Date:** 16 April 2026
**Auditor:** Fresh-session Claude Code (no prior context from build sessions)
**Companion to:** `INDEPENDENT_VERIFICATION.md` — that report verifies what was built; this report attacks it.

Three hostile perspectives are applied: an investment banker assessing the platform for acquisition, a competitor's engineer hunting for places to outbuild it, and a regulator/auditor probing for governance gaps. Each perspective generates issues, all are mapped to remediations, and a top-5 priority list closes the report.

Issue references: `IB.x` = investment banker, `CE.x` = competitor's engineer, `RA.x` = regulator/auditor. Cross-references to `INDEPENDENT_VERIFICATION.md` issues use `IV#n`.

---

## 1. Investment Banker Perspective

> *"If I were evaluating this platform for acquisition or investment, what would concern me?"*

### IB.1 Bus factor of one (CRITICAL)

Jeff is the sole operator. Every cookie refresh, every Supabase service-role action, every Paperclip session, every Apps Script that breaks at 2 AM lands on him. There is no operational backup, no documented runbook for "Jeff is on holiday for two weeks", no second person who could roll a Paperclip session cookie. The TASK_LOG, PLAN documents, and runbook implicitly assume Jeff. An acquirer would discount the platform's value by the cost of replacing or hiring around this dependency, and that cost is non-trivial — the system has accreted twelve months of decisions whose rationales live in Jeff's head plus one git history.

### IB.2 No backup or disaster-recovery posture (CRITICAL)

The platform depends on:

- Two Supabase projects (CBS `eptugqwlgsmwhnubbqsk`, WR `imbskgjkqvadnazzhbiw`) — no documented backup beyond Supabase's default daily snapshot at the platform tier.
- One Paperclip Railway deployment — no documented restore-from-image plan, no warm standby, no tested failover. The `PAPERCLIP_IMAGE_DIGEST` is pinned in `scripts/env-setup.sh`, which is the right instinct, but no actual DR drill has been run.
- Two Google Workspace accounts (Drive, Apps Script) and one Microsoft 365 tenant (Outlook, Teams, SharePoint, Graph). No rehearsed account-loss recovery.
- One Vercel project for the dashboard, one Apps Script for email intake, one Apps Script for CA sender.

There is no documented RTO or RPO. There is no automated export of `documents`, `agent_traces`, `evaluation_scores`, or `correction_proposals`. If a service-role key were to leak and an attacker dropped tables, the rebuild path is "re-ingest from Drive plus re-derive corrections from git history" — recoverable in principle, not rehearsed in practice.

### IB.3 Cookie-based authentication for production-critical scripts (HIGH)

A non-trivial fraction of the deployment toolchain (`create-evaluator-routine.py`, `create-monitoring-agent.py`, `create-trace-ingestion-routine.py`, `deploy-heartbeat-extensions.py`, `prepare-trace-skill-sync.py`, `ingest-traces.py`, `wr-agent-reconfig.py`) requires a `PAPERCLIP_SESSION_COOKIE` extracted from the founder's browser. There is no service account, no machine identity, no API key path that does not eventually expire and require Jeff to log into `org.cbslab.app`. This is fine for a one-person startup; it is a meaningful operational cost at any scale beyond that and a concrete reason the trace ingestion routine has produced 0 rows in production (IV#3).

### IB.4 Vendor concentration risk (HIGH)

The platform sits on a stack with multiple single suppliers and no contractual fallbacks:

| Layer | Supplier | Risk if vendor fails |
|---|---|---|
| Agent runtime | Paperclip (private, pre-1.0) | Total stop. No alternative orchestrator drop-in. |
| Database + retrieval | Supabase (one of the larger PaaS providers, but one provider) | Total stop. Migration cost moderate (it is Postgres + pgvector underneath). |
| LLMs | Anthropic (evaluator + agents) | Total stop. Migration cost moderate (provider abstraction exists in `lib/evaluator.py` but is not generalised). |
| Embeddings | Voyage AI | Total stop. Re-embedding 1,273 + 16,786 chunks at a different model means a full index rebuild. |
| Hosting | Railway | Service interruption. Restart on Render or Fly is documented as feasible but not rehearsed. |
| Email intake | Google Apps Script | Service interruption. Power Automate equivalent failed previously (per TASK_LOG). |

Paperclip is the highest concentration risk: it is private software at 0.3.1, no public SLA, no escape hatch. The two Apps Scripts also represent quiet dependencies on Google's free tier with no licence-bound recourse.

### IB.5 Cost predictability (MEDIUM)

`agent-config/token-budgets.md` records monthly budgets totalling roughly $200/month across CBS + WR agents plus the evaluator. There is no automated cost-attribution dashboard tying actual spend to agent ID; budgets are enforced by Paperclip soft-alerts at 80%. Token cost grows with both heartbeats (linear in agent count) and trace ingestion (linear in evaluation throughput), and the evaluator currently runs on Sonnet-4 at every 2 hours — this becomes the largest variable cost as production traffic appears. There is no Sentinel-style anomaly detection for runaway agents.

### IB.6 Intellectual-property surface (MEDIUM)

The CAPITAL framework, Shipley methodology assets, all competitor profiles, and the corrections that encode "how Jeff thinks about a tender" all live in plaintext markdown in the repository. The repository itself is not visibly licensed. There is no DLP, no encryption-at-rest beyond what Supabase provides at the platform layer, no field-level encryption on `documents.content`. An attacker with a leaked `SUPABASE_SERVICE_ROLE_KEY` (which sits in `scripts/env-setup.sh` plaintext, locally) walks away with the entire knowledge corpus of two firms.

### IB.7 Scalability ceiling not tested (MEDIUM)

The system was designed for a load that has not arrived: 30 tenders in `tender_register`, 0 advanced past `interest_passed`, 0 board papers, 0 agent traces in production, no concurrent evaluator runs. Concurrency models, evaluator throughput, embedding rate limits, and Paperclip's behaviour with simultaneous heartbeats across 13 agents are all unmeasured at the scale the platform was sized for. The S4-P3 dedup ran at 19,301 → 16,786 rows in a few minutes; what happens when that becomes 200,000 is unanswered.

### IB.8 Governance documentation is methodology, not control (LOW)

The platform's governance posture is described in agent instructions ("hard stops", "do not send", "do not approve") but does not include independently-verifiable policy documents (data-handling policy, incident response plan, retention schedule, access-control policy). For an acquirer, the absence of these is normal at this stage; for a buyer in a regulated sector (financial services, government) they would be required and not present.

### IB.9 No exit / portability story for customer data (LOW)

If a third entity ever became a tenant of this platform, the data export story is "manual SQL dump from Supabase + manual Drive download". There is no built-in tenant-export path, no portability tooling. Easy to build later; missing today.

---

## 2. Competitor's Engineer Perspective

> *"If I were trying to build a better version, where would I attack the weaknesses?"*

### CE.1 The trace pipeline depends on free-text parsing of issue comments (CRITICAL)

`scripts/ingest-traces.py` parses Paperclip issue-comment markdown for `---TRACE-START---` / `---TRACE-END---` markers, JSON-decodes the body, and inserts rows. This is brittle in three ways:

1. The agent must emit the markers exactly. Any whitespace drift, any model variation that wraps the JSON in a code fence, any model that decides to "improve" the format breaks the parse silently.
2. The JSON body is inside a Markdown comment. There is no schema validation at the agent boundary. If `task_type` is misspelt (e.g. `tender_scan` vs `tender-scan`, see IV#7) the row inserts but routes wrong.
3. If Paperclip ever changes how comments are stored, exported, or ordered, the parser breaks.

A competitor would build a structured-output channel directly into the agent runtime (function call returning a typed object) and never round-trip through markdown. This is the single highest-leverage architectural attack.

### CE.2 Single Railway deployment, no failover (CRITICAL)

Paperclip runs on one Railway service. There is no health check tied to a load balancer, no warm standby, no documented MTTR target. A Railway region outage stops every heartbeat across both companies. A competitor with a multi-region Kubernetes deployment, even a small one, would advertise SLA in a way Project River cannot match today.

### CE.3 Embedding model is unverified at insert time (HIGH)

S4-P5 surfaced the silent failure mode where `voyage-3` and `voyage-3.5` produce vectors of the same dimension (1024) but in incompatible spaces. The retrieval test caught this only because top similarities collapsed to ~0.03. Production ingest paths do not assert that the embedding model used to embed query and chunk are the same — the checks live in test scripts. A model-mismatch incident could land silently and degrade retrieval for weeks before anyone noticed.

### CE.4 No CI / no automated tests in CI (HIGH)

There is no `.github/workflows/`, no Buildkite config, no Vercel preview-test integration. `scripts/test-evaluator-e2e.py` and the retrieval test scripts only run when someone runs them. Every commit to `main` is implicitly trusted. A competitor who automates linting, type-checking, schema-conformance tests on every PR ships with materially lower regression risk.

### CE.5 Self-evaluation conflict (HIGH)

The Layer B "self-check" skill has the same agent that produced the output also score it. Even with a separate evaluator pass (Layer A) running async, the trace's `self_check.score` field — used for blocked-work detection and trace prioritisation — is self-reported by the producing agent. A competitor would point to the obvious conflict: the agent that decided its KB grounding was strong is the same agent that wrote the ungrounded text. Independent evaluation per heartbeat (more expensive, but tractable for high-value tasks) is the corrective design.

### CE.6 Dedup correctness depends on byte-identical content hashes (MEDIUM)

S4-P3 and S4-P4 dedup logic uses SHA-256 of chunk content. Two ingests of the same PDF that produce slightly different text extraction (line-wrap differences, page-break artefacts, OCR variation) survive as "distinct" rows. WR-DISCOVERY-SUMMARY §8 already noted this risk for files >50 chunks; no shingling check was added. A competitor with content-similarity dedup (MinHash, cosine on sentence embeddings) would maintain a leaner index.

### CE.7 Routine-level rather than queue-level concurrency (MEDIUM)

Paperclip routines fire on cron. The "Daily Tender Scan" routine is duplicated and cannot be deleted via API; the system relies on agent idempotency to avoid double-processing. A competitor running a worker queue (SQS, Kafka, Temporal) with at-least-once semantics and explicit deduplication keys ships with stronger guarantees.

### CE.8 No dependency lockfile / no SBOM (MEDIUM)

`scripts/requirements.txt` exists but is not pinned tightly (no `pip-compile`, no hashes, no lockfile). The Paperclip Docker digest is pinned, which is good; the Python environment around it is not. A competitor with Renovate / Dependabot configured catches CVEs and library breakages within hours.

### CE.9 Two retrieval indexes with diverging schemas (LOW)

The hyper-agent-v1 discovery summary records that CBS and WR `documents` schemas diverge (`drive_file_id` only on WR; `match_documents` signature differs; IVFFlat lists differ). This is intentional but creates ongoing complexity for any code that reads both. A competitor with a unified `documents` table or a single retrieval layer behind both has lower carrying cost.

### CE.10 No retrieval evaluation harness in CI (LOW)

`Stage4/scripts/cbs-retrieval-test.py` and `scripts/wr-retrieval-test.py` test 10 and 5 hand-picked queries. There is no growing regression set, no nightly drift check, no comparison against a frozen baseline. After any KB change a competitor would automatically rerun the full retrieval suite and diff scores; here it is operator-initiated.

---

## 3. Regulator / Auditor Perspective

> *"If I were auditing for governance compliance, what gaps would I find?"*

### RA.1 No data retention or deletion policy (HIGH)

There is no documented retention schedule for `agent_traces`, `evaluation_scores`, `correction_proposals`, `tender_register`, or `documents`. The CBS dedup phase (S4-P4) deleted 14,382 rows; the WR dedup deleted 2,515; both were operator-initiated quality remediations, not policy-driven retention purges. Under any regime that applies to the underlying customer data (Australian Privacy Principles, GDPR for any EU-touched material, contractual obligations to clients) the absence of a retention policy is a finding by itself.

### RA.2 Service-role key on disk in plaintext (HIGH)

`scripts/env-setup.sh` contains the full Supabase service-role JWT for both Supabase projects, the Anthropic API key, the Voyage API key, the Microsoft client secret, the Xero client secret, the Teams webhook URL, and a GitHub PAT — all in plaintext, all on the founder's laptop, all exported into the shell when any script runs. The file is gitignored, so it does not leak via commit, but it has none of the protections an auditor expects: no Vault, no SOPS encryption, no `chmod 600` enforcement, no rotation log. Any attacker who lands on the laptop walks away with full database write access.

### RA.3 Service role bypasses RLS (HIGH)

Every Supabase script in this repo authenticates with the service-role key. Row-level security is therefore inactive on every code path. There is no separation between "read only" agents and "read/write" agents at the data-layer boundary; the boundary lives in agent instructions (`AGENTS.md` "hard stops"), which are advisory, not enforced. An auditor would point out that an agent that ignored its instruction would still have full DB access.

### RA.4 Self-evaluation bypass risk (HIGH)

Layer B (`skills/self-check`) is the only quality control on the synchronous path before sync-evaluation thresholds engage. The agent producing the output is the agent reporting the self-check score embedded in the trace. The trace then drives downstream blocked-work detection. An agent that consistently self-reported `score: 5.0` would never trigger the monitoring agent's blocked-work check. There is no independent attestation that the embedded self-check value matches what the self-check skill actually produced.

### RA.5 Audit-trail completeness is structural, not enforced (MEDIUM)

`agent_traces` is the system-of-record for "what the agent did". The contract is: every substantive output emits a trace. There is no enforcement of this contract. If an agent produces an output without emitting a trace, the trace simply does not exist; no alarm fires, the missing trace is invisible. The smoke test confirms the path works; it does not confirm the path was used. Independent reconciliation (e.g. trace count vs Paperclip issue-comment count) is not implemented.

### RA.6 CA approval gate is bypassable in two ways (MEDIUM)

The CA send approval gate is enforced architecturally by:

1. `scripts/ca-sender-preflight.py` — checks `ca_send_approved=TRUE` before sending.
2. `scripts/river-ca-sender.gs` — the actual sender, gated by the preflight.

Bypass paths:

- The preflight is a separate script, not invoked from inside `river-ca-sender.gs`. An operator or future agent that runs the sender directly, skipping the preflight, will not be gated. A row-level trigger or a database constraint that physically prevents `ca_sent_at IS NOT NULL` unless `ca_send_approved=TRUE` would close this.
- The service-role key (RA.2/RA.3) can `UPDATE tender_register SET ca_send_approved = TRUE` from any script, with no separation of duties. Approval is meant to be human; nothing in the data layer enforces that.

### RA.7 Correction-proposal review is weekly (MEDIUM)

PLAN.md §3 records the founder decision: "Correction review cadence — weekly batch. Informational in daily digest." For a system that depends on correction proposals to close the quality loop on agent errors (factual discipline failures, fabrication, instruction non-adherence) a weekly cadence means up to seven days of biased outputs before the corrective signal lands. For high-value paths (CA fill, board papers) this is too slow. A regulator would want either tighter cadence on high-severity proposals or an automatic block on the originating agent until a critical proposal is reviewed.

### RA.8 No separation of duties (MEDIUM)

The same operator (Jeff) is the founder, the dev, the evaluator, the auditor, the deployer, and the human-in-the-loop. There is no second pair of eyes on calibration scores, on correction approvals, on schema migrations, on Paperclip API mutations. P8 records Jeff as both the human scorer and the consumer of the calibration report comparing his scores to the evaluator. This is normal for a sole founder; an auditor would still flag it.

### RA.9 Hard-stop enforcement is layered but the platform layer leaks (MEDIUM)

Hard stops have three layers (per Day 4 testing):

- Layer 1 (instruction): agent refuses based on AGENTS.md.
- Layer 2 (platform): Mail.Send returns 404 because Graph permission not granted.
- Layer 3 (audit): activity log delete returns 404.

Layer 2 is the load-bearing layer. Mail.ReadWrite is documented as a planned upgrade (`docs/hyper-agent-v1/MAIL_READWRITE_UPGRADE.md`) that would grant the agents send capability — at which point the only thing standing between the agent and an outbound email would be Layer 1 (its own instruction). An auditor would want the Mail.Send capability to remain at the granular `Mail.ReadWrite` level the doc describes, never expanding to `Mail.Send`, and would want the upgrade gate to require evidence that Layer 1 self-restraint has been audit-tested with adversarial prompts.

### RA.10 No incident response plan (LOW)

There is no documented IR plan for: leaked service-role key, agent producing an unauthorised external action, evaluator producing systematically wrong scores in production, CA sent without approval. The Operator Runbook covers normal operations; it does not cover what to do at 2 AM when something has gone wrong.

### RA.11 Bug log: trace task_type vocabulary mismatch (HIGH)

Issue IV#7 (cross-file task_type vocabulary mismatch) is itself an audit finding: the architectural sync-evaluation gate is bypassed in production for every task_type because the routing table will never match. An auditor running a tabletop exercise on "what gates the high-risk go/no/go assessment from being delivered without evaluator scoring" would find no working gate.

---

## 4. Critique-to-Advancement Mapping

Each issue mapped to a concrete remediation. Severity drives priority. Effort sizing: S = under a day, M = 1–3 days, L = 1–2 weeks, XL = >2 weeks.

| Ref | Issue (one line) | Severity | Remediation | Effort | Dependency |
|---|---|---|---|---|---|
| IV#1 | Empty " 2" placeholder skill directories | LOW | `git rm -r` the six placeholder directories | S | None |
| IV#2 | Phase spec range mismatch | LOW | Update `Stage4/10-P9-VERIFICATION-CRITIQUE.md` row-count gate to `≥ 1,000 and ≤ 5,000` | S | None |
| IV#3 | Evaluator tables empty in production | MEDIUM | Run `ingest-traces.py` once with a fresh cookie against a 24h window; register the trace ingestion routine via `create-trace-ingestion-routine.py --execute` | M | Cookie refresh |
| IV#4 | WR `prompt_templates` empty | MEDIUM | Re-ingest the four WR templates into WR Supabase via a one-off script (mirror of `ingest-wr-templates.py` pointing at `WR_SUPABASE_URL`) | S | None |
| IV#5 | WR IVFFlat at lists=40 | HIGH | Apply `scripts/wr-ivfflat-rebuild.sql` in Supabase SQL Editor against WR project. Same for CBS at lists=36 if not already done | S | Operator action |
| IV#6 | 98 legacy waterroads rows on CBS | LOW | `DELETE FROM documents WHERE entity='waterroads' AND project='cbs'` in CBS SQL Editor; or migrate first if content differs from current WR KB | S | Validation review |
| IV#7 | task_type vocabulary mismatch | HIGH | Pick kebab-case (matches trace-capture and monitoring agent — fewer files to change). Rewrite `config/evaluation-events.json` to use `tender-scan`, `go-no-go`, `board-paper`, `ca-fill`, `executive-brief`, etc. Add white_paper_draft → `white-paper`, heartbeat_idle → `heartbeat-idle`. Add a runtime warning in the routing layer for unknown task_types so future drift is visible | S | None |
| IV#8 | P9 phase spec wording on WR_SUPABASE_URL | LOW | Update phase spec wording to "WR agents are configured so that `SUPABASE_URL` resolves to the WR Supabase project at runtime" | S | None |
| IV#9 | Trace ingestion never run in production | MEDIUM | Same remediation as IV#3 | M | Cookie refresh |
| IV#10 | No tender past `interest_passed` | MEDIUM | Drive one real tender through the full lifecycle (interest → pursue → ca_drafted → ca_sent → docs_received → go_no_go → go) as an explicit smoke test. Capture the lessons | L | Real tender opportunity |
| IB.1 | Bus factor of one | CRITICAL | Document the runbook "what breaks if Jeff is unavailable for 14 days" — concrete failure modes (cookie expiry, Apps Script auth, Paperclip restart) and their fixes. Train one second person on minimum viable response | L | Hire / brief a second |
| IB.2 | No backup / DR posture | CRITICAL | Define RTO/RPO. Automate daily `pg_dump` of both Supabase projects to S3-compatible storage. Document the rebuild path. Run one DR drill against a recovery snapshot | L | Storage account |
| IB.3 | Cookie auth | HIGH | Move all deploy scripts to a Paperclip API key path. If Paperclip does not yet support API keys for the relevant endpoints, raise as a roadmap item with the vendor; meanwhile, document the cookie refresh as the operator runbook step (currently implicit) | M | Paperclip vendor |
| IB.4 | Vendor concentration | HIGH | Document the migration cost for each layer (Supabase → self-hosted Postgres+pgvector; Voyage → another embedding provider; Anthropic → multi-provider via abstraction). Decide which is acceptable and which warrants a redundant provider today. Most realistic immediate hedge: provider-abstract `lib/evaluator.py` so swapping the LLM provider is config not code | L | Architectural decision |
| IB.5 | Cost predictability | MEDIUM | Build a per-agent monthly cost report from Paperclip API token-usage data; alert on >120% of budget; flag agents that are most token-elastic for closer attention | M | Paperclip API endpoint availability |
| IB.6 | IP surface | MEDIUM | Add field-level encryption to `documents.content` for the most sensitive subset (corrections, competitor profiles, board papers) using Supabase's pgcrypto. Add a documented policy on which categories are encrypted. Tighten the `scripts/env-setup.sh` posture: move secrets to a Vault or 1Password CLI integration with on-demand decryption | L | Decision on which categories to encrypt |
| IB.7 | Scalability ceiling | MEDIUM | Run a synthetic load test: 1,000 traces ingested in an hour, 100 evaluations/hour, 10× the current tender register, simultaneous heartbeats across all 13 agents. Capture failure modes | L | Test harness |
| IB.8 | Methodology not policy | LOW | Draft the four documents an auditor expects: data-handling policy, IR plan, retention schedule, access-control policy | M | Decisions on policy content |
| IB.9 | No tenant export | LOW | Add a `scripts/export-tenant.py` that produces a portable bundle (documents, governance, traces) per entity. Useful for backups too | M | Decision on export format |
| CE.1 | Trace pipeline depends on free-text parsing | CRITICAL | Replace the trace-in-comment marker pattern with a structured channel: either a Paperclip "metadata" field on the issue comment, or a side-channel POST from the agent to a `/traces` endpoint that writes directly to `agent_traces`. Add JSON Schema validation. Reject non-conforming traces visibly | XL | Paperclip vendor capability |
| CE.2 | Single Railway deployment | CRITICAL | Stand up a second Railway environment as warm standby, or move to a multi-region Kubernetes deployment. At a minimum, automate health-check + restart on the existing Railway service | L | Hosting cost |
| CE.3 | Embedding model unverified at insert | HIGH | Add an `embedding_model` column on `documents` (or a metadata key). Reject inserts whose model differs from the active retrieval model. Verify on every retrieval path | M | Schema migration |
| CE.4 | No CI | HIGH | Add `.github/workflows/ci.yml`: lint (ruff), type-check (mypy / pyright), pytest, schema-conformance check (rubric weights sum to 1.0, evaluation_scores columns match rubric, task_type vocabulary consistency). Run on every PR | M | None |
| CE.5 | Self-evaluation conflict | HIGH | For high-value paths (sync-evaluation task types), run an independent evaluator pass per output, not just the self-check. Cost moderately higher; trust materially higher | M | Cost approval |
| CE.6 | Byte-identical hash dedup | MEDIUM | Add a shingling-based near-duplicate check post-dedup. Run nightly; flag clusters for human triage | M | None |
| CE.7 | Routine concurrency | MEDIUM | Either accept the duplicate-routine pattern as resolved by idempotency, or push Paperclip vendor to allow routine deletion. Document the chosen path | S | Decision |
| CE.8 | No lockfile / SBOM | MEDIUM | Adopt `pip-compile` / `uv lock`. Add Renovate or Dependabot. Generate SBOM on each release tag | S | None |
| CE.9 | Two divergent retrieval schemas | LOW | Document the divergence intentionally; or harmonise (add `drive_file_id` on CBS, harmonise match_documents signatures). Lower priority if WR/CBS divergence is operationally acceptable | M | None |
| CE.10 | No retrieval regression suite in CI | LOW | Promote the retrieval test scripts to a CI job that runs against the live Supabase projects nightly; alert on similarity drift > 0.05 vs baseline | M | CI dependency |
| RA.1 | No retention policy | HIGH | Draft and adopt a retention schedule per table. Implement a scheduled `DELETE WHERE created_at < now() - interval` pass for the tables that have a retention period; document the rationale for the rest | M | Policy decision |
| RA.2 | Service-role key in plaintext | HIGH | Migrate `scripts/env-setup.sh` secrets to a Vault, 1Password CLI, AWS Secrets Manager, or `op run` pattern. Rotate all currently-exposed credentials. Document the rotation cadence | M | Tool selection |
| RA.3 | Service role bypasses RLS | HIGH | Define a "limited" Supabase role with row-level policies that match the agent-instruction hard stops. Migrate read paths to the limited role; reserve the service-role key for the deploy/dedup paths only | L | Policy design |
| RA.4 | Self-evaluation bypass | HIGH | Same fix as CE.5 — independent evaluator on high-value paths. Additionally: log the self-check skill output independently from the trace and reconcile the two | M | None |
| RA.5 | Audit-trail completeness not enforced | MEDIUM | Add a reconciliation routine that compares Paperclip issue-comment counts (per agent per day) against `agent_traces` row counts; alert on any divergence > 5% | M | None |
| RA.6 | CA approval gate bypassable | MEDIUM | Add a database constraint or trigger: `ca_sent_at IS NOT NULL` requires `ca_send_approved=TRUE AND ca_send_approved_by IS NOT NULL`. Move the preflight call into `river-ca-sender.gs` directly | S | None |
| RA.7 | Weekly correction review | MEDIUM | For severity='critical' correction proposals, page the operator immediately and block the originating agent's outputs of the same task_type until reviewed | M | None |
| RA.8 | No separation of duties | MEDIUM | Identify the second person from IB.1; assign them as the independent reviewer for high-severity correction proposals and CA approval grants | L | Hire / assign |
| RA.9 | Hard-stop layer 2 leaks if Mail.ReadWrite enabled | MEDIUM | Defer Mail.ReadWrite upgrade until Layer 1 has been adversarial-tested with red-team prompts; document the test results before granting the permission | M | Test harness |
| RA.10 | No IR plan | LOW | Draft an incident-response plan covering the four named scenarios (key leak, unauthorised external action, evaluator drift, unauthorised CA send) | M | None |
| RA.11 | Sync-eval gate bypassed by IV#7 | HIGH | Same fix as IV#7 | S | None |

---

## 5. Top 5 Remediation Priorities

Selected on the joint criteria of severity, leverage (what is unblocked downstream), and effort. Listed in order to execute.

### Priority 1 — Fix the task_type vocabulary mismatch (IV#7 / RA.11)

**Why first:** small effort, high consequence. Today the bug is masked because no traces exist; the moment trace ingestion goes live the sync-evaluation gate silently fails for every high-value task type, breaking the architectural quality control on `go-no-go`, `board-paper`, `ca-fill`, and `executive-brief`. Fixing it is a one-file rewrite plus a runtime warning for unknown task_types.

**Acceptance criteria:** `config/evaluation-events.json` uses kebab-case task_types matching `skills/trace-capture/SKILL.md` exactly. The evaluator routing layer raises a visible warning (not a silent fallthrough) when it sees an unknown task_type. Test: insert a synthetic trace with `task_type='go-no-go'` — the routing layer correctly resolves it to `sync_evaluation`.

### Priority 2 — Apply the WR IVFFlat rebuild + activate the trace ingestion routine in production (IV#5 + IV#3 + IV#9)

**Why next:** these are the operational steps that move the platform from "built" to "operating". Both are blocked on the operator (one SQL run; one cookie refresh + script execution). Until they land, retrieval quality on WR is suppressed and the entire evaluation layer is dark.

**Acceptance criteria:** `scripts/wr-ivfflat-rebuild.sql` applied against WR Supabase, ANALYZE confirms the new index. `agent_traces` has > 0 rows from real Paperclip comments after the trace ingestion routine has run for 24 hours. Spot-check one trace end-to-end: Paperclip comment → agent_traces → evaluation_scores.

### Priority 3 — Move secrets off plaintext and tighten access (RA.2 + RA.3 + IB.6)

**Why now:** the plaintext service-role key is the biggest single point of compromise. Migrating to a Vault / 1Password CLI / `op run` pattern, then defining a limited Supabase role for read paths, closes the largest immediate security exposure. Also unblocks any future second-operator handoff (IB.1).

**Acceptance criteria:** `scripts/env-setup.sh` no longer contains plaintext secrets. All current credentials rotated. A documented rotation cadence is in place. A "read-only-for-agents" Supabase role exists with row-level policies; agents migrated to use it; service-role key reserved for explicit deploy/dedup operations.

### Priority 4 — Replace the trace-in-comment parser with a structured channel (CE.1)

**Why this:** the marker-and-JSON pattern in markdown comments is the load-bearing weakness in the evaluation layer. It is one model regression away from a silent quality-data outage. Building a structured channel (either a Paperclip-side metadata field, or a small `/traces` POST endpoint the agent calls directly) eliminates an entire class of brittleness, lets us add JSON Schema validation, and rejects malformed traces visibly instead of silently dropping them.

**Acceptance criteria:** Agents call a typed POST endpoint to write traces; markdown markers retired. Trace inserts that fail schema validation return an error to the agent runtime and are logged. End-to-end: a real heartbeat produces a trace via the new path, scored by the evaluator, surfaced on the dashboard.

### Priority 5 — Establish DR posture: backups, drill, and second-operator handoff (IB.1 + IB.2)

**Why this:** the bus factor and DR gaps are the items an external assessor would find most damning. Daily automated `pg_dump` of both Supabase projects to S3-compatible storage; one rehearsed DR drill against a recovery snapshot; a written runbook for "what breaks if Jeff is unavailable for 14 days" with concrete remediation steps; one second person briefed sufficient to execute the runbook. None of these is technically hard; what makes them top-five is that without them the platform's value can be erased by a single bad day, and an acquirer would discount accordingly.

**Acceptance criteria:** Nightly backups landing in object storage with a retention schedule. One DR drill executed end-to-end with documented timing (RTO/RPO measured). A runbook reviewed by a second person who can demonstrate they could execute it.

---

## 6. Items Out of Scope for the Top 5

These remain in the backlog and should be addressed once the top 5 are complete:

- IV#1, IV#2, IV#4, IV#6, IV#8, IV#10 — repo hygiene, doc fixes, low-risk data cleanup, end-to-end tender lifecycle exercise.
- IB.4 (vendor concentration), IB.5 (cost predictability), IB.7 (scalability), IB.8 (governance docs), IB.9 (tenant export).
- CE.2 (multi-region failover), CE.3 (embedding model verification), CE.4 (CI), CE.5 (independent evaluator on sync paths), CE.6 (shingling dedup), CE.7 (queue concurrency), CE.8 (lockfile / SBOM), CE.9 (schema unification), CE.10 (retrieval regression CI).
- RA.1 (retention), RA.4 (independent evaluator — same as CE.5), RA.5 (trace reconciliation), RA.6 (CA approval DB constraint), RA.7 (correction review cadence), RA.8 (separation of duties), RA.9 (Mail.ReadWrite gate), RA.10 (IR plan).

The advancement programme should sequence these against capacity. Most are S–M effort; the structurally large items are CE.1 (trace channel), CE.2 (multi-region), IB.4 (vendor abstraction).
