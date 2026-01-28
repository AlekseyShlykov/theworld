import { TextsData } from '../hooks/useTexts';

/**
 * Validates the structure of texts data to ensure all required fields exist
 * for all 8 rounds (though rounds 2-7 have narrative, round 8 may not)
 */
export function validateTextsStructure(texts: TextsData | null): string[] {
  const errors: string[] = [];

  if (!texts) {
    errors.push("Texts data is null or undefined");
    return errors;
  }

  if (!texts.rounds) {
    errors.push("Missing 'rounds' object");
    return errors;
  }

  // Validate rounds 1-8 (these should have full narrative structure)
  for (let round = 1; round <= 8; round++) {
    const roundKey = String(round);
    const roundData = texts.rounds[roundKey];

    if (!roundData) {
      errors.push(`Missing data for round ${roundKey}`);
      continue;
    }

    if (!roundData.introText || typeof roundData.introText !== 'string' || roundData.introText.trim() === '') {
      errors.push(`Missing or empty introText for round ${roundKey}`);
    }

    if (!roundData.preChoiceText || typeof roundData.preChoiceText !== 'string' || roundData.preChoiceText.trim() === '') {
      errors.push(`Missing or empty preChoiceText for round ${roundKey}`);
    }

    if (!roundData.postChoiceText || typeof roundData.postChoiceText !== 'string' || roundData.postChoiceText.trim() === '') {
      errors.push(`Missing or empty postChoiceText for round ${roundKey}`);
    }

    if (!roundData.zoneTexts || typeof roundData.zoneTexts !== 'object') {
      errors.push(`Missing or invalid zoneTexts for round ${roundKey}`);
    } else {
      for (let zone = 1; zone <= 5; zone++) {
        const zoneKey = String(zone);
        if (!roundData.zoneTexts[zoneKey] || typeof roundData.zoneTexts[zoneKey] !== 'string' || roundData.zoneTexts[zoneKey].trim() === '') {
          errors.push(`Missing or empty zoneTexts[${zoneKey}] for round ${roundKey}`);
        }
      }
    }
  }

  // Validate final section
  if (!texts.final) {
    errors.push("Missing 'final' object");
  } else {
    const requiredFinalKeys = ['mapText', 'endingText', 'authorshipText', 'illustrationsCredit', 'playAgain', 'myWebsite', 'illustratorButton'];
    for (const key of requiredFinalKeys) {
      if (!texts.final[key as keyof typeof texts.final] || typeof texts.final[key as keyof typeof texts.final] !== 'string') {
        errors.push(`Missing or invalid final.${key}`);
      }
    }
  }

  // Validate UI strings
  if (!texts.ui) {
    errors.push("Missing 'ui' object");
  } else {
    const requiredUIKeys = ['next', 'start', 'startGame', 'nextRound'];
    for (const key of requiredUIKeys) {
      if (!texts.ui[key as keyof typeof texts.ui] || typeof texts.ui[key as keyof typeof texts.ui] !== 'string') {
        errors.push(`Missing or invalid ui.${key}`);
      }
    }
  }

  // Validate header section
  if (!texts.header) {
    errors.push("Missing 'header' object");
  } else {
    if (!texts.header.introTitle || typeof texts.header.introTitle !== 'string' || texts.header.introTitle.trim() === '') {
      errors.push("Missing or empty header.introTitle");
    }
    if (!texts.header.endingTitle || typeof texts.header.endingTitle !== 'string' || texts.header.endingTitle.trim() === '') {
      errors.push("Missing or empty header.endingTitle");
    }
    if (!texts.header.roundTitles || typeof texts.header.roundTitles !== 'object') {
      errors.push("Missing or invalid header.roundTitles object");
    } else {
      for (let round = 1; round <= 8; round++) {
        const roundKey = `round${round}` as keyof typeof texts.header.roundTitles;
        if (!texts.header.roundTitles[roundKey] || typeof texts.header.roundTitles[roundKey] !== 'string' || texts.header.roundTitles[roundKey].trim() === '') {
          errors.push(`Missing or empty header.roundTitles.${roundKey}`);
        }
      }
    }
  }

  // Validate timeline section
  if (!texts.timeline) {
    errors.push("Missing 'timeline' object");
  } else {
    const requiredTimelineKeys = ['title', 'axisYears', 'axisTime', 'achievementsTitle', 'roundLabel', 'yearLabel'];
    for (const key of requiredTimelineKeys) {
      if (!texts.timeline[key as keyof typeof texts.timeline] || typeof texts.timeline[key as keyof typeof texts.timeline] !== 'string') {
        errors.push(`Missing or invalid timeline.${key}`);
      }
    }
    
    // Validate milestones
    if (!texts.timeline.milestones || typeof texts.timeline.milestones !== 'object') {
      errors.push("Missing or invalid timeline.milestones object");
    } else {
      const requiredMilestoneKeys = ['sedentary', 'crops', 'domestication', 'writing', 'trade', 'epidemics', 'technology', 'governance'];
      for (const key of requiredMilestoneKeys) {
        if (!texts.timeline.milestones[key as keyof typeof texts.timeline.milestones] || typeof texts.timeline.milestones[key as keyof typeof texts.timeline.milestones] !== 'string') {
          errors.push(`Missing or invalid timeline.milestones.${key}`);
        }
      }
    }
  }

  return errors;
}


