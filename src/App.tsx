import React, { useState, useEffect, useMemo } from 'react';
import { MapCanvas } from './components/MapCanvas';
import { ChoiceButtons } from './components/ChoiceButtons';
import { PhaseContent } from './components/PhaseContent';
import { Toast } from './components/Toast';
import { IntroScreens } from './components/IntroScreens';
import { PreStep1Intro } from './components/PreStep1Intro';
import { RoundNarrative } from './components/RoundNarrative';
import { LanguageSelector } from './components/LanguageSelector';
import { FinalMapScreen } from './components/FinalMapScreen';
import { FinalEndingScreen } from './components/FinalEndingScreen';
import { DebugPanel } from './components/DebugPanel';
import { TopBar } from './components/TopBar';
import { GameFooter } from './components/GameFooter';
import { useGameData } from './hooks/useGameData';
import { useGameState } from './hooks/useGameState';
import { useTexts } from './hooks/useTexts';
import { useTTS } from './contexts/TTSContext';
import './App.css';

function App() {
  // LANGUAGE STATE
  // null = language not selected yet, 'en' or 'ru' = language selected
  const [language, setLanguage] = useState<'en' | 'ru' | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ru'>('en');
  
  // Load texts based on selected language
  const { texts, loading: textsLoading, error: textsError } = useTexts(selectedLanguage);
  
  const { logic, content, turnLogic, loading, error } = useGameData(selectedLanguage);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // INTRO SCREEN STATE
  // Controls which intro screen is showing (1-4) or null if intro is complete
  // To disable intro: set initial state to null: useState<number | null>(null)
  const [introScreen, setIntroScreen] = useState<number | null>(1);
  
  // INTRO ANIMATION STATE
  // Controls whether the animated map should be shown during intro screens 2-4
  // Only active on first playthrough (after clicking "Start" on screen 1)
  const [isIntroAnimationActive, setIntroAnimationActive] = useState<boolean>(false);
  
  // PRE-STEP-1 INTRO STATE
  // Controls the zone introduction sequence before Step 1
  // null = not showing, true = showing
  // To disable: set initial state to false
  const [showPreStep1Intro, setShowPreStep1Intro] = useState<boolean>(false);
  
  // ROUND NARRATIVE STATE
  // Controls showing narrative flow for rounds 2-8
  // null = not showing, number = round number showing
  const [showRoundNarrative, setShowRoundNarrative] = useState<number | null>(null);
  
  // FINAL SCREENS STATE
  // Controls showing final screens after Round 8
  // null = not showing, 'finalMap' = showing final map, 'finalEnding' = showing ending
  const [finalScreen, setFinalScreen] = useState<'finalMap' | 'finalEnding' | null>(null);
  
  // DEBUG: Choices log for tracking player decisions
  interface ChoiceLogEntry {
    round: number;
    zone: number; // 1-5
  }
  const [choicesLog, setChoicesLog] = useState<ChoiceLogEntry[]>([]);

  // Initialize game state once data is loaded
  const {
    gameState,
    // zoneChoiceCounts, // Get choice counts for debug panel (unused but kept for future debug features)
    setPhase,
    setHighlightedArea,
    selectArea,
    nextTurn,
    restartGame,
    captureCurrentSnapshot
  } = useGameState(logic?.areas || [], logic?.populationMultipliers);

  // TTS context for auto-reading
  const { isSpeechOn, speakText, stopSpeaking } = useTTS();

  // Helper function to get current screen text for TTS
  // This function is safe to call even when data isn't loaded yet
  const getCurrentScreenText = (): string => {
    if (!texts || !content) return '';

    // Intro screens
    if (introScreen !== null) {
      if (introScreen === 1) {
        const title = texts.intro.screen1?.title || '';
        const subtitle = texts.intro.screen1?.subtitle || '';
        return title && subtitle ? `${title}. ${subtitle}` : title || subtitle;
      } else if (introScreen === 2) {
        return texts.intro.screen2?.text || '';
      } else if (introScreen === 3) {
        return texts.intro.screen3?.text || '';
      } else if (introScreen === 4) {
        return texts.intro.screen4?.text || '';
      }
    }

    // Pre-step-1 intro / Round narrative
    if (showPreStep1Intro || (showRoundNarrative !== null && showRoundNarrative >= 1 && showRoundNarrative <= 8)) {
      const round = showRoundNarrative || 1;
      const roundData = texts.rounds[round.toString()];
      if (roundData) {
        // Return intro text for round narrative (most common case)
        return roundData.introText;
      }
    }

    // Final screens
    if (finalScreen === 'finalMap') {
      return texts.final.mapText;
    }
    if (finalScreen === 'finalEnding') {
      return texts.final.endingText;
    }

    // Phase content
    const currentStep = content.steps.find(s => s.id === gameState.currentTurn);
    if (currentStep) {
      if (gameState.currentPhase === 'phase1') {
        return currentStep.phase1Text || '';
      } else if (gameState.currentPhase === 'phase3') {
        const phase3Content = currentStep.phase3;
        return typeof phase3Content === 'string' ? phase3Content : phase3Content.text || '';
      }
    }

    return '';
  };

  // Memoize current text to track changes
  const currentScreenText = useMemo(() => {
    return getCurrentScreenText();
  }, [
    introScreen,
    showPreStep1Intro,
    showRoundNarrative,
    finalScreen,
    gameState.currentPhase,
    gameState.currentTurn,
    texts,
    content
  ]);

  // Auto-read when text changes and speech is ON
  // Use ref to track previous text to avoid re-reading the same text
  const prevTextRef = React.useRef<string>(currentScreenText || '');
  const prevSpeechOnRef = React.useRef<boolean>(isSpeechOn);
  
  useEffect(() => {
    const cleanText = currentScreenText?.trim() || '';
    const textChanged = cleanText !== prevTextRef.current;
    const speechToggledOn = !prevSpeechOnRef.current && isSpeechOn;
    
    // Auto-read if:
    // 1. Speech is ON
    // 2. Current text exists
    // 3. Either text changed OR speech was just turned ON
    if (isSpeechOn && cleanText !== '') {
      if (textChanged || speechToggledOn) {
        prevTextRef.current = cleanText;
        stopSpeaking();
        speakText(cleanText, selectedLanguage);
      }
    } else {
      // Reset when speech is off
      if (prevSpeechOnRef.current && !isSpeechOn) {
        prevTextRef.current = '';
      }
    }
    
    prevSpeechOnRef.current = isSpeechOn;
  }, [currentScreenText, isSpeechOn, selectedLanguage, speakText, stopSpeaking]);


  // Utility function to convert hex color to color name for button labels
  // Maps hex colors from logic.json to readable color names
  const getColorName = (hexColor: string): string => {
    const colorMap: Record<string, string> = {
      '#000000': 'Black',
      '#4ECDC4': 'Teal',
      '#45B7D1': 'Blue',
      '#FFA07A': 'Orange',
      '#98D8C8': 'Mint'
    };
    return colorMap[hexColor.toUpperCase()] || 'Unknown';
  };

  // Animate area overlays on phase changes
  useEffect(() => {
    if (gameState.currentPhase === 'phase1' || gameState.currentPhase === 'phase2') {
      let startTime: number | null = null;
      const duration = logic?.overlayAnimationMaxMs || 3000;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setAnimationProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [gameState.currentPhase, gameState.currentTurn, logic?.overlayAnimationMaxMs]);

  // Handle phase transitions
  const handlePhase1Continue = () => {
    setPhase('phase2');
  };

  const handleAreaSelect = (areaId: string) => {
    if (!turnLogic || !logic) return;

    selectArea(areaId, turnLogic, logic);

    // Log the choice to debug panel
    const zoneNumber = parseInt(areaId.replace('A', ''));
    setChoicesLog(prev => [...prev, {
      round: gameState.currentTurn,
      zone: zoneNumber
    }]);

    // Show toast notification
    const area = gameState.areas.find(a => a.id === areaId);
    const choice = turnLogic[`turn${gameState.currentTurn}`]?.onChoose[areaId];
    if (area && choice && content) {
      const label = content.ui.areaLabels[areaId];
      setToastMessage(
        `${label} ${content.ui.toast.advanced}: +${choice.powerDelta.toFixed(1)} ${content.ui.toast.powerGain}, +${choice.accDelta.toFixed(1)} ${content.ui.toast.accGain}`
      );
      setShowToast(true);
    }
  };

  const handlePhase3Continue = () => {
    nextTurn();
    setAnimationProgress(0);
  };

  const handleRestart = () => {
    restartGame();
    setAnimationProgress(0);
    // Reset intro screens when restarting (optional: set to null/false to skip intros on restart)
    // Note: Language selection is NOT reset on restart - user keeps their language choice
    setIntroScreen(1);
    setShowPreStep1Intro(false);
    setShowRoundNarrative(null);
    setFinalScreen(null);
    // Reset choices log
    setChoicesLog([]);
    // Reset intro animation state (will be activated again when clicking "Start" on screen 1)
    setIntroAnimationActive(false);
  };

  // Intro screen navigation handlers
  const handleIntroNext = () => {
    if (introScreen !== null && introScreen < 4) {
      // Activate animation when moving from screen 1 to screen 2 (first time)
      if (introScreen === 1) {
        setIntroAnimationActive(true);
      }
      setIntroScreen(introScreen + 1);
    }
  };

  // Handle language selection
  const handleLanguageSelect = (lang: 'en' | 'ru') => {
    setSelectedLanguage(lang);
    setLanguage(lang); // Set language as selected
  };

  const handleStartGame = () => {
    // Complete intro and start pre-step-1 intro sequence
    // Deactivate animation when starting the game
    setIntroAnimationActive(false);
    setIntroScreen(null);
    setShowPreStep1Intro(true);
  };

  // Handler for zone selection during pre-step-1 intro
  const handlePreStep1ZoneSelect = (areaId: string) => {
    if (!turnLogic || !logic) return;
    
    // Check if choice already logged for this round to prevent duplicates
    const zoneNumber = parseInt(areaId.replace('A', ''));
    const alreadyLogged = choicesLog.some(entry => entry.round === 1 && entry.zone === zoneNumber);
    
    if (alreadyLogged) {
      return;
    }
    
    // Apply the choice using existing logic (applies deltas + +0.1 bonus)
    selectArea(areaId, turnLogic, logic);
    
    // Log the choice to debug panel (only once)
    setChoicesLog(prev => [...prev, {
      round: 1,
      zone: zoneNumber
    }]);
  };

  // Handler for completing pre-step-1 intro and proceeding to Step 2
  const handlePreStep1Complete = () => {
    // IMPORTANT: Set showRoundNarrative BEFORE clearing showPreStep1Intro
    // This ensures the Round Narrative check (which comes first in rendering) will catch it
    setShowRoundNarrative(2);
    setShowPreStep1Intro(false);
    // Skip Step 1 and advance directly to Step 2
    // Mark step 1 as completed and advance to turn 2
    nextTurn(); // This will advance from turn 1 to turn 2
    setPhase('phase1'); // Ensure we're in phase1
    setAnimationProgress(0);
  };

  // Handler for zone selection during round narrative (rounds 2-8)
  const handleRoundNarrativeZoneSelect = (areaId: string) => {
    if (!turnLogic || !logic) return;
    
    const currentRound = showRoundNarrative || gameState.currentTurn;
    const zoneNumber = parseInt(areaId.replace('A', ''));
    
    // Check if choice already logged for this round to prevent duplicates
    const alreadyLogged = choicesLog.some(entry => entry.round === currentRound && entry.zone === zoneNumber);
    
    if (alreadyLogged) {
      return;
    }
    
    // Apply the choice using existing logic (applies deltas + +0.1 bonus)
    selectArea(areaId, turnLogic, logic);
    
    // Log the choice to debug panel (only once)
    setChoicesLog(prev => [...prev, {
      round: currentRound,
      zone: zoneNumber
    }]);
  };

  // Handler for completing a round narrative and proceeding to next round
  const handleRoundNarrativeComplete = () => {
    const currentRound = showRoundNarrative;
    if (currentRound === null) return;
    
    // If Round 8 is complete, capture final snapshot and transition to final map screen
    if (currentRound === 8) {
      // Capture round 8's snapshot before transitioning to final screen
      // This ensures the population chart has data for all 8 rounds
      captureCurrentSnapshot();
      setShowRoundNarrative(null);
      setFinalScreen('finalMap');
      setPhase('finalMap');
      return;
    }
    
    // Calculate next round before clearing state
    const nextRound = currentRound + 1;
    
    // Advance to next turn first
    nextTurn();
    setPhase('phase1');
    setAnimationProgress(0);
    
    // Check if next round (currentRound + 1) needs narrative flow (2-8)
    if (nextRound >= 2 && nextRound <= 8) {
      // Directly set next round narrative - we know what the next round is
      // The useEffect will serve as a fallback safety net if this doesn't work
      setShowRoundNarrative(nextRound);
    } else {
      // For Round 9+, clear narrative display so normal game flow takes over
      setShowRoundNarrative(null);
    }
  };
  
  // Handler for final map screen - proceed to ending
  const handleFinalMapNext = () => {
    setFinalScreen('finalEnding');
    setPhase('finalEnding');
  };
  
  // Handler for play again - reset game
  const handlePlayAgain = () => {
    restartGame();
    setAnimationProgress(0);
    setIntroScreen(1);
    setShowPreStep1Intro(false);
    setShowRoundNarrative(null);
    setFinalScreen(null);
    setPhase('phase1');
    // Reset choices log
    setChoicesLog([]);
  };

  // LANGUAGE SELECTION SCREEN: Show first before anything else
  if (language === null) {
    return (
      <div className="app">
        <LanguageSelector onLanguageSelect={handleLanguageSelect} />
      </div>
    );
  }

  if (loading || textsLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" aria-label="Loading game data"></div>
        <p>Loading Guns, Germs & Steel...</p>
      </div>
    );
  }

  if (error || textsError || !logic || !content || !turnLogic || !texts) {
    return (
      <div className="error-screen">
        <h1>Error Loading Game</h1>
        <p>{error || textsError || 'Failed to load game data'}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const currentStep = content.steps.find(s => s.id === gameState.currentTurn);

  // FINAL SCREENS: Check before round narrative (after Round 8)
  if (finalScreen === 'finalMap' && !loading && !error && !textsLoading && logic && content && texts) {
    return (
      <div className="app">
        <TopBar
          currentRound={gameState.currentTurn}
          completedRounds={gameState.completedSteps}
          currentLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <main className="app-main">
          <DebugPanel areas={gameState.areas} choicesLog={choicesLog} />
          <FinalMapScreen
            areas={gameState.areas}
            logic={logic}
            labels={content.ui.areaLabels}
            texts={texts}
            choicesLog={choicesLog}
            areaHistory={gameState.areaHistory}
            onNext={handleFinalMapNext}
          />
        </main>
        <GameFooter
          currentRound={gameState.currentTurn}
          currentLanguage={selectedLanguage}
          getCurrentScreenText={getCurrentScreenText}
        />
      </div>
    );
  }
  
  if (finalScreen === 'finalEnding' && !loading && !error && !textsLoading && logic && content && texts) {
    return (
      <div className="app">
        <TopBar
          currentRound={gameState.currentTurn}
          completedRounds={gameState.completedSteps}
          currentLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <main className="app-main">
          <DebugPanel areas={gameState.areas} choicesLog={choicesLog} />
          <FinalEndingScreen
            areas={gameState.areas}
            logic={logic}
            texts={texts}
            onPlayAgain={handlePlayAgain}
          />
        </main>
        <GameFooter
          currentRound={gameState.currentTurn}
          currentLanguage={selectedLanguage}
          getCurrentScreenText={getCurrentScreenText}
        />
      </div>
    );
  }

  // ROUND NARRATIVE: Check this FIRST before other screens (rounds 2-8)
  // This must be checked before intro screens and PreStep1Intro to ensure proper transitions
  // Add defensive check to ensure texts and round data exist before rendering
  if (showRoundNarrative !== null && showRoundNarrative >= 2 && showRoundNarrative <= 8 && !loading && !error && !textsLoading && logic && content && texts) {
    // Defensive check: verify round data exists
    const roundData = texts.rounds[showRoundNarrative.toString()];
    
    if (!roundData) {
      console.error(`No narrative data for round ${showRoundNarrative}. Showing error screen.`);
      return (
        <div className="app">
          <div className="error-screen">
            <h1>Error</h1>
            <p>Story data missing for round {showRoundNarrative}.</p>
            <button onClick={() => {
              setShowRoundNarrative(null);
              setPhase('phase1');
            }}>Continue without narrative</button>
          </div>
        </div>
      );
    }
    return (
      <div className="app">
        <TopBar
          currentRound={showRoundNarrative || gameState.currentTurn}
          completedRounds={gameState.completedSteps}
          currentLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <main className="app-main">
          {texts && (
            <RoundNarrative
              key={`round-${showRoundNarrative}`}
              round={showRoundNarrative}
              areas={gameState.areas}
              logic={logic}
              labels={content.ui.areaLabels}
              getColorName={getColorName}
              onZoneSelect={handleRoundNarrativeZoneSelect}
              onComplete={handleRoundNarrativeComplete}
              texts={texts}
              choicesLog={choicesLog}
              currentLanguage={selectedLanguage}
            />
          )}
        </main>
        <GameFooter
          currentRound={showRoundNarrative || gameState.currentTurn}
          currentLanguage={selectedLanguage}
          getCurrentScreenText={getCurrentScreenText}
        />
      </div>
    );
  }

  // INTRO SCREENS: Show intro sequence before the game starts
  // To disable intro, set introScreen initial state to null in useState above
  if (introScreen !== null && !loading && !error && logic && content) {
    return (
      <div className="app">
        <TopBar
          currentRound={gameState.currentTurn}
          completedRounds={gameState.completedSteps}
          currentLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          isStartScreen={true}
        />
        <main className="app-main">
          {introScreen !== null && texts && (
            <IntroScreens
              currentScreen={introScreen}
              onNext={handleIntroNext}
              onStartGame={handleStartGame}
              texts={texts}
              showIntroAnimation={isIntroAnimationActive}
            />
          )}
        </main>
        <GameFooter
          currentRound={gameState.currentTurn}
          currentLanguage={selectedLanguage}
          getCurrentScreenText={getCurrentScreenText}
        />
      </div>
    );
  }

  // PRE-STEP-1 INTRO: Show zone introduction sequence before Step 1
  // To disable: set showPreStep1Intro initial state to false in useState above
  if (showPreStep1Intro && !loading && !error && logic && content) {
    return (
      <div className="app">
        <TopBar
          currentRound={gameState.currentTurn}
          completedRounds={gameState.completedSteps}
          currentLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          isStartScreen={true}
        />
        <main className="app-main">
          {texts && (
            <PreStep1Intro
              areas={gameState.areas}
              logic={logic}
              labels={content.ui.areaLabels}
              getColorName={getColorName}
              onZoneSelect={handlePreStep1ZoneSelect}
              onComplete={handlePreStep1Complete}
              texts={texts}
              round={1}
              choicesLog={choicesLog}
              currentLanguage={selectedLanguage}
            />
          )}
        </main>
        <GameFooter
          currentRound={gameState.currentTurn}
          currentLanguage={selectedLanguage}
          getCurrentScreenText={getCurrentScreenText}
        />
      </div>
    );
  }

  // Check if we should show round narrative for rounds 2-7
  // This runs when entering a turn that needs narrative
  // This is a fallback safety mechanism in case the direct handlers don't set the narrative
  useEffect(() => {
    if (!loading && !error && !textsLoading && logic && content && texts && gameState.currentPhase === 'phase1') {
      const currentRound = gameState.currentTurn;
      // If we're on rounds 2-8 and not already showing narrative, check if we should start it
      if (currentRound >= 2 && currentRound <= 8 && showRoundNarrative === null && !showPreStep1Intro) {
        const roundData = texts.rounds[currentRound.toString()];
        if (roundData) {
          // Defensive check: ensure we have narrative data before showing it
          setShowRoundNarrative(currentRound);
        } else {
          console.warn(`No narrative data found for round ${currentRound}. Proceeding to normal game flow.`);
        }
      }
    }
  }, [gameState.currentTurn, gameState.currentPhase, loading, textsLoading, error, logic, content, texts, showRoundNarrative, showPreStep1Intro]);


  // Completion screen
  if (gameState.currentPhase === 'complete') {
    return (
      <div className="app">
        <TopBar
          currentRound={gameState.currentTurn}
          completedRounds={gameState.completedSteps}
          currentLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <main className="app-main">
          <div className="completion-screen">
            <h2>{content.ui.finalScreen.title}</h2>
            <p>{content.ui.finalScreen.subtitle}</p>
            
            <div className="final-map">
              <MapCanvas
                areas={gameState.areas}
                logic={logic}
                highlightedArea={null}
                animationProgress={1}
                currentTurn={gameState.currentTurn}
              />
            </div>

            <div className="final-stats">
              <h3>Final Rankings</h3>
              {[...gameState.areas]
                .sort((a, b) => b.power - a.power)
                .map((area, index) => (
                  <div key={area.id} className="final-stat-row">
                    <span className="rank">#{index + 1}</span>
                    <span className="area-name">{content.ui.areaLabels[area.id]}</span>
                    <span className="area-power">Power: {area.power.toFixed(1)}</span>
                  </div>
                ))}
            </div>

            <button 
              className="restart-button" 
              onClick={() => {
                if ((window as any).playClickSound) {
                  (window as any).playClickSound();
                }
                handleRestart();
              }}
            >
              {content.ui.finalScreen.restart}
            </button>
          </div>
        </main>
        <GameFooter
          currentRound={gameState.currentTurn}
          currentLanguage={selectedLanguage}
          getCurrentScreenText={getCurrentScreenText}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <TopBar
        currentRound={gameState.currentTurn}
        completedRounds={gameState.completedSteps}
        currentLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />
      <main className="app-main">
        <section className="game-section">
          <h2 className="step-title">
            {currentStep?.title || 'Unknown Step'}
          </h2>

          <DebugPanel areas={gameState.areas} choicesLog={choicesLog} />
          
          <div className="content-wrapper">
            <div id="map-container">
              <MapCanvas
              areas={gameState.areas}
              logic={logic}
              highlightedArea={gameState.highlightedArea}
              animationProgress={animationProgress}
              currentTurn={gameState.currentTurn}
              onSelect={currentStep ? handleAreaSelect : undefined}
              onHover={currentStep ? setHighlightedArea : undefined}
              disabled={!currentStep || gameState.currentPhase !== 'phase2'}
              hasSelected={gameState.currentPhase !== 'phase2'}
              />
            </div>

            {gameState.currentPhase === 'phase1' && currentStep && (
              <PhaseContent
                phase="phase1"
                content={currentStep.phase1Text}
                onContinue={handlePhase1Continue}
              />
            )}
          </div>

          {currentStep && (
            <ChoiceButtons
              areas={gameState.areas}
              labels={content.ui.areaLabels}
              question={currentStep.choiceQuestion}
              onSelect={handleAreaSelect}
              onHover={setHighlightedArea}
              texts={texts || undefined}
            />
          )}

          {gameState.currentPhase === 'phase3' && currentStep && (
            <div className="content-wrapper">
              <PhaseContent
                phase="phase3"
                content={currentStep.phase3}
                onContinue={handlePhase3Continue}
              />
            </div>
          )}
        </section>
      </main>

      <Toast
        message={toastMessage}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
      <GameFooter
        currentRound={gameState.currentTurn}
        currentLanguage={selectedLanguage}
        getCurrentScreenText={getCurrentScreenText}
      />
    </div>
  );
}

export default App;

