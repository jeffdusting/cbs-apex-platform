---
title: Separation of Duties — Design
status: DESIGN (deferred from Stage 5)
author: Claude chat + CC (Stage 5 P8)
date: 2026-04-19
critique_ref: RA.8
---

# Separation of Duties

## 1. Current State

Jeff Dusting is the sole operator. The following responsibilities currently
collapse into one person:

- **Founder / business owner** — defines what the agent workforce should
  do and what "good" looks like.
- **Developer / deployer** — writes code (with CC), applies Supabase
  schema changes, ships agent prompt updates via the Paperclip API,
  rotates credentials, edits Railway settings.
- **Evaluator scorer / human reviewer** — approves CA sends, reviews
  correction proposals, scores board papers for WR, triages agent
  escalations.
- **Auditor** — reviews TASK_LOG, verifies gate results, runs
  reconciliation scripts.
- **Human-in-the-loop** — all Paperclip heartbeats that require
  confirmation land on Jeff.
- **1Password vault custodian** — sole signer-in; no break-glass
  account.

**Concrete single-person risks:**

| Risk | Today's exposure |
|---|---|
| Bus factor (IB.1) | 14-day absence stops evaluator + correction review + CA approvals. |
| Audit collusion | No second pair of eyes on any action. An agent proposal that is wrong and gets auto-approved has no second reviewer. |
| Credential continuity | If Jeff's laptop or 1Password account is lost, there is no second human who can sign in and recover. |
| Regulator readiness (RA.8) | A regulator asking "who approved this CA?" gets one name for every CA ever sent. |

## 2. Target Roles

Four roles, each with a defined purpose and least-privilege access.

### Operator — Jeff (today); ultimately 2+ operators
Full authority. All Paperclip mutations, Supabase service-role,
1Password vault access, deployment authority. Exactly this role today.
**Target:** 2 operators, so one can cover for the other.

### Reviewer — Sarah Taylor (initial appointment)
Human-in-the-loop on client-facing outputs. Can view the dashboard,
review correction proposals, approve CA sends, approve WR board papers.
Cannot write code, cannot change schema, cannot access the vault, cannot
send Paperclip API mutations as an agent. Uses the Supabase `river_agent_read`
role for data inspection.

### Observer — future team member, e.g. an analyst
Read-only dashboard + weekly monitoring digest recipient. Exists so that
at least one additional person has situational awareness without
elevated access. Useful for business-continuity briefings, internal
reporting, and board updates.

### Developer — CC sessions (now); potentially a second human dev later
Code, schema, Paperclip API changes. All destructive or production-touching
actions are guarded behind explicit `--execute` flags or user confirmation
prompts (existing convention — see `scripts/retention-purge.py`,
`scripts/cbs-kb-dedup.py`). Developer does not have standing
production Supabase credentials — uses ephemeral service-role keys
pulled via `op run` for the duration of a deploy.

## 3. Access Model per Role

Capabilities matrix. "✓ (guarded)" means the capability exists but only
via a flagged/interactive path that produces an auditable record.

| Capability | Operator | Reviewer | Observer | Developer |
|---|:---:|:---:|:---:|:---:|
| Paperclip API mutations (`POST`/`PATCH`/`DELETE`) | ✓ | ✗ | ✗ | ✓ (guarded) |
| Paperclip API reads | ✓ | ✓ | ✓ | ✓ |
| Supabase service-role key | ✓ | ✗ | ✗ | ✓ (deploy windows only) |
| Supabase `river_agent_read` role | ✓ | ✓ | ✓ | ✗ |
| Dashboard — view | ✓ | ✓ | ✓ | ✗ |
| Dashboard — approve CA | ✓ | ✓ | ✗ | ✗ |
| Dashboard — approve WR board paper | ✓ | ✓ (WR only) | ✗ | ✗ |
| Correction review (`correction_proposals`) | ✓ | ✓ | ✗ | ✗ |
| Agent prompt template edits (runtime) | ✓ | ✗ | ✗ | ✓ (guarded) |
| Schema migrations | ✓ | ✗ | ✗ | ✓ |
| 1Password vault `River` | ✓ | ✗ | ✗ | ✗ |
| Railway console | ✓ | ✗ | ✗ | ✓ (guarded) |
| Receive monitoring digest | ✓ | ✓ | ✓ | ✗ |
| Receive critical correction alert (Teams webhook) | ✓ | ✓ | ✗ | ✗ |

