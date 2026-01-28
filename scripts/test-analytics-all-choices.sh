#!/usr/bin/env bash
# Send 8 test events (rounds 1-8) for one session to the Web App.
# Usage: ./scripts/test-analytics-all-choices.sh [WEB_APP_URL]
# If WEB_APP_URL is omitted, uses the one from .env (VITE_ANALYTICS_WEB_APP_URL).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

URL="${1:-}"
if [ -z "$URL" ] && [ -f .env ]; then
  URL=$(grep -E '^VITE_ANALYTICS_WEB_APP_URL=' .env | cut -d= -f2- | tr -d '"' | tr -d "'")
fi
if [ -z "$URL" ]; then
  echo "Usage: $0 <WEB_APP_URL>"
  echo "Or set VITE_ANALYTICS_WEB_APP_URL in .env"
  exit 1
fi

SESSION="full-test-session-$(date +%s)"
echo "Sending 8 events for session: $SESSION"
echo "URL: $URL"
echo ""

for ROUND in 1 2 3 4 5 6 7 8; do
  CHOICE=$(( (ROUND - 1) % 5 + 1 ))
  EVT="full-test-ev-${SESSION}-r${ROUND}"
  TS=$(python3 -c "from datetime import datetime, timezone; print(datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'))")
  PAYLOAD=$(python3 -c "
import json, urllib.parse
p = {
  'timestamp': '${TS}',
  'sessionId': '${SESSION}',
  'country': 'unknown',
  'device': 'desktop',
  'language': 'en',
  'round': ${ROUND},
  'choice': ${CHOICE},
  'eventId': '${EVT}'
}
print(urllib.parse.quote(json.dumps(p, separators=(',', ':'))))
")
  RESP=$(curl -sS -L \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "Accept: application/json" \
    --data "payload=$PAYLOAD" \
    "$URL")
  echo "Round $ROUND choice $CHOICE -> $RESP"
  sleep 0.3
done

echo ""
echo "Done. Session: $SESSION"
echo ""
echo "In your Google Sheet you should see:"
echo "  events_log: 8 new rows (one per round, choice 1..5,1..3)"
echo "  sessions_summary: 1 row for $SESSION with maxRound=8, completed=TRUE, choice1..choice8 = 1,2,3,4,5,1,2,3"
