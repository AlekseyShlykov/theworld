import React, { useState, useEffect } from 'react';
import { RoundIconsRow } from './RoundIconsRow';
import { LanguageDropdown, LanguageOption } from './LanguageDropdown';
import { Language } from '../types';
import './TopBar.css';

interface TopBarProps {
  currentRound: number;
  completedRounds: number[];
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isStartScreen?: boolean;
}

interface UITexts {
  [language: string]: {
    [roundKey: string]: {
      title: string;
    };
  };
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRound,
  completedRounds,
  currentLanguage,
  onLanguageChange,
  isStartScreen = false
}) => {
  const [uiTexts, setUiTexts] = useState<UITexts | null>(null);
  const [loading, setLoading] = useState(true);

  // Available languages configuration
  const availableLanguages: LanguageOption[] = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' }
  ];

  // Load UI texts from JSON
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL;
    fetch(`${baseUrl}config/uiTexts.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load UI texts');
        }
        return response.json();
      })
      .then((data: UITexts) => {
        setUiTexts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading UI texts:', error);
        setLoading(false);
      });
  }, []);

  // Get title based on current round and language
  const getTitle = (): string => {
    if (!uiTexts) {
      return 'Guns, Germs & Steel';
    }

    // Use startScreen.title if we're on the first screen
    if (isStartScreen) {
      const startTitle = uiTexts[currentLanguage]?.startScreen?.title;
      if (startTitle) {
        return startTitle;
      }
    }

    const roundKey = `round${currentRound}`;
    const title = uiTexts[currentLanguage]?.[roundKey]?.title;
    
    if (title) {
      return title;
    }

    // Fallback to default title
    return currentLanguage === 'ru' 
      ? 'Ружья, микробы и сталь' 
      : 'Guns, Germs & Steel';
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <RoundIconsRow
          currentRound={currentRound}
          completedRounds={completedRounds}
        />
      </div>

      <div className="top-bar-center">
        <h1 className="round-title">{loading ? '...' : getTitle()}</h1>
      </div>

      <div className="top-bar-right">
        <LanguageDropdown
          currentLanguage={currentLanguage}
          availableLanguages={availableLanguages}
          onChange={onLanguageChange}
        />
      </div>
    </div>
  );
};