### Segregated-duty rules (written so a regulator can read them)

- **Four-eyes on CA sends.** No single role may both author and send a
  CA. Today the agent authors; a human reviewer (Operator or Reviewer)
  approves. This remains true — the constraint in P4
  (`ca_send_approved`) enforces it at the DB layer. Reviewer role exists
  so approval is not always by the Operator.
- **Deploy vs approve.** Developer may deploy prompt changes but cannot
  approve CA sends or correction proposals. Operator can do both but
  should prefer to have Reviewer approve where possible.
- **Vault custody.** Vault access is restricted to Operators. Developers
  pull ephemeral keys via `op run` when performing schema changes; those
  keys are not persisted to disk.

## 4. Implementation Steps — When a Second Operator is Ready

Linear order. Each step is safely reversible until step 7.

1. **Create Reviewer Supabase account.**
    - In CBS Supabase project dashboard: add Sarah as a user.
    - Do not grant project admin. Grant the SQL user `river_agent_read` (already
      created in P3). Verify she can SELECT from `documents`, `tender_register`,
      `correction_proposals` and cannot INSERT/UPDATE/DELETE anywhere.
2. **Create Reviewer dashboard access.**
    - Wire dashboard auth to use her Supabase account (or a Google SSO
      linked to her email).
    - Add a role claim `reviewer` to her JWT. Dashboard hides Operator-only
      controls (e.g., prompt template editor) when claim ≠ `operator`.
3. **Grant Reviewer CA approval UI.**
    - The CA approval page reads `role` from the JWT. For `reviewer`,
      show the approve button. For `observer`, show the approve button
      disabled and show an informational banner.
4. **Teams webhook: add Reviewer to critical alert channel.**
    - Update the Teams distribution so Sarah receives critical correction
      proposals and CA approval requests.
5. **Train Reviewer on the correction review workflow.**
    - Short walkthrough: how proposals reach the dashboard, the
      approve/reject vocabulary, when to escalate back to Operator.
    - Deliverable: a one-page SOP co-signed by Operator + Reviewer.
6. **Dual-operator bootstrap (optional second Operator).**
    - Second Operator (name TBD) gets `op signin` to the `River` vault.
    - Add them as Supabase project admin on both CBS and WR projects.
    - Add them to Railway as a collaborator.
    - Document their phone number and timezone in `docs/contacts.md`.
7. **Audit entry.**
    - Append a TASK_LOG note recording the role assignments, the date of
      access grant, and the reviewer contact details. This is the
      paper trail an auditor will ask for.

### Reversal path (if Reviewer needs to be removed quickly)

- Revoke dashboard role claim (single config line).
- Revoke Supabase user (1 click).
- Remove from Teams distribution list.
- No data needs to be touched — role is orthogonal to data.

## 5. Open Questions for Next Session

1. **SSO for the dashboard** — should we use Supabase Auth,
   Azure AD, or Google Workspace? Sarah already has an @cbs.com.au
   Microsoft 365 account; Azure AD is the natural choice but depends on
   tenant-level admin consent.
2. **Evidence store for regulator** — where does the record of
   "who approved which CA" live? Today the `ca_send_approved` column
   carries a timestamp but no approver identity. Adding
   `ca_send_approved_by UUID REFERENCES auth.users(id)` is a small
   follow-up that makes the audit trail complete.
3. **Backup reviewer** — Sarah alone is still bus-factor 1 for the
   reviewer role. Identify a second reviewer before go-live of CA
   delegation.
