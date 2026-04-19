#!/bin/bash
# Convenience wrapper — sources the three plaintext env files and then
# invokes op-setup.sh to populate the 1Password "River" vault.
# Intended to be run once by the operator in an interactive shell where
# TouchID prompts for 1Password CLI will reach the screen.

set -euo pipefail

cd "$(dirname "$0")/.."

for f in scripts/env-setup.sh .secrets/wr-env.sh .secrets/river-ca-sender-env.sh; do
    if [ ! -r "$f" ]; then
        echo "FAIL: cannot read $f (check path and permissions)" >&2
        exit 1
    fi
    # shellcheck source=/dev/null
    source "$f"
done

bash scripts/op-setup.sh
