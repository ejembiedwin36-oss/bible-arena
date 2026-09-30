import type { VoiceInferenceGateway, VoiceInferenceRequest, VoiceInferenceResponse } from './voiceInferenceGateway';

export class SupabaseVoiceGateway implements VoiceInferenceGateway {
  constructor(
    private readonly supabaseUrl: string,
    private readonly accessToken: string,
  ) {}

  async infer(request: VoiceInferenceRequest): Promise<VoiceInferenceResponse> {
    const endpoint = `${this.supabaseUrl.replace(/\/$/, '')}/functions/v1/voice-inference`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(request),
    });

    let payload: VoiceInferenceResponse;
    try {
      payload = (await response.json()) as VoiceInferenceResponse;
    } catch {
      throw new Error(`Supabase voice gateway returned an invalid response (HTTP ${response.status}).`);
    }

    if (!response.ok) {
      throw new Error(payload.message ?? `Supabase voice gateway failed with status ${response.status}.`);
    }

    return payload;
  }
}
