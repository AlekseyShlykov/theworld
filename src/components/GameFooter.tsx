import React from 'react';
import { useMusic, useSFX } from '../hooks/useAudio';
import { useTTS } from '../contexts/TTSContext';
import './GameFooter.css';

interface GameFooterProps {
  currentRound: number;
  currentLanguage: 'en' | 'ru';
  getCurrentScreenText: () => string;
}

interface FooterButtonProps {
  icon: string;
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
  ariaLabel: string;
}

const FooterButton: React.FC<FooterButtonProps> = ({ icon, onClick, isActive = false, ariaLabel }) => {
  return (
    <button
      className={`footer-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      <img src={icon} alt="" className="footer-icon" />
    </button>
  );
};

export const GameFooter: React.FC<GameFooterProps> = ({
  currentRound,
  currentLanguage: _currentLanguage,
  getCurrentScreenText: _getCurrentScreenText
}) => {
  const { isPlaying: isMusicPlaying, toggleMusic } = useMusic(currentRound);
  const { sfxEnabled, toggleSFX, playClickSound } = useSFX();
  const { isSpeechOn, setIsSpeechOn, stopSpeaking } = useTTS();

  const handleMusicClick = () => {
    playClickSound();
    toggleMusic();
  };

  const handleTTSClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    
    if (!isSpeechOn) {
      // Turn speech ON - useEffect in App.tsx will handle reading
      setIsSpeechOn(true);
    } else {
      // Turn speech OFF and stop reading
      setIsSpeechOn(false);
      stopSpeaking();
    }
  };

  const handleSFXClick = () => {
    // Don't play sound when toggling SFX itself
    toggleSFX();
  };

  const handleWebsiteClick = () => {
    playClickSound();
    window.open('https://buildtounderstand.dev/', '_blank');
  };

  const handleXClick = () => {
    playClickSound();
    window.open('https://x.com/buildtoundrstnd', '_blank');
  };

  const handleEmailClick = () => {
    playClickSound();
    window.location.href = 'mailto:buildtounderstand@gmail.com';
  };

  // Expose playClickSound to window for use in other components
  React.useEffect(() => {
    (window as any).playClickSound = playClickSound;
    return () => {
      delete (window as any).playClickSound;
    };
  }, [playClickSound]);

  return (
    <footer className="game-footer">
      <div className="footer-left">
        <FooterButton
          icon="/assets/music.png"
          onClick={handleMusicClick}
          isActive={isMusicPlaying}
          ariaLabel="Toggle background music"
        />
        <FooterButton
          icon="/assets/Speech.png"
          onClick={handleTTSClick}
          isActive={isSpeechOn}
          ariaLabel={isSpeechOn ? "Stop reading" : "Start reading"}
        />
        <FooterButton
          icon="/assets/sounds.png"
          onClick={handleSFXClick}
          isActive={sfxEnabled}
          ariaLabel="Toggle sound effects"
        />
      </div>

      <div className="footer-center">
        <span className="footer-credit">Created by Alex Shlykov</span>
      </div>

      <div className="footer-right">
        <FooterButton
          icon="/assets/web.png"
          onClick={handleWebsiteClick}
          ariaLabel="Visit my website"
        />
        <FooterButton
          icon="/assets/X.png"
          onClick={handleXClick}
          ariaLabel="Visit my X (Twitter)"
        />
        <FooterButton
          icon="/assets/letter.png"
          onClick={handleEmailClick}
          ariaLabel="Send email"
        />
      </div>
    </footer>
  );
};

