import React from 'react';
import { RoundIconsRow } from './RoundIconsRow';
import { LanguageDropdown, LanguageOption } from './LanguageDropdown';
import { Language } from '../types';
import { TextsData } from '../hooks/useTexts';
import './TopBar.css';

interface TopBarProps {
  currentRound: number;
  completedRounds: number[];
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isStartScreen?: boolean;
  isPreGame?: boolean; // true only during intro screens (before Start button), not during PreStep1Intro
  texts: TextsData | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRound,
  completedRounds,
  currentLanguage,
  onLanguageChange,
  isStartScreen = false,
  isPreGame = false,
  texts
}) => {
  // Available languages configuration
  const availableLanguages: LanguageOption[] = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' }
  ];

  // Get title based on current round and screen state
  const getTitle = (): string => {
    if (!texts || !texts.header) {
      // Fallback to default title if texts not loaded
      return currentLanguage === 'ru' 
        ? 'Ружья, микробы и сталь' 
        : 'Guns, Germs & Steel';
    }

    // Use introTitle if we're on intro/start screens
    if (isStartScreen) {
      return texts.header.introTitle;
    }

    // Use round title based on current round
    const roundKey = `round${currentRound}` as keyof typeof texts.header.roundTitles;
    const roundTitle = texts.header.roundTitles[roundKey];
    
    if (roundTitle) {
      return roundTitle;
    }

    // Fallback to intro title if round title is missing
    return texts.header.introTitle;
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <RoundIconsRow
          currentRound={currentRound}
          completedRounds={completedRounds}
          isPreGame={isPreGame}
        />
      </div>

      <div className="top-bar-center">
        <h1 className="round-title">{getTitle()}</h1>
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



