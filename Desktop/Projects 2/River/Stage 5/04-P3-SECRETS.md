# Phase 3: Secrets + Access Control

## Objective

Migrate secrets from plaintext env files to 1Password CLI, create a limited Supabase role with RLS for agent read paths, rotate all credentials, and add pgcrypto encryption for sensitive document categories. Addresses RA.2, RA.3, IB.6.

## Prerequisites

- S5-P2 complete.
- `op` (1Password CLI) installed on the operator's machine. If not installed, this phase produces the setup instructions and the `op run` wrapper scripts, but cannot execute the migration.

## Context

```bash
cat stage5/DISCOVERY_SUMMARY.md | grep -A5 "Secrets"
which op 2>/dev/null && echo "1Password CLI available" || echo "1Password CLI NOT available"
```

## Tasks

### TASK 3.1: Audit Current Secrets (RA.2)

Read `scripts/env-setup.sh` and `.secrets/wr-env.sh`. List every secret, its purpose, and where it is used. Create `docs/secrets-audit.md` with the inventory.

### TASK 3.2: Create 1Password Vault Structure

If `op` is available, create the vault items. If not, produce the `op` commands as a script for Jeff to run.

Create `scripts/op-setup.sh`:
```bash
#!/bin/bash
# Creates 1Password vault items for Project River
# Run once: bash scripts/op-setup.sh

# CBS Supabase
op item create --category=login --title="River CBS Supabase" \
  --vault="River" \
  url="$SUPABASE_URL" \
  "Service Role Key"="$SUPABASE_SERVICE_ROLE_KEY"

# WR Supabase
op item create --category=login --title="River WR Supabase" \
  --vault="River" \
  url="$WR_SUPABASE_URL" \
  "Service Role Key"="$WR_SUPABASE_SERVICE_ROLE_KEY"

# Voyage AI
op item create --category=api_credential --title="River Voyage AI" \
  --vault="River" \
  credential="$VOYAGE_API_KEY"

# Anthropic
op item create --category=api_credential --title="River Anthropic" \
  --vault="River" \
  credential="$ANTHROPIC_API_KEY"

# Microsoft Graph
op item create --category=login --title="River Microsoft Graph" \
  --vault="River" \
  "Client ID"="$MICROSOFT_CLIENT_ID" \
  "Client Secret"="$MICROSOFT_CLIENT_SECRET" \
  "Tenant ID"="$MICROSOFT_TENANT_ID"

# ... (repeat for all secrets found in TASK 3.1)
```

### TASK 3.3: Create `op run` Wrapper

Create `scripts/env-op.sh` that replaces `scripts/env-setup.sh` for secret injection:

```bash
#!/bin/bash
# Usage: op run --env-file=scripts/env-op.env -- python3 scripts/evaluate-outputs.py
# Or: source <(op inject -i scripts/env-op.tpl)

# This file maps 1Password references to environment variables
export SUPABASE_URL="op://River/River CBS Supabase/url"
export SUPABASE_SERVICE_ROLE_KEY="op://River/River CBS Supabase/Service Role Key"
export WR_SUPABASE_URL="op://River/River WR Supabase/url"
export WR_SUPABASE_SERVICE_ROLE_KEY="op://River/River WR Supabase/Service Role Key"
export VOYAGE_API_KEY="op://River/River Voyage AI/credential"
export ANTHROPIC_API_KEY="op://River/River Anthropic/credential"
# ... all secrets
```

The operator uses `op run --env-file=scripts/env-op.env -- <command>` or `eval $(op inject -i scripts/env-op.env)` instead of `source scripts/env-setup.sh`. The plaintext file is then deleted (after confirming 1Password works).

### TASK 3.4: Create Limited Supabase Role (RA.3)

Create `scripts/supabase-limited-role.sql`:

