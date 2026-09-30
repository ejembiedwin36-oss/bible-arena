export type VoiceCapabilityStatus = 'planned' | 'available' | 'unverified';

export type VoiceLanguageCapability = {
  code: string;
  name: string;
  speechRecognition: VoiceCapabilityStatus;
  speechUnderstanding: VoiceCapabilityStatus;
  speechResponse: VoiceCapabilityStatus;
  speechSynthesis: VoiceCapabilityStatus;
};

/**
 * Language-first voice contract for Bible Arena.
 *
 * A language is not considered voice-ready just because text exists.
 * The four stages are tracked independently:
 *   hear → understand → respond → speak
 *
 * Provider-specific implementations should use this registry instead of
 * hard-coding Idoma or English into the voice UI.
 */
export const voiceLanguageCapabilities: VoiceLanguageCapability[] = [
  {
    code: 'en',
    name: 'English',
    speechRecognition: 'planned',
    speechUnderstanding: 'planned',
    speechResponse: 'planned',
    speechSynthesis: 'planned',
  },
  {
    code: 'id',
    name: 'Idoma',
    speechRecognition: 'planned',
    speechUnderstanding: 'planned',
    speechResponse: 'planned',
    speechSynthesis: 'planned',
  },
  {
    code: 'ig',
    name: 'Igbo',
    speechRecognition: 'planned',
    speechUnderstanding: 'planned',
    speechResponse: 'planned',
    speechSynthesis: 'planned',
  },
  {
    code: 'yo',
    name: 'Yoruba',
    speechRecognition: 'planned',
    speechUnderstanding: 'planned',
    speechResponse: 'planned',
    speechSynthesis: 'planned',
  },
  {
    code: 'ha',
    name: 'Hausa',
    speechRecognition: 'planned',
    speechUnderstanding: 'planned',
    speechResponse: 'planned',
    speechSynthesis: 'planned',
  },
  {
    code: 'tiv',
    name: 'Tiv',
    speechRecognition: 'planned',
    speechUnderstanding: 'planned',
    speechResponse: 'planned',
    speechSynthesis: 'planned',
  },
  {
    code: 'igl',
    name: 'Igala',
    speechRecognition: 'planned',
    speechUnderstanding: 'planned',
    speechResponse: 'planned',
    speechSynthesis: 'planned',
  },
  {
    code: 'efi',
    name: 'Efik / Calabar',
    speechRecognition: 'planned',
    speechUnderstanding: 'planned',
    speechResponse: 'planned',
    speechSynthesis: 'planned',
  },
];

export function getVoiceLanguageCapability(code: string) {
  return voiceLanguageCapabilities.find((language) => language.code === code) ?? null;
}

export function isVoiceConversationReady(code: string): boolean {
  const capability = getVoiceLanguageCapability(code);
  if (!capability) return false;

  return [
    capability.speechRecognition,
    capability.speechUnderstanding,
    capability.speechResponse,
    capability.speechSynthesis,
  ].every((status) => status === 'available');
}
