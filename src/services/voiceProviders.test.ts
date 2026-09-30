import { describe, expect, it, vi } from 'vitest';
import { ParserBackedUnderstandingProvider, type SpeechRecognitionProvider, type SpeechSynthesisProvider } from './voiceProviders';

describe('voiceProviders', () => {
  it('adapts the existing intent parser without pretending to be speech recognition', async () => {
    const parser = vi.fn().mockReturnValue({
      type: 'open_book',
      bookName: 'Matthew',
    });

    const provider = new ParserBackedUnderstandingProvider(parser);
    const result = await provider.parse('open Matthew', { languageCode: 'en' });

    expect(provider.kind).toBe('voice_understanding');
    expect(provider.supports('id')).toBe(true);
    expect(result).toEqual({ type: 'open_book', bookName: 'Matthew' });
    expect(parser).toHaveBeenCalledWith('open Matthew', { languageCode: 'en' });
  });

  it('keeps recognition and synthesis as explicit provider contracts', () => {
    const recognition: SpeechRecognitionProvider = {
      kind: 'speech_recognition',
      supports: () => true,
      start: async () => ({ transcript: 'open Matthew' }),
      stop: async () => undefined,
    };

    const synthesis: SpeechSynthesisProvider = {
      kind: 'speech_synthesis',
      supports: () => true,
      speak: async () => undefined,
      stop: async () => undefined,
    };

    expect(recognition.kind).toBe('speech_recognition');
    expect(synthesis.kind).toBe('speech_synthesis');
  });
});
