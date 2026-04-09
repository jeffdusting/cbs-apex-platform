# Project River — Status

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

### Paperclip

| Field | Value |
|---|---|
| Version | 0.3.1 |
| Deployment mode | authenticated |
| CBS Group company ID | fafce870-b862-4754-831e-2cd10e8b203c |
| CBS agents | 9 active |
| Projects | 4 |
| Routines | 2 |

### Recovery Procedure

1. **Supabase:** PITR not enabled. To restore, re-run `scripts/ingest-knowledge-base.py` and `scripts/insert-governance-templates.py`.
2. **Railway PostgreSQL:** Use Railway dashboard → Postgres service → Backups to restore to a point before the WAL LSN above.
3. **Paperclip config:** Agent configurations are versioned in Paperclip (config revisions). Use `POST /api/agents/{id}/config-revisions/{revisionId}/rollback` to revert individual agents.
4. **Repository:** `git tag river-p5-day2` marks the pre-Day 3 state. `git checkout river-p5-day2` to restore files.
