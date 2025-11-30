import { useState, useEffect, useRef } from 'react';

// Music management for round-based background music
export const useMusic = (currentRound: number) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load music for the current round
  useEffect(() => {
    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create new audio element for current round
    const audio = new Audio(`/assets/audio/round${currentRound}.mp3`);
    audio.loop = true;
    audio.volume = 0.5; // Set volume to 50%
    
    // Handle errors gracefully (file might not exist)
    audio.addEventListener('error', () => {
      console.warn(`Music file for round ${currentRound} not found or failed to load`);
    });

    audioRef.current = audio;

    // If music was playing, continue playing with new track
    if (isPlaying) {
      audio.play().catch(err => {
        console.warn('Failed to play music:', err);
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentRound]);

  // Sync playback state with isPlaying
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn('Failed to play music:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const toggleMusic = () => {
    setIsPlaying(prev => !prev);
  };

  return { isPlaying, toggleMusic };
};

// SFX management for button click sounds
export const useSFX = () => {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  // Load click sound
  useEffect(() => {
    const audio = new Audio('/assets/audio/click.mp3');
    audio.volume = 0.3; // Set volume to 30%
    
    audio.addEventListener('error', () => {
      console.warn('SFX click sound file not found or failed to load');
    });

    clickSoundRef.current = audio;

    return () => {
      if (clickSoundRef.current) {
        clickSoundRef.current = null;
      }
    };
  }, []);

  const playClickSound = () => {
    if (sfxEnabled && clickSoundRef.current) {
      // Reset to start and play
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(err => {
        console.warn('Failed to play click sound:', err);
      });
    }
  };

  const toggleSFX = () => {
    setSfxEnabled(prev => !prev);
  };

  return { sfxEnabled, toggleSFX, playClickSound };
};