```sql
-- Create a role for agent read paths (not service-role)
CREATE ROLE river_agent_read LOGIN PASSWORD 'op://River/River Agent Read/password';

-- Grant read on documents, prompt_templates, rubric_versions
GRANT SELECT ON documents, prompt_templates, rubric_versions TO river_agent_read;

-- Grant read + write on agent_traces (agents write traces)
GRANT SELECT, INSERT ON agent_traces TO river_agent_read;

-- Grant read on evaluation_scores (agents read their own scores)
GRANT SELECT ON evaluation_scores TO river_agent_read;

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: river_agent_read sees all entities (entity filtering is application-level)
CREATE POLICY agent_read_documents ON documents
    FOR SELECT TO river_agent_read
    USING (true);

-- Service role bypasses RLS (for deploy/dedup)
-- This is the default Supabase behaviour — no change needed.

-- DENY write on tender_register.ca_send_approved to river_agent_read
-- (approval must come through the dashboard/service-role path)
REVOKE UPDATE ON tender_register FROM river_agent_read;
GRANT UPDATE (lifecycle_stage, interest_score, interest_reasons, interest_assessed_at,
    tender_contact_name, tender_contact_email, doc_count, go_no_go_scorecard,
    go_no_go_recommendation, go_no_go_assessed_at) ON tender_register TO river_agent_read;
-- Note: ca_send_approved is NOT in the grant list — agents cannot set it.
```

Apply via Supabase CLI. Document the role in `docs/secrets-audit.md`.

### TASK 3.5: Credential Rotation

After 1Password vault is populated and `op run` works:
1. Rotate the CBS Supabase service-role key (Supabase dashboard → Settings → API → Regenerate).
2. Rotate the WR Supabase service-role key.
3. Update the 1Password items with new values.
4. Verify all scripts still work via `op run`.
5. Delete the plaintext `scripts/env-setup.sh` secrets (replace with a pointer to the `op run` pattern).

Create `scripts/env-setup.sh` replacement that documents the `op` approach:
```bash
#!/bin/bash
# SECRETS ARE IN 1PASSWORD — do not store plaintext here.
# Usage: eval $(op inject -i scripts/env-op.env)
# Or:    op run --env-file=scripts/env-op.env -- <command>
echo "ERROR: Do not source this file. Use: eval \$(op inject -i scripts/env-op.env)" && return 1
```

### TASK 3.6: Add pgcrypto for Sensitive Categories (IB.6)

For the most sensitive document categories (corrections, competitor profiles, board papers), add encryption at rest using Supabase's pgcrypto extension. Create `scripts/pgcrypto-sensitive-docs.sql`:

This is a design document rather than an immediate execution — field-level encryption requires application-level changes to encrypt on write and decrypt on read, which affects multiple scripts. Produce the SQL and the Python wrapper functions, but flag that execution requires updating all read/write paths.

## Gate Verification

```bash
echo "=== S5-P3 Gate ==="
[ -f "docs/secrets-audit.md" ] && echo "PASS: Secrets audit" || echo "FAIL"
[ -f "scripts/op-setup.sh" ] && echo "PASS: 1Password setup script" || echo "FAIL"
[ -f "scripts/env-op.env" ] && echo "PASS: op env file" || echo "FAIL"
[ -f "scripts/supabase-limited-role.sql" ] && echo "PASS: Limited role SQL" || echo "FAIL"

# Check if 1Password migration completed
if grep -q "Do not source this file" scripts/env-setup.sh 2>/dev/null; then
    echo "PASS: env-setup.sh replaced with op pointer"
else
    echo "WARN: env-setup.sh still contains plaintext (1Password migration pending operator action)"
fi
```

## Archive Point

```bash
git add -A && git commit -m "S5-P3: Secrets + access control — 1Password, limited role, rotation"
git tag stage5-P3-secrets
```

## TASK_LOG Entry

```markdown
## S5-P3: Secrets + Access Control
- **Status:** COMPLETE
- **1Password CLI:** [available — migration done / not available — scripts produced]
- **Limited Supabase role:** [SQL produced / applied]
- **Credential rotation:** [completed / pending 1Password setup]
- **pgcrypto design:** produced (execution deferred to read/write path updates)
- **Next phase:** P4 (Governance), P5 (CI), or P8 (Deferred) — any after P2
```
