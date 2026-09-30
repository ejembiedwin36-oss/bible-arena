import { supabase } from '../lib/supabase';

export type LanguagePreference = {
  bibleLanguageId: string;
  interfaceLanguageId: string;
  voiceInputLanguageId: string;
  responseLanguageId: string;
};

export const DEFAULT_LANGUAGE_PREFERENCE: LanguagePreference = {
  bibleLanguageId: 'en',
  interfaceLanguageId: 'en',
  voiceInputLanguageId: 'en',
  responseLanguageId: 'en',
};

export function createLanguagePreference(
  overrides: Partial<LanguagePreference> = {},
): LanguagePreference {
  return { ...DEFAULT_LANGUAGE_PREFERENCE, ...overrides };
}

export function setBibleLanguage(preferences: LanguagePreference, languageId: string): LanguagePreference {
  return { ...preferences, bibleLanguageId: languageId };
}

export function setInterfaceLanguage(preferences: LanguagePreference, languageId: string): LanguagePreference {
  return { ...preferences, interfaceLanguageId: languageId };
}

export function setVoiceInputLanguage(preferences: LanguagePreference, languageId: string): LanguagePreference {
  return { ...preferences, voiceInputLanguageId: languageId };
}

export function setResponseLanguage(preferences: LanguagePreference, languageId: string): LanguagePreference {
  return { ...preferences, responseLanguageId: languageId };
}

export async function loadLanguagePreferences(userId: string): Promise<LanguagePreference> {
  const { data, error } = await supabase
    .from('profiles')
    .select('preferred_language_code, interface_language_code, voice_input_language_code, response_audio_language_code')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;

  return createLanguagePreference({
    bibleLanguageId: data?.preferred_language_code ?? undefined,
    interfaceLanguageId: data?.interface_language_code ?? undefined,
    voiceInputLanguageId: data?.voice_input_language_code ?? undefined,
    responseLanguageId: data?.response_audio_language_code ?? undefined,
  });
}

export async function saveLanguagePreferences(userId: string, preferences: LanguagePreference) {
  const { error } = await supabase
    .from('profiles')
    .update({
      preferred_language_code: preferences.bibleLanguageId,
      interface_language_code: preferences.interfaceLanguageId,
      voice_input_language_code: preferences.voiceInputLanguageId,
      response_audio_language_code: preferences.responseLanguageId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}
