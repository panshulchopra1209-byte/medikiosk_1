/**
 * URSA AI Clinical Speech Engine
 * Voice-enabled multimodal assistant for MediKiosk
 * Provides text-to-speech audio guidance and speech recognition across Indian languages.
 */

import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

export const URSA_ASSISTANT_NAME = 'URSA';

export const LANGUAGE_BCP47_MAP: Record<LanguageCode, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
};

// Global Audio Muted Tracking (Strictly controlled by the header button on top)
let isAudioMutedGlobal: boolean = (() => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('medikiosk_audio_muted');
      if (stored !== null) return stored === 'true';
    } catch {}
  }
  return false;
})();

export function setGlobalAudioMuted(muted: boolean): void {
  isAudioMutedGlobal = muted;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('medikiosk_audio_muted', String(muted));
    } catch {}
  }
  if (muted) {
    stopSpeaking();
  }
}

export function isAudioGloballyMuted(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('medikiosk_audio_muted');
      if (stored !== null) return stored === 'true';
    } catch {}
  }
  return isAudioMutedGlobal;
}

// Text to Speech for Voice Assistant
export function speakPrompt(
  text: string,
  language: LanguageCode = 'en',
  onEnd?: () => void
): boolean {
  // If voice assistant is muted via the button on top, strictly remain muted
  if (isAudioGloballyMuted()) {
    if (onEnd) onEnd();
    return false;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this device');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = LANGUAGE_BCP47_MAP[language] || 'en-IN';
    utterance.lang = targetLang;
    utterance.rate = 0.93; // Slightly measured pace for clear patient comprehension
    utterance.pitch = 1.05; // Friendly, professional medical tone

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const assistantVoice = voices.find(
      (v) =>
        (v.lang === targetLang && (v.name.includes('Natural') || v.name.includes('India')))
    ) || voices.find((v) => v.lang.startsWith(language) || v.lang.includes(targetLang));

    if (assistantVoice) {
      utterance.voice = assistantVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    if (onEnd) onEnd();
    return false;
  }
}

// Speak language change announcement
export function announceUrsaLanguageChange(language: LanguageCode, audioMuted: boolean): void {
  if (audioMuted || isAudioGloballyMuted()) return;
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  speakPrompt(t.ursaLangChangedSpeech, language);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Browser Speech-to-Text Recognition Hook for URSA
export function createSpeechRecognizer(
  language: LanguageCode,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  try {
    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = LANGUAGE_BCP47_MAP[language] || 'en-IN';

    recognizer.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      onResult(text, Boolean(finalTranscript));
    };

    recognizer.onerror = (event: any) => {
      console.warn('URSA speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    return recognizer;
  } catch (err) {
    console.warn('Could not instantiate SpeechRecognition for URSA:', err);
    return null;
  }
}
