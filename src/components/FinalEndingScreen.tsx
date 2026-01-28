import React from 'react';
import { UnifiedTextBlock } from './UnifiedTextBlock';
import { IntroMapAnimation } from './IntroMapAnimation';
import { Area, LogicData } from '../types';
import { TextsData } from '../hooks/useTexts';
import './FinalEndingScreen.css';

interface FinalEndingScreenProps {
  areas: Area[];
  logic: LogicData;
  texts: TextsData;
  onPlayAgain: () => void;
  /** When provided, only a single "Next" button is shown; otherwise Play Again + My website */
  onNext?: () => void;
}

/** Dedicated ending image (independent from intro screens) */
const ENDING_IMAGE = 'assets/intro/ending_image.png';

export const FinalEndingScreen: React.FC<FinalEndingScreenProps> = ({
  areas: _areas,
  logic,
  texts,
  onPlayAgain,
  onNext
}) => {
  const baseUrl = import.meta.env.BASE_URL;
  const handleWebsiteClick = () => {
    window.open('https://buildtounderstand.dev/', '_blank');
  };

  return (
    <div className="final-ending-screen" role="dialog" aria-label="Game ending">
      <IntroMapAnimation
        isActive={true}
        imageSource={`${baseUrl}${ENDING_IMAGE}`}
        animationKey="ending"
        scrollSpeed={logic?.imageScrollSpeed}
      />

      <div className="intro-text-container">
        <UnifiedTextBlock
          text={texts.final.endingText}
          emphasizeFirstIfQuestion={true}
          useNumberedStyle={false}
        />
      </div>

      <div className={`action-section ${onNext ? 'action-section-single' : ''}`}>
        {onNext ? (
          <button
            className="nav-button final-ending-button final-ending-button-primary"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              onNext();
            }}
            aria-label="Continue to final results"
          >
            {texts.ui.next}
          </button>
        ) : (
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
        )}
      </div>
    </div>
  );
};



