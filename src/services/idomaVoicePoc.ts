import type { VoiceIntent } from './voiceIntent';

export type IdomaVoicePocInput = {
  audioReference: string;
  expectedIntent?: VoiceIntent;
};

export type IdomaVoicePocResult = {
  status: 'not_configured' | 'ready_for_provider_test';
  languageCode: 'id';
  audioReference: string;
  expectedIntent?: VoiceIntent;
  notes: string[];
};

/**
 * Safe proof-of-concept boundary for Idoma voice.
 * No fake ASR/TTS result is returned here. A real provider adapter will be
 * attached only after its Idoma capabilities are verified with test audio.
 */
export function prepareIdomaVoicePoc(input: IdomaVoicePocInput): IdomaVoicePocResult {
  return {
    status: 'ready_for_provider_test',
    languageCode: 'id',
    audioReference: input.audioReference,
    expectedIntent: input.expectedIntent,
    notes: [
      'Use native-speaker Idoma recordings for evaluation.',
      'Measure recognition, intent accuracy, response quality, and speech synthesis separately.',
      'Do not mark Idoma production-ready until the complete hear-understand-respond-speak flow is verified.',
    ],
  };
}
