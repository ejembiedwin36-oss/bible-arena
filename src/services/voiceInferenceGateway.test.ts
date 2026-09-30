import { describe, expect, it } from 'vitest';
import { HttpVoiceInferenceGateway } from './voiceInferenceGateway';

describe('voiceInferenceGateway', () => {
  it('sends a structured inference request to the configured backend', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (_input, init) => {
      expect(init?.method).toBe('POST');
      expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(String(init?.body))).toEqual({
        operation: 'recognize',
        languageCode: 'id',
        audioReference: 'fixtures/idoma/example.wav',
      });

      return new Response(JSON.stringify({ transcript: 'example' }), { status: 200 });
    };

    try {
      const gateway = new HttpVoiceInferenceGateway('/api/voice/inference');
      await expect(
        gateway.infer({
          operation: 'recognize',
          languageCode: 'id',
          audioReference: 'fixtures/idoma/example.wav',
        }),
      ).resolves.toEqual({ transcript: 'example' });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('surfaces backend failures', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(null, { status: 502 });

    try {
      const gateway = new HttpVoiceInferenceGateway('/api/voice/inference');
      await expect(
        gateway.infer({ operation: 'synthesize', languageCode: 'id', text: 'hello' }),
      ).rejects.toThrow('status 502');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
