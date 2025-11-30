import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TTSContextType {
  isSpeechOn: boolean;
  setIsSpeechOn: (value: boolean) => void;
  speakText: (text: string, language: 'en' | 'ru') => void;
  stopSpeaking: () => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export const TTSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSpeechOn, setIsSpeechOn] = useState(false);

  const speakText = useCallback((text: string, language: 'en' | 'ru') => {
    if (!text || text.trim() === '') {
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.error('[TTS] Speech synthesis is not supported in this browser');
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Helper function to actually speak
    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // Only proceed if we have voices loaded
      if (voices.length === 0) {
        console.log('[TTS] Still no voices, waiting...');
        return;
      }
      
      const cleanText = text.trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'ru' ? 'ru-RU' : 'en-US';
      
      // Get and set a voice
      const langPrefix = language === 'ru' ? 'ru' : 'en';
      const voice = voices.find(v => v.lang.startsWith(langPrefix)) || voices[0];
      
      if (voice) {
        utterance.voice = voice;
      }
      
      // Speak
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('[TTS] Exception calling speak():', error);
      }
    };

    // Check if voices are loaded
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      // Wait for voices to load
      const onVoicesChanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      
      // Fallback: try after a delay
      setTimeout(() => {
        if (window.speechSynthesis.onvoiceschanged === onVoicesChanged) {
          window.speechSynthesis.onvoiceschanged = null;
        }
        doSpeak();
      }, 500);
    } else {
      doSpeak();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return (
    <TTSContext.Provider value={{ isSpeechOn, setIsSpeechOn, speakText, stopSpeaking }}>
      {children}
    </TTSContext.Provider>
  );
};

export const useTTS = () => {
  const context = useContext(TTSContext);
  if (context === undefined) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
};
