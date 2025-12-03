import React, { useState, useEffect, useMemo } from 'react';
import { MapCanvas } from './MapCanvas';
import { MapScrollAnimation } from './MapScrollAnimation';
import { ChoiceButtons } from './ChoiceButtons';
import { DebugPanel } from './DebugPanel';
import { UnifiedTextBlock } from './UnifiedTextBlock';
import { Area, LogicData, LanguageData } from '../types';
import { TextsData } from '../hooks/useTexts';
import './PreStep1Intro.css';

// Round map images mapping
const baseUrl = import.meta.env.BASE_URL;
const roundMapImages: Record<number, string> = {
  1: `${baseUrl}assets/rounds/round1_map.png`,
  2: `${baseUrl}assets/rounds/round2_map.png`,
  3: `${baseUrl}assets/rounds/round3_map.png`,
  4: `${baseUrl}assets/rounds/round4_map.png`,
  5: `${baseUrl}assets/rounds/round5_map.png`,
  6: `${baseUrl}assets/rounds/round6_map.png`,
  7: `${baseUrl}assets/rounds/round7_map.png`,
  8: `${baseUrl}assets/rounds/round8_map.png`,
};

interface ChoiceLogEntry {
  round: number;
  zone: number;
}

interface RoundNarrativeProps {
  round: number;
  areas: Area[];
  logic: LogicData;
  labels: LanguageData['ui']['areaLabels'];
  getColorName: (hexColor: string) => string;
  onZoneSelect: (areaId: string) => void;
  onComplete: () => void;
  texts: TextsData;
  choicesLog?: ChoiceLogEntry[];
  currentLanguage?: 'en' | 'ru';
}

