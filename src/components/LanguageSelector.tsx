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
          className="nav-button language-button language-button-english"
          onClick={() => onLanguageSelect('en')}
          aria-label="Select English"
        >
          English
        </button>
        <button
          className="nav-button language-button language-button-russian"
          onClick={() => onLanguageSelect('ru')}
          aria-label="Select Russian"
        >
          Русский
        </button>
        <button
          className="nav-button language-button language-button-spanish"
          onClick={() => onLanguageSelect('es')}
          aria-label="Select Spanish"
        >
          Español
        </button>
        <button
          className="nav-button language-button language-button-french"
          onClick={() => onLanguageSelect('fr')}
          aria-label="Select French"
        >
          Français
        </button>
        <button
          className="nav-button language-button language-button-japanese"
          onClick={() => onLanguageSelect('ja')}
          aria-label="Select Japanese"
        >
          日本語
        </button>
      </div>
    </div>
  );
};






