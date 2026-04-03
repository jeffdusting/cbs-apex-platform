"""Configuration and secret loading for the flight calendar sync service."""

import json
import os


def _get_secret(secret_name: str) -> str:
    """Load a secret from Google Cloud Secret Manager, or fall back to env vars for local dev."""
    # For local development, check if the value is set directly as an env var
    direct_value = os.environ.get(secret_name)
    if direct_value:
        return direct_value

    # In Cloud Functions, load from Secret Manager
    # Secrets are mounted as env vars by the --set-secrets flag
    secret_env = secret_name.upper().replace("-", "_")
    value = os.environ.get(secret_env)
    if value:
        return value

    raise ValueError(
        f"Secret '{secret_name}' not found. Set it as an environment variable "
        f"or configure it in Google Cloud Secret Manager."
    )


def get_gmail_token() -> dict:
    """Get Gmail OAuth token as a dict."""
    token_json = _get_secret("GMAIL_TOKEN")
    return json.loads(token_json)


def get_gmail_user_email() -> str:
    return os.environ.get("GMAIL_USER_EMAIL", "jeff.dusting@gmail.com")


def get_ms_graph_client_id() -> str:
    return _get_secret("MS_CLIENT_ID")


def get_ms_graph_client_secret() -> str:
    return _get_secret("MS_CLIENT_SECRET")


def get_ms_graph_tenant_id() -> str:
    return _get_secret("MS_TENANT_ID")


def get_ms_target_email() -> str:
    return os.environ.get("MS_TARGET_EMAIL", "jeff@cbs.com.au")


def get_anthropic_api_key() -> str:
    return _get_secret("ANTHROPIC_API_KEY")


def get_gcs_bucket() -> str:
    return os.environ.get("GCS_BUCKET", "flight-calendar-sync-state")


def get_gcs_processed_file() -> str:
    return os.environ.get("GCS_PROCESSED_FILE", "processed_email_ids.json")
