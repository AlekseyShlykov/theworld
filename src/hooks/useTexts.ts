import { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { validateTextsStructure } from '../utils/validateTexts';

export interface IntroScreenData {
  screen1: {
    title: string;
    subtitle: string;
    button: string;
  };
  screen2: {
    text: string;
  };
  screen3: {
    text: string;
  };
  screen4: {
    text: string;
    button: string;
  };
}

export interface RoundData {
  introText: string;
  zoneTexts: {
    [key: string]: string; // Keys: "1" through "5"
  };
  preChoiceText: string;
  postChoiceText: string;
}

export interface FinalData {
  mapText: string;
  endingText: string;
  playAgain: string;
  myWebsite: string;
}

export interface TimelineData {
  title: string;
  axisYears: string;
  axisTime: string;
  achievementsTitle: string;
  roundLabel: string;
  yearLabel: string;
  milestones: {
    sedentary: string;
    crops: string;
    domestication: string;
    writing: string;
    trade: string;
    epidemics: string;
    technology: string;
    governance: string;
  };
}

export interface PopulationChartData {
  title: string;
  axis: {
    time: string;
    population: string;
  };
  tooltip: {
    round: string;
    acc: string;
    power: string;
    populationValue: string;
    year: string;
  };
  explanation: string;
  yAxisLabel: string;
}

export interface DominanceChartData {
  title: string;
  axis: {
    time: string;
    dominance: string;
  };
  tooltip: {
    round: string;
    year: string;
    dominance: string;
    acc: string;
    power: string;
    rawValue: string;
  };
  explanation: string;
}

export interface FutureProjectionChartData {
  title: string;
  axis: {
    time: string;
    development: string;
  };
  tooltip: {
    predicted: string;
    round: string;
    acc: string;
    power: string;
    value: string;
  };
  explanation: string;
}

export interface TextsData {
  intro: IntroScreenData;
  rounds: {
    [key: string]: RoundData; // Keys: "1" through "8"
  };
  ui: {
    next: string;
    start: string;
    startGame: string;
    nextRound: string;
    chooseLanguage: string;
    english: string;
    russian: string;
  };
  areaButtons: {
    area1: string;
    area2: string;
    area3: string;
    area4: string;
    area5: string;
  };
  final: FinalData;
  timeline: TimelineData;
  populationChart: PopulationChartData;
  dominanceChart: DominanceChartData;
  futureProjectionChart: FutureProjectionChartData;
}

export const useTexts = (language: Language) => {
  const [texts, setTexts] = useState<TextsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTexts = useCallback(async (lang: Language) => {
    try {
      setLoading(true);
      // Use base URL for GitHub Pages compatibility
      const baseUrl = import.meta.env.BASE_URL;
      const url = lang === 'ru' ? `${baseUrl}data/texts_ru.json` : `${baseUrl}data/texts_en.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load texts for language: ${lang}`);
      }

      const data = await response.json() as TextsData;
      
      // Validate the structure
      const validationErrors = validateTextsStructure(data);
      if (validationErrors.length > 0) {
        console.error(`[Texts Validation] Structure validation failed for ${lang}:`, validationErrors);
        throw new Error(`Text structure validation failed: ${validationErrors.join('; ')}`);
      }
      
      setTexts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error(`Failed to load texts for language ${language}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTexts(language);
  }, [language, loadTexts]);

  return { texts, loading, error, reloadTexts: () => loadTexts(language) };
};

