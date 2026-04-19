#!/bin/bash
# Paperclip liveness check. Exits 0 when Paperclip responds, 1 otherwise.
# Intended to be run every 5 minutes from cron as a lightweight probe.
#
# Cron example (every 5 minutes, log to a rolling file):
#   */5 * * * * bash "/Users/jeffdusting/Desktop/Projects 2/River/scripts/railway-health-check.sh" \
#     >> "$HOME/river-logs/health.log" 2>&1
#
# Exit codes:
#   0 — Paperclip reachable (200 or 401 — 401 means front-end is up but
#       the probe has no cookie, which is the expected unauthenticated
#       response)
#   1 — Paperclip not reachable (5xx, DNS failure, timeout, or any
#       non-200/401 response)
#
# This script does NOT automatically restart the service. Automatic
# restart requires the Railway CLI to be authenticated, which in turn
# requires a Railway API token that we have not chosen to persist to
# disk. If Paperclip is down, the script logs the event and optionally
# sends a Teams alert — the operator still decides whether to restart.

set -u

HEALTH_URL="${PAPERCLIP_HEALTH_URL:-https://org.cbslab.app/api/companies}"
TIMEOUT_SECS="${HEALTH_TIMEOUT:-10}"
TEAMS_WEBHOOK="${TEAMS_WEBHOOK_URL:-}"

TS="$(date -u +%FT%TZ)"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time "$TIMEOUT_SECS" "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ]; then
    echo "$TS paperclip ok (HTTP $STATUS)"
    exit 0
fi

echo "$TS paperclip DOWN (HTTP $STATUS)"

# Optional Teams alert, fire-and-forget.
if [ -n "$TEAMS_WEBHOOK" ]; then
    BODY=$(cat <<EOF
{
  "type": "message",
  "attachments": [{
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": {
      "type": "AdaptiveCard",
      "version": "1.4",
      "body": [
        {"type": "TextBlock", "size": "Medium", "weight": "Bolder", "text": "Paperclip health check: DOWN"},
        {"type": "TextBlock", "text": "URL: $HEALTH_URL"},
        {"type": "TextBlock", "text": "HTTP $STATUS at $TS"},
        {"type": "TextBlock", "text": "Check Railway console for container status. Restart if required."}
      ]
    }
  }]
}
EOF
)
    curl -s -o /dev/null -X POST \
        -H "Content-Type: application/json" \
        -d "$BODY" \
        "$TEAMS_WEBHOOK" || true
fi

exit 1
