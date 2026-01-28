# Analytics: Deploy & Examples

## 1. Deploy the Web App (Google Apps Script)

1. **Create a new Google Spreadsheet** (or use an existing one).

2. **Open Apps Script:** Extensions → Apps Script. Delete any default `Code.gs` content.

3. **Add the script:**
   - Copy the contents of `apps-script/Code.gs` from this repo into the Apps Script editor (replace all).
   - Save (Ctrl/Cmd+S).

4. **Create the two sheets:**
   - In the Apps Script editor, run the function **`setupSheets`** once (Select function `setupSheets` → Run). This creates:
     - **events_log** with header: `timestamp | sessionId | country | device | round | choice | eventId`
     - **sessions_summary** with header: `sessionId | firstTimestamp | lastTimestamp | country | device | maxRound | completed | choice1 | choice2 | ... | choice8`
   - Or create the sheets manually with those exact names and header rows.

5. **Deploy as Web App:**
   - Click **Deploy** → **New deployment**.
   - Type: **Web app**.
   - Description: e.g. "Analytics doPost".
   - **Execute as:** Me (your account).
   - **Who has access:** Anyone (so the game site can POST from the browser).
   - Click **Deploy**. Authorize if prompted.
   - Copy the **Web app URL** (ends with `/exec`).

6. **Configure the client:**
   - In the project root, create a file `.env` (or set in your build env):
   - `VITE_ANALYTICS_WEB_APP_URL=<paste the Web app URL>`
   - Rebuild the app so the env variable is baked in.

---

## 2. Example Payload (client sends)

Each choice event is one POST with body (when using JSON) or form field `payload` (when using form-urlencoded). The payload object is:

```json
{
  "timestamp": "2025-01-28T12:00:00.000Z",
  "sessionId": "abc-123-session-uuid",
  "country": "unknown",
  "device": "desktop",
  "round": 1,
  "choice": 3,
  "eventId": "evt-uuid-456"
}
```

- **round:** 1..8  
- **choice:** 1..5 (zone)  
- **sessionId:** from localStorage  
- **device:** `"mobile"` or `"desktop"`  
- **country:** best-effort (e.g. `"unknown"`)  
- **eventId:** unique per event (for deduplication)

---

## 3. What appears in the sheets

### A) Session that stops at round 3

**Events sent:** 3 POSTs (round 1, round 2, round 3).

**events_log** — 3 new rows:

| timestamp | sessionId | country | device | round | choice | eventId |
|-----------|-----------|---------|--------|-------|--------|---------|
| 2025-01-28T12:00:01Z | sess-A | unknown | desktop | 1 | 2 | evt-1 |
| 2025-01-28T12:00:05Z | sess-A | unknown | desktop | 2 | 4 | evt-2 |
| 2025-01-28T12:00:10Z | sess-A | unknown | desktop | 3 | 1 | evt-3 |

**sessions_summary** — 1 row (upserted 3 times, final state):

| sessionId | firstTimestamp | lastTimestamp | country | device | maxRound | completed | choice1 | choice2 | choice3 | choice4 | choice5 | choice6 | choice7 | choice8 |
|-----------|----------------|---------------|---------|--------|----------|-----------|---------|---------|---------|---------|---------|---------|---------|---------|
| sess-A | 2025-01-28T12:00:01Z | 2025-01-28T12:00:10Z | unknown | desktop | 3 | FALSE | 2 | 4 | 1 | | | | | |

Only choice1, choice2, choice3 are filled; choice4..choice8 stay blank. `completed` is FALSE.

---

### B) Session that reaches round 8

**Events sent:** 8 POSTs (rounds 1..8).

**events_log** — 8 new rows (one per round), e.g.:

| timestamp | sessionId | country | device | round | choice | eventId |
|-----------|-----------|---------|--------|-------|--------|---------|
| ... | sess-B | ... | ... | 1 | 1 | ... |
| ... | sess-B | ... | ... | 2 | 3 | ... |
| ... | sess-B | ... | ... | 3 | 5 | ... |
| ... | sess-B | ... | ... | 4 | 2 | ... |
| ... | sess-B | ... | ... | 5 | 4 | ... |
| ... | sess-B | ... | ... | 6 | 1 | ... |
| ... | sess-B | ... | ... | 7 | 3 | ... |
| ... | sess-B | ... | ... | 8 | 2 | ... |

**sessions_summary** — 1 row (final state after 8th event):

| sessionId | firstTimestamp | lastTimestamp | country | device | maxRound | completed | choice1 | choice2 | choice3 | choice4 | choice5 | choice6 | choice7 | choice8 |
|-----------|----------------|---------------|---------|--------|----------|-----------|---------|---------|---------|---------|---------|---------|---------|---------|
| sess-B | (first event ts) | (8th event ts) | unknown | desktop | 8 | TRUE | 1 | 3 | 5 | 2 | 4 | 1 | 3 | 2 |

All choice1..choice8 filled; `completed` is TRUE.

---

## 4. Deduplication

If the client retries the same event (same **eventId**), the script checks **events_log** for that eventId. If found, it returns `{ ok: true, duplicate: true }` and does **not** append or update. So duplicate retries do not create duplicate rows.

---

## 5. Files changed in this repo

| File | Change |
|------|--------|
| `apps-script/Code.gs` | New: doPost, validation, dedup, append events_log, upsert sessions_summary |
| `apps-script/appsscript.json` | New: Web App manifest |
| `src/utils/analytics.ts` | New: getOrCreateSessionId, getDevice, getCountry, sendChoiceEvent |
| `src/App.tsx` | Call sendChoiceEvent(round, zone) in handleAreaSelect, handlePreStep1ZoneSelect, handleRoundNarrativeZoneSelect |
| `src/vite-env.d.ts` | Optional env type for VITE_ANALYTICS_WEB_APP_URL |
| `.env.example` | Documents VITE_ANALYTICS_WEB_APP_URL |
| `ANALYTICS_IMPLEMENTATION_PLAN.md` | Implementation plan (no code) |
| `ANALYTICS_DEPLOY.md` | This file |
