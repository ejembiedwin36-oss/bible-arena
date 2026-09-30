import type { VoiceCapabilityStatus } from './voiceLanguageCapabilities';

export type VoiceCapability = 'recognition' | 'understanding' | 'synthesis';

export type VoiceCapabilityRecord = {
  languageCode: string;
  languageName: string;
  recognition: VoiceCapabilityStatus;
  understanding: VoiceCapabilityStatus;
  synthesis: VoiceCapabilityStatus;
  notes?: string;
  evidence?: string[];
};

/**
 * Production safety rule: a language is never treated as voice-ready by
 * assumption. Each capability must be explicitly verified for the selected
 * provider and locale.
 */
export const VOICE_CAPABILITY_REGISTRY: VoiceCapabilityRecord[] = [
  {
    languageCode: 'en',
    languageName: 'English',
    recognition: 'available',
    understanding: 'available',
    synthesis: 'available',
    notes: 'Baseline production voice language.',
  },
  {
    languageCode: 'id',
    languageName: 'Idoma',
    recognition: 'unverified',
    understanding: 'unverified',
    synthesis: 'unverified',
    notes: 'Priority language. Must be validated with real Idoma speech samples and native-speaker review before production claims.',
  },
  {
    languageCode: 'ig',
    languageName: 'Igbo',
    recognition: 'unverified',
    understanding: 'unverified',
    synthesis: 'unverified',
  },
  {
    languageCode: 'yo',
    languageName: 'Yoruba',
    recognition: 'unverified',
    understanding: 'unverified',
    synthesis: 'unverified',
  },
  {
    languageCode: 'ha',
    languageName: 'Hausa',
    recognition: 'unverified',
    understanding: 'unverified',
    synthesis: 'unverified',
  },
  {
    languageCode: 'tiv',
    languageName: 'Tiv',
    recognition: 'unverified',
    understanding: 'unverified',
    synthesis: 'unverified',
  },
  {
    languageCode: 'igl',
    languageName: 'Igala',
    recognition: 'unverified',
    understanding: 'unverified',
    synthesis: 'unverified',
  },
  {
    languageCode: 'calabar',
    languageName: 'Efik / Calabar',
    recognition: 'unverified',
    understanding: 'unverified',
    synthesis: 'unverified',
  },
];

export function getVoiceCapability(languageCode: string): VoiceCapabilityRecord | undefined {
  return VOICE_CAPABILITY_REGISTRY.find((entry) => entry.languageCode === languageCode);
}

export function isVoiceCapabilityAvailable(
  languageCode: string,
  capability: VoiceCapability,
): boolean {
  return getVoiceCapability(languageCode)?.[capability] === 'available';
}
