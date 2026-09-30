export type VoiceInferenceOperation = 'recognize' | 'understand' | 'synthesize';

export type VoiceInferenceRequest = {
  operation: VoiceInferenceOperation;
  languageCode: string;
  audioReference?: string;
  transcript?: string;
  text?: string;
};

export type VoiceInferenceResponse = {
  status?: string;
  transcript?: string;
  intent?: unknown;
  audioReference?: string;
  message?: string;
};

/**
 * Server-side inference gateway contract.
 *
 * Provider credentials and model endpoints stay outside the browser.
 * The concrete transport can be implemented by a Supabase Edge Function
 * or another authenticated backend without changing the voice UI.
 */
export interface VoiceInferenceGateway {
  infer(request: VoiceInferenceRequest): Promise<VoiceInferenceResponse>;
}

export class HttpVoiceInferenceGateway implements VoiceInferenceGateway {
  constructor(private readonly endpoint: string) {}

  async infer(request: VoiceInferenceRequest): Promise<VoiceInferenceResponse> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    let payload: VoiceInferenceResponse;
    try {
      payload = (await response.json()) as VoiceInferenceResponse;
    } catch {
      throw new Error(`Voice inference returned an invalid response (HTTP ${response.status}).`);
    }

    if (!response.ok) {
      throw new Error(payload.message ?? `Voice inference request failed with status ${response.status}.`);
    }

    return payload;
  }
}
