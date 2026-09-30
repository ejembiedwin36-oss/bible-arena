export type VoiceInferenceOperation = 'recognize' | 'understand' | 'synthesize';

export type VoiceInferenceRequest = {
  operation: VoiceInferenceOperation;
  languageCode: string;
  audioReference?: string;
  transcript?: string;
  text?: string;
};

export type VoiceInferenceResponse = {
  transcript?: string;
  intent?: unknown;
  audioReference?: string;
};

/**
 * Server-side inference gateway contract.
 *
 * Provider credentials and model endpoints must stay outside the browser.
 * The concrete transport can later be implemented by a Supabase Edge
 * Function or another authenticated backend without changing the voice UI.
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

    if (!response.ok) {
      throw new Error(`Voice inference request failed with status ${response.status}.`);
    }

    return (await response.json()) as VoiceInferenceResponse;
  }
}
