#!/usr/bin/env python3
"""
Deploy heartbeat extension templates to live agents via Paperclip API PATCH.

Reads the tier-appropriate template, merges it into the agent's existing
promptTemplate, and PATCHes the Paperclip API.

Usage:
    python3 scripts/deploy-heartbeat-extensions.py                        # preview all
    python3 scripts/deploy-heartbeat-extensions.py --agent-id 01273fb5    # preview one
    python3 scripts/deploy-heartbeat-extensions.py --execute              # deploy all
    python3 scripts/deploy-heartbeat-extensions.py --agent-id 01273fb5 --execute  # deploy one
"""

import argparse
import json
import os
import sys

import httpx

PAPERCLIP_API_URL = os.environ.get("PAPERCLIP_API_URL", "https://org.cbslab.app")
PAPERCLIP_COOKIE = os.environ.get("PAPERCLIP_SESSION_COOKIE", "")

# Agent tier mapping
AGENT_TIERS = {
    "01273fb5": {"name": "CBS Executive", "tier": "tier1-ceo"},
    "1dcabe74": {"name": "Tender Intelligence", "tier": "tier2-specialist"},
    "69aa7cc8": {"name": "Tender Coordination", "tier": "tier2-specialist"},
    "31230e7a": {"name": "Technical Writing", "tier": "tier3-support"},
    "9f649467": {"name": "Compliance", "tier": "tier3-support"},
    "43468bee": {"name": "Pricing and Commercial", "tier": "tier3-support"},
    "beb7d905": {"name": "Governance CBS", "tier": "tier2-specialist"},
    "d5df66da": {"name": "Office Management CBS", "tier": "tier2-specialist"},
    "a0bb2e2a": {"name": "Research CBS", "tier": "tier3-support"},
    "00fb11a2": {"name": "WR Executive", "tier": "tier1-ceo"},
    "10adea58": {"name": "Governance WR", "tier": "tier2-specialist"},
    "9594ef21": {"name": "Office Management WR", "tier": "tier2-specialist"},
}

TEMPLATE_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "docs",
    "hyper-agent-v1",
    "heartbeat-extension-templates",
)

TRACE_MARKER = "### Trace Capture"


def paperclip_headers() -> dict:
    return {
        "Cookie": f"__Secure-better-auth.session_token={PAPERCLIP_COOKIE}",
        "Content-Type": "application/json",
    }


def load_template(tier: str) -> str:
    """Load the heartbeat extension template for a tier."""
    filename = f"{tier}-trace-extension.md"
    filepath = os.path.join(TEMPLATE_DIR, filename)
    with open(filepath) as f:
        content = f.read()
    # Extract just the markdown section (skip the frontmatter header)
    lines = content.split("\n")
    start = None
    for i, line in enumerate(lines):
        if line.startswith("### Trace Capture"):
            start = i
            break
    if start is not None:
        return "\n".join(lines[start:]).strip()
    return content.strip()


def get_agent_full_id(short_id: str) -> str | None:
    """Resolve short agent ID to full UUID."""
    headers = paperclip_headers()
    for company_id in [
        "fafce870-b862-4754-831e-2cd10e8b203c",
        "95a248d4-08e7-4879-8e66-5d1ff948e005",
    ]:
        try:
            r = httpx.get(
                f"{PAPERCLIP_API_URL}/api/companies/{company_id}/agents",
                headers=headers,
                timeout=15,
            )
            if r.status_code == 200:
                agents = r.json()
                if isinstance(agents, dict):
                    agents = agents.get("agents", agents.get("data", []))
                for agent in agents:
                    if agent.get("id", "").startswith(short_id):
                        return agent["id"]
            elif r.status_code == 401:
                print("ERROR: Session cookie expired")
                sys.exit(2)
        except Exception:
            continue
    return None


def get_agent_prompt(agent_id: str) -> tuple[dict, str]:
    """Get agent's current adapterConfig and promptTemplate."""
    headers = paperclip_headers()
    r = httpx.get(
        f"{PAPERCLIP_API_URL}/api/agents/{agent_id}",
        headers=headers,
        timeout=15,
    )
    r.raise_for_status()
    agent = r.json()
    config = agent.get("adapterConfig", {})
    prompt = config.get("promptTemplate", "")
    return config, prompt


