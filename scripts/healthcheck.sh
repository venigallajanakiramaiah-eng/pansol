#!/usr/bin/env bash
# Smoke test after deploy: retries until the app answers HTTP 200 or gives up.
# Usage: scripts/healthcheck.sh http://<public-ip>/  [attempts] [sleep-seconds]
set -euo pipefail
URL="${1:?usage: healthcheck.sh <url> [attempts] [sleep]}"
ATTEMPTS="${2:-20}"
SLEEP="${3:-6}"
for i in $(seq 1 "$ATTEMPTS"); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$URL" || true)
  if [[ "$code" == "200" ]]; then
    echo "Healthy: $URL returned 200 (attempt $i)"
    exit 0
  fi
  echo "Attempt $i/$ATTEMPTS: got '$code', retrying in ${SLEEP}s..."
  sleep "$SLEEP"
done
echo "Health check FAILED for $URL" >&2
exit 1
