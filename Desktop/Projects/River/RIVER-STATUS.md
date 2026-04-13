# Project River — Status

**Current Day:** Sprint 3 Complete + Post-Sprint Enhancements
**Git Tag:** river-sprint-3 (Sprint 3) — enhancements on main
**Last Updated:** 13 April 2026

## Post-Sprint 3 Enhancements (11-13 April 2026)

| Enhancement | Status |
|---|---|
| CBS Executive budget $25→$100, heartbeat 6h→2h | LIVE |
| Tender Coordination budget $20→$90, heartbeat 4h→2h | LIVE |
| Shipley methodology KB (4 documents ingested) | LIVE |
| Competitor profiles (5 competitors with win themes) | LIVE |
| tender-workflow skill (Bronze/Silver/Gold) | LIVE |
| tender-register (Supabase dedup + decision recording) | LIVE |
| Tender source expansion (5 portals — email scanning) | LIVE |
| Manager review dashboard (monitoring/manager-dashboard.html) | LIVE |
| Teams notifications (Adaptive Card + HTML email with deep links) | LIVE |
| Email task submission via rivertasks@cbs.com.au | LIVE (Google Apps Script) |
| Google Apps Script cookie expiry alerting | LIVE |
| agent-recruitment skill (CEO can create specialist agents) | LIVE |
| token-efficiency skill | LIVE |
| graph-mail-read skill | LIVE |
| competitor-analysis skill | LIVE |
| All 12 AGENTS.md with embedded heartbeat protocol | LIVE |

---

## Platform

| Field | Value |
|---|---|
| Paperclip URL | `https://org.cbslab.app` |
| Paperclip Version | 0.3.1 |
| Deployment Mode | authenticated |
| Docker Image | `ghcr.io/paperclipai/paperclip@sha256:791f3493d101...` |
| Railway Project | just-learning / production / Paperclip |
| Supabase Project | eptugqwlgsmwhnubbqsk |

---

## Entities

| Entity | Status | Company ID | Agents | Budget |
|--------|--------|------------|--------|--------|
| CBS Group | active | fafce870-b862-4754-831e-2cd10e8b203c | 9 | $129/mo |
| WaterRoads | active (governance) | 95a248d4-08e7-4879-8e66-5d1ff948e005 | 3 | $34/mo |
| Adventure Safety | archived | 9d3e3196-e802-4f17-982a-aad28d717b04 | 0 | — |
| MAF CobaltBlu | archived | 44f71a7a-921c-4330-8ae3-56af5347c9d5 | 0 | — |

---

## CBS Group Agents

| Agent | Role | Model | Heartbeat | Budget | Agent ID |
|-------|------|-------|-----------|--------|----------|
| CBS Executive | ceo | Opus 4.6 | 21600s (6h) | $25/mo | 01273fb5 |
| Tender Intelligence | researcher | Sonnet 4 | 86400s (24h) | $15/mo | 1dcabe74 |
| Tender Coordination | pm | Sonnet 4 | 14400s (4h) | $20/mo | 69aa7cc8 |
| Technical Writing | engineer | Sonnet 4 | disabled | $25/mo | 31230e7a |
| Compliance | qa | Sonnet 4 | disabled | $5/mo | 9f649467 |
| Pricing and Commercial | general | Sonnet 4 | disabled | $10/mo | 43468bee |
| Governance CBS | pm | Sonnet 4 | disabled (routine) | $15/mo | beb7d905 |
| Office Management CBS | general | Haiku 4.5 | 43200s (12h) | $4/mo | d5df66da |
| Research CBS | researcher | Sonnet 4 | disabled | $10/mo | a0bb2e2a |

## WaterRoads Agents

| Agent | Role | Model | Heartbeat | Budget | Agent ID |
|-------|------|-------|-----------|--------|----------|
| WR Executive | ceo | Sonnet 4 | 21600s (6h) | $15/mo | 00fb11a2 |
| Governance WR | pm | Sonnet 4 | disabled (routine) | $15/mo | 10adea58 |
| Office Management WR | general | Haiku 4.5 | 43200s (12h) | $4/mo | 9594ef21 |

---

## Integrations

| Integration | Status | Scope |
|-------------|--------|-------|
| M365 Graph API | active | SharePoint write, Teams notify, Calendar, Mail.Read |
| Xero | active | CBS read-only, WR read-only |
| Supabase pgvector | active | 1,422 documents, 13 templates |
| AusTender | active | Email notifications, portal query skill |
| GitHub | active | Version control (cbs-apex-platform repo) |

---

## Hard Stop Status

| Layer | Test | Result | Last Verified |
|-------|------|--------|---------------|
| Layer 1 (instruction) | Email refusal | PASS | 10 April 2026 |
| Layer 1 (instruction) | Xero refusal | PASS | 10 April 2026 |
| Layer 2 (platform) | Graph Mail.Send | PASS (404) | 10 April 2026 |
| Layer 2 (platform) | Xero write | PASS (no scope) | 10 April 2026 |
| Layer 3 (audit) | Activity log immutability | PASS (404) | 10 April 2026 |

---

## Routines

| Entity | Routine | Cron | Agent |
|--------|---------|------|-------|
| CBS Group | Daily tender opportunity scan | `0 7 * * *` | Tender Intelligence |
| CBS Group | Board paper preparation cycle | `0 8 1,22 * *` | Governance CBS |
| WaterRoads | Board paper preparation cycle | `0 8 1,22 * *` | Governance WR |

---

## Known Issues

1. **CBS Executive 2 (duplicate)** — duplicate agent (id=117c536c) consuming budget at 1h intervals. DELETE returns 500. Recommend disabling.
2. **CBS Group duplicate** — second "CBS Group" company (f353f31a) with 1 "CEO" agent, archived but not deletable.

---

## Rollback Snapshot — Pre-Day 3

**Taken:** 10 April 2026, 09:49 AEST (2026-04-09T23:49Z UTC)

### Supabase

| Field | Value |
|---|---|
| PITR Timestamp | 09 Apr 2026 19:34:42 (as reported by Jeff) |
| Project ID | eptugqwlgsmwhnubbqsk |
| Documents ingested | 1,422 |
| Templates loaded | 9 |
| Note | Supabase PITR is not enabled — snapshot is informational only |

### Railway PostgreSQL

| Field | Value |
|---|---|
| Server timestamp | 2026-04-09 23:48:58 UTC |
| Server start | 2026-04-09 01:11:27 UTC |
| WAL LSN | 0/3C4C610 |
| PostgreSQL version | 18.3 (Debian) |
| Database | railway |
| Host | mainline.proxy.rlwy.net:41427 |

### Recovery Procedure

1. **Supabase:** PITR not enabled. To restore, re-run `scripts/ingest-knowledge-base.py` and `scripts/insert-governance-templates.py`.
2. **Railway PostgreSQL:** Use Railway dashboard → Postgres service → Backups to restore to a point before the WAL LSN above.
3. **Paperclip config:** Agent configurations are versioned in Paperclip (config revisions). Use `POST /api/agents/{id}/config-revisions/{revisionId}/rollback` to revert individual agents.
4. **Repository:** `git tag river-p5-day2` marks the pre-Day 3 state. `git checkout river-p5-day2` to restore files.
