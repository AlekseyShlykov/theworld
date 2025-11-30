import React from 'react';
import { StepPhase3 } from '../types';
import { UnifiedTextBlock } from './UnifiedTextBlock';

interface PhaseContentProps {
  phase: 'phase1' | 'phase3';
  content: string | StepPhase3;
  onContinue?: () => void;
}

export const PhaseContent: React.FC<PhaseContentProps> = ({
  phase,
  content,
  onContinue
}) => {
  if (phase === 'phase1') {
    return (
      <div className="phase-content phase1" role="article">
        <UnifiedTextBlock text={content as string} />
        {onContinue && (
          <button
            className="continue-button"
            onClick={() => {
              if ((window as any).playClickSound) {
                (window as any).playClickSound();
              }
              onContinue();
            }}
            aria-label="Continue to make choice"
          >
            Continue →
          </button>
        )}
      </div>
    );
  }

  // Phase 3
  const phase3Content = content as StepPhase3;
  
  return (
    <div className="phase-content phase3" role="article">
      {phase3Content.image && (
        <div className="media-container">
          <img
            src={`/assets/${phase3Content.image}`}
            alt="Historical illustration"
            className="phase3-media"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      {phase3Content.video && (
        <div className="media-container">
          <video
            src={`/assets/${phase3Content.video}`}
            controls
            className="phase3-media"
            aria-label="Historical video"
          >
            <track kind="captions" label="English captions" />
            Your browser does not support video playback.
          </video>
        </div>
      )}
      <div className="phase3-text">
        <UnifiedTextBlock text={phase3Content.text} />
      </div>
      {onContinue && (
        <button
          className="continue-button"
          onClick={() => {
            if ((window as any).playClickSound) {
              (window as any).playClickSound();
            }
            onContinue();
          }}
          aria-label="Continue to next turn"
        >
          Next Turn →
        </button>
      )}
    </div>
  );
};

