import React from 'react';
import { MapCanvas } from './MapCanvas';
import { UnifiedTextBlock } from './UnifiedTextBlock';
import { Area, LogicData } from '../types';
import { TextsData } from '../hooks/useTexts';
import './FinalEndingScreen.css';

interface FinalEndingScreenProps {
  areas: Area[];
  logic: LogicData;
  texts: TextsData;
  onPlayAgain: () => void;
}

export const FinalEndingScreen: React.FC<FinalEndingScreenProps> = ({
  areas,
  logic,
  texts,
  onPlayAgain
}) => {
  const handleWebsiteClick = () => {
    window.open('https://buildtounderstand.dev/', '_blank');
  };

  return (
    <div className="final-ending-screen" role="dialog" aria-label="Game ending">
      <div className="final-ending-image">
        <MapCanvas
          areas={areas}
          logic={logic}
          highlightedArea={null}
          animationProgress={1}
          currentTurn={8}
        />
      </div>

      <div className="final-ending-text-container">
        <UnifiedTextBlock text={texts.final.endingText} emphasizeFirstIfQuestion={true} />
      </div>

      <div className="action-section">
        <div className="final-ending-buttons">
          <button
            className="nav-button final-ending-button final-ending-button-primary"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              onPlayAgain();
            }}
            aria-label="Restart the game"
          >
            {texts.final.playAgain}
          </button>
          <button
            className="nav-button final-ending-button final-ending-button-link"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              handleWebsiteClick();
            }}
            aria-label="Visit buildtounderstand.dev"
          >
            {texts.final.myWebsite}
          </button>
        </div>
      </div>
    </div>
  );
};



