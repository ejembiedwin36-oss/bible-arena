import type { VoiceIntent } from './voiceIntent';

export type LanguageUnderstandingRequest = {
  transcript: string;
  languageCode: string;
};

export interface LanguageUnderstandingProvider {
  understand(request: LanguageUnderstandingRequest): Promise<VoiceIntent>;
}

/**
 * Routes transcripts to a verified language-specific understanding provider.
 * Non-English languages intentionally fail closed until their vocabulary/model
 * has been validated with native speakers.
 */
export class LanguageUnderstandingRouter {
  constructor(
    private readonly providers: ReadonlyMap<string, LanguageUnderstandingProvider>,
  ) {}

  async understand(request: LanguageUnderstandingRequest): Promise<VoiceIntent> {
    const provider = this.providers.get(request.languageCode);
    if (!provider) return { type: 'unknown', transcript: request.transcript };
    return provider.understand(request);
  }
}