def merge_extension(prompt: str, extension: str) -> str:
    """Insert the trace extension into the agent's promptTemplate."""
    # If already has trace capture, skip
    if TRACE_MARKER in prompt:
        return prompt

    # Strategy: insert before the last major section that looks like a status/notification step
    # Look for Teams notification section or the end of heartbeat protocol
    insertion_markers = [
        "## Send Teams Notifications",
        "### Send Teams Notifications",
        "6. **Send Teams Notifications**",
        "## Reporting Obligations",
    ]

    for marker in insertion_markers:
        if marker in prompt:
            idx = prompt.index(marker)
            return prompt[:idx] + extension + "\n\n" + prompt[idx:]

    # Fallback: append before the very end
    return prompt.rstrip() + "\n\n" + extension + "\n"


def deploy_to_agent(agent_id: str, config: dict, new_prompt: str) -> bool:
    """PATCH the agent's promptTemplate."""
    headers = paperclip_headers()
    updated_config = {**config, "promptTemplate": new_prompt}

    r = httpx.patch(
        f"{PAPERCLIP_API_URL}/api/agents/{agent_id}",
        headers=headers,
        json={"adapterConfig": updated_config},
        timeout=30,
    )
    if r.status_code in (200, 204):
        # Verify by reading back
        _, readback = get_agent_prompt(agent_id)
        if TRACE_MARKER in readback:
            return True
        else:
            print("    WARN: Verification failed — trace marker not found in readback")
            return False
    else:
        print(f"    ERROR: PATCH returned {r.status_code}: {r.text[:200]}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Deploy heartbeat extensions to agents")
    parser.add_argument("--agent-id", help="Deploy to a single agent (short ID)")
    parser.add_argument("--execute", action="store_true", help="Actually deploy via API")
    args = parser.parse_args()

    if not PAPERCLIP_COOKIE:
        print("ERROR: PAPERCLIP_SESSION_COOKIE must be set")
        sys.exit(2)

    # Determine which agents to process
    if args.agent_id:
        if args.agent_id not in AGENT_TIERS:
            print(f"ERROR: Unknown agent ID {args.agent_id}")
            print(f"Known IDs: {', '.join(AGENT_TIERS.keys())}")
            sys.exit(1)
        agents_to_process = {args.agent_id: AGENT_TIERS[args.agent_id]}
    else:
        agents_to_process = AGENT_TIERS

    print(f"{'DEPLOYING' if args.execute else 'PREVIEW'} — heartbeat extensions for {len(agents_to_process)} agents\n")

    success = 0
    skipped = 0
    failed = 0

    for short_id, info in agents_to_process.items():
        name = info["name"]
        tier = info["tier"]

        print(f"  {name} ({short_id}) — {tier}")

        # Load template
        try:
            extension = load_template(tier)
        except FileNotFoundError:
            print(f"    SKIP: Template not found for {tier}")
            failed += 1
            continue

        if args.execute:
            # Resolve full ID
            full_id = get_agent_full_id(short_id)
            if not full_id:
                print(f"    SKIP: Could not resolve full agent ID")
                failed += 1
                continue

            # Get current prompt
            try:
                config, current_prompt = get_agent_prompt(full_id)
            except Exception as e:
                print(f"    ERROR: {e}")
                failed += 1
                continue

            # Check if already deployed
            if TRACE_MARKER in current_prompt:
                print(f"    SKIP: Trace capture already present")
                skipped += 1
                continue

            # Merge
            new_prompt = merge_extension(current_prompt, extension)

            # Show diff summary
            added_lines = len(new_prompt.split("\n")) - len(current_prompt.split("\n"))
            print(f"    Lines added: {added_lines}")

            # Deploy
            ok = deploy_to_agent(full_id, config, new_prompt)
            if ok:
                print(f"    → DEPLOYED and VERIFIED")
                success += 1
            else:
                print(f"    → DEPLOY FAILED")
                failed += 1
        else:
            # Preview mode — just show what would happen
            print(f"    Template: {tier}-trace-extension.md")
            print(f"    Extension preview ({len(extension)} chars):")
            preview = extension[:200].replace("\n", " ")
            print(f"    {preview}...")
        print()

    print(f"\nSummary: {success} deployed, {skipped} already present, {failed} failed")
    if not args.execute:
        print("Run with --execute to deploy. Test with --agent-id <ID> --execute first.")


if __name__ == "__main__":
    main()
