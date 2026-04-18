# Phase 5: CI/CD + Code Quality

## Objective

Establish automated quality gates: GitHub Actions CI pipeline, dependency lockfile with SBOM, embedding model verification on insert, near-duplicate detection via shingling, and nightly retrieval regression suite. Addresses CE.3, CE.4, CE.6, CE.8, CE.10.

## Prerequisites

- S5-P2 complete.

## Context

```bash
cat stage5/DISCOVERY_SUMMARY.md | grep -A3 "CI\|lockfile\|embedding"
```

## Tasks

### TASK 5.1: GitHub Actions CI Pipeline (CE.4)

Create `.github/workflows/ci.yml`:

```yaml
name: River CI
on: [push, pull_request]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements.txt ruff mypy
      - name: Lint
        run: ruff check scripts/ skills/ --select E,F,W
      - name: Type check (non-strict)
        run: mypy scripts/lib/ --ignore-missing-imports --no-error-summary || true
      - name: Syntax check all Python
        run: find scripts/ -name "*.py" -exec python -m py_compile {} +
      - name: Config consistency
        run: |
          python -c "
          import json
          # Rubric weights sum to 1.0
          with open('config/evaluator-rubric-v1.json') as f:
              r = json.load(f)
          w = sum(d['weight'] for d in r['dimensions'])
          assert abs(w - 1.0) < 0.01, f'Rubric weights: {w}'
          # task_type vocabulary consistency
          with open('config/evaluation-events.json') as f:
              e = json.load(f)
          with open('skills/trace-capture/SKILL.md') as f:
              skill = f.read()
          for mode in e.values():
              for tc in mode.get('trigger_conditions', []):
                  tt = tc['task_type']
                  assert '_' not in tt, f'Snake-case task_type: {tt}'
          print('Config consistency: PASS')
          "
```

### TASK 5.2: Dependency Lockfile + SBOM (CE.8)

```bash
pip install pip-tools --break-system-packages

# Generate locked requirements
pip-compile requirements.txt --output-file=requirements.lock --generate-hashes 2>/dev/null || \
pip-compile requirements.txt --output-file=requirements.lock

# Generate SBOM
pip install cyclonedx-bom --break-system-packages
cyclonedx-py requirements --format json --output sbom.json 2>/dev/null || \
echo "SBOM generation failed — cyclonedx-py may not be available. Producing requirements.lock is the priority."
```

Update `.github/workflows/ci.yml` to install from `requirements.lock` if it exists.

### TASK 5.3: Embedding Model Verification on Insert (CE.3)

The WR KB had a silent failure where `voyage-3` and `voyage-3.5` vectors produced identical dimensions (1024) but incompatible spaces. Add verification:

1. Add `embedding_model` to the metadata JSONB on every document insert. Update `scripts/ingest-knowledge-base.py`, `scripts/wr-index-drive-content.py`, `scripts/cbs-kb-email-intake.py`, and `scripts/wr-kb-email-intake.py` to include `metadata.embedding_model = 'voyage-3.5'` on every insert.

2. Create `scripts/lib/embedding_guard.py`:
```python
ACTIVE_MODEL = 'voyage-3.5'

def verify_embedding_model(metadata: dict) -> bool:
    """Returns True if the document was embedded with the active model."""
    return metadata.get('embedding_model') == ACTIVE_MODEL

def assert_query_model(model_used: str):
    """Raises if query embedding used a different model than active."""
    if model_used != ACTIVE_MODEL:
        raise ValueError(f"Query model '{model_used}' != active model '{ACTIVE_MODEL}'")
```

3. Update the evaluator's KB grounding check to verify that retrieval results have matching `embedding_model` metadata.

### TASK 5.4: Near-Duplicate Detection via Shingling (CE.6)

The Stage 4 dedup used byte-identical content hashes. Add a near-duplicate check for future ingestion:

