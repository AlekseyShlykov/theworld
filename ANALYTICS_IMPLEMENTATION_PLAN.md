# Analytics Implementation Plan

## 1. Overview

Store analytics in **one** Google Spreadsheet with **two** sheets:

| Sheet | Purpose | Write pattern |
|-------|---------|----------------|
| **events_log** | Append-only log (one row per choice event) | Append row on every valid event |
| **sessions_summary** | One row per sessionId (aggregated) | Upsert by sessionId on every valid event |

Aggregation is done **server-side** in Google Apps Script. The client sends only per-choice events.

---

## 2. Sheet Schemas

### Sheet #1: events_log

| Column | Description |
|--------|-------------|
| timestamp | ISO string from payload |
| sessionId | From payload |
| country | From payload (or "unknown") |
| device | From payload (mobile/desktop) |
| round | Integer 1..8 |
| choice | Integer 1..5 (zone) |
| eventId | Unique id for deduplication |

**Header row:** `timestamp | sessionId | country | device | round | choice | eventId`

### Sheet #2: sessions_summary

| Column | Description |
|--------|-------------|
| sessionId | Unique per session |
| firstTimestamp | First event timestamp for this session |
| lastTimestamp | Most recent event timestamp |
| country | Latest known non-empty (or first); "unknown" if never set |
| device | Same rule as country |
| maxRound | Max round received (1..8) |
| completed | TRUE if maxRound == 8, else FALSE |
| choice1 .. choice8 | Choice value (1..5) for that round; empty if not yet played |

**Header row:** `sessionId | firstTimestamp | lastTimestamp | country | device | maxRound | completed | choice1 | choice2 | choice3 | choice4 | choice5 | choice6 | choice7 | choice8`

---

## 3. Upsert Logic (Apps Script)

On each valid POST:

1. **Validate payload:**  
   `round` ∈ 1..8, `choice` ∈ 1..5, `sessionId` non-empty string, `timestamp` non-empty string.

2. **Deduplication:**  
   If `eventId` was already processed → return 200 OK without writing (idempotent).  
   Dedup method: **check events_log for existing eventId** before appending. Simple, no extra sheet, stays within Apps Script quotas; one extra read of the eventId column per request (or use a small cache in ScriptProperties for recent eventIds if we want to avoid scanning events_log when it grows).

   **Recommended for small-to-medium volume:** Scan the `eventId` column in `events_log` with `TextFinder` (or get last N rows if events_log is append-only and we can limit search). Alternatively, keep a **processed_eventIds** sheet (append-only list of eventIds) and use TextFinder there—smaller sheet to scan.  
   **Simplest reliable approach:** One hidden sheet **processed_eventIds** with a single column `eventId`. Before processing, use `TextFinder` to find the eventId. If found, return 200 and skip. After processing, append the eventId to this sheet. This keeps events_log free of duplicate checks and uses a small, fast lookup sheet.  
   **Even simpler:** Check for eventId in **events_log** column G (eventId). Use `sheet.getRange(2, 7, lastRow, 7).getValues()` and check if eventId is in the array. For small-to-medium volume (hundreds to low thousands of rows) this is acceptable.  
   **Chosen approach:** Dedup by scanning **events_log** column G (eventId) for the current eventId. If found, return 200 without writing. No extra sheet, minimal complexity. If volume grows large, we can later add a ScriptProperties cache for recent eventIds (e.g. last 500) to avoid full scan.

3. **Append to events_log:**  
   One new row: `[timestamp, sessionId, country, device, round, choice, eventId]`.

4. **Upsert sessions_summary:**  
   - **Lookup:** Find row where column A (sessionId) equals payload sessionId.  
   **Best option for small-to-medium volume:** Use **TextFinder** on the sessionId column: `sheet.getRange("A:A").createTextFinder(sessionId).findNext()`. Fast and built-in. No need for PropertiesService cache unless we have very high request rate.  
   - **If not found:** Append a new row: sessionId, firstTimestamp=lastTimestamp=timestamp, country, device, maxRound=round, completed=(round==8), choice{round}=choice, others blank.  
   - **If found:** Update that row: lastTimestamp=timestamp; maxRound=max(current maxRound, round); completed=(maxRound==8); set choice{round}=choice; optionally update country/device if current is "unknown" and payload has a value.

---

## 4. Deduplication (detailed)

- **Goal:** Avoid duplicate rows from client retries (same eventId sent twice).
- **Method:** Before appending to events_log, check if this eventId already exists in events_log (column 7). If yes, respond 200 and do not write again.
- **No separate “processed_eventIds” sheet** in the minimal version: one sheet fewer, logic in one place. If events_log grows very large (e.g. >10k rows), we can later add a cache in ScriptProperties (e.g. store last 500 eventIds as JSON) to avoid scanning the whole column every time.

---

## 5. Files to Create/Change

| File | Action |
|------|--------|
| **apps-script/Code.gs** | **Create.** Contains doPost, validation, dedup (eventId in events_log), append to events_log, upsert sessions_summary (TextFinder for sessionId). |
| **apps-script/appsscript.json** | **Create.** Manifest for Web App (doPost). |
| **src/utils/analytics.ts** | **Create.** getOrCreateSessionId(), getDevice(), getCountry(), sendChoiceEvent(round, choice). Uses fetch to Web App URL from env. |
| **src/App.tsx** | **Change.** Call sendChoiceEvent(round, choice) from the three choice handlers (handleAreaSelect, handlePreStep1ZoneSelect, handleRoundNarrativeZoneSelect). No change to game logic. |
| **.env.example** | **Create.** Document `VITE_ANALYTICS_WEB_APP_URL` (optional). |
| **ANALYTICS_IMPLEMENTATION_PLAN.md** | **Create.** This plan. |
| **ANALYTICS_DEPLOY.md** | **Create.** Deploy steps + example payloads and expected rows. |

Client changes are minimal: one new utility, one env variable, and three one-line calls at existing choice handlers.

---

## 6. Summary

- **Sheets:** events_log (append) + sessions_summary (upsert by sessionId).
- **Upsert:** TextFinder on sessionId column in sessions_summary; update or append one row.
- **Dedup:** Check eventId in events_log column G; if present, skip write and return 200.
- **Files:** New Apps Script project (Code.gs + appsscript.json), new src/utils/analytics.ts, small changes in App.tsx, env example and docs.
