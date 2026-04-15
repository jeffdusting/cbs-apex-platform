#!/usr/bin/env python3
"""
S4-P7 — Deploy WR agent reconfiguration via Paperclip API.

For each of the three WR agents (WR Executive, Governance WR, Office Management WR):
  1. GET current adapterConfig
  2. Build new adapterConfig.env with SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
     pointed at the WR Supabase project
  3. Load the updated AGENTS.md as the new promptTemplate
  4. PATCH /api/agents/{id} with Origin header
  5. Verify by GET and check the new values landed

Requires:
  - PAPERCLIP_SESSION_COOKIE set to the __Secure-better-auth.session_token value
  - WR_SUPABASE_URL / WR_SUPABASE_SERVICE_ROLE_KEY (via .secrets/wr-env.sh)
  - Local AGENTS.md files under agent-instructions/{wr-executive,governance-wr,office-management-wr}/

Usage:
  source scripts/env-setup.sh
  source .secrets/wr-env.sh
  export PAPERCLIP_SESSION_COOKIE='<value of __Secure-better-auth.session_token>'
  python3 scripts/wr-agent-reconfig.py [--dry-run]

When --dry-run is set, no PATCH calls are made; the script prints the intended
diff summary so Jeff can preview before applying.
"""

import argparse
import json
import os
import sys
from pathlib import Path

import httpx

REPO_ROOT = Path(__file__).parent.parent
WR_COMPANY_ID = "95a248d4-08e7-4879-8e66-5d1ff948e005"

# (slug, local SKILL.md path) — WR company skills to register before agent sync.
# Ordered so wr-drive-read (new) sits alongside the infra skills WR needs.
SKILLS_TO_REGISTER = [
    ("supabase-query", "skills/supabase-query/SKILL.md"),
    ("sharepoint-write", "skills/sharepoint-write/SKILL.md"),
    ("teams-notify", "skills/teams-notify/SKILL.md"),
    ("wr-drive-read", "skills/wr-drive-read/SKILL.md"),
    ("xero-read", "skills/xero-read/SKILL.md"),  # only governance-wr uses this but safer to register for all WR
]

# Built-in Paperclip skills, always desired on every agent.
BUILTIN_PAPERCLIP = [
    "paperclipai/paperclip/paperclip",
    "paperclipai/paperclip/paperclip-create-agent",
    "paperclipai/paperclip/paperclip-create-plugin",
    "paperclipai/paperclip/para-memory-files",
]

# (agent-instructions dir, paperclip agent id, local skill slugs to desire).
# feedback-loop / trace-capture / self-check from hyper-agent-v1 are NOT registered
# at the Paperclip company level yet (true for CBS as well — a broader hyper-agent-v1
# gap). Leaving them out of the desiredSkills payload avoids a sync error; the agent
# prompts still reference these skills as conceptual guidance until they're registered.
AGENTS = [
    ("wr-executive", "00fb11a2-2ede-43b0-b680-9d4b12551bb8",
     ["supabase-query", "wr-drive-read", "sharepoint-write", "teams-notify"]),
    ("governance-wr", "10adea58-6d60-4ca8-96d6-5cc6dc2b3ffc",
     ["supabase-query", "wr-drive-read", "xero-read", "sharepoint-write", "teams-notify"]),
    ("office-management-wr", "9594ef21-3067-4bba-b88b-6ec03ade1e2f",
     ["supabase-query", "wr-drive-read", "sharepoint-write"]),
]

ORIGIN = "https://org.cbslab.app"


def get_env(key: str) -> str:
    val = os.environ.get(key)
    if not val:
        print(f"ERROR: {key} not set in environment", file=sys.stderr)
        sys.exit(2)
    return val


def agents_md(role: str) -> str:
    path = REPO_ROOT / "agent-instructions" / role / "AGENTS.md"
    if not path.exists():
        print(f"ERROR: {path} not found", file=sys.stderr)
        sys.exit(2)
    return path.read_text()


