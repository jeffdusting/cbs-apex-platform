#!/bin/bash
# Project River — Environment Variables
# Fill values once. Every script reads from these.
# Usage: source scripts/env-setup.sh

export PAPERCLIP_URL="https://org.cbslab.app"
export PAPERCLIP_API_KEY=""       # board operator session token or API key
export ANTHROPIC_API_KEY=""       # from Anthropic console
export SUPABASE_URL=""            # from Supabase project dashboard
export SUPABASE_SERVICE_ROLE_KEY="" # from Supabase project dashboard
export VOYAGE_API_KEY=""          # from voyageai.com
export MICROSOFT_CLIENT_ID=""     # from Azure AD
export MICROSOFT_CLIENT_SECRET="" # from Azure AD
export MICROSOFT_TENANT_ID=""     # from Azure AD
export XERO_CLIENT_ID=""          # from Xero developer portal
export XERO_CLIENT_SECRET=""      # from Xero developer portal
export GITHUB_PAT=""              # GitHub fine-grained token
export PAPERCLIP_IMAGE_DIGEST="ghcr.io/paperclipai/paperclip@sha256:791f3493d101154cb8a991a3895160297fae979f50cba657032ae4ce18132bff"
