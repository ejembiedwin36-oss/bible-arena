export type IdomaAsrResult = {
  transcript: string;
  languageCode: 'idu';
  model?: string;
};

const DEFAULT_ENDPOINT = '/api/voice/idoma/transcribe';
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

/**
 * Sends recorded Idoma audio to Bible Arena's own ASR backend.
 *
 * Hugging Face credentials must never be placed in browser code. The backend
 * owns model authentication and returns only the transcription result.
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

  const formData = new FormData();
  formData.append('audio', audio, 'idoma-recording.webm');
  formData.append('languageCode', 'idu');

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => null) as Partial<IdomaAsrResult> | null;

  if (!response.ok) {
    const message = response.status === 503
      ? 'Idoma speech recognition is not available yet.'
      : `Idoma speech recognition failed with status ${response.status}.`;
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
