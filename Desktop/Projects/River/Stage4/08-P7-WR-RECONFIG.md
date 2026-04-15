# Phase 7: WR Agent Reconfiguration

## Objective

Reconfigure the 3 WR agents (WR Executive, Governance WR, Office Management WR) to use the WR Supabase project instead of CBS. Create the `wr-drive-read` skill. Verify entity-scoped retrieval — WR queries return WR content, not CBS content.

## Prerequisites

- S4-P5 complete. WR KB rationalised and verified.
- `WR_SUPABASE_URL`, `WR_SUPABASE_SERVICE_ROLE_KEY` set.
- `PAPERCLIP_SESSION_COOKIE` set (may need refresh — cookie expires after hours).
- `.secrets/wr-service-account.json` for Drive API.

## Context

```bash
cat stage4/WR-DISCOVERY-SUMMARY.md | head -20
cat stage4/data/wr-retrieval-test-results.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d)} queries tested')"
```

## Tasks

### TASK 7.1: Verify WR Supabase Connectivity

Quick check: query `documents` count and `prompt_templates` count from WR Supabase.

### TASK 7.2: Update WR Agent Instructions

For each of `wr-executive`, `governance-wr`, `office-management-wr`:

1. Read current `agent-instructions/{agent}/AGENTS.md`.
2. Replace `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` references with `WR_SUPABASE_URL` / `WR_SUPABASE_SERVICE_ROLE_KEY`.
3. Configure `supabase-query` skill for entity `waterroads` and WR Supabase project.
4. Add `match_threshold=0.3` in KB query instructions (WR `match_documents` supports it).
5. Commit local file changes.

### TASK 7.3: Deploy via Paperclip API PATCH

For each WR agent (`00fb11a2`, `10adea58`, `9594ef21`):

1. GET current `adapterConfig` from `GET /api/agents/{id}`
2. Replace `promptTemplate` with updated AGENTS.md content
3. PATCH via `PATCH /api/agents/{id}` with `Origin: https://org.cbslab.app` header
4. Verify by GET and checking key strings (`WR_SUPABASE_URL`, `match_threshold`)

If cookie expired, generate exact PATCH commands for Jeff to execute after refresh. Do not skip verification.

### TASK 7.4: Create wr-drive-read Skill

Create `skills/wr-drive-read/SKILL.md` — allows WR agents to fetch full Drive file content given a `drive_file_id` from retrieval results. Uses `.secrets/wr-service-account.json`. Handles Google Docs export, PDF text extraction (pdfplumber), DOCX (python-docx).

### TASK 7.5: Assign Skills to WR Agents

Read each WR agent's current skill list. Add `wr-drive-read` alongside existing skills (including `trace-capture` and `self-check` from hyper-agent-v1). POST via `/api/agents/{id}/skills/sync`. Verify by reading back.

### TASK 7.6: Entity Isolation Verification

Run cross-entity retrieval test:
- WR query ("WaterRoads PPP ferry Rhodes Barangaroo") against WR Supabase → should return WR docs
- Same query against CBS Supabase → should return 0 or minimal results
- CBS query ("CAPITAL framework tunnel asset management") against CBS Supabase → should return CBS docs
- Confirm no cross-entity leakage

## Gate Verification

```bash
echo "=== S4-P7 Gate Verification ==="
for agent in wr-executive governance-wr office-management-wr; do
    grep -q "WR_SUPABASE_URL" agent-instructions/$agent/AGENTS.md 2>/dev/null && echo "PASS: $agent → WR Supabase" || echo "FAIL: $agent still on CBS"
done
[ -f "skills/wr-drive-read/SKILL.md" ] && echo "PASS: wr-drive-read skill exists" || echo "FAIL: Missing"
echo "(Entity isolation test results above)"
```

## Archive Point

```bash
git add -A && git commit -m "S4-P7: WR agent reconfig — point to WR Supabase, add wr-drive-read"
git tag stage4-P7-wr-reconfig
```

## TASK_LOG Entry

```markdown
## S4-P7: WR Agent Reconfiguration
- **Status:** COMPLETE
- **Agents updated:** WR Executive, Governance WR, Office Management WR
- **API PATCH:** [deployed / commands generated]
- **wr-drive-read skill:** created and assigned
- **Entity isolation:** [PASS / FAIL]
- **Next phase:** P8 (Calibration) if P6 done and Jeff has scored, else P8 blocked — note status
```
