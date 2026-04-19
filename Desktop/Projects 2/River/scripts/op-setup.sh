#!/bin/bash
# Project River — 1Password vault population (one-off, operator-run)
#
# Purpose: migrate all Project River secrets from plaintext env files into
#          1Password vault "River" so downstream scripts can resolve them
#          via `op run --env-file=scripts/env-op.env -- <cmd>` instead of
#          `source scripts/env-setup.sh`.
#
# Pre-requisites:
#   1. `op --version` works (1Password CLI installed).
#   2. `op signin` has been run and the operator's session is live.
#   3. A vault named "River" exists (`op vault create River` if not).
#   4. The plaintext env files are STILL LOADED in the current shell
#      (this script reads them and writes their contents to 1Password).
#
# Usage:
#   source scripts/env-setup.sh
#   source .secrets/wr-env.sh
#   source .secrets/river-ca-sender-env.sh
#   bash scripts/op-setup.sh
#
# Idempotency: this script creates new items every run. Do NOT rerun
# without first `op item delete` on prior entries, or the vault will end
# up with duplicates. The script errors early if a duplicate title is
# detected.

set -euo pipefail

VAULT="River"

# ---------- sanity ----------

if ! command -v op >/dev/null 2>&1; then
    echo "FAIL: 1Password CLI (op) not installed." >&2
    exit 1
fi

if ! op vault get "$VAULT" >/dev/null 2>&1; then
    echo "FAIL: Vault '$VAULT' not found. Run: op vault create $VAULT" >&2
    exit 1
fi

check_duplicate () {
    local title="$1"
    if op item get "$title" --vault "$VAULT" >/dev/null 2>&1; then
        echo "FAIL: Item '$title' already exists in vault '$VAULT'." >&2
        echo "       Delete it first: op item delete '$title' --vault '$VAULT'" >&2
        exit 1
    fi
}

require_env () {
    local var="$1"
    if [ -z "${!var:-}" ]; then
        echo "FAIL: Environment variable $var is not set." >&2
        echo "       Source scripts/env-setup.sh, .secrets/wr-env.sh, and .secrets/river-ca-sender-env.sh first." >&2
        exit 1
    fi
}

# ---------- env gate ----------

require_env SUPABASE_URL
require_env SUPABASE_SERVICE_ROLE_KEY
require_env WR_SUPABASE_URL
require_env WR_SUPABASE_SERVICE_ROLE_KEY
require_env WR_SUPABASE_DB_PASSWORD
require_env VOYAGE_API_KEY
require_env ANTHROPIC_API_KEY
require_env MICROSOFT_CLIENT_ID
require_env MICROSOFT_CLIENT_SECRET
require_env MICROSOFT_TENANT_ID
require_env XERO_CLIENT_ID
require_env XERO_CLIENT_SECRET
require_env GITHUB_PAT
require_env TEAMS_WEBHOOK_URL
require_env RIVER_CA_SENDER_TOKEN
require_env RIVER_CA_SENDER_URL
require_env WR_GCP_PROJECT_ID
require_env WR_SERVICE_ACCOUNT_EMAIL
require_env WR_DRIVE_ID
require_env WR_SERVICE_ACCOUNT_FILE

# Paperclip URL has a default; cookie is refreshed per-session and stored as a blank here initially.
: "${PAPERCLIP_URL:=https://org.cbslab.app}"
: "${PAPERCLIP_SESSION_COOKIE:=}"
: "${PAPERCLIP_IMAGE_DIGEST:=}"

# ---------- duplicate gate ----------

for t in \
    "River CBS Supabase" \
    "River WR Supabase" \
    "River Voyage AI" \
    "River Anthropic" \
    "River Paperclip" \
    "River Microsoft Graph" \
    "River Xero" \
    "River GitHub PAT" \
    "River Teams Webhook" \
    "River CA Sender" \
    "River WR GCP" \
    "River Agent Read"
do
    check_duplicate "$t"
done

# ---------- create items ----------

echo "Creating 12 items in vault '$VAULT'..."

op item create --category=login --title="River CBS Supabase" --vault="$VAULT" \
    "url=$SUPABASE_URL" \
    "Service Role Key=$SUPABASE_SERVICE_ROLE_KEY" >/dev/null
echo "  [1/12] River CBS Supabase"

