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
  return {
    ...DEFAULT_LANGUAGE_PREFERENCE,
    ...overrides,
  };
}

export function setBibleLanguage(
  preferences: LanguagePreference,
  languageId: string,
): LanguagePreference {
  return { ...preferences, bibleLanguageId: languageId };
}

export function setInterfaceLanguage(
  preferences: LanguagePreference,
  languageId: string,
): LanguagePreference {
  return { ...preferences, interfaceLanguageId: languageId };
}

export function setVoiceInputLanguage(
  preferences: LanguagePreference,
  languageId: string,
): LanguagePreference {
  return { ...preferences, voiceInputLanguageId: languageId };
}

export function setResponseLanguage(
  preferences: LanguagePreference,
  languageId: string,
): LanguagePreference {
  return { ...preferences, responseLanguageId: languageId };
}
