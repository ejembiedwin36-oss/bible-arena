import { describe, expect, it } from 'vitest';
import {
  createLanguagePreference,
  setBibleLanguage,
  setInterfaceLanguage,
  setResponseLanguage,
  setVoiceInputLanguage,
} from './languagePreferences';

describe('language preferences', () => {
  it('uses English by default', () => {
    expect(createLanguagePreference()).toEqual({
      bibleLanguageId: 'en',
      interfaceLanguageId: 'en',
      voiceInputLanguageId: 'en',
      responseLanguageId: 'en',
    });
  });

  it('allows Bible, interface, voice, and response languages to differ', () => {
    const preferences = createLanguagePreference({
      bibleLanguageId: 'id',
      interfaceLanguageId: 'en',
      voiceInputLanguageId: 'id',
      responseLanguageId: 'id',
    });

    expect(preferences.bibleLanguageId).toBe('id');
    expect(preferences.interfaceLanguageId).toBe('en');
    expect(preferences.voiceInputLanguageId).toBe('id');
    expect(preferences.responseLanguageId).toBe('id');
  });

  it('changes one preference without changing the others', () => {
    const original = createLanguagePreference({ bibleLanguageId: 'id' });
    const updated = setResponseLanguage(original, 'ig');

    expect(updated).toEqual({
      bibleLanguageId: 'id',
      interfaceLanguageId: 'en',
      voiceInputLanguageId: 'en',
      responseLanguageId: 'ig',
    });
    expect(original.responseLanguageId).toBe('en');
  });

  it('provides separate setters for each preference', () => {
    const original = createLanguagePreference();

    expect(setBibleLanguage(original, 'id').bibleLanguageId).toBe('id');
    expect(setInterfaceLanguage(original, 'yo').interfaceLanguageId).toBe('yo');
    expect(setVoiceInputLanguage(original, 'ha').voiceInputLanguageId).toBe('ha');
    expect(setResponseLanguage(original, 'tiv').responseLanguageId).toBe('tiv');
  });
});
