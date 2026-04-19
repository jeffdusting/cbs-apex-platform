---
title: Vendor Migration Cost Matrix
status: ACCEPTED
author: Stage 5 — P7 (DR + Resilience)
date: 2026-04-19
critique_ref: IB.4
---

# Vendor Migration Costs

## Purpose

For every external vendor in the stack, describe the migration cost to a
plausible alternative — effort, data portability, switching cost. Gives
us an honest picture of concentration risk and flags the few places
where a cheap hedge (an abstraction layer) is worth the investment
before we need it.

## 1. Migration matrix

| Layer | Current vendor | Plausible alternative | Effort | Data portability | Cost impact |
|---|---|---|---|---|---|
| Orchestration | **Paperclip v0.3.1** (hosted on Railway) | Self-hosted (no drop-in replacement) | **XL** | Agent instructions + skills are git-managed. Paperclip-specific runtime pieces (heartbeat protocol, issue object, budget enforcement, adapterConfig) would need to be reimplemented or replaced. | Highest risk — no competing product with the same issue/heartbeat model. |
| Database | **Supabase** (Postgres + pgvector + Auth + Storage) | Self-hosted Postgres + pgvector; Neon; Crunchy Data | M | Full `pg_dump` portable. pgvector extension works on any Postgres. Supabase-specific: Auth (GoTrue), Storage, Edge Functions, the realtime websocket channel. RPC functions port with minor tweaks. | Self-hosted: $20–50/month + ops time. Neon/Crunchy: similar to Supabase pricing. |
| LLM (agents) | **Anthropic Claude** (Sonnet 4, Opus 4.6, Haiku 4.5) | Multi-provider via adapter (OpenAI GPT-5, Google Gemini, Mistral, self-hosted) | L | Agent instructions are model-agnostic. Adapter layer in Paperclip handles model selection. `scripts/lib/evaluator.py` already takes a `model` parameter — one-level indirection. | Variable. Switching from Anthropic to OpenAI at current usage ≈ ±20% depending on the month. |
| Embeddings | **Voyage AI** voyage-3.5 (1024-dim) | OpenAI text-embedding-3-large, Cohere embed-v4, self-hosted BGE | L | Embeddings are not portable — full re-embed required (~18,000 chunks). ~$5–15 one-time. Must rebuild IVFFlat indexes at new dimensionality. | One-time migration cost. Ongoing cost within ±30% of Voyage. |
| Hosting (Paperclip) | **Railway** | Render, Fly.io, self-hosted Docker, DigitalOcean App Platform | S | Docker image is portable. Environment variables documented in the 1Password vault. No Railway-specific volume mounts at the Paperclip layer. | Similar ($5–20/month). |
| Email intake | **Google Apps Script** (jeff@cbsaustralia.com.au) | Power Automate, Lambda + Graph API subscription, self-hosted poller | M | Logic is simple (poll, parse, create Paperclip issue). ~1-day rewrite. Message format is stable. | Similar or free. |
| Dashboard | **Vercel** (static HTML + edge functions) | Netlify, Cloudflare Pages, self-hosted nginx | S | Static assets port trivially. Edge functions have Vercel-specific bindings but current usage is minimal. | Similar or free. |
| Email send (CA) | **Google Apps Script Web App** | Microsoft Graph `sendMail`, SendGrid, AWS SES | M | Logic is small (one POST handler, template expansion, Gmail draft creation). ~1–2-day rewrite. | Graph: free within M365. SendGrid/SES: <$1/month at current volume. |
| Auth | **Supabase Auth** (GoTrue) | Clerk, Auth0, self-hosted Keycloak | L if we lean on Supabase-issued JWTs in policies | Users in `auth.users`, session cookies, JWT claims all tied to Supabase Auth. Migration touches every RLS policy that uses `auth.uid()`. | Clerk: ~$25/month starter. Auth0: similar. |
| 1Password CLI | **1Password** (operator vault) | Bitwarden CLI, HashiCorp Vault, AWS Secrets Manager | M | Vault items portable via `op item get --format=json` → re-import on target. Operator workflow changes. | Bitwarden: free self-host. Vault: ops overhead. |

## 2. Concentration risk ranking

Ranked by the size of the hole left if the vendor disappears overnight.

1. **Paperclip** — no drop-in replacement. A vendor failure would stop
   the agent workforce. Mitigation: keep agent instructions and skills
   under git so we could rebuild orchestration elsewhere, even if
   painfully. Track Paperclip's financial health; maintain an
   operator-level relationship with the vendor.
2. **Supabase** — Postgres side is portable; Auth migration is the
   sticking point. Mitigation: avoid leaning on Auth features beyond
   JWT issuance + RLS claims, so a future Auth swap is contained.
3. **Anthropic** — model-level switch is painful but not existential.
   Mitigation: the evaluator-provider abstraction below.
4. **Voyage AI** — embeddings are not portable, but re-embedding is a
   one-time cost of hours, not weeks. Low strategic risk.
5. **Everything else (Railway, Vercel, Apps Script)** — swappable in
   days.

## 3. Recommended hedge — evaluator provider abstraction

**Priority: M effort, high leverage.**

Today `scripts/lib/evaluator.py` hardcodes Anthropic. Action:

- Add a `provider` parameter (default `"anthropic"`) alongside the
  existing `model` parameter.
- Factor the HTTP call out into a provider module (`lib/providers/anthropic.py`,
  `lib/providers/openai.py`) so the call site just routes by `provider`.
- Keep the rubric and scoring logic provider-agnostic — that's already
  how they're written.
- No behaviour change by default. New provider support is opt-in.

This is the cheapest move that insures against Anthropic availability,
Anthropic price changes, and single-provider rate limits. It's also the
prerequisite for the load-test scenario S2 described in
`docs/designs/load-test-spec.md` (which wants to run evaluations across
providers to compare).

Effort: ~1–2 days. Files touched: `scripts/lib/evaluator.py` +
two new files under `scripts/lib/providers/`.

## 4. Hedges NOT recommended at this stage

- **Database abstraction** — writing against an ORM that can target any
  Postgres derivative. The Supabase-specific pieces (Auth, Storage,
  Realtime) are the actual lock-in; the query layer is already portable
  via plain SQL. Adding an ORM would pay no dividend.
- **Orchestrator abstraction** — trying to build a thin layer so we
  could swap Paperclip for a self-hosted alternative. No viable
  alternative exists at the feature parity we rely on. An abstraction
  today would be architecture for a phantom.
- **Multi-region Railway** — Railway currently does not provide a
  useful multi-region primitive at the Paperclip container level. Track
  their roadmap; don't over-engineer a failover layer that Railway
  would replace.

## 5. Review cadence

Revisit this matrix every 6 months or when a vendor signals a material
change (pricing, acquisition, end-of-life). The evaluator provider
abstraction is a one-time action; the rest of this document is
reference material, not a project plan.
