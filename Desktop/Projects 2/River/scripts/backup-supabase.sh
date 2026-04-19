#!/bin/bash
# Daily backup of CBS + WR Supabase projects.
#
# Run interactively:
#   bash scripts/backup-supabase.sh
#
# Run from cron (recommended 02:00 local):
#   0 2 * * * cd "/Users/jeffdusting/Desktop/Projects 2/River" && \
#     op run --env-file=scripts/env-op.env -- bash scripts/backup-supabase.sh \
#     >> "$HOME/river-backups/last-run.log" 2>&1
#
# Required environment (via `op run` or a sourced env file):
#   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY           — CBS
#   WR_SUPABASE_URL, WR_SUPABASE_SERVICE_ROLE_KEY     — WR
#   WR_SUPABASE_DB_PASSWORD                           — WR (for pg_dump fallback)
#
# Strategy:
#   1. Prefer `supabase db dump --linked --project-ref ...`.
#   2. If the Supabase CLI is not installed or not linked, fall back to
#      direct `pg_dump` over the project's pooled Postgres URL.
#   3. Keep 30 days of local backups. Older directories are deleted.
#   4. An optional S3 upload step is left commented out — enable after the
#      target bucket is provisioned and credentials are in 1Password.

set -euo pipefail

DATE="$(date +%Y-%m-%d)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/river-backups}"
OUT="$BACKUP_DIR/$DATE"
mkdir -p "$OUT"

CBS_REF="eptugqwlgsmwhnubbqsk"
WR_REF="imbskgjkqvadnazzhbiw"

have_cli () { command -v "$1" >/dev/null 2>&1; }

# ---------- CBS ----------

echo "[cbs] starting dump at $(date -u +%FT%TZ)"
if have_cli supabase && supabase projects list 2>/dev/null | grep -q "$CBS_REF"; then
    supabase db dump --linked --project-ref "$CBS_REF" \
        > "$OUT/cbs-dump.sql" 2>"$OUT/cbs-dump.err" \
        || echo "[cbs] supabase CLI dump FAILED — see cbs-dump.err"
else
    if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
        echo "[cbs] skipping pg_dump fallback — SUPABASE_DB_PASSWORD not set"
    elif have_cli pg_dump; then
        PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
            "postgresql://postgres.$CBS_REF:$SUPABASE_DB_PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" \
            > "$OUT/cbs-dump.sql" 2>"$OUT/cbs-dump.err" \
            || echo "[cbs] pg_dump FAILED — see cbs-dump.err"
    else
        echo "[cbs] neither supabase CLI nor pg_dump available — skipping"
    fi
fi

# ---------- WR ----------

echo "[wr]  starting dump at $(date -u +%FT%TZ)"
if have_cli supabase && supabase projects list 2>/dev/null | grep -q "$WR_REF"; then
    supabase db dump --linked --project-ref "$WR_REF" \
        > "$OUT/wr-dump.sql" 2>"$OUT/wr-dump.err" \
        || echo "[wr] supabase CLI dump FAILED — see wr-dump.err"
elif have_cli pg_dump; then
    if [ -z "${WR_SUPABASE_DB_PASSWORD:-}" ]; then
        echo "[wr] skipping pg_dump fallback — WR_SUPABASE_DB_PASSWORD not set"
    else
        PGPASSWORD="$WR_SUPABASE_DB_PASSWORD" pg_dump \
            "postgresql://postgres.$WR_REF:$WR_SUPABASE_DB_PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" \
            > "$OUT/wr-dump.sql" 2>"$OUT/wr-dump.err" \
            || echo "[wr] pg_dump FAILED — see wr-dump.err"
    fi
else
    echo "[wr] neither supabase CLI nor pg_dump available — skipping"
fi

# ---------- verify ----------

echo ""
echo "=== Verification ==="
for f in "$OUT/cbs-dump.sql" "$OUT/wr-dump.sql"; do
    if [ -s "$f" ]; then
        bytes=$(wc -c < "$f" | tr -d ' ')
        lines=$(wc -l < "$f" | tr -d ' ')
        echo "OK    $(basename "$f"): ${bytes} bytes, ${lines} lines"
    else
        echo "FAIL  $(basename "$f"): empty or missing"
    fi
done

# ---------- retention ----------

echo ""
echo "=== Retention (30 days) ==="
find "$BACKUP_DIR" -maxdepth 1 -type d -name '20??-??-??' -mtime +30 -print -exec rm -rf {} +

# ---------- optional S3 sync ----------
# Enable once an S3-compatible bucket + credentials are provisioned.
# aws s3 sync "$OUT" "s3://river-backups/$DATE/" --storage-class STANDARD_IA

echo ""
echo "Done. Backup directory: $OUT"
