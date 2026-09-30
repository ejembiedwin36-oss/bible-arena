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
      bibleLanguageId: 'ido',
      interfaceLanguageId: 'en',
      voiceInputLanguageId: 'ido',
      responseLanguageId: 'ido',
    });

    expect(preferences.bibleLanguageId).toBe('ido');
    expect(preferences.interfaceLanguageId).toBe('en');
    expect(preferences.voiceInputLanguageId).toBe('ido');
    expect(preferences.responseLanguageId).toBe('ido');
  });

  it('changes one preference without changing the others', () => {
    const original = createLanguagePreference({ bibleLanguageId: 'ido' });
    const updated = setResponseLanguage(original, 'ig');

    expect(updated).toEqual({
      bibleLanguageId: 'ido',
      interfaceLanguageId: 'en',
      voiceInputLanguageId: 'en',
      responseLanguageId: 'ig',
    });
    expect(original.responseLanguageId).toBe('en');
  });

  it('provides separate setters for each preference', () => {
    const original = createLanguagePreference();

    expect(setBibleLanguage(original, 'ido').bibleLanguageId).toBe('ido');
    expect(setInterfaceLanguage(original, 'yo').interfaceLanguageId).toBe('yo');
    expect(setVoiceInputLanguage(original, 'ha').voiceInputLanguageId).toBe('ha');
    expect(setResponseLanguage(original, 'tiv').responseLanguageId).toBe('tiv');
  });
});