op item create --category=login --title="River WR Supabase" --vault="$VAULT" \
    "url=$WR_SUPABASE_URL" \
    "Service Role Key=$WR_SUPABASE_SERVICE_ROLE_KEY" \
    "DB Password=$WR_SUPABASE_DB_PASSWORD" >/dev/null
echo "  [2/12] River WR Supabase"

op item create --category="API Credential" --title="River Voyage AI" --vault="$VAULT" \
    "credential=$VOYAGE_API_KEY" >/dev/null
echo "  [3/12] River Voyage AI"

op item create --category="API Credential" --title="River Anthropic" --vault="$VAULT" \
    "credential=$ANTHROPIC_API_KEY" >/dev/null
echo "  [4/12] River Anthropic"

op item create --category=login --title="River Paperclip" --vault="$VAULT" \
    "url=$PAPERCLIP_URL" \
    "Session Cookie=$PAPERCLIP_SESSION_COOKIE" \
    "Image Digest=$PAPERCLIP_IMAGE_DIGEST" >/dev/null
echo "  [5/12] River Paperclip (note: Session Cookie is operator-refreshed)"

op item create --category=login --title="River Microsoft Graph" --vault="$VAULT" \
    "Client ID=$MICROSOFT_CLIENT_ID" \
    "Client Secret=$MICROSOFT_CLIENT_SECRET" \
    "Tenant ID=$MICROSOFT_TENANT_ID" >/dev/null
echo "  [6/12] River Microsoft Graph"

op item create --category=login --title="River Xero" --vault="$VAULT" \
    "Client ID=$XERO_CLIENT_ID" \
    "Client Secret=$XERO_CLIENT_SECRET" >/dev/null
echo "  [7/12] River Xero"

op item create --category="API Credential" --title="River GitHub PAT" --vault="$VAULT" \
    "credential=$GITHUB_PAT" >/dev/null
echo "  [8/12] River GitHub PAT"

op item create --category="API Credential" --title="River Teams Webhook" --vault="$VAULT" \
    "credential=$TEAMS_WEBHOOK_URL" >/dev/null
echo "  [9/12] River Teams Webhook"

op item create --category=login --title="River CA Sender" --vault="$VAULT" \
    "Shared Token=$RIVER_CA_SENDER_TOKEN" \
    "Web App URL=$RIVER_CA_SENDER_URL" >/dev/null
echo "  [10/12] River CA Sender"

op item create --category=login --title="River WR GCP" --vault="$VAULT" \
    "Project ID=$WR_GCP_PROJECT_ID" \
    "Service Account Email=$WR_SERVICE_ACCOUNT_EMAIL" \
    "Drive ID=$WR_DRIVE_ID" >/dev/null
if [ -f "$WR_SERVICE_ACCOUNT_FILE" ]; then
    op document create "$WR_SERVICE_ACCOUNT_FILE" \
        --title "River WR GCP Service Account JSON" \
        --vault "$VAULT" >/dev/null
    echo "  [11/12] River WR GCP (incl. service account JSON as document)"
else
    echo "  [11/12] River WR GCP (JSON file not found at $WR_SERVICE_ACCOUNT_FILE — attach manually)"
fi

# River Agent Read is created with a freshly generated password.
# This is the credential for the limited Supabase role defined in
# scripts/supabase-limited-role.sql.
AGENT_READ_PASSWORD="$(openssl rand -hex 32)"
op item create --category=login --title="River Agent Read" --vault="$VAULT" \
    "password=$AGENT_READ_PASSWORD" \
    "role=river_agent_read" >/dev/null
echo "  [12/12] River Agent Read (fresh 32-byte password generated)"

# ---------- confirmation ----------

echo ""
echo "Done. Verify with:"
echo "  op item list --vault $VAULT"
echo ""
echo "Next steps:"
echo "  1. Apply the limited Supabase role SQL with the generated password:"
echo "     op read 'op://River/River Agent Read/password'"
echo "     # paste into the SQL template in scripts/supabase-limited-role.sql, then apply"
echo "  2. Test op run:"
echo "     op run --env-file=scripts/env-op.env -- python3 scripts/paperclip-validate.py"
echo "  3. After verifying, replace scripts/env-setup.sh with the error stub (see docs/secrets-audit.md §3.2)."
