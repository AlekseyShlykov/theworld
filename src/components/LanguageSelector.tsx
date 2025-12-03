import React from 'react';
import { Language } from '../types';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  onLanguageSelect: (language: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect }) => {
  return (
    <div className="language-selector-screen" role="dialog" aria-label="Language selection">
      <h1 className="language-selector-title">Choose language / Выберите язык</h1>
      <div className="language-buttons">
        <button
          className="language-button language-button-english"
          onClick={() => onLanguageSelect('en')}
          aria-label="Select English"
        >
          English
        </button>
        <button
          className="language-button language-button-russian"
          onClick={() => onLanguageSelect('ru')}
          aria-label="Select Russian"
        >
          Русский
        </button>
      </div>
    </div>
  );
};






