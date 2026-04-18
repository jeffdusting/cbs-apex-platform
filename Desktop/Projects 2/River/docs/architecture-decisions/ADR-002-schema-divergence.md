# ADR-002: CBS and WR Supabase Schema Divergence

**Status:** Accepted (intentional)
**Date:** 16 April 2026
**Context:** CBS and WR `documents` tables have divergent schemas: WR has `drive_file_id` + `drive_modified` (for Drive sync); CBS does not (repo-based ingestion). `match_documents` signatures differ: WR has `match_threshold` parameter; CBS was upgraded in Stage 4 to match.
**Decision:** Maintain the divergence. WR's Drive-based workflow requires the Drive sync columns. CBS's repo-based workflow does not. Forcing alignment would add unused columns or remove necessary ones.
**Consequence:** Code that reads both KBs must account for schema differences. The `supabase-query` skill handles this via entity-scoped queries to the correct project.
