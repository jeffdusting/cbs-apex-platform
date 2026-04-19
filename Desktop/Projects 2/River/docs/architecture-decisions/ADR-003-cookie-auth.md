# ADR-003: Paperclip Cookie Auth Accepted

**Status:** Accepted (vendor limitation)
**Date:** 19 April 2026
**Critique reference:** IB.3

## Context

Paperclip v0.3.1 does not expose API keys or service accounts. Every
authenticated API call requires a browser-derived session cookie —
specifically `__Secure-better-auth.session_token`, copied from the
logged-in operator's DevTools into the `PAPERCLIP_SESSION_COOKIE`
environment variable. The cookie expires after a few hours, matching
the web session's lifetime.

Scripts affected (non-exhaustive): `ingest-traces.py`,
`paperclip-validate.py`, `trace-reconciliation.py`, and every deploy
script that issues `PATCH /api/agents/{id}`.

## Decision

Accept the constraint. We will not build a browser-automation workaround
to forge or rotate cookies headlessly. The cost of a bespoke solution
(Selenium, re-login scheduling, MFA handling) exceeds the operator cost
of manual cookie refresh at current scale.

We will:

1. Treat cookie refresh as a named operator procedure
   (`docs/absence-runbook.md §3`).
2. Detect cookie expiry in the monitoring agent's daily digest so
   failures surface within 24 hours rather than accumulating silently.
3. Keep cookie-dependent scripts on interactive-only execution —
   nothing should run in CI expecting a live cookie.
4. Store the current cookie only in the 1Password `River Paperclip` item;
   never commit cookie values to git or write them to disk outside a
   `source`'d env file.
5. Raise API key support as a roadmap request with the Paperclip vendor.
   Track their response; if API keys ship, this ADR is superseded.

## Consequences

- **Operational** — any deploy or mutation requires a fresh cookie.
  Second-operator handoff includes a cookie-refresh walkthrough.
- **Pipeline** — trace ingestion can fall behind silently if the cookie
  expires between runs. Mitigated by the reconciliation step in the
  monitoring digest (`scripts/trace-reconciliation.py`).
- **CI** — no CI job depends on `PAPERCLIP_SESSION_COOKIE`. Validation
  that would require a live cookie is excluded from CI and runs only
  on-demand on the operator's workstation.
- **Security posture** — the cookie is short-lived (hours), so the
  blast radius of accidental disclosure is bounded. This is the one
  upside of the vendor limitation.

## Future

When Paperclip ships API keys:

1. Replace every `PAPERCLIP_SESSION_COOKIE` reference with
   `PAPERCLIP_API_KEY`.
2. Remove the cookie refresh procedure from the absence runbook.
3. Remove the reconciliation step's cookie-expiry check.
4. Supersede this ADR.

## Alternatives considered and rejected

- **Browser automation** — Selenium or Playwright to log in and extract
  a fresh cookie on a cron. Adds a brittle dependency (MFA handling,
  Paperclip front-end changes), introduces a new credential
  (automation account), and still has to ship the cookie somewhere for
  scripts to read. Not worth it at current scale.
- **Proxy service** — a small service that logs in once and hands out
  short-lived scoped tokens to scripts. Same brittleness as browser
  automation plus an additional service to maintain.
- **Disable cookie-dependent scripts** — reduces operational surface to
  zero but also disables trace ingestion, deploys, and half of
  observability. Net negative.
