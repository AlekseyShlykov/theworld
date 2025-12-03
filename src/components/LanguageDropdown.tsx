import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import './LanguageDropdown.css';

export interface LanguageOption {
  code: Language;
  label: string;
}

interface LanguageDropdownProps {
  currentLanguage: Language;
  availableLanguages: LanguageOption[];
  onChange: (languageCode: Language) => void;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLanguage,
  availableLanguages,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Find current language label
  const currentLanguageOption = availableLanguages.find(
    lang => lang.code === currentLanguage
  );
  const currentLabel = currentLanguageOption?.label || currentLanguage.toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLanguageSelect = (languageCode: Language) => {
    if (languageCode !== currentLanguage) {
      onChange(languageCode);
    }
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="language-dropdown-container">
      <button
        ref={buttonRef}
        className="language-dropdown-button"
        onClick={handleButtonClick}
        aria-label={`Current language: ${currentLabel}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="language-dropdown-label">{currentLabel}</span>
        <span className={`language-dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="language-dropdown-menu"
          role="listbox"
          aria-label="Select language"
        >
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              className={`language-dropdown-item ${
                language.code === currentLanguage ? 'active' : ''
              }`}
              onClick={() => handleLanguageSelect(language.code)}
              role="option"
              aria-selected={language.code === currentLanguage}
              type="button"
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


