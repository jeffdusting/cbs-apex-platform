# Secrets Audit — Project River

**Date:** 19 April 2026
**Author:** Stage 5 — P3 (Secrets + Access Control)
**Source files audited:**
- `scripts/env-setup.sh` (world of CBS-side credentials, pre-P3)
- `.secrets/wr-env.sh` (WR-specific credentials)
- `.secrets/river-ca-sender-env.sh` (CA sender Apps Script credentials)

---

## 1. Inventory

Every secret currently in plaintext env files is catalogued below. "Where used" is the actual set of scripts that read the variable (verified via `grep os.environ` across `scripts/`).

### 1.1 CBS Supabase (eptugqwlgsmwhnubbqsk)

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `SUPABASE_URL` | CBS Supabase REST base URL | ~30 scripts (most data-path scripts) | N/A — public URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS; full schema access | ~30 scripts | Supabase dashboard → Settings → API → Regenerate service_role |

### 1.2 WR Supabase (imbskgjkqvadnazzhbiw)

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `WR_SUPABASE_URL` | WR Supabase REST base URL | `wr-*` scripts | N/A — public URL |
| `WR_SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS; WR schema | `wr-*` scripts | Supabase dashboard (WR project) → Settings → API → Regenerate |
| `WR_SUPABASE_DB_PASSWORD` | Direct psql access | Not used by Python scripts; used only for manual psql | Supabase dashboard → Database → Reset password |

### 1.3 Embeddings + LLM

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `VOYAGE_API_KEY` | voyage-3 embeddings for document ingest | `cbs-kb-dedup.py`, `ingest-knowledge-base.py`, `wr-*-dedup.py`, `wr-kb-*` | Voyage AI dashboard → API Keys → Rotate |
| `ANTHROPIC_API_KEY` | Claude API for evaluator + calibration | `evaluate-outputs.py`, `calibrate-evaluator.py`, `sync-evaluate.py` | console.anthropic.com → API Keys → Regenerate |

### 1.4 Paperclip

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `PAPERCLIP_URL` / `PAPERCLIP_API_URL` | Paperclip base URL | Most `paperclip-*`, `ingest-traces.py`, `heartbeat-*` scripts | N/A — fixed URL |
| `PAPERCLIP_SESSION_COOKIE` | Better-auth session token for Paperclip API | `ingest-traces.py`, `paperclip-validate.py`, etc. | Refresh from browser DevTools → Application → Cookies → `org.cbslab.app` → `__Secure-better-auth.session_token` |
| `PAPERCLIP_API_KEY` | Legacy slot (currently empty) | Unused post-cookie-auth migration | Deprecated — remove from env when confirmed unused |
| `PAPERCLIP_IMAGE_DIGEST` | Pinned Docker digest for Paperclip | Operator reference; not used by scripts | Bump when Paperclip operator updates digest |

### 1.5 Microsoft 365 (Graph API)

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `MICROSOFT_CLIENT_ID` | Azure AD app registration client ID | `test-graph-api.py`, email intake scripts | portal.azure.com → App registrations → River → Certificates & secrets |
| `MICROSOFT_CLIENT_SECRET` | Azure AD client secret | Same as above | Azure AD → App registrations → River → New client secret |
| `MICROSOFT_TENANT_ID` | CBS tenant ID | Same as above | N/A — tenant is fixed |

### 1.6 Xero

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `XERO_CLIENT_ID` | Xero OAuth app client ID | `test-xero-api.py` | developer.xero.com → My Apps → River → Configuration |
| `XERO_CLIENT_SECRET` | Xero OAuth client secret | Same | developer.xero.com → Generate a secret |

### 1.7 GitHub

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `GITHUB_PAT` | Personal access token for repo access | Not read by any Python script today (operator use only) | github.com → Settings → Developer settings → PAT → Regenerate |

### 1.8 Teams / Power Automate

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `TEAMS_WEBHOOK_URL` | Power Automate webhook for operator alerts | `check-blocked-work.py`, `check-token-anomaly.py`, `feedback-report.py` | Power Automate → flow → regenerate trigger URL |

### 1.9 CA Sender (jeff@cbsaustralia.com.au Apps Script)

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `RIVER_CA_SENDER_TOKEN` | Shared bearer token between Paperclip agent and Apps Script | `ca-sender-preflight.py`; also hard-coded as `SHARED_TOKEN` in `scripts/river-ca-sender.gs` | `openssl rand -hex 32` → update both `.gs` and this env |
| `RIVER_CA_SENDER_URL` | Apps Script deployment URL | `ca-sender-preflight.py` | Redeploy Apps Script, replace deployment ID |

### 1.10 WR Google Cloud / Drive

| Variable | Purpose | Where used | Rotation path |
|---|---|---|---|
| `WR_GCP_PROJECT_ID` | GCP project id for WR | `wr-create-folders.py`, `wr-drive-reorg.py`, `wr-index-drive-content.py` | N/A — project is fixed |
| `WR_SERVICE_ACCOUNT_EMAIL` | Service account identity | Same WR scripts | GCP IAM → Service Accounts (only if rotated) |
| `WR_DRIVE_ID` | WaterRoads Shared Drive ID | Same WR scripts | N/A — drive is fixed |
| `WR_SERVICE_ACCOUNT_FILE` | Path to `.secrets/wr-service-account.json` | Same WR scripts | GCP IAM → Service Accounts → River → Keys → Rotate |

---

## 2. Risk findings (RA.2)

- **Plaintext at rest.** Every secret above is in a file on the operator's disk. Even with `chmod 600` (applied at P0), any process running as the operator's uid can read them. There is no audit trail of which script read which secret at which time.
- **Long-lived keys.** The CBS and WR service-role JWTs both expire in 2029 (`exp: 2091285357` and `exp: 2091655883`). Rotating them is the only way to bound the blast radius of accidental disclosure.
- **Service-role everywhere.** All Python scripts use the service-role key — including read-only scripts (`wr-retrieval-test.py`, `feedback-report.py`) that only need SELECT. This is the RA.3 concern: a rogue read path can also write/delete. See §4.
- **Shared bearer tokens.** `RIVER_CA_SENDER_TOKEN` is shared between the Paperclip agent and the Apps Script. Any leak of either side compromises both.
- **No segregation by environment.** There is no dev/staging/prod split — the same keys are used locally and would be used in CI.

---

## 3. 1Password migration plan

### 3.1 Target vault structure

Vault name: `River`.

| Item title | Category | Fields |
|---|---|---|
| River CBS Supabase | login | `url`, `Service Role Key` |
| River WR Supabase | login | `url`, `Service Role Key`, `DB Password` |
| River Voyage AI | api_credential | `credential` |
| River Anthropic | api_credential | `credential` |
| River Paperclip | login | `url`, `Session Cookie`, `Image Digest` |
| River Microsoft Graph | login | `Client ID`, `Client Secret`, `Tenant ID` |
| River Xero | login | `Client ID`, `Client Secret` |
| River GitHub PAT | api_credential | `credential` |
| River Teams Webhook | api_credential | `credential` |
| River CA Sender | login | `Shared Token`, `Web App URL` |
| River WR GCP | login | `Project ID`, `Service Account Email`, `Drive ID`, service account JSON as document attachment |
| River Agent Read | login | `password` (for the new limited role — §4) |

### 3.2 Operator steps (one-off)

1. `op signin` — authenticate against the operator's 1Password account.
2. `op vault create River` (or reuse an existing vault).
3. With the plaintext env still loaded, run `bash scripts/op-setup.sh` — creates every item above.
4. Verify: `op item list --vault River` shows all 12 entries.
5. Test: `op run --env-file=scripts/env-op.env -- python3 scripts/paperclip-validate.py` — same result as the plaintext path.
6. Rotate CBS + WR service-role keys (§5), update the two 1Password items.
7. Replace `scripts/env-setup.sh` with the stub that errors on `source` (prevents accidental fallback).

### 3.3 Usage pattern after migration

```bash
# One-off command
op run --env-file=scripts/env-op.env -- python3 scripts/evaluate-outputs.py --batch-size 10

