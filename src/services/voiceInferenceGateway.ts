export type VoiceInferenceOperation = 'recognize' | 'understand' | 'synthesize';

export type VoiceInferenceRequest = {
  operation: VoiceInferenceOperation;
  languageCode: string;
  audioReference?: string;
  /** Base64-encoded audio for providers that accept JSON payloads. */
  audioBase64?: string;
  audioMimeType?: string;
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
 * Audio can be represented by a storage reference or a provider-safe
 * base64 payload during development. Production should prefer Storage
 * references for larger recordings rather than embedding large audio in JSON.
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
