import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Area, TurnLogic, LogicData, RoundSnapshot } from '../types';

// Types for steps configuration
interface ZoneDelta {
  powerDelta: number;
  accDelta: number;
}

interface StepConfig {
  step: number;
  zones: ZoneDelta[];
}

interface StepsConfig {
  steps: StepConfig[];
}

export const useGameState = (
  initialAreas: Area[],
  populationMultipliers?: { round7: number; round8: number }
) => {
  // Track how many times each zone has been chosen across all steps
  const [zoneChoiceCounts, setZoneChoiceCounts] = useState<Record<string, number>>({
    A1: 0,
    A2: 0,
    A3: 0,
    A4: 0,
    A5: 0
  });

  // Use ref to access current choice counts in callbacks without stale closures
  const zoneChoiceCountsRef = useRef<Record<string, number>>({
    A1: 0,
    A2: 0,
    A3: 0,
    A4: 0,
    A5: 0
  });

  // Cache for steps configuration
  const stepsConfigRef = useRef<StepsConfig | null>(null);
  // stepsConfigLoaded kept for potential future use
  const [_stepsConfigLoaded, setStepsConfigLoaded] = useState(false);
  
  // Track if initial Round 1 calculation has been done
  const hasInitializedRef = useRef(false);
  
  // Track which rounds have had their deltas applied
  // This prevents applying deltas multiple times for the same round
  const roundsWithDeltasAppliedRef = useRef<Set<number>>(new Set());

  // Load steps-config.json once on mount
  useEffect(() => {
    // Use base URL for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL;
    fetch(`${baseUrl}steps-config.json`)
      .then(response => response.json())
      .then((config: StepsConfig) => {
        stepsConfigRef.current = config;
        setStepsConfigLoaded(true);
      })
      .catch(error => {
        console.error('Failed to load steps-config.json:', error);
        stepsConfigRef.current = { steps: [] };
        setStepsConfigLoaded(true);
      });
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    currentTurn: 1,
    currentPhase: 'phase1',
    areas: JSON.parse(JSON.stringify(initialAreas)), // Deep copy
    completedSteps: [],
    selectedArea: null,
    highlightedArea: null,
    areaHistory: [] // History of area stats per round for population chart
  });

  // Helper function to create a snapshot of current area values
  // This captures Acc and Power values after each round completes
  // Population value calculation:
  // - Rounds 1-6: Acc * Power (default)
  // - Round 7: Acc * Power * multiplierRound7 (from logic.json)
  // - Round 8: Acc * Power * multiplierRound8 (from logic.json)
  // Multipliers are loaded from logic.json and allow visualization to show
  // population growth acceleration in later rounds without affecting game mechanics
  const createAreaSnapshot = useCallback((areas: Area[], round: number): RoundSnapshot => {
    // Determine multiplier based on round number
    // Rounds 1-6 use multiplier 1.0 (no change)
    // Round 7 and 8 use multipliers from logic.json if available
    let multiplier = 1.0;
    
    if (populationMultipliers) {
      if (round === 7) {
        multiplier = populationMultipliers.round7;
      } else if (round === 8) {
        multiplier = populationMultipliers.round8;
      }
      // For rounds 1-6 and 0, multiplier remains 1.0 (default behavior)
    }
    
    return {
      round,
      areas: areas.map(area => ({
        areaId: area.id,
        acc: area.acc,
        power: area.power,
        populationValue: area.acc * area.power * multiplier
      }))
    };
  }, [populationMultipliers]);

  // Generate random delta for steps > 2 if not in config
  // Uses step number as seed for deterministic randomness
  const generateRandomDelta = (stepNumber: number, zoneIndex: number): ZoneDelta => {
    // Simple seeded random function using step number and zone index
    // This ensures the same step/zone combination always generates the same delta
    const seed = (stepNumber * 1000 + zoneIndex * 100) % 10000;
    let random1 = (seed * 9301 + 49297) % 233280;
    random1 = (random1 * 9301 + 49297) % 233280; // Second pass for better distribution
    const normalized1 = random1 / 233280;
    
    let random2 = ((seed + 1) * 9301 + 49297) % 233280;
    random2 = (random2 * 9301 + 49297) % 233280;
    const normalized2 = random2 / 233280;
    
    // powerDelta in range [-0.8, 0.8]
    // accDelta in range [0.1, 1.0]
    return {
      powerDelta: (normalized1 * 1.6) - 0.8, // -0.8 to 0.8
      accDelta: (normalized2 * 0.9) + 0.1     // 0.1 to 1.0
    };
  };

  // Get base deltas for a specific step from config
  // Now supports steps 1-8 with explicit config values
  // For steps beyond 8, use the last available step config (step 8) as fallback
  const getStepDeltas = useCallback((stepNumber: number): ZoneDelta[] => {
    if (!stepsConfigRef.current) {
      // If config not loaded yet, return random deltas (deterministic based on step)
      return Array(5).fill(null).map((_, index) => generateRandomDelta(stepNumber, index));
    }

    // Find the step config for this step number
    const stepConfig = stepsConfigRef.current.steps.find(s => s.step === stepNumber);
    
    if (stepConfig) {
      return stepConfig.zones;
    }

    // If no config found (e.g., step > 8), use the last available step config as fallback
    // This ensures consistent behavior for steps beyond the configured range
    const steps = stepsConfigRef.current.steps;
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      return lastStep.zones;
    }

    // Fallback: generate random deltas if config is empty (should not happen)
    return Array(5).fill(null).map((_, index) => generateRandomDelta(stepNumber, index));
  }, []);

  // Calculate zone power and acceleration for a given step
  // Formula: currentValue + roundDelta
  // Choice bonus is applied separately in selectArea, not here
  // For Round 1 start: uses initial values from logic.json
  // For Round 2+: accumulates from current values
  // Currently unused - removed to fix TypeScript errors
  // If needed in future, can be restored from git history

  // Keep ref in sync with state
  useEffect(() => {
    zoneChoiceCountsRef.current = zoneChoiceCounts;
  }, [zoneChoiceCounts]);

  // Update areas when initialAreas changes (when data loads)
  // Initialize from logic.json values WITHOUT applying any round deltas
  // Deltas are only applied when player makes a choice
  useEffect(() => {
    if (initialAreas.length > 0 && !hasInitializedRef.current) {
      setGameState(prev => {
        // Simply use initial values from logic.json (1.0/1.0 by default)
        // No deltas applied yet - they will be applied when player makes a choice
        const updatedAreas = initialAreas.map(initialArea => ({
          ...initialArea,
          power: initialArea.power, // Use value from logic.json
          acc: initialArea.acc      // Use value from logic.json
        }));

        // Mark as initialized
        hasInitializedRef.current = true;

        // Capture initial snapshot (round 0) before any rounds are played
        const initialSnapshot = createAreaSnapshot(updatedAreas, 0);

        return {
          ...prev,
          areas: updatedAreas,
          areaHistory: [initialSnapshot]
        };
      });
    }
  }, [initialAreas, createAreaSnapshot]);

  // REMOVED: No longer apply round deltas automatically when turn changes
  // Round deltas are now applied ONLY when player makes a choice (in selectArea)

  const setPhase = useCallback((phase: GameState['currentPhase']) => {
    setGameState(prev => ({ ...prev, currentPhase: phase }));
  }, []);

  const setHighlightedArea = useCallback((areaId: string | null) => {
    setGameState(prev => ({ ...prev, highlightedArea: areaId }));
  }, []);

  // selectArea: Apply round deltas to all zones (once per round), then apply choice bonus (+0.1) to chosen zone
  // turnLogic and logic are kept in signature for interface compatibility but not used in current implementation
  const selectArea = useCallback((areaId: string, _turnLogic: TurnLogic, _logic: LogicData) => {
    // Increment the choice count for the selected zone
    setZoneChoiceCounts(prevCounts => {
      const newChoiceCounts = {
        ...prevCounts,
        [areaId]: (prevCounts[areaId] || 0) + 1
      };
      
      // Update ref immediately
      zoneChoiceCountsRef.current = newChoiceCounts;

      // Update game state: Apply round deltas to ALL zones (once per round), then add choice bonus to chosen zone
      setGameState(prev => {
        const currentRound = prev.currentTurn;
        const areaIds = initialAreas.map(a => a.id);
        
        // Check if deltas have already been applied for this round
        const deltasAlreadyApplied = roundsWithDeltasAppliedRef.current.has(currentRound);
        
        // Get round deltas for current turn from steps-config.json
        const deltas = getStepDeltas(currentRound);
        
        // Step 1: Apply round deltas to all zones (only if not already applied this round)
        let updatedAreas = prev.areas;
        if (!deltasAlreadyApplied) {
          updatedAreas = prev.areas.map((area) => {
            const zoneIndex = areaIds.indexOf(area.id);
            const delta = deltas[zoneIndex];
            
            if (delta) {
              // Apply round delta to this zone
              return {
                ...area,
                power: area.power + (delta.powerDelta ?? 0),
                acc: area.acc + (delta.accDelta ?? 0)
              };
            }
            
            return area;
          });
          
          // Mark this round as having deltas applied
          roundsWithDeltasAppliedRef.current.add(currentRound);
        }
        
        // Step 2: Apply choice bonus (+0.1) to chosen zone
        updatedAreas = updatedAreas.map(area => {
          if (area.id === areaId) {
            return {
              ...area,
              power: area.power + 0.05,
              acc: area.acc + 0.05
            };
          }
          return area;
        });

        return {
          ...prev,
          areas: updatedAreas,
          selectedArea: areaId,
          currentPhase: 'phase3'
        };
      });

      return newChoiceCounts;
    });
  }, [getStepDeltas, initialAreas]);

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      const newTurn = prev.currentTurn + 1;
      const isComplete = newTurn > 8;
      
      // Capture snapshot of current area values before advancing to next turn
      // This records the state after the current round completes (Acc and Power after all deltas and bonuses applied)
      // Population value = Acc * Power for each center
      const currentRoundSnapshot = createAreaSnapshot(prev.areas, prev.currentTurn);
      
      // Add snapshot to history, but only if it's not already there (avoid duplicates)
      const historyWithoutCurrentRound = prev.areaHistory.filter(s => s.round !== prev.currentTurn);
      const updatedHistory = [...historyWithoutCurrentRound, currentRoundSnapshot].sort((a, b) => a.round - b.round);
      
      // Advance to next turn WITHOUT applying round deltas
      // Round deltas are only applied when player makes a choice in selectArea
      // Note: We don't clear roundsWithDeltasAppliedRef because we want to track
      // which rounds have had deltas applied to prevent re-application
      return {
        ...prev,
        currentTurn: isComplete ? prev.currentTurn : newTurn,
        currentPhase: isComplete ? 'complete' : 'phase1',
        completedSteps: [...prev.completedSteps, prev.currentTurn],
        selectedArea: null,
        highlightedArea: null,
        areaHistory: updatedHistory
        // Keep areas as-is - no deltas applied until choice is made
      };
    });
  }, [createAreaSnapshot]);

  const restartGame = useCallback(() => {
    // Reset choice counts
    const resetCounts = { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0 };
    setZoneChoiceCounts(resetCounts);
    zoneChoiceCountsRef.current = resetCounts;
    
    // Reset initialization flag
    hasInitializedRef.current = false;
    
    // Reset rounds with deltas applied
    roundsWithDeltasAppliedRef.current.clear();

    setGameState(() => {
      // Reset zones to initial values from logic.json (1.0/1.0 by default)
      // No deltas applied - they will be applied when player makes choices
      const updatedAreas = initialAreas.map(initialArea => ({
        ...initialArea,
        power: initialArea.power, // Use value from logic.json
        acc: initialArea.acc      // Use value from logic.json
      }));

      // Mark as initialized after restart
      hasInitializedRef.current = true;

      // Capture initial snapshot (round 0) on restart
      const initialSnapshot = createAreaSnapshot(updatedAreas, 0);

      return {
        currentTurn: 1,
        currentPhase: 'phase1',
        areas: updatedAreas,
        completedSteps: [],
        selectedArea: null,
        highlightedArea: null,
        areaHistory: [initialSnapshot]
      };
    });
  }, [initialAreas, createAreaSnapshot]);

  // Capture snapshot for current round without advancing
  // Used when transitioning to final screen to ensure round 8's snapshot is captured
  const captureCurrentSnapshot = useCallback(() => {
    setGameState(prev => {
      const currentRoundSnapshot = createAreaSnapshot(prev.areas, prev.currentTurn);
      
      // Add snapshot to history, but only if it's not already there (avoid duplicates)
      const historyWithoutCurrentRound = prev.areaHistory.filter(s => s.round !== prev.currentTurn);
      const updatedHistory = [...historyWithoutCurrentRound, currentRoundSnapshot].sort((a, b) => a.round - b.round);
      
      return {
        ...prev,
        areaHistory: updatedHistory
      };
    });
  }, [createAreaSnapshot]);

  // Mark a round as completed without advancing the turn or changing phase
  // Used when transitioning to final screens to ensure the current round is marked as completed
  const markCurrentRoundCompleted = useCallback(() => {
    setGameState(prev => {
      const currentRound = prev.currentTurn;
      // Only add if not already in completedSteps
      if (prev.completedSteps.includes(currentRound)) {
        return prev;
      }
      
      // Capture snapshot of current round before marking as completed
      const currentRoundSnapshot = createAreaSnapshot(prev.areas, currentRound);
      const historyWithoutCurrentRound = prev.areaHistory.filter(s => s.round !== currentRound);
      const updatedHistory = [...historyWithoutCurrentRound, currentRoundSnapshot].sort((a, b) => a.round - b.round);
      
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, currentRound],
        areaHistory: updatedHistory
      };
    });
  }, [createAreaSnapshot]);

  return {
    gameState,
    zoneChoiceCounts, // Expose choice counts for debug panel
    setPhase,
    setHighlightedArea,
    selectArea,
    nextTurn,
    restartGame,
    captureCurrentSnapshot, // Expose for capturing final snapshot
    markCurrentRoundCompleted // Expose for marking round as completed without advancing
  };
};
