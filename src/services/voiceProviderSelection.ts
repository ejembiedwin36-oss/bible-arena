import { getVoiceCapability, type VoiceCapability } from './voiceCapabilityRegistry';
import type { VoiceProviderSet } from './voiceProviders';

export type VoiceProviderSelection = {
  languageCode: string;
  provider: VoiceProviderSet;
  available: Record<VoiceCapability, boolean>;
};

/**
 * Select only providers whose language support has been explicitly marked
 * available in the registry. This prevents a provider from being used for a
 * language merely because its API accepts an arbitrary locale string.
 */
export function selectVoiceProviders(
  languageCode: string,
  provider: VoiceProviderSet,
): VoiceProviderSelection {
  const capabilities = getVoiceCapability(languageCode);

  const available = {
    recognition: capabilities?.recognition === 'available' && Boolean(provider.recognition?.supports(languageCode)),
    understanding: capabilities?.understanding === 'available' && Boolean(provider.understanding?.supports(languageCode)),
    synthesis: capabilities?.synthesis === 'available' && Boolean(provider.synthesis?.supports(languageCode)),
  };

  return {
    languageCode,
    provider: {
      recognition: available.recognition ? provider.recognition : undefined,
      understanding: available.understanding ? provider.understanding : undefined,
      synthesis: available.synthesis ? provider.synthesis : undefined,
    },
    available,
  };
}

export function canRunVoiceTurn(languageCode: string, provider: VoiceProviderSet): boolean {
  const selection = selectVoiceProviders(languageCode, provider);
  return selection.available.recognition && selection.available.understanding;
}
