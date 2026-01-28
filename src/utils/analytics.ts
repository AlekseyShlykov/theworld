/**
 * Analytics: send choice events to Google Apps Script Web App.
 * One event per choice; sessionId in localStorage; device/country best-effort.
 */

const STORAGE_KEY_SESSION_ID = 'ggs_analytics_session_id';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create sessionId (stored in localStorage).
 */
export function getOrCreateSessionId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY_SESSION_ID);
    if (!id || id.trim() === '') {
      id = generateId();
      localStorage.setItem(STORAGE_KEY_SESSION_ID, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

/**
 * device: "mobile" if innerWidth < 768, else "desktop".
 */
export function getDevice(): string {
  if (typeof window === 'undefined' || window.innerWidth < 768) return 'mobile';
  return 'desktop';
}

/**
 * country: best-effort (optional). For now always "unknown" unless you add geolocation.
 */
export function getCountry(): string {
  return 'unknown';
}

/**
 * Send one choice event to the Web App. No-op if VITE_ANALYTICS_WEB_APP_URL is not set.
 * round: 1..8, choice: 1..5 (zone), language: e.g. "en" or "ru" (optional).
 */
export function sendChoiceEvent(round: number, choice: number, language?: string): void {
  const url = import.meta.env.VITE_ANALYTICS_WEB_APP_URL;
  if (!url || typeof url !== 'string' || url.trim() === '') return;

  const lang = language && String(language).trim() !== '' ? String(language).trim() : 'unknown';
  const payload = {
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
    country: getCountry(),
    device: getDevice(),
    language: lang,
    round,
    choice,
    eventId: generateId(),
  };

  // Use form-urlencoded to avoid CORS preflight (Apps Script does not send CORS headers).
  const body = 'payload=' + encodeURIComponent(JSON.stringify(payload));
  fetch(url.trim(), {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  }).catch(() => {
    // Fire-and-forget; optional: queue for retry
  });
}
