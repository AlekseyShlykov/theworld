import React from 'react';
import './RoundIconsRow.css';

interface RoundIconsRowProps {
  currentRound: number;      // 1–8, the round that is currently running
  completedRounds: number[]; // e.g. [1, 2]
}

// Image mapping for each round
const ROUND_IMAGES = [
  'stone.png',      // Round 1
  'food.png',       // Round 2
  'cow.png',        // Round 3
  'alphabet.png',   // Round 4
  'continents.png', // Round 5
  'germs.png',      // Round 6
  'guns.png',       // Round 7
  'social.png',     // Round 8
];

export const RoundIconsRow: React.FC<RoundIconsRowProps> = ({
  currentRound,
  completedRounds
}) => {
  const getIconState = (roundIndex: number): 'locked' | 'active' | 'completed' => {
    const roundNumber = roundIndex + 1; // Convert 0-based index to 1-based round number
    
    // If round is in completedRounds, it's completed
    if (completedRounds.includes(roundNumber)) {
      return 'completed';
    }
    
    // If this is the current round, it's active
    if (roundNumber === currentRound) {
      return 'active';
    }
    
    // If round is before current round (and not in completedRounds), it's also completed
    if (roundNumber < currentRound) {
      return 'completed';
    }
    
    // Otherwise, it's locked
    return 'locked';
  };

  return (
    <div className="round-icons-row" role="navigation" aria-label="Round progress">
      {ROUND_IMAGES.map((image, index) => {
        const roundNumber = index + 1;
        const state = getIconState(index);
        
        return (
          <div
            key={roundNumber}
            className={`round-icon round-icon--${state}`}
            aria-label={`Round ${roundNumber}${state === 'completed' ? ' (completed)' : state === 'active' ? ' (active)' : ' (locked)'}`}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <div className="round-icon-circle">
              <img
                src={`/assets/${image}`}
                alt={`Round ${roundNumber} icon`}
                className="round-icon-image"
                onError={(e) => {
                  // Fallback if icon doesn't exist
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.textContent = roundNumber.toString();
                  }
                }}
              />
              {state === 'locked' && (
                <div className="round-icon-overlay" aria-hidden="true"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

