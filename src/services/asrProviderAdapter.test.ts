import { describe, expect, it } from 'vitest';
import { HttpAsrProviderAdapter, runAsrBenchmarkCase } from './asrProviderAdapter';

describe('HttpAsrProviderAdapter', () => {
  it('sends a benchmark case and returns the transcript', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (_input, init) => {
      expect(init?.method).toBe('POST');
      return new Response(JSON.stringify({ transcript: 'open Matthew chapter five' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const provider = new HttpAsrProviderAdapter('omnilingual', 'https://asr.example.test');
      const result = await runAsrBenchmarkCase(
        {
          id: 'case-1',
          languageCode: 'id',
          audioReference: 'user-1/case-1.wav',
          expectedTranscript: 'open Matthew chapter five',
        },
        provider,
      );

      expect(result.status).toBe('completed');
      expect(result.transcript).toBe('open Matthew chapter five');
      expect(result.wordErrorRate).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('reports provider failures without pretending the test passed', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response('bad gateway', { status: 502 });

    try {
      const provider = new HttpAsrProviderAdapter('idoma-specialist', 'https://asr.example.test');
      const result = await runAsrBenchmarkCase(
        { id: 'case-2', languageCode: 'id', audioReference: 'user-1/case-2.wav' },
        provider,
      );

      expect(result.status).toBe('failed');
      expect(result.error).toContain('502');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