export const RoundNarrative: React.FC<RoundNarrativeProps> = ({
  round,
  areas,
  logic,
  labels,
  getColorName,
  onZoneSelect,
  onComplete,
  texts,
  choicesLog = [],
  currentLanguage: _currentLanguage = 'en'
}) => {
  // Screen states: 'intro' | 'zone-1' | 'zone-2' | 'zone-3' | 'zone-4' | 'zone-5' | 'pre-choice' | 'post-choice'
  const [currentScreen, setCurrentScreen] = useState<string>('intro');
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);
  const [hasMadeChoice, setHasMadeChoice] = useState(false);
  
  // CRITICAL: Reset state when round changes
  // This ensures each round starts fresh with intro screen and no choice made
  useEffect(() => {
    setCurrentScreen('intro');
    setHasMadeChoice(false);
    setHighlightedZone(null);
  }, [round]);

  // Get round data from texts (round is a string key in the JSON)
  const roundData = texts.rounds[round.toString()];
  
  // Defensive check: Don't render if no round data
  if (!roundData) {
    return (
      <div className="error-screen" style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>Story data missing for round {round}.</p>
        <button onClick={onComplete}>Continue</button>
      </div>
    );
  }

  // Use current areas as-is - don't reset values for display
  // The game state already handles proper initialization for Round 1
  const displayAreas = useMemo<Area[]>(() => {
    return areas;
  }, [areas]);

  // Handle zone intro sequence
  useEffect(() => {
    if (currentScreen.startsWith('zone-')) {
      const zoneNumber = parseInt(currentScreen.split('-')[1]);
      const zoneId = `A${zoneNumber}`;
      setHighlightedZone(zoneId);
    } else if (currentScreen === 'pre-choice') {
      setHighlightedZone(null); // Clear highlight
    }
  }, [currentScreen]);

  // Helper function to map zone ID (A1-A5) to zone number string ("1"-"5") for text lookup
  // Currently unused but kept for potential future use
  // const getZoneNumber = (areaId: string): string => {
  //   return areaId.replace('A', ''); // A1 -> "1", A2 -> "2", etc.
  // };

  // Intro screen
  if (currentScreen === 'intro') {
    return (
      <div className="pre-step1-intro-screen" role="dialog" aria-label={`Round ${round} introduction`}>
        <DebugPanel areas={displayAreas} choicesLog={choicesLog} />
        <div className="pre-step1-content-wrapper">
          <div id="map-container">
            <MapCanvas
              areas={displayAreas}
              logic={logic}
              highlightedArea={null}
              animationProgress={1}
              currentTurn={round}
            />
          </div>
          <div className="pre-step1-text-container">
            <UnifiedTextBlock text={roundData.introText} />
          </div>
        </div>
        <div className="action-section action-section-single">
          <button
            className="pre-step1-button"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              setCurrentScreen('zone-1');
            }}
            aria-label="Start zone introduction"
          >
            {round === 1 ? texts.ui.start : texts.ui.next}
          </button>
        </div>
      </div>
    );
  }

  // Zone introduction screens (1-5)
  if (currentScreen.startsWith('zone-')) {
    const zoneNumber = parseInt(currentScreen.split('-')[1]);
    // Map zone ID (A1-A5) to zone number string ("1"-"5") for text lookup
    const zoneNumberStr = zoneNumber.toString();
    // zoneId is set in useEffect above via setHighlightedZone
    const zoneText = roundData.zoneTexts[zoneNumberStr] || '';
    const isLastZone = zoneNumber === 5;

    return (
      <div className="pre-step1-intro-screen" role="dialog" aria-label={`Zone ${zoneNumber} introduction`}>
        <DebugPanel areas={displayAreas} choicesLog={choicesLog} />
        <div className="pre-step1-content-wrapper">
          <div id="map-container">
            <MapCanvas
            areas={displayAreas}
            logic={logic}
            highlightedArea={highlightedZone}
            animationProgress={1}
            currentTurn={round}
            />
          </div>
          <div className="pre-step1-text-container">
            <UnifiedTextBlock text={zoneText} />
          </div>
        </div>
        <div className="action-section action-section-single">
          <button
            className="pre-step1-button"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              if (isLastZone) {
                setCurrentScreen('pre-choice');
              } else {
                setCurrentScreen(`zone-${zoneNumber + 1}`);
              }
            }}
            aria-label={isLastZone ? "Continue to choice explanation" : "Next zone"}
          >
            {texts.ui.next}
          </button>
        </div>
      </div>
    );
  }

  // Pre-choice explanation screen
  if (currentScreen === 'pre-choice') {
    const handleZoneSelect = (areaId: string) => {
      // Map areaId (A1-A5) to zone number (1-5) for logging
      // Ensure choice is only made once per round
      if (hasMadeChoice) {
        return;
      }
      
      onZoneSelect(areaId);
      setHasMadeChoice(true);
      setCurrentScreen('post-choice');
    };

    return (
      <div className="pre-step1-intro-screen" role="dialog" aria-label="Choice explanation">
        <DebugPanel areas={displayAreas} choicesLog={choicesLog} />
        <div className="pre-step1-content-wrapper">
          <div id="map-container">
            <MapCanvas
            areas={displayAreas}
            logic={logic}
            highlightedArea={highlightedZone}
            animationProgress={1}
            currentTurn={round}
            onSelect={handleZoneSelect}
            onHover={setHighlightedZone}
            disabled={hasMadeChoice}
            hasSelected={hasMadeChoice}
            />
          </div>
          <div className="pre-step1-text-container">
            <UnifiedTextBlock text={roundData.preChoiceText} />
          </div>
        </div>
        <div className="action-section pre-step1-choice-section">
          <ChoiceButtons
            areas={displayAreas}
            labels={labels}
            question=""
            onSelect={handleZoneSelect}
            onHover={setHighlightedZone}
            getColorName={getColorName}
            texts={texts}
          />
        </div>
      </div>
    );
  }

  // Post-choice explanation screen
  if (currentScreen === 'post-choice') {
    return (
      <div className="pre-step1-intro-screen" role="dialog" aria-label="Post-choice explanation">
        <DebugPanel areas={areas} choicesLog={choicesLog} />
        <div className="pre-step1-content-wrapper">
          <MapScrollAnimation
            imageSrc={roundMapImages[round] || roundMapImages[1]}
            animationKey={round} // Key changes per round to restart animation
          />
          <div className="pre-step1-text-container">
            <UnifiedTextBlock text={roundData.postChoiceText} emphasizeFirstIfQuestion={true} />
          </div>
        </div>
        <div className="action-section action-section-single">
          <button
            className="pre-step1-button pre-step1-next-round-button"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              onComplete();
            }}
            aria-label={round === 8 ? "Proceed to final map" : "Proceed to next round"}
          >
            {round === 8 ? texts.ui.next : texts.ui.nextRound}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

