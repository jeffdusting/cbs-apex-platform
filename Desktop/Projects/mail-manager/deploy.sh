#!/usr/bin/env bash
# Deployment script for flight-calendar-sync Cloud Function
# Usage: ./deploy.sh <PROJECT_ID> <SERVICE_ACCOUNT_EMAIL>

set -euo pipefail

PROJECT_ID="${1:?Usage: ./deploy.sh <PROJECT_ID> <SERVICE_ACCOUNT_EMAIL>}"
SERVICE_ACCOUNT="${2:?Usage: ./deploy.sh <PROJECT_ID> <SERVICE_ACCOUNT_EMAIL>}"
REGION="australia-southeast1"
FUNCTION_NAME="flight-calendar-sync"

echo "Deploying ${FUNCTION_NAME} to ${PROJECT_ID} (${REGION})..."

# Deploy the Cloud Function
gcloud functions deploy "${FUNCTION_NAME}" \
  --project="${PROJECT_ID}" \
  --gen2 \
  --runtime=python312 \
  --region="${REGION}" \
  --source=. \
  --entry-point=sync_flights \
  --trigger-http \
  --no-allow-unauthenticated \
  --memory=256MB \
  --timeout=120s \
  --set-secrets="GMAIL_TOKEN=gmail-oauth-token:latest,MS_CLIENT_ID=ms-graph-client-id:latest,MS_CLIENT_SECRET=ms-graph-client-secret:latest,MS_TENANT_ID=ms-graph-tenant-id:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest"

FUNCTION_URL=$(gcloud functions describe "${FUNCTION_NAME}" --project="${PROJECT_ID}" --region="${REGION}" --gen2 --format='value(serviceConfig.uri)')

echo "Function deployed at: ${FUNCTION_URL}"
echo ""

# Create Cloud Scheduler job (delete first if it exists)
JOB_NAME="${FUNCTION_NAME}-job"
if gcloud scheduler jobs describe "${JOB_NAME}" --project="${PROJECT_ID}" --location="${REGION}" &>/dev/null; then
  echo "Updating existing scheduler job..."
  gcloud scheduler jobs update http "${JOB_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${REGION}" \
    --schedule="*/15 * * * *" \
    --uri="${FUNCTION_URL}" \
    --http-method=POST \
    --oidc-service-account-email="${SERVICE_ACCOUNT}"
else
  echo "Creating scheduler job..."
  gcloud scheduler jobs create http "${JOB_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${REGION}" \
    --schedule="*/15 * * * *" \
    --uri="${FUNCTION_URL}" \
    --http-method=POST \
    --oidc-service-account-email="${SERVICE_ACCOUNT}"
fi

echo ""
echo "Deployment complete!"
echo "  Function: ${FUNCTION_URL}"
echo "  Scheduler: every 15 minutes"
echo ""
echo "To test manually:"
echo "  curl -H \"Authorization: bearer \$(gcloud auth print-identity-token)\" ${FUNCTION_URL}"
