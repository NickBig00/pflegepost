#!/usr/bin/env bash
# Runs the pgTAP tests in supabase/tests/database against a throwaway database.
#
# Preferred: `npx supabase test db` (needs the local stack via Docker).
# Fallback (e.g. cloud sessions where image pulls are rate limited): this script
# uses a local PostgreSQL server with pgTAP and scripts/db-test-stubs.sql.
#   Requirements: postgresql + postgresql-<version>-pgtap + pg_prove, run as root
#   or as a user that may run `psql -U postgres`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB="pflegepost_test"
PSQL=(psql -X -q -v ON_ERROR_STOP=1 -U postgres -h localhost)

if ! pg_isready -h localhost -q; then
  pg_ctlcluster "$(ls /usr/lib/postgresql | sort -n | tail -1)" main start
fi

export PGPASSWORD="${PGPASSWORD:-postgres}"
if [ "$(id -u)" = "0" ]; then
  runuser -u postgres -- psql -X -q -c "alter user postgres password '$PGPASSWORD'" >/dev/null
fi

"${PSQL[@]}" -d postgres -c "set client_min_messages = warning" -c "drop database if exists $DB" -c "create database $DB" >/dev/null
"${PSQL[@]}" -d "$DB" -f "$ROOT/scripts/db-test-stubs.sql" >/dev/null
"${PSQL[@]}" -d "$DB" -c "alter database $DB set search_path = \"\$user\", public, extensions" >/dev/null

for migration in "$ROOT"/supabase/migrations/*.sql; do
  "${PSQL[@]}" -d "$DB" -f "$migration" >/dev/null
done

pg_prove -h localhost -U postgres -d "$DB" "$ROOT"/supabase/tests/database/*.test.sql
