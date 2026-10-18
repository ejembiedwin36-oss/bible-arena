export type IdomaAsrResult = {
  transcript: string;
  languageCode: 'idu';
  model?: string;
};

const DEFAULT_ENDPOINT = '/api/voice/idoma/transcribe';
// Keep browser uploads below Vercel Functions' 4.5 MB request-body ceiling.
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

/**
 * Sends recorded Idoma audio to Bible Arena's own server-side ASR proxy.
 * Cloud credentials must never be placed in browser code. The server owns
 * Runpod authentication and returns only the transcription result.
 */
export async function transcribeIdomaAudio(
  audio: Blob,
  endpoint = DEFAULT_ENDPOINT,
): Promise<IdomaAsrResult> {
  if (audio.size === 0) {
    throw new Error('No audio was recorded.');
  }

  if (audio.size > MAX_AUDIO_BYTES) {
    throw new Error('The audio recording is too large. Please record a shorter clip.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': audio.type || 'audio/webm',
    },
    body: audio,
  });

  const payload = await response.json().catch(() => null) as
    | (Partial<IdomaAsrResult> & { error?: string })
    | null;

  if (!response.ok) {
    const message = payload?.error || (response.status === 503
      ? 'Idoma speech recognition is not configured yet.'
      : `Idoma speech recognition failed with status ${response.status}.`);
    throw new Error(message);
  }

  if (!payload || typeof payload.transcript !== 'string' || payload.transcript.trim() === '') {
    throw new Error('Idoma speech recognition returned no transcript.');
  }

  if (payload.languageCode !== 'idu') {
    throw new Error('Idoma speech recognition returned an unexpected language.');
  }

  return {
    transcript: payload.transcript.trim(),
    languageCode: 'idu',
    model: typeof payload.model === 'string' ? payload.model : undefined,
  };
}