Create `scripts/lib/near_dedup.py`:
```python
import hashlib
from collections import defaultdict

def shingle(text: str, k: int = 5) -> set:
    """Generate k-word shingles from text."""
    words = text.lower().split()
    return {' '.join(words[i:i+k]) for i in range(len(words) - k + 1)}

def jaccard_similarity(set_a: set, set_b: set) -> float:
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)

def find_near_duplicates(documents: list[dict], threshold: float = 0.85) -> list[tuple]:
    """Find document pairs with Jaccard similarity above threshold."""
    shingles = [(doc['id'], shingle(doc['content'])) for doc in documents]
    duplicates = []
    for i in range(len(shingles)):
        for j in range(i + 1, len(shingles)):
            sim = jaccard_similarity(shingles[i][1], shingles[j][1])
            if sim >= threshold:
                duplicates.append((shingles[i][0], shingles[j][0], sim))
    return duplicates
```

Create `scripts/check-near-duplicates.py` — a standalone script that runs the shingling check against a Supabase table and reports near-duplicate clusters. Arguments: `--table documents`, `--entity cbs-group`, `--threshold 0.85`, `--limit 1000`. Output: count of near-duplicate pairs, top 10 by similarity.

### TASK 5.5: Nightly Retrieval Regression Suite (CE.10)

Create `scripts/retrieval-regression.py`:
1. Reads a baseline queries file: `config/retrieval-baselines.json` containing the 10 CBS + 5 WR queries from Stage 4 verification, with their baseline top-similarity scores.
2. Runs each query against the live Supabase, records top-similarity.
3. Compares against baseline. If any query's top-similarity drops by >0.05 from baseline, flag as regression.
4. Outputs a summary: queries tested, regressions detected, new baseline values.
5. `--update-baseline` flag: writes current values as the new baseline.

Create `config/retrieval-baselines.json` from the Stage 4 retrieval test results (CBS and WR).

Add to `.github/workflows/ci.yml` as a scheduled job (nightly, requires secrets for Supabase + Voyage AI):
```yaml
  retrieval-regression:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    # ... (only on nightly cron, with Supabase and Voyage secrets)
```

Note: this job requires GitHub Actions secrets for `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `WR_SUPABASE_URL`, `WR_SUPABASE_SERVICE_ROLE_KEY`, and `VOYAGE_API_KEY`. Document the required secrets in the workflow file comments.

## Gate Verification

```bash
echo "=== S5-P5 Gate ==="
[ -f ".github/workflows/ci.yml" ] && echo "PASS: CI workflow" || echo "FAIL"
[ -f "requirements.lock" ] && echo "PASS: Lockfile" || echo "FAIL"
[ -f "scripts/lib/embedding_guard.py" ] && python3 -m py_compile scripts/lib/embedding_guard.py 2>&1 && echo "PASS: Embedding guard" || echo "FAIL"
[ -f "scripts/lib/near_dedup.py" ] && python3 -m py_compile scripts/lib/near_dedup.py 2>&1 && echo "PASS: Near dedup" || echo "FAIL"
[ -f "scripts/check-near-duplicates.py" ] && python3 -m py_compile scripts/check-near-duplicates.py 2>&1 && echo "PASS: Near dedup script" || echo "FAIL"
[ -f "scripts/retrieval-regression.py" ] && python3 -m py_compile scripts/retrieval-regression.py 2>&1 && echo "PASS: Retrieval regression" || echo "FAIL"
[ -f "config/retrieval-baselines.json" ] && echo "PASS: Baselines" || echo "FAIL"

# CI syntax
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" 2>&1 && echo "PASS: CI YAML valid" || echo "FAIL: CI YAML invalid"
```

## Archive Point

```bash
git add -A && git commit -m "S5-P5: CI/CD + quality — GitHub Actions, lockfile, embedding guard, shingling, regression"
git tag stage5-P5-ci-quality
```

## TASK_LOG Entry

```markdown
## S5-P5: CI/CD + Code Quality
- **Status:** COMPLETE
- **GitHub Actions:** created (.github/workflows/ci.yml)
- **Lockfile:** [generated / pip-compile not available]
- **SBOM:** [generated / deferred]
- **Embedding guard:** created (scripts/lib/embedding_guard.py)
- **Near-dedup:** created (scripts/lib/near_dedup.py + scripts/check-near-duplicates.py)
- **Retrieval regression:** created (scripts/retrieval-regression.py + config/retrieval-baselines.json)
- **Next phase:** P6 (Observability) if P2 done, or P3/P4/P8 if not yet run
```
