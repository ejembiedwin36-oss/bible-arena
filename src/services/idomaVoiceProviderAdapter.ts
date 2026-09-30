import type { VoiceIntent } from './voiceIntent';
import type { SpeechRecognitionProvider, SpeechSynthesisProvider, VoiceUnderstandingProvider, VoiceRecognitionResult } from './voiceProviders';

export type IdomaVoiceAdapterConfig = {
  asrEndpoint?: string;
  ttsEndpoint?: string;
  understandingEndpoint?: string;
};

/**
 * Adapter boundary for the researched Idoma stack.
 *
 * This file intentionally does not call a provider yet. The public Idoma
 * models require deployment/evaluation before Bible Arena can safely depend
 * on them. Keeping the adapter here lets the real transport be added without
 * changing VoiceSession or the Reader.
 */
export class IdomaVoiceProviderAdapter implements SpeechRecognitionProvider, VoiceUnderstandingProvider, SpeechSynthesisProvider {
  readonly kind = 'speech_recognition' as const;
  readonly understandingKind = 'voice_understanding' as const;
  readonly synthesisKind = 'speech_synthesis' as const;
  readonly languageCode = 'id';

  constructor(private readonly config: IdomaVoiceAdapterConfig = {}) {}

  supports(languageCode: string): boolean {
    return languageCode === this.languageCode;
  }

  async start(languageCode: string): Promise<VoiceRecognitionResult> {
    this.assertLanguage(languageCode);
    if (!this.config.asrEndpoint) throw new Error('Idoma ASR endpoint is not configured.');
    throw new Error('Idoma ASR transport is not implemented yet; configure a verified provider adapter first.');
  }

  async stop(): Promise<void> {
    return undefined;
  }

  async parse(transcript: string): Promise<VoiceIntent> {
    if (!this.config.understandingEndpoint) {
      throw new Error('Idoma understanding endpoint is not configured.');
    }
    void transcript;
    throw new Error('Idoma understanding transport is not implemented yet.');
  }

  async speak(text: string, languageCode: string): Promise<void> {
    this.assertLanguage(languageCode);
    if (!this.config.ttsEndpoint) throw new Error('Idoma TTS endpoint is not configured.');
    void text;
    throw new Error('Idoma TTS transport is not implemented yet; configure a verified provider adapter first.');
  }

  async stopSynthesis(): Promise<void> {
    return undefined;
  }

  private assertLanguage(languageCode: string): void {
    if (!this.supports(languageCode)) {
      throw new Error(`Idoma provider cannot handle language "${languageCode}".`);
    }
  }
}
