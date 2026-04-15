#!/usr/bin/env python3
"""
Apply evaluator schema to CBS Supabase.

Usage:
    # Option 1: Direct PostgreSQL connection (requires SUPABASE_DB_URL)
    export SUPABASE_DB_URL="postgresql://postgres:[password]@db.eptugqwlgsmwhnubbqsk.supabase.co:5432/postgres"
    python3 scripts/apply-evaluator-schema.py

    # Option 2: Manual — copy scripts/evaluator-schema.sql into Supabase SQL Editor:
    # https://supabase.com/dashboard/project/eptugqwlgsmwhnubbqsk/sql/new
"""

import os
import sys

def apply_via_psycopg2():
    """Apply schema via direct PostgreSQL connection."""
    try:
        import psycopg2
    except ImportError:
        print("psycopg2 not installed. Run: pip install psycopg2-binary")
        return False

    db_url = os.environ.get("SUPABASE_DB_URL", "")
    if not db_url:
        print("SUPABASE_DB_URL not set.")
        return False

    try:
        conn = psycopg2.connect(db_url, connect_timeout=10)
        conn.autocommit = True
        cur = conn.cursor()

        schema_path = os.path.join(os.path.dirname(__file__), "evaluator-schema.sql")
        with open(schema_path, "r") as f:
            sql = f.read()

        cur.execute(sql)
        print("Schema applied successfully via psycopg2")

        cur.execute("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('agent_traces', 'evaluation_scores', 'rubric_versions', 'correction_proposals')
            ORDER BY table_name
        """)
        tables = [r[0] for r in cur.fetchall()]
        print(f"Tables found: {tables}")

        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"psycopg2 connection failed: {e}")
        return False


def verify_via_rest():
    """Verify tables exist via Supabase REST API."""
    import httpx

    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        print("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")
        return False

    headers = {"apikey": key, "Authorization": f"Bearer {key}"}
    all_ok = True
    for table in ["agent_traces", "evaluation_scores", "rubric_versions", "correction_proposals"]:
        r = httpx.get(f"{url}/rest/v1/{table}?select=id&limit=1", headers=headers)
        if r.status_code == 200:
            print(f"  {table}: EXISTS")
        else:
            print(f"  {table}: NOT FOUND ({r.status_code})")
            all_ok = False
    return all_ok


if __name__ == "__main__":
    print("=== Evaluator Schema Application ===")

    if os.environ.get("SUPABASE_DB_URL"):
        if apply_via_psycopg2():
            sys.exit(0)

    print("\nDirect connection not available.")
    print("Please apply the schema manually:")
    print("  1. Open https://supabase.com/dashboard/project/eptugqwlgsmwhnubbqsk/sql/new")
    print("  2. Paste the contents of scripts/evaluator-schema.sql")
    print("  3. Click Run")
    print("\nAfter applying, run this script again to verify.")
    print("\n=== Verifying via REST API ===")
    if verify_via_rest():
        print("\nAll tables present.")
    else:
        print("\nSome tables missing — schema not yet applied.")
        sys.exit(1)
