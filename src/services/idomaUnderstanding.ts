import type { VoiceIntent } from './voiceIntent';
import type { LanguageUnderstandingProvider } from './languageUnderstanding';

/**
 * Idoma understanding provider boundary.
 *
 * This intentionally does not invent Idoma grammar or translate guessed
 * phrases. Verified Idoma examples, a trained model, or a reviewed command
 * vocabulary can be connected here later.
 */
export class IdomaUnderstandingProvider implements LanguageUnderstandingProvider {
  async understand(request: { transcript: string; languageCode: string }): Promise<VoiceIntent> {
    if (request.languageCode !== 'id') {
      return { type: 'unknown', transcript: request.transcript };
    }

    return {
      type: 'unknown',
      transcript: request.transcript,
    };
  }
}