def build_wr_env_overlay(current_env: dict, wr_url: str, wr_key: str) -> dict:
    """Return a new env dict with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    pointed at WR. All other entries are preserved. Preserves each entry's
    original binding shape (type=plain with a literal value is how the live
    adapterConfig stores everything — including secrets)."""
    new_env = dict(current_env or {})

    def preserve_shape(existing, new_value):
        # Keep whatever shape the existing binding used; default to plain+value.
        if isinstance(existing, dict) and existing.get("type"):
            return {**existing, "value": new_value}
        return {"type": "plain", "value": new_value}

    new_env["SUPABASE_URL"] = preserve_shape(new_env.get("SUPABASE_URL"), wr_url)
    new_env["SUPABASE_SERVICE_ROLE_KEY"] = preserve_shape(new_env.get("SUPABASE_SERVICE_ROLE_KEY"), wr_key)
    return new_env


def summarise_env(env: dict) -> str:
    url = env.get("SUPABASE_URL", {}).get("value", "<unset>")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY", {}).get("value", "")
    key_tail = key[-8:] if key else "<unset>"
    keys = sorted(env.keys())
    return f"SUPABASE_URL={url}  key_tail=…{key_tail}  env_keys={len(keys)}"


def register_wr_skills(base_url: str, cookies: dict, headers: dict, dry_run: bool) -> dict[str, str]:
    """Ensure the required skills exist on the WR company and their markdown matches
    the local SKILL.md. Returns {slug: fully-qualified-key} for agent sync."""
    # Fetch current WR company skills
    r = httpx.get(f"{base_url}/api/companies/{WR_COMPANY_ID}/skills",
                  cookies=cookies, headers=headers, timeout=30)
    r.raise_for_status()
    existing = {s.get("slug"): s for s in r.json()}

    slug_to_key: dict[str, str] = {}
    for slug, rel_path in SKILLS_TO_REGISTER:
        local_path = REPO_ROOT / rel_path
        if not local_path.exists():
            print(f"  WARN: local skill source missing: {rel_path} — skipping registration")
            continue
        local_md = local_path.read_text()

        if slug in existing:
            skill_id = existing[slug]["id"]
            key = existing[slug]["key"]
            print(f"  [{slug}] already registered (id={skill_id[:8]}, key={key})")
        else:
            if dry_run:
                print(f"  [{slug}] DRY-RUN would POST create on WR company")
                slug_to_key[slug] = f"company/{WR_COMPANY_ID}/{slug}"
                continue
            rr = httpx.post(
                f"{base_url}/api/companies/{WR_COMPANY_ID}/skills",
                cookies=cookies, headers=headers,
                json={"slug": slug, "name": slug},
                timeout=30,
            )
            if rr.status_code not in (200, 201):
                print(f"  [{slug}] POST create failed {rr.status_code}: {rr.text[:200]}")
                continue
            skill_id = rr.json()["id"]
            key = rr.json()["key"]
            print(f"  [{slug}] created id={skill_id[:8]} key={key}")

        # PATCH the SKILL.md content so the runtime serves the real markdown.
        if dry_run:
            slug_to_key[slug] = key
            continue
        pf = httpx.patch(
            f"{base_url}/api/companies/{WR_COMPANY_ID}/skills/{skill_id}/files",
            cookies=cookies, headers=headers,
            json={"path": "SKILL.md", "content": local_md},
            timeout=30,
        )
        if pf.status_code not in (200, 201, 204):
            print(f"  [{slug}] PATCH content failed {pf.status_code}: {pf.text[:200]}")
            continue
        slug_to_key[slug] = key

    return slug_to_key


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Do not PATCH; print intended changes only")
    args = ap.parse_args()

    base_url = get_env("PAPERCLIP_URL").rstrip("/")
    cookie = get_env("PAPERCLIP_SESSION_COOKIE")
    wr_url = get_env("WR_SUPABASE_URL")
    wr_key = get_env("WR_SUPABASE_SERVICE_ROLE_KEY")

    cookies = {"__Secure-better-auth.session_token": cookie}
    headers = {"Origin": ORIGIN, "Content-Type": "application/json"}

    print("=== Register WR company skills ===")
    slug_to_key = register_wr_skills(base_url, cookies, headers, args.dry_run)

    failures = 0
    for role, agent_id, skills in AGENTS:
        print(f"\n=== {role} ({agent_id[:8]}) ===")

        # GET current
        r = httpx.get(f"{base_url}/api/agents/{agent_id}", cookies=cookies, headers=headers, timeout=30)
        if r.status_code != 200:
            print(f"  ERROR: GET failed {r.status_code}: {r.text[:200]}")
            failures += 1
            continue
        agent = r.json()
        current_cfg = agent.get("adapterConfig", {}) or {}
        current_env = current_cfg.get("env", {}) or {}

        print(f"  Before: {summarise_env(current_env)}")

        # Build updated adapterConfig
        new_env = build_wr_env_overlay(current_env, wr_url, wr_key)
        new_prompt = agents_md(role)
        new_cfg = dict(current_cfg)
        new_cfg["env"] = new_env
        new_cfg["promptTemplate"] = new_prompt

        prompt_len = len(new_prompt)
        prompt_has_wr = "WR Supabase project" in new_prompt and 'filter_entity="waterroads"' in new_prompt
        print(f"  New:    {summarise_env(new_env)}  promptTemplate={prompt_len} chars  wr_strings_present={prompt_has_wr}")
        print(f"  Skills: {skills}")

        if args.dry_run:
            continue

        # PATCH adapterConfig (env + promptTemplate)
        pr = httpx.patch(
            f"{base_url}/api/agents/{agent_id}",
            cookies=cookies,
            headers=headers,
            json={"adapterConfig": new_cfg},
            timeout=60,
        )
        if pr.status_code not in (200, 204):
            print(f"  ERROR: PATCH failed {pr.status_code}: {pr.text[:300]}")
            failures += 1
            continue

        # POST skills/sync — builds desiredSkills from fully-qualified keys.
        desired_keys = list(BUILTIN_PAPERCLIP)
        for slug in skills:
            k = slug_to_key.get(slug)
            if k:
                desired_keys.append(k)
            else:
                print(f"  WARN: skill slug '{slug}' not registered — omitting from desiredSkills")

        sr = httpx.post(
            f"{base_url}/api/agents/{agent_id}/skills/sync",
            cookies=cookies,
            headers=headers,
            json={"desiredSkills": desired_keys},
            timeout=60,
        )
        if sr.status_code not in (200, 204):
            print(f"  WARN: skills sync returned {sr.status_code}: {sr.text[:200]}")

        # Verify adapterConfig
        vr = httpx.get(f"{base_url}/api/agents/{agent_id}", cookies=cookies, headers=headers, timeout=30)
        if vr.status_code != 200:
            print(f"  ERROR: verify GET failed {vr.status_code}")
            failures += 1
            continue
        v = vr.json()
        v_cfg = v.get("adapterConfig", {}) or {}
        v_env = v_cfg.get("env", {}) or {}
        v_url = v_env.get("SUPABASE_URL", {}).get("value", "")
        v_prompt = v_cfg.get("promptTemplate", "")
        ok_url = v_url == wr_url
        ok_prompt = 'filter_entity="waterroads"' in v_prompt and "match_threshold=0.3" in v_prompt

        # Verify skills
        sr = httpx.get(f"{base_url}/api/agents/{agent_id}/skills", cookies=cookies, headers=headers, timeout=30)
        v_desired: list[str] = []
        v_slugs: list[str] = []
        if sr.status_code == 200:
            data = sr.json()
            v_desired = data.get("desiredSkills", []) if isinstance(data, dict) else []
            v_slugs = [k.split("/")[-1] for k in v_desired]
        ok_drive = "wr-drive-read" in v_slugs
        v_skills = v_slugs  # display as slugs for readability
        status = "OK" if (ok_url and ok_prompt and ok_drive) else "MISMATCH"
        print(f"  Verify: {status}  url_ok={ok_url}  prompt_ok={ok_prompt}  wr-drive-read_assigned={ok_drive}")
        print(f"          skills={v_skills}")
        if not (ok_url and ok_prompt and ok_drive):
            failures += 1

    print()
    if failures:
        print(f"FAIL: {failures} agent(s) did not reconfigure cleanly")
        sys.exit(1)
    print("PASS: all WR agents reconfigured")


if __name__ == "__main__":
    main()
