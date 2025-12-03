import { useState, useEffect } from 'react';
import { LogicData, LanguageData, TurnLogic, Language } from '../types';

export const useGameData = (language: Language) => {
  const [logic, setLogic] = useState<LogicData | null>(null);
  const [content, setContent] = useState<LanguageData | null>(null);
  const [turnLogic, setTurnLogic] = useState<TurnLogic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Use base URL for GitHub Pages compatibility
        const baseUrl = import.meta.env.BASE_URL;
        const [logicRes, contentRes, turnLogicRes] = await Promise.all([
          fetch(`${baseUrl}data/logic.json`),
          fetch(`${baseUrl}data/${language}.json`),
          fetch(`${baseUrl}data/turnLogic.json`)
        ]);

        if (!logicRes.ok || !contentRes.ok || !turnLogicRes.ok) {
          throw new Error('Failed to load game data');
        }

        const [logicData, contentData, turnLogicData] = await Promise.all([
          logicRes.json(),
          contentRes.json(),
          turnLogicRes.json()
        ]);

        setLogic(logicData);
        setContent(contentData);
        setTurnLogic(turnLogicData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [language]);

  return { logic, content, turnLogic, loading, error };
};

