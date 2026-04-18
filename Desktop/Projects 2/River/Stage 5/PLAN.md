# Stage 5 — Strategic Plan

**Programme:** stage5
**Date:** 16 April 2026
**Authority:** Jeff Dusting (founder) + Claude chat (architecture)
**Source:** `stage4/ADVERSARIAL_CRITIQUE.md` — 40 issues across 3 perspectives (IB.1–9, CE.1–10, RA.1–11, IV#1–10)
**Purpose:** Comprehensive remediation of all issues identified in the Stage 4 adversarial critique. Every issue is either resolved in this programme or has a design document produced that scopes the deferred work.

---

## 1. Issue Disposition

Every issue from the critique is assigned to a phase. No issue is unaddressed.

| Ref | Issue (short) | Severity | Phase | Action |
|---|---|---|---|---|
| IV#7 / RA.11 | task_type vocabulary mismatch | HIGH | P1 | Fix — rewrite evaluation-events.json to kebab-case |
| IV#1 | Empty " 2" skill directories | LOW | P1 | Fix — git rm |
| IV#2 | Phase spec range mismatch | LOW | P1 | Fix — update doc |
| IV#4 | WR prompt_templates empty | MEDIUM | P1 | Fix — ingest 4 WR templates |
| IV#6 | 98 legacy waterroads rows on CBS | LOW | P1 | Fix — validate and delete |
| IV#8 | Phase spec wording | LOW | P1 | Fix — update doc |
| CE.7 | Duplicate routine | MEDIUM | P1 | Document as accepted (idempotent) |
| CE.9 | Divergent retrieval schemas | LOW | P1 | Document intentional divergence |
| IV#3 / IV#9 | Trace ingestion never run | MEDIUM | P2 | Activate — cookie refresh + run |
| IV#5 | WR IVFFlat at lists=40 | HIGH | P2 | Fix — rebuild index |
| IV#10 | No tender past interest_passed | MEDIUM | P2 | Exercise — drive one real tender through lifecycle |
| RA.2 | Secrets in plaintext | HIGH | P3 | Fix — 1Password CLI integration |
| RA.3 | Service role bypasses RLS | HIGH | P3 | Fix — limited Supabase role + RLS policies |
| IB.6 | IP surface unprotected | MEDIUM | P3 | Fix — credential rotation + pgcrypto for sensitive categories |
| RA.6 | CA approval gate bypassable | MEDIUM | P4 | Fix — DB trigger enforcing ca_send_approved |
| RA.1 | No retention policy | HIGH | P4 | Fix — define policy + implement scheduled purge |
| RA.7 | Weekly correction review too slow | MEDIUM | P4 | Fix — critical proposals alert immediately |
| RA.10 | No IR plan | LOW | P4 | Produce — incident response plan document |
| IB.8 | Governance docs missing | LOW | P4 | Produce — data handling, access control, retention policies |
| CE.4 | No CI | HIGH | P5 | Build — GitHub Actions workflow |
| CE.8 | No lockfile / SBOM | MEDIUM | P5 | Build — pip-compile + SBOM generation |
| CE.3 | Embedding model unverified | HIGH | P5 | Build — model assertion on insert + metadata column |
| CE.6 | Byte-identical dedup only | MEDIUM | P5 | Build — shingling near-duplicate check |
| CE.10 | No retrieval regression in CI | LOW | P5 | Build — nightly retrieval suite |
| IB.5 | Cost unpredictable | MEDIUM | P6 | Build — per-agent cost report + anomaly alert |
| RA.5 | Trace reconciliation missing | MEDIUM | P6 | Build — trace count vs issue count reconciliation |
| CE.5 / RA.4 | Self-evaluation conflict | HIGH | P6 | Build — independent evaluator pass on sync paths |
| IB.1 | Bus factor of one | CRITICAL | P7 | Produce — 14-day absence runbook + second-operator brief |
| IB.2 | No backup / DR | CRITICAL | P7 | Build — automated pg_dump to S3 + DR drill plan |
| IB.3 | Cookie auth | HIGH | P7 | Document — vendor roadmap item + explicit runbook step |
| IB.4 | Vendor concentration | HIGH | P7 | Produce — migration cost matrix + provider abstraction in evaluator |
| CE.2 | Single Railway deployment | CRITICAL | P7 | Produce — failover plan + health check automation |
| CE.1 | Trace pipeline free-text parsing | CRITICAL | P8 | Produce — structured trace channel design document |
| RA.8 | No separation of duties | MEDIUM | P8 | Produce — second-operator role definition + access model |
| RA.9 | Mail.ReadWrite gate needed | MEDIUM | P8 | Produce — adversarial test plan before permission upgrade |
| IB.7 | Scalability untested | MEDIUM | P8 | Produce — synthetic load test specification |
| IB.9 | No tenant export | LOW | P8 | Build — export-tenant.py script |
| P9 | Independent verification | — | P9 | Verify — all Stage 5 work audited |

**Summary:** 38 issues resolved or designed across 10 phases. Every critique item has a home.

---

## 2. Phase Sequencing

| Phase | Name | Effort | Issues addressed |
|---|---|---|---|
| P0 | Discovery | S | Assess current state post-Stage 4 |
| P1 | Critical fixes + repo hygiene | S | IV#1,2,4,6,7,8; CE.7,9; RA.11 |
| P2 | Operational activation | M | IV#3,5,9,10 |
| P3 | Secrets + access control | M–L | RA.2,3; IB.6 |
| P4 | Governance hardening | M | RA.1,6,7,10; IB.8 |
| P5 | CI/CD + code quality | M | CE.3,4,6,8,10 |
| P6 | Observability + cost | M | IB.5; CE.5; RA.4,5 |
| P7 | DR + resilience planning | M–L | IB.1,2,3,4; CE.2 |
| P8 | Deferred items — design docs | M | CE.1; RA.8,9; IB.7,9 |
| P9 | Independent verification | M | All — fresh-session audit |

---

## 3. Dependency Map

```
P0 (Discovery) ─────────────────────────────────────────────────────────┐
   │                                                                     │
   v                                                                     │
P1 (Critical fixes) ── must be first execution phase (IV#7 blocks P2)   │
   │                                                                     │
   v                                                                     │
P2 (Operational activation) ── needs P1 (task_type fix)                 │
   │                                                                     │
   ├──→ P3 (Secrets) ── independent of P2 output                        │
   ├──→ P4 (Governance) ── independent of P2 output                     │
   ├──→ P5 (CI/CD) ── independent of P2 output                         │
   │         ↕ P3, P4, P5 are parallel ↕                                │
   │                                                                     │
   ├──→ P6 (Observability) ── needs P2 (traces flowing)                 │
   │                                                                     │
   ├──→ P7 (DR + resilience) ── needs P3 (secrets in vault before DR)   │
   │                                                                     │
   ├──→ P8 (Deferred designs) ── independent, can run anytime after P1  │
   │                                                                     │
   └──→ P9 (Verification) ── needs ALL prior phases                     │
```

P3, P4, P5, and P8 can run in any order after P2. P6 needs traces flowing (P2). P7 needs secrets sorted (P3). P9 runs last.

---

## 4. Decisions Resolved

| Decision | Resolution |
|---|---|
| Secrets management tool | 1Password CLI (`op run`) — already in use for credential storage per userMemories |
| RLS scope | Read paths use limited role; service-role reserved for deploy/dedup/schema operations |
| Retention periods | `agent_traces`: 90 days. `evaluation_scores`: 365 days. `correction_proposals` (status=ingested or rejected): 90 days. `documents`: no auto-purge. |
| Critical correction alert | Severity=critical proposals page operator immediately via Teams webhook and block originating agent's same task_type |
| CI platform | GitHub Actions (repo is already on GitHub) |
| Backup target | Supabase CLI `db dump` to S3-compatible storage (or local encrypted backup as MVP) |
| Embedding model assertion | Add `embedding_model` metadata key on every insert; reject mismatches at query time |
| Independent evaluator for sync paths | Run a separate Sonnet 4 evaluation call (not the self-check) for sync task types. Cost ~$0.01/evaluation — acceptable. |
| Structured trace channel | Deferred to future programme. Design document produced in P8. |
| Duplicate routine | Accepted pattern — idempotency handles it. Documented. |
| Schema divergence CBS/WR | Intentional — documented. Harmonisation deferred. |
