import { useState, useEffect, useRef } from 'react';

// Singleton audio instance for background music
// This ensures only one audio element exists across the entire app
let globalAudioInstance: HTMLAudioElement | null = null;
let globalIsPlaying = false;
let globalListeners: Set<(isPlaying: boolean) => void> = new Set();

// Music management - always plays round1.mp3 continuously
// currentRound parameter kept for backward compatibility but not used
export const useMusic = (_currentRound: number) => {
  const [isPlaying, setIsPlaying] = useState(globalIsPlaying);
  const hasInitializedRef = useRef(false);

  // Initialize global audio instance once
  useEffect(() => {
    if (!globalAudioInstance && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      const baseUrl = import.meta.env.BASE_URL;
      const audio = new Audio(`${baseUrl}assets/audio/round1.mp3`);
      audio.loop = true; // Loop continuously
      audio.volume = 0.5; // Set volume to 50%
      
      // Handle errors gracefully
      audio.addEventListener('error', () => {
        console.warn('Background music file (round1.mp3) not found or failed to load');
      });

      // Add ended event listener as fallback to ensure continuous looping
      // This ensures the track restarts even if the loop property doesn't work
      audio.addEventListener('ended', () => {
        if (globalIsPlaying && globalAudioInstance) {
          globalAudioInstance.currentTime = 0;
          globalAudioInstance.play().catch(err => {
            console.warn('Failed to restart background music:', err);
          });
        }
      });

      globalAudioInstance = audio;
      // Music is off by default; user can turn it on via the footer button
    }

    // Register this component as a listener for global state changes
    const updateListener = (newIsPlaying: boolean) => {
      setIsPlaying(newIsPlaying);
    };
    globalListeners.add(updateListener);

    return () => {
      globalListeners.delete(updateListener);
    };
  }, []); // Only run once on mount

  // Sync playback state with isPlaying
  // This connects the footer button state to audio playback
  useEffect(() => {
    if (globalAudioInstance) {
      if (isPlaying && !globalIsPlaying) {
        // Button is ON: Start playing from the beginning
        globalAudioInstance.currentTime = 0; // Reset to start
        globalAudioInstance.play().catch(err => {
          console.warn('Failed to play music:', err);
          setIsPlaying(false);
        }).then(() => {
          if (!globalAudioInstance?.paused) {
            globalIsPlaying = true;
            globalListeners.forEach(listener => listener(true));
          }
        });
      } else if (!isPlaying && globalIsPlaying) {
        // Button is OFF: Stop immediately and reset to beginning
        globalAudioInstance.pause();
        globalAudioInstance.currentTime = 0; // Reset to start
        globalIsPlaying = false;
        globalListeners.forEach(listener => listener(false));
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
    const baseUrl = import.meta.env.BASE_URL;
    const audio = new Audio(`${baseUrl}assets/audio/click.mp3`);
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



