import React from 'react';
import { TextsData } from '../hooks/useTexts';
import { IntroMapAnimation } from './IntroMapAnimation';
import { UnifiedTextBlock } from './UnifiedTextBlock';
import './IntroScreens.css';

interface IntroScreensProps {
  currentScreen: number;
  onNext: () => void;
  onStartGame: () => void;
  texts: TextsData;
  showIntroAnimation?: boolean;
}

export const IntroScreens: React.FC<IntroScreensProps> = ({
  currentScreen,
  onNext,
  onStartGame,
  texts,
  showIntroAnimation = false
}) => {
  // Intro images mapping
  const baseUrl = import.meta.env.BASE_URL;
  const introStartImage = `${baseUrl}assets/intro/intro_map_start.png`; // Used on screen 1 (static)
  const introImages = [
    `${baseUrl}assets/intro/intro_map_1.png`, // Intro step 1 (screen 2)
    `${baseUrl}assets/intro/intro_map_2.png`, // Intro step 2 (screen 3)
    `${baseUrl}assets/intro/intro_map_3.png`, // Intro step 3 (screen 4)
  ];

  // Get the image index (0-based) for current screen (screens 2, 3, 4 map to indices 0, 1, 2)
  const getImageIndex = (screen: number): number => {
    if (screen >= 2 && screen <= 4) {
      return screen - 2; // Screen 2 -> 0, Screen 3 -> 1, Screen 4 -> 2
    }
    return 0;
  };
  // Intro Screen 1: Start Screen with title and subtitle (static image, no animation)
  if (currentScreen === 1) {
    return (
      <div className="intro-screen intro-screen-1" role="dialog" aria-label="Game introduction">
        <div className="intro-image-container intro-image-top-spacing">
          <img
            src={introStartImage}
            alt="World map"
            className="intro-image"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="intro-title-section">
          <h1 className="intro-title">{texts.intro.screen1.title}</h1>
          <p className="intro-subtitle">
            {texts.intro.screen1.subtitle}
          </p>
        </div>
        <div className="action-section action-section-single">
          <button
            className="intro-button intro-start-button"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              onNext();
            }}
            aria-label="Start introduction"
          >
            {texts.intro.screen1.button}
          </button>
        </div>
      </div>
    );
  }

  // Intro Screen 2: Image + Text + Next button (Intro step 1)
  if (currentScreen === 2) {
    return (
      <div className="intro-screen intro-screen-content" role="dialog" aria-label="Introduction part 1">
        {showIntroAnimation ? (
          <IntroMapAnimation 
            isActive={true} 
            imageSource={introImages[getImageIndex(2)]}
            animationKey={2} // Key changes on each step to restart animation
          />
        ) : (
          <div className="intro-image-container intro-image-top-spacing">
            <img
              src={`${baseUrl}assets/map-image.png`}
              alt="World map"
              className="intro-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="intro-text-container">
          <UnifiedTextBlock text={texts.intro.screen2.text} />
        </div>
        <div className="action-section action-section-single">
          <button
            className="intro-button intro-next-button"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              onNext();
            }}
            aria-label="Continue to next section"
          >
            {texts.ui.next}
          </button>
        </div>
      </div>
    );
  }

  // Intro Screen 3: Image + Text + Next button (Intro step 2)
  if (currentScreen === 3) {
    return (
      <div className="intro-screen intro-screen-content" role="dialog" aria-label="Introduction part 2">
        {showIntroAnimation ? (
          <IntroMapAnimation 
            isActive={true} 
            imageSource={introImages[getImageIndex(3)]}
            animationKey={3} // Key changes on each step to restart animation
          />
        ) : (
          <div className="intro-image-container intro-image-top-spacing">
            <img
              src={`${baseUrl}assets/map-image.png`}
              alt="World map"
              className="intro-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="intro-text-container">
          <UnifiedTextBlock text={texts.intro.screen3.text} />
        </div>
        <div className="action-section action-section-single">
          <button
            className="intro-button intro-next-button"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              onNext();
            }}
            aria-label="Continue to next section"
          >
            {texts.ui.next}
          </button>
        </div>
      </div>
    );
  }

  // Intro Screen 4: Image + Text + Start Game button (Intro step 3)
  if (currentScreen === 4) {
    return (
      <div className="intro-screen intro-screen-content" role="dialog" aria-label="Introduction part 3">
        {showIntroAnimation ? (
          <IntroMapAnimation 
            isActive={true} 
            imageSource={introImages[getImageIndex(4)]}
            animationKey={4} // Key changes on each step to restart animation
          />
        ) : (
          <div className="intro-image-container intro-image-top-spacing">
            <img
              src={`${baseUrl}assets/map-image.png`}
              alt="World map"
              className="intro-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="intro-text-container">
          <UnifiedTextBlock text={texts.intro.screen4.text} />
        </div>
        <div className="action-section action-section-single">
          <button
            className="intro-button intro-start-game-button"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              onStartGame();
            }}
            aria-label="Start the game"
          >
            {texts.intro.screen4.button}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

