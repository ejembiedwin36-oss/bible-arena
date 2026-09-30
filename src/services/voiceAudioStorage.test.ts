import { describe, expect, it } from 'vitest';
import { SupabaseVoiceAudioStorage } from './voiceAudioStorage';

describe('SupabaseVoiceAudioStorage', () => {
  it('uploads audio under the authenticated user folder', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      expect(String(input)).toContain('/storage/v1/object/voice-audio/user-1/');
      expect(init?.method).toBe('POST');
      expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token');
      return new Response('', { status: 200 });
    };

    try {
      const storage = new SupabaseVoiceAudioStorage(
        'https://example.supabase.co',
        'token',
        'user-1',
      );

      const result = await storage.upload({
        languageCode: 'id',
        mimeType: 'audio/webm',
        blob: new Blob(['audio'], { type: 'audio/webm' }),
      });

      expect(result.languageCode).toBe('id');
      expect(result.storagePath).toMatch(/^user-1\/.+\.webm$/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
