import type { VoiceIntent, VoiceIntentContext } from './voiceIntent';
import type {
  SpeechRecognitionProvider,
  SpeechSynthesisProvider,
  VoiceUnderstandingProvider,
  VoiceProviderSet,
} from './voiceProviders';

export type VoiceSessionStage =
  | 'idle'
  | 'listening'
  | 'understanding'
  | 'acting'
  | 'speaking'
  | 'error';

export type VoiceSessionState = {
  stage: VoiceSessionStage;
  languageCode: string;
  transcript: string;
  intent: VoiceIntent | null;
  responseText: string;
  error: Error | null;
};

export type VoiceActionHandler = (
  intent: VoiceIntent,
  context: VoiceIntentContext,
) => Promise<string>;

export function createVoiceSessionState(languageCode: string): VoiceSessionState {
  return {
    stage: 'idle',
    languageCode,
    transcript: '',
    intent: null,
    responseText: '',
    error: null,
  };
}

export async function runVoiceTurn(
  providers: VoiceProviderSet,
  languageCode: string,
  handleIntent: VoiceActionHandler,
): Promise<VoiceSessionState> {
  const recognition = requireProvider(providers.recognition, 'speech recognition');
  const understanding = requireProvider(providers.understanding, 'voice understanding');

  let state = createVoiceSessionState(languageCode);

  try {
    state = { ...state, stage: 'listening' };
    const recognitionResult = await recognition.start(languageCode);
    state = { ...state, transcript: recognitionResult.transcript, stage: 'understanding' };

    const context = { languageCode };
    const intent = await understanding.parse(recognitionResult.transcript, context);
    state = { ...state, intent, stage: 'acting' };

    const responseText = await handleIntent(intent, context);
    state = { ...state, responseText };

    const synthesis = providers.synthesis;
    if (synthesis?.supports(languageCode)) {
      state = { ...state, stage: 'speaking' };
      await synthesis.speak(responseText, languageCode);
    }

    return { ...state, stage: synthesis?.supports(languageCode) ? 'idle' : 'acting' };
  } catch (cause) {
    return {
      ...state,
      stage: 'error',
      error: cause instanceof Error ? cause : new Error('Voice turn failed.'),
    };
  } finally {
    await recognition.stop().catch(() => undefined);
  }
}

function requireProvider<T>(provider: T | undefined, name: string): T {
  if (!provider) throw new Error(`${name} provider is not configured.`);
  return provider;
}

export type VoiceSessionDependencies = {
  recognition: SpeechRecognitionProvider;
  understanding: VoiceUnderstandingProvider;
  synthesis?: SpeechSynthesisProvider;
};
