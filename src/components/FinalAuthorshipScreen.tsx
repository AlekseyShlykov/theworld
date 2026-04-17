import React from 'react';
import { MapCanvas } from './MapCanvas';
import { UnifiedTextBlock } from './UnifiedTextBlock';
import { Area, LogicData } from '../types';
import { TextsData } from '../hooks/useTexts';
import './FinalEndingScreen.css';

interface FinalAuthorshipScreenProps {
  areas: Area[];
  logic: LogicData;
  texts: TextsData;
  onPlayAgain: () => void;
}

/**
 * Final authorship / credits screen.
 * Same layout and link buttons as FinalEndingScreen (Play Again, other games, subscribe, etc.).
 * Uses texts.final.authorshipText and reuses texts.final.playAgain / myWebsite / subscribeToUpdates.
 */
export const FinalAuthorshipScreen: React.FC<FinalAuthorshipScreenProps> = ({
  areas,
  logic,
  texts,
  onPlayAgain
}) => {
  const handleWebsiteClick = () => {
    window.open('https://evolutionofcivilizations.earth/', '_blank');
  };

  const handleSubscribeClick = () => {
    window.open('https://buildtounderstand.substack.com/?subscribe=true', '_blank');
  };

  const handleIllustratorClick = () => {
    window.open('https://www.instagram.com/katya_evazu/', '_blank');
  };

  const handleSupportClick = () => {
    window.open('https://patreon.com/buildtounderstand', '_blank');
  };

  return (
    <div className="final-ending-screen" role="dialog" aria-label="Authorship and credits">
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
        <UnifiedTextBlock text={`${texts.final.authorshipText}\n\n${texts.final.illustrationsCredit}`} />
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
            aria-label={texts.final.myWebsite}
          >
            {texts.final.myWebsite}
          </button>
          <button
            className="nav-button final-ending-button final-ending-button-link"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              handleSubscribeClick();
            }}
            aria-label={texts.final.subscribeToUpdates}
          >
            {texts.final.subscribeToUpdates}
          </button>
          <button
            className="nav-button final-ending-button final-ending-button-link"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              handleIllustratorClick();
            }}
            aria-label={texts.final.illustratorButton}
          >
            {texts.final.illustratorButton}
          </button>
          <button
            className="nav-button final-ending-button final-ending-button-link"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              handleSupportClick();
            }}
            aria-label={texts.final.supportMe}
          >
            {texts.final.supportMe}
          </button>
        </div>
      </div>
    </div>
  );
};
