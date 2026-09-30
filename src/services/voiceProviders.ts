import type { VoiceIntent, VoiceIntentContext, VoiceIntentParser } from './voiceIntent';

export type VoiceRecognitionResult = {
  transcript: string;
  confidence?: number;
};

export interface SpeechRecognitionProvider {
  readonly kind: 'speech_recognition';
  supports(languageCode: string): boolean;
  start(languageCode: string): Promise<VoiceRecognitionResult>;
  stop(): Promise<void>;
}

export interface VoiceUnderstandingProvider {
  readonly kind: 'voice_understanding';
  supports(languageCode: string): boolean;
  parse(transcript: string, context: VoiceIntentContext): Promise<VoiceIntent>;
}

export interface SpeechSynthesisProvider {
  readonly kind: 'speech_synthesis';
  supports(languageCode: string): boolean;
  speak(text: string, languageCode: string): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Adapter used while a production recognition provider is being selected.
 * It deliberately exposes no fake microphone implementation.
 */
export class ParserBackedUnderstandingProvider implements VoiceUnderstandingProvider {
  readonly kind = 'voice_understanding' as const;

  constructor(private readonly parser: VoiceIntentParser) {}

  supports(languageCode: string): boolean {
    return Boolean(languageCode);
  }

  async parse(transcript: string, context: VoiceIntentContext): Promise<VoiceIntent> {
    return this.parser(transcript, context);
  }
}

export type VoiceProviderSet = {
  recognition?: SpeechRecognitionProvider;
  understanding?: VoiceUnderstandingProvider;
  synthesis?: SpeechSynthesisProvider;
};
