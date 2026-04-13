"""Project River — Agent Configuration Standards

SINGLE SOURCE OF TRUTH for what every agent MUST have.

Import from this file in any script that creates or validates agents.
Do NOT duplicate these values elsewhere.

Usage:
    from agent_standards import REQUIRED_ENV_VARS, build_agent_env
    env = build_agent_env()  # returns dict ready for adapterConfig.env
"""

import os

# =============================================================================
# REQUIRED ENV VARS FOR EVERY AGENT
# =============================================================================
# These MUST be set on every agent. Any agent missing any of these will fail
# to perform core functions (KB retrieval, notifications, tender scanning).

REQUIRED_ENV_VARS = [
    # Supabase — required for ALL KB retrieval and register operations
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",

    # Voyage AI — required for query embeddings
    "VOYAGE_API_KEY",

    # Teams webhook — required for notifications on in_review/blocked/completion
    "TEAMS_WEBHOOK_URL",

    # Microsoft Graph — required for email scanning and SharePoint writes
    "MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET",
    "MICROSOFT_TENANT_ID",
]

# =============================================================================
# ROLE-SPECIFIC ENV VARS
# =============================================================================
# Some agents need additional credentials for their specialist role.

ROLE_SPECIFIC_ENV_VARS = {
    "governance-cbs": ["XERO_CLIENT_ID", "XERO_CLIENT_SECRET"],
    "governance-wr": ["XERO_CLIENT_ID", "XERO_CLIENT_SECRET"],
    "pricing-commercial": ["XERO_CLIENT_ID", "XERO_CLIENT_SECRET"],
}


def build_agent_env(agent_role: str = None) -> dict:
    """
    Build the complete env dict for a new agent. Call this when creating agents.

    Returns a dict in Paperclip adapterConfig.env format:
        {"KEY": {"type": "plain", "value": "..."}}

    Args:
        agent_role: optional role key (e.g. "governance-cbs") to include
                    role-specific env vars

    Raises:
        ValueError if any required env var is missing from the shell environment
    """
    env = {}
    required = list(REQUIRED_ENV_VARS)
    if agent_role and agent_role in ROLE_SPECIFIC_ENV_VARS:
        required.extend(ROLE_SPECIFIC_ENV_VARS[agent_role])

    missing = []
    for key in required:
        val = os.environ.get(key)
        if not val:
            missing.append(key)
            continue
        env[key] = {"type": "plain", "value": val}

    if missing:
        raise ValueError(
            f"Missing required env vars in shell environment: {missing}. "
            f"Run `source scripts/env-setup.sh` and retry."
        )

    return env


def validate_agent_env(agent_env: dict, agent_role: str = None) -> list[str]:
    """
    Check an existing agent's env vars against the required set.

    Args:
        agent_env: the agent's current adapterConfig.env dict
        agent_role: optional role for role-specific checks

    Returns:
        List of missing env var names (empty if all present)
    """
    required = list(REQUIRED_ENV_VARS)
    if agent_role and agent_role in ROLE_SPECIFIC_ENV_VARS:
        required.extend(ROLE_SPECIFIC_ENV_VARS[agent_role])

    missing = []
    for key in required:
        entry = agent_env.get(key, {})
        if not entry or not entry.get("value"):
            missing.append(key)
    return missing
