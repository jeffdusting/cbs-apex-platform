# Access Control Policy

**Owner:** Jeff Dusting
**Effective:** 2026-04-19 (S5-P4)
**Review cadence:** quarterly, or on role change.

## Role model

| Role | Scope | Granted to | How granted | How revoked |
|---|---|---|---|---|
| `operator` | Full human operator — can run any script, modify agent configs, deploy schema changes | Jeff Dusting | 1Password vault membership | Remove from 1Password vault |
| `agent-read` (`river_operator` Supabase role) | Read-only access to `documents`, `agent_traces`, `evaluation_scores`, `correction_proposals`, `tender_register`; no write access; no access to secrets | Human diagnostic users | Supabase SQL: see `scripts/supabase-limited-role.sql` | Revoke role in Supabase dashboard |
| `service-role` | Full Supabase read/write | Production agents and ingestion scripts | Environment variable `SUPABASE_SERVICE_ROLE_KEY` loaded from 1Password | Rotate key, update 1Password, re-deploy |
| `dashboard-user` | Read-only Vercel dashboard (evaluator + cost panels) | Jeff Dusting; future: select stakeholders | Vercel project membership | Remove from Vercel project |
| `paperclip-operator` | Paperclip company-level admin — can hire/fire agents, change runtime configs | Jeff Dusting | Paperclip session cookie (1Password) | Log out of Paperclip session |

## Principle of least privilege

Agents never hold the `service-role` key unless they must write. Read-only agents and diagnostics use `river_operator`. The full service role key is only loaded in the environment of scripts that ingest or update data.

## Granting access

- **New human user:** Jeff adds them to the 1Password River vault, shares the `SUPABASE_URL` and (if required) a `river_operator` credential. Service-role keys are never shared.
- **New agent:** created via `scripts/paperclip-hire-*.py`. Env config inherits the parent company's key profile; the agent manifest in `scripts/wr-agents-manifest.json` (or CBS equivalent) is updated and committed.

## Revoking access

- **Human user:** remove from 1Password vault and any Vercel project memberships. Rotate the shared service-role key if the departure is involuntary.
- **Agent:** disable via `PATCH /api/agents/{id}` with `status=disabled`; update the manifest and commit.

## Secrets rotation cadence

| Secret | Rotation | Trigger |
|---|---|---|
| Supabase service-role keys (CBS, WR) | 180 days | Scheduled or on suspected leak |
| Voyage API key | 180 days | Scheduled |
| Anthropic API key | 180 days | Scheduled |
| Paperclip session cookie | 30 days or on expiry | Expiry detected by River Monitor |
| 1Password vault password | Annually | Scheduled |

## Related documents

- [`docs/secrets-audit.md`](../secrets-audit.md)
- [`docs/policies/data-handling-policy.md`](data-handling-policy.md)
- [`docs/policies/incident-response-plan.md`](incident-response-plan.md)
- `scripts/supabase-limited-role.sql`
