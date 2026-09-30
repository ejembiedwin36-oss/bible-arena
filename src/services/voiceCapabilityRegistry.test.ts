import { describe, expect, it } from 'vitest';
import { getVoiceCapability, isVoiceCapabilityAvailable, VOICE_CAPABILITY_REGISTRY } from './voiceCapabilityRegistry';

describe('voiceCapabilityRegistry', () => {
  it('keeps English first and Idoma second', () => {
    expect(VOICE_CAPABILITY_REGISTRY[0].languageCode).toBe('en');
    expect(VOICE_CAPABILITY_REGISTRY[1].languageCode).toBe('id');
  });

  it('does not claim Idoma voice capabilities without verification', () => {
    const idoma = getVoiceCapability('id');
    expect(idoma?.recognition).toBe('unverified');
    expect(idoma?.understanding).toBe('unverified');
    expect(idoma?.synthesis).toBe('unverified');
    expect(isVoiceCapabilityAvailable('id', 'recognition')).toBe(false);
  });

  it('supports explicit capability checks', () => {
    expect(isVoiceCapabilityAvailable('en', 'recognition')).toBe(true);
    expect(isVoiceCapabilityAvailable('en', 'understanding')).toBe(true);
    expect(isVoiceCapabilityAvailable('en', 'synthesis')).toBe(true);
  });
});
