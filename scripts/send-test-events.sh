#!/usr/bin/env bash
# Send 3 test events to your Web App so you can verify data in Google Sheets.
# Usage: ./scripts/send-test-events.sh
# Uses VITE_ANALYTICS_WEB_APP_URL from .env, or pass URL as first argument.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

URL="${1:-}"
if [ -z "$URL" ] && [ -f .env ]; then
  URL=$(grep -E '^VITE_ANALYTICS_WEB_APP_URL=' .env | cut -d= -f2- | tr -d '"' | tr -d "'")
fi
if [ -z "$URL" ]; then
  echo "Usage: $0 [WEB_APP_URL]"
  echo "Or set VITE_ANALYTICS_WEB_APP_URL in .env"
  exit 1
fi

SESSION="check-send-$(date +%s)"
TS=$(python3 -c "from datetime import datetime, timezone; print(datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'))")

echo "Sending 3 test events to: $URL"
echo "Session: $SESSION"
echo ""

for ROUND in 1 2 3; do
  case $ROUND in
    1) CHOICE=2; LANG=en ;;
    2) CHOICE=4; LANG=en ;;
    3) CHOICE=1; LANG=ru ;;
  esac
  EVT="check-ev-${SESSION}-${ROUND}"
  PAYLOAD=$(python3 -c "
import json, urllib.parse
p = {
  'timestamp': '${TS}',
  'sessionId': '${SESSION}',
  'country': 'unknown',
  'device': 'desktop',
  'language': '${LANG}',
  'round': ${ROUND},
  'choice': ${CHOICE},
  'eventId': '${EVT}'
}
print(urllib.parse.quote(json.dumps(p, separators=(',', ':'))))
")
  RESP=$(curl -sS -L -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: application/json" --data "payload=$PAYLOAD" "$URL")
  echo "Round $ROUND choice $CHOICE ($LANG) -> $RESP"
done

echo ""
echo "Done. In your spreadsheet:"
echo "  events_log: 3 new rows (session $SESSION, rounds 1–3, choices 2,4,1, languages en,en,ru)"
echo "  sessions_summary: 1 row for $SESSION with maxRound=3, choice1=2, choice2=4, choice3=1"
