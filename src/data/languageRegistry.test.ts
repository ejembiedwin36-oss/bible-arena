import { describe, expect, it } from 'vitest';
import { bibleArenaLanguages, getLanguage, getLanguagesByPriority } from './languageRegistry';

describe('Bible Arena language registry', () => {
  it('keeps English first and Idoma immediately after English', () => {
    const languages = getLanguagesByPriority();

    expect(languages[0].id).toBe('en');
    expect(languages[1].id).toBe('ido');
  });

  it('keeps the rollout list ordered by priority', () => {
    expect(bibleArenaLanguages.map((language) => language.priority)).toEqual(
      [...bibleArenaLanguages].map((language) => language.priority).sort((a, b) => a - b),
    );
  });

  it('tracks capabilities independently per language', () => {
    const english = getLanguage('en');
    const idoma = getLanguage('ido');

    expect(english?.capabilities.speechRecognition).toBe(true);
    expect(idoma?.capabilities.speechRecognition).toBe(false);
    expect(idoma?.capabilities.bibleText).toBe(false);
  });

  it('returns undefined for an unknown language', () => {
    expect(getLanguage('unknown')).toBeUndefined();
  });
});