# Interactive shell with secrets in env
eval $(op inject -i scripts/env-op.env)
```

`op run` never writes the secrets to disk; the subprocess inherits them via anonymous pipes. `op inject` writes resolved values to the shell env only for the shell's lifetime.

---

## 4. Limited Supabase role (RA.3)

See `scripts/supabase-limited-role.sql` for the full DDL. Summary:

- New role `river_agent_read` with its own password (stored at `op://River/River Agent Read/password`).
- GRANT `SELECT` on `documents`, `prompt_templates`, `rubric_versions`.
- GRANT `SELECT, INSERT` on `agent_traces` (agents write traces, never update/delete).
- GRANT `SELECT` on `evaluation_scores` (agents read their scores but don't write — evaluator runs as service role).
- GRANT UPDATE on `tender_register` for an **explicit column allowlist** that does NOT include `ca_send_approved`. The approval flag is only writable through the dashboard path (service-role, authenticated operator), enforcing the Stage 4 CA approval gate at the role level.
- RLS enabled on `documents` with a permissive `USING (true)` policy — entity filtering is application-level. The RLS toggle still forces future policy changes to go through SQL review.
- Service-role unchanged: deploy, dedup, and schema operations continue as today.

Application wiring is deferred: the refactor to make read-only scripts load the limited-role password instead of the service-role key is a multi-script change (~15 scripts). The DDL lands now; the refactor is a follow-up task tracked in P3 gate verification notes.

---

## 5. Credential rotation plan

Rotations are sequenced so that each step is individually reversible.

1. Pre-flight: confirm 1Password vault is populated and `op run` has succeeded for at least `paperclip-validate.py` and one WR script.
2. **CBS Supabase service-role key:** Regenerate in dashboard → immediately update `River CBS Supabase/Service Role Key` → `op run -- python3 scripts/paperclip-validate.py` to confirm.
3. **WR Supabase service-role key:** Same flow on WR project.
4. **CA Sender token:** `openssl rand -hex 32` → update `River CA Sender/Shared Token` in 1Password AND `SHARED_TOKEN` in `scripts/river-ca-sender.gs` → redeploy Apps Script → `op run -- python3 scripts/ca-sender-preflight.py`.
5. **Voyage + Anthropic:** rotate last, since they are only needed by async scripts (evaluator + embeddings). Update 1Password items.
6. **Microsoft Graph client secret:** add a new secret in Azure AD, update 1Password, wait 24h, delete the old one.
7. **GitHub PAT:** regenerate in GitHub settings, update 1Password.
8. **Final:** overwrite `scripts/env-setup.sh` with the error stub. Confirm no script in `scripts/` still sources the old file (`grep -l env-setup.sh scripts/` should only return pre-P3 docs if any).

Rotations 2, 3, 4 involve brief windows where the old key is invalid and scripts will fail — schedule outside of the Stage 5 verification window.

---

## 6. pgcrypto design (IB.6) — deferred execution

`scripts/pgcrypto-sensitive-docs.sql` is produced as a design document. Field-level encryption for the `documents` table rows whose `document_type IN ('correction', 'competitor_profile', 'board_paper')` would require:

- `pgcrypto` extension enabled (already the case on Supabase by default).
- An encryption key stored in 1Password (`op://River/River Pgcrypto/key`), injected into the DB session as a runtime parameter — NOT stored in the database itself.
- Every write path to those categories updated to call `pgp_sym_encrypt(text_column, current_setting('app.pgcrypto_key'))`.
- Every read path updated to call `pgp_sym_decrypt(bytea_column, current_setting('app.pgcrypto_key'))`.
- Embedding generation moved to post-decrypt (embeddings on ciphertext are useless).

Execution is deferred because it affects ~15 scripts and changes the embedding pipeline semantics. The SQL and Python wrapper signatures ship now; the refactor is scoped in P8 (deferred designs).

---

## 7. Audit outcomes

- Full inventory of 25 secrets across 9 sub-systems, cross-referenced to scripts that read them.
- Vault structure defined for 1Password migration (12 items).
- Limited Supabase role SQL produced for RA.3.
- Rotation sequence produced with reversibility guarantees.
- pgcrypto design scoped as P8 follow-up (IB.6).
