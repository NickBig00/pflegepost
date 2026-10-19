#!/usr/bin/env bash
# Installs dependencies in Claude Code cloud sessions so tests, lint and
# typecheck work right away. Does nothing on local machines.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}"

for dir in app web; do
  if [ -f "$dir/package-lock.json" ] && [ ! -d "$dir/node_modules" ]; then
    echo "Installing dependencies in $dir…"
    (cd "$dir" && npm ci --no-audit --no-fund --loglevel=error)
  fi
done

# api.expo.dev is not reachable from the cloud container.
echo 'export EXPO_OFFLINE=1' >> "${CLAUDE_ENV_FILE:-/dev/null}"
