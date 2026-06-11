#!/bin/sh
set -e

# Apply committed migrations (prisma/migrations) to the database. Safe to run on
# every boot: already-applied migrations are skipped. Fails fast if the DB is
# unreachable so the container restarts instead of serving a broken schema.
echo "[entrypoint] Running prisma migrate deploy..."
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Starting: $*"
exec "$@"
