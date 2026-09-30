import { describe, expect, it } from 'vitest';
import { canRunVoiceTurn, selectVoiceProviders } from './voiceProviderSelection';
import type { VoiceProviderSet } from './voiceProviders';

const providers: VoiceProviderSet = {
  recognition: {
    kind: 'speech_recognition',
    supports: () => true,
    start: async () => ({ transcript: 'open Matthew' }),
    stop: async () => undefined,
  },
  understanding: {
    kind: 'voice_understanding',
    supports: () => true,
    parse: async () => ({ type: 'open_book', bookName: 'Matthew' }),
  },
  synthesis: {
    kind: 'speech_synthesis',
    supports: () => true,
    speak: async () => undefined,
    stop: async () => undefined,
  },
};

describe('voiceProviderSelection', () => {
  it('allows a fully verified language to use supported providers', () => {
    const selection = selectVoiceProviders('en', providers);

    expect(selection.available).toEqual({ recognition: true, understanding: true, synthesis: true });
    expect(canRunVoiceTurn('en', providers)).toBe(true);
  });

  it('does not treat Idoma as production voice-ready before verification', () => {
    const selection = selectVoiceProviders('id', providers);

    expect(selection.available).toEqual({ recognition: false, understanding: false, synthesis: false });
    expect(canRunVoiceTurn('id', providers)).toBe(false);
  });

  it('requires both recognition and understanding for a voice turn', () => {
    const selection = selectVoiceProviders('en', {
      ...providers,
      understanding: undefined,
    });

    expect(selection.available.recognition).toBe(true);
    expect(selection.available.understanding).toBe(false);
    expect(canRunVoiceTurn('en', { ...providers, understanding: undefined })).toBe(false);
  });
});
