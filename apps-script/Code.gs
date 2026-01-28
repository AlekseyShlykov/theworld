/**
 * Web App endpoint: doPost(e)
 * Expects JSON body: { timestamp, sessionId, country, device, round, choice, eventId }
 * - Appends one row to events_log
 * - Upserts one row in sessions_summary by sessionId
 * Deduplication: if eventId already exists in events_log, return 200 without writing.
 */

const SHEET_EVENTS_LOG = 'events_log';
const SHEET_SESSIONS_SUMMARY = 'sessions_summary';

// Column indices (1-based for getRange)
const EVENTS_COL_TIMESTAMP = 1;
const EVENTS_COL_SESSION_ID = 2;
const EVENTS_COL_COUNTRY = 3;
const EVENTS_COL_DEVICE = 4;
const EVENTS_COL_ROUND = 5;
const EVENTS_COL_CHOICE = 6;
const EVENTS_COL_EVENT_ID = 7;

const SUMMARY_COL_SESSION_ID = 1;
const SUMMARY_COL_FIRST_TS = 2;
const SUMMARY_COL_LAST_TS = 3;
const SUMMARY_COL_COUNTRY = 4;
const SUMMARY_COL_DEVICE = 5;
const SUMMARY_COL_MAX_ROUND = 6;
const SUMMARY_COL_COMPLETED = 7;
const SUMMARY_COL_CHOICE_1 = 8; // choice1..choice8 = cols 8..15

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : '';
    var payload = null;
    if (raw) {
      if (e.postData.type === 'application/json') {
        payload = JSON.parse(raw);
      } else {
        var match = /payload=([^&]*)/.exec(raw);
        if (match) {
          var decoded = decodeURIComponent(match[1].replace(/\+/g, ' '));
          payload = JSON.parse(decoded);
        }
      }
    }

    if (!payload) {
      output.setContent(JSON.stringify({ ok: false, error: 'Missing or invalid JSON body' }));
      return output;
    }

    const validation = validatePayload(payload);
    if (!validation.valid) {
      output.setContent(JSON.stringify({ ok: false, error: validation.error }));
      return output;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const eventsSheet = ss.getSheetByName(SHEET_EVENTS_LOG);
    const summarySheet = ss.getSheetByName(SHEET_SESSIONS_SUMMARY);

    if (!eventsSheet || !summarySheet) {
      output.setContent(JSON.stringify({ ok: false, error: 'Sheets events_log or sessions_summary not found' }));
      return output;
    }

    // Deduplication: if eventId already in events_log, skip write and return 200
    if (eventIdAlreadyProcessed(eventsSheet, payload.eventId)) {
      output.setContent(JSON.stringify({ ok: true, duplicate: true }));
      return output;
    }

    // 1) Append to events_log
    appendEventRow(eventsSheet, payload);

    // 2) Upsert sessions_summary
    upsertSessionSummary(summarySheet, payload);

    output.setContent(JSON.stringify({ ok: true }));
  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: String(err.message || err) }));
  }

  return output;
}

/**
 * Validate payload. round 1..8, choice 1..5, sessionId and timestamp non-empty.
 */
function validatePayload(p) {
  if (!p || typeof p !== 'object') {
    return { valid: false, error: 'Payload must be an object' };
  }
  var round = p.round;
  var choice = p.choice;
  if (typeof round !== 'number' || round < 1 || round > 8 || Math.floor(round) !== round) {
    return { valid: false, error: 'round must be integer 1..8' };
  }
  if (typeof choice !== 'number' || choice < 1 || choice > 5 || Math.floor(choice) !== choice) {
    return { valid: false, error: 'choice must be integer 1..5' };
  }
  if (!p.sessionId || String(p.sessionId).trim() === '') {
    return { valid: false, error: 'sessionId is required' };
  }
  if (!p.timestamp || String(p.timestamp).trim() === '') {
    return { valid: false, error: 'timestamp is required' };
  }
  if (!p.eventId || String(p.eventId).trim() === '') {
    return { valid: false, error: 'eventId is required' };
  }
  return { valid: true };
}

/**
 * Check if eventId already exists in events_log (column G).
 */
function eventIdAlreadyProcessed(eventsSheet, eventId) {
  var lastRow = eventsSheet.getLastRow();
  if (lastRow < 2) return false; // only header
  var range = eventsSheet.getRange(2, EVENTS_COL_EVENT_ID, lastRow, EVENTS_COL_EVENT_ID);
  var finder = range.createTextFinder(String(eventId)).matchEntireCell(true).findNext();
  return finder !== null;
}

