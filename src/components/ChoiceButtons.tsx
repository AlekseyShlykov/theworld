import React, { useState } from 'react';
import { Area, LanguageData } from '../types';
import { TextsData } from '../hooks/useTexts';

interface ChoiceButtonsProps {
  areas: Area[];
  labels: LanguageData['ui']['areaLabels'];
  question: string;
  onSelect: (areaId: string) => void;
  onHover: (areaId: string | null) => void;
  disabled?: boolean;
  getColorName?: (hexColor: string) => string; // Function to map hex color to color name for button labels (optional)
  texts?: TextsData; // Translation texts for button labels
}

export const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({
  areas,
  labels,
  question,
  onSelect,
  onHover,
  disabled = false,
  getColorName: _getColorName,
  texts
}) => {
  const [tentativeSelection, setTentativeSelection] = useState<string | null>(null);
  const [hasSelected, setHasSelected] = useState(false); // Track if a selection has been made

  const handleClick = (areaId: string) => {
    if (disabled || hasSelected) {
      return;
    }

    // Play SFX if available
    if ((window as any).playClickSound) {
      (window as any).playClickSound();
    }

    // Mobile: first tap selects, second tap confirms
    if (tentativeSelection === areaId) {
      setHasSelected(true);
      onSelect(areaId);
      setTentativeSelection(null);
    } else {
      setTentativeSelection(areaId);
      onHover(areaId);
      
      // Auto-confirm after 300ms if on desktop (has mouse)
      if (window.matchMedia('(pointer: fine)').matches) {
        setTimeout(() => {
          // If still the same selection and not already selected, auto-confirm
          setTentativeSelection(prev => {
            if (prev === areaId && !hasSelected) {
              setHasSelected(true);
              onSelect(areaId);
              return null;
            }
            return prev;
          });
        }, 300);
      }
    }
  };

  const handleMouseEnter = (areaId: string) => {
    if (disabled) return;
    onHover(areaId);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    if (!tentativeSelection) {
      onHover(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, areaId: string) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(areaId);
    }
  };

  // Helper function to get button label from translations
  const getButtonLabel = (areaId: string): string => {
    if (texts?.areaButtons) {
      // Map areaId (A1, A2, etc.) to areaButtons key (area1, area2, etc.)
      const areaNumber = areaId.replace('A', '');
      const areaKey = `area${areaNumber}` as keyof typeof texts.areaButtons;
      return texts.areaButtons[areaKey] || areaId;
    }
    // Fallback to labels if texts not available (backward compatibility)
    return labels[areaId] || areaId;
  };

  return (
    <div className="choice-section" role="region" aria-label="Area selection">
      {question && <h3 className="choice-question">{question}</h3>}
      <div className="choice-buttons choice-buttons-row">
        {areas.map((area) => (
          <button
            key={area.id}
            className={`choice-btn choice-button ${tentativeSelection === area.id ? 'tentative' : ''}`}
            onClick={() => handleClick(area.id)}
            onMouseEnter={() => handleMouseEnter(area.id)}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(e) => handleKeyPress(e, area.id)}
            disabled={disabled}
            aria-label={`Select ${getButtonLabel(area.id)}`}
            data-zone={area.id.replace('A', '')}
            style={{
              backgroundColor: area.color,
              '--area-color': area.color
            } as React.CSSProperties}
          >
            <span className="choice-label">
              {getButtonLabel(area.id)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

