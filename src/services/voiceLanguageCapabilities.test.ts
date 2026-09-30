import { describe, expect, it } from 'vitest';
import {
  getVoiceLanguageCapability,
  isVoiceConversationReady,
  voiceLanguageCapabilities,
} from './voiceLanguageCapabilities';

describe('voiceLanguageCapabilities', () => {
  it('keeps English first and Idoma immediately after it', () => {
    expect(voiceLanguageCapabilities[0]?.code).toBe('en');
    expect(voiceLanguageCapabilities[1]?.code).toBe('id');
  });

  it('tracks the four voice stages independently', () => {
    const idoma = getVoiceLanguageCapability('id');

    expect(idoma).not.toBeNull();
    expect(idoma).toMatchObject({
      speechRecognition: 'planned',
      speechUnderstanding: 'planned',
      speechResponse: 'planned',
      speechSynthesis: 'planned',
    });
  });

  it('does not claim voice conversation readiness before all stages are available', () => {
    expect(isVoiceConversationReady('id')).toBe(false);
    expect(isVoiceConversationReady('unknown')).toBe(false);
  });
});