/**
 * Append one row to events_log: timestamp, sessionId, country, device, round, choice, eventId
 */
function appendEventRow(eventsSheet, p) {
  var country = (p.country != null && String(p.country).trim() !== '') ? String(p.country).trim() : 'unknown';
  var device = (p.device != null && String(p.device).trim() !== '') ? String(p.device).trim() : 'unknown';
  var row = [
    String(p.timestamp),
    String(p.sessionId).trim(),
    country,
    device,
    Number(p.round),
    Number(p.choice),
    String(p.eventId).trim()
  ];
  eventsSheet.appendRow(row);
}

/**
 * Upsert sessions_summary: find by sessionId (column A), update or append.
 */
function upsertSessionSummary(summarySheet, p) {
  var sessionId = String(p.sessionId).trim();
  var country = (p.country != null && String(p.country).trim() !== '') ? String(p.country).trim() : 'unknown';
  var device = (p.device != null && String(p.device).trim() !== '') ? String(p.device).trim() : 'unknown';
  var round = Number(p.round);
  var choice = Number(p.choice);
  var timestamp = String(p.timestamp);

  var colA = summarySheet.getRange('A:A');
  var finder = colA.createTextFinder(sessionId).matchEntireCell(true).findNext();

  if (finder === null) {
    // New session: append row
    var newRow = buildSummaryRow(sessionId, timestamp, timestamp, country, device, round, round === 8, round, choice);
    summarySheet.appendRow(newRow);
  } else {
    // Existing session: update row
    var rowIndex = finder.getRow();
    var lastRow = summarySheet.getLastRow();
    if (rowIndex < 2) return; // header row, should not happen

    var lastTsRange = summarySheet.getRange(rowIndex, SUMMARY_COL_LAST_TS);
    lastTsRange.setValue(timestamp);

    var maxRoundRange = summarySheet.getRange(rowIndex, SUMMARY_COL_MAX_ROUND);
    var currentMax = Number(maxRoundRange.getValue()) || 0;
    var newMax = Math.max(currentMax, round);
    maxRoundRange.setValue(newMax);

    var completedRange = summarySheet.getRange(rowIndex, SUMMARY_COL_COMPLETED);
    completedRange.setValue(newMax === 8);

    var choiceCol = SUMMARY_COL_CHOICE_1 + (round - 1);
    summarySheet.getRange(rowIndex, choiceCol).setValue(choice);

    // Optionally update country/device if currently "unknown" and payload has a value
    var countryRange = summarySheet.getRange(rowIndex, SUMMARY_COL_COUNTRY);
    var deviceRange = summarySheet.getRange(rowIndex, SUMMARY_COL_DEVICE);
    if (String(countryRange.getValue()).toLowerCase() === 'unknown' && country !== 'unknown') {
      countryRange.setValue(country);
    }
    if (String(deviceRange.getValue()).toLowerCase() === 'unknown' && device !== 'unknown') {
      deviceRange.setValue(device);
    }
  }
}

/**
 * Build a new sessions_summary row: sessionId, firstTimestamp, lastTimestamp, country, device, maxRound, completed, choice1..choice8
 */
function buildSummaryRow(sessionId, firstTs, lastTs, country, device, maxRound, completed, round, choice) {
  var row = [
    sessionId,
    firstTs,
    lastTs,
    country,
    device,
    maxRound,
    completed,
    '', '', '', '', '', '', '', '' // choice1..choice8
  ];
  var choiceCol = SUMMARY_COL_CHOICE_1 - 1 + (round - 1); // 0-based index in array
  row[choiceCol] = choice;
  return row;
}

/**
 * One-time setup: create sheets with headers if they don't exist.
 * Run from Script Editor or add a menu item.
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var eventsSheet = ss.getSheetByName(SHEET_EVENTS_LOG);
  if (!eventsSheet) {
    eventsSheet = ss.insertSheet(SHEET_EVENTS_LOG);
    eventsSheet.appendRow(['timestamp', 'sessionId', 'country', 'device', 'round', 'choice', 'eventId']);
  }

  var summarySheet = ss.getSheetByName(SHEET_SESSIONS_SUMMARY);
  if (!summarySheet) {
    summarySheet = ss.insertSheet(SHEET_SESSIONS_SUMMARY);
    summarySheet.appendRow([
      'sessionId', 'firstTimestamp', 'lastTimestamp', 'country', 'device', 'maxRound', 'completed',
      'choice1', 'choice2', 'choice3', 'choice4', 'choice5', 'choice6', 'choice7', 'choice8'
    ]);
  }

  return 'Sheets created or already exist.';
}
