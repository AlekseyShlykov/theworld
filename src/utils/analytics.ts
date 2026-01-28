import type { Language } from '../types';

/**
 * Sends a choice event to analytics (e.g. Google Analytics, Apps Script).
 * Stub implementation — replace with your tracking endpoint.
 */
export function sendChoiceEvent(
  round: number,
  zoneNumber: number,
  language: Language
): void {
  if (import.meta.env.DEV) {
    console.debug('[analytics] sendChoiceEvent', { round, zoneNumber, language });
  }
  // TODO: call your analytics endpoint (e.g. apps-script, GA4)
}
