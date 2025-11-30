import React, { useState, useEffect } from 'react';
import { RoundIconsRow } from './RoundIconsRow';
import './TopBar.css';

interface TopBarProps {
  currentRound: number;
  completedRounds: number[];
  currentLanguage: 'en' | 'ru';
  onLanguageChange: (lang: 'en' | 'ru') => void;
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

  // Load UI texts from JSON
  useEffect(() => {
    fetch('/config/uiTexts.json')
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
        <div className="language-selector">
          <button
            className={currentLanguage === 'en' ? 'active' : ''}
            onClick={() => onLanguageChange('en')}
            aria-label="Switch to English"
          >
            EN
          </button>
          <button
            className={currentLanguage === 'ru' ? 'active' : ''}
            onClick={() => onLanguageChange('ru')}
            aria-label="Switch to Russian"
          >
            RU
          </button>
        </div>
      </div>
    </div>
  );
};



