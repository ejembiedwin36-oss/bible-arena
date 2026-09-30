import { describe, expect, it, vi } from 'vitest';
import { runVoiceTurn } from './voiceSession';
import type { VoiceProviderSet } from './voiceProviders';

describe('voiceSession', () => {
  it('runs hear -> understand -> act -> speak', async () => {
    const recognition = {
      kind: 'speech_recognition' as const,
      supports: () => true,
      start: vi.fn().mockResolvedValue({ transcript: 'Take me to Matthew chapter 5' }),
      stop: vi.fn().mockResolvedValue(undefined),
    };

    const understanding = {
      kind: 'voice_understanding' as const,
      supports: () => true,
      parse: vi.fn().mockResolvedValue({
        type: 'open_book_chapter' as const,
        bookName: 'Matthew',
        chapterNumber: 5,
      }),
    };

    const synthesis = {
      kind: 'speech_synthesis' as const,
      supports: () => true,
      speak: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    };

    const providers: VoiceProviderSet = { recognition, understanding, synthesis };
    const result = await runVoiceTurn(providers, 'id', async (intent) => {
      expect(intent.type).toBe('open_book_chapter');
      return 'Matthew chapter 5 is ready.';
    });

    expect(result.stage).toBe('idle');
    expect(result.transcript).toContain('Matthew chapter 5');
    expect(result.responseText).toBe('Matthew chapter 5 is ready.');
    expect(synthesis.speak).toHaveBeenCalledWith('Matthew chapter 5 is ready.', 'id');
    expect(recognition.stop).toHaveBeenCalledTimes(1);
  });

  it('can finish without speech synthesis when none is configured', async () => {
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
    };

    const result = await runVoiceTurn(providers, 'en', async () => 'Matthew is ready.');
    expect(result.responseText).toBe('Matthew is ready.');
  });

  it('returns an error state when recognition is not configured', async () => {
    const result = await runVoiceTurn({ understanding: {} as never }, 'id', async () => 'ok');
    expect(result.stage).toBe('error');
    expect(result.error?.message).toContain('speech recognition provider');
  });
});
