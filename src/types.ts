// Language type
export type Language = 'en' | 'ru';

// Game data types
export interface Area {
  id: string;
  start: { x: number; y: number };
  power: number;
  acc: number;
  color: string;
}

export interface LogicData {
  areas: Area[];
  opacityByRank: Record<string, number>;
  barrierThresholds: {
    river: number;
    mountain: number;
    ocean: number;
  };
  turns: number;
  overlayAnimationMaxMs: number;
  baseGrowthRadius: number;
  growthMultiplier: number;
  clonePowerThreshold: number;
  populationMultipliers?: {
    round7: number;
    round8: number;
  };
}

export interface StepPhase3 {
  image: string | null;
  video: string | null;
  text: string;
}

export interface Step {
  id: number;
  icon: string;
  title: string;
  phase1Text: string;
  choiceQuestion: string;
  phase3: StepPhase3;
}

export interface LanguageData {
  ui: {
    title: string;
    subtitle: string;
    buttons: Record<string, string>;
    areaLabels: Record<string, string>;
    toast: {
      advanced: string;
      powerGain: string;
      accGain: string;
    };
    finalScreen: {
      title: string;
      subtitle: string;
      restart: string;
    };
  };
  steps: Step[];
}

export interface TurnChoice {
  powerDelta: number;
  accDelta: number;
}

export interface TurnLogic {
  [key: string]: {
    onChoose: Record<string, TurnChoice>;
  };
}

export type GamePhase = 'phase1' | 'phase2' | 'phase3' | 'complete' | 'finalMap' | 'finalEnding';

// History tracking for population chart
// Stores Acc and Power values for each area after each round completes
export interface AreaSnapshot {
  areaId: string;
  acc: number;
  power: number;
  // Population value calculation:
  // - Rounds 1-6: acc * power
  // - Round 7: acc * power * multiplierRound7 (from logic.json)
  // - Round 8: acc * power * multiplierRound8 (from logic.json)
  // Multipliers are applied only for visualization, not game mechanics
  populationValue: number;
}

export interface RoundSnapshot {
  round: number;
  areas: AreaSnapshot[];
}

export interface GameState {
  currentTurn: number;
  currentPhase: GamePhase;
  areas: Area[];
  completedSteps: number[];
  selectedArea: string | null;
  highlightedArea: string | null;
  areaHistory: RoundSnapshot[]; // History of area stats per round for population chart
}

