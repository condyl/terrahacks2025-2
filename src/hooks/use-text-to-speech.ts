import { useState, useCallback } from 'react';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Clean text for speech (remove markdown formatting)
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\n+/g, '. ') // Replace line breaks with pauses
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice settings for a gentle, caring tone
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 0.8; // Slightly quieter

    // Try to find a pleasant voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Google') ||
      voice.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  return { speak, stop, isPlaying, isSupported };
}