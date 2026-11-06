import { describe, expect, it } from 'vitest';
import { alignRedLetters, redLetterVerse } from './redLetterCorpus';
import john from '../data/redLetters/John.json';
import matthew from '../data/redLetters/Matthew.json';

describe('KJV red-letter marker alignment', () => {
  it('bundles the John 4:10 and 4:14 red-letter passages locally', () => {
    for (const verseNumber of ['10', '14']) {
      const verse = john['4'][verseNumber as '10' | '14'];
      expect(redLetterVerse(john, 4, Number(verseNumber), verse.text).some((part) => part.red)).toBe(true);
    }
  });

  it('bundles Matthew 5:8 red letters locally', () => {
    const verse = matthew['5']['8'];
    expect(redLetterVerse(matthew, 5, 8, verse.text)).toEqual([{ text: verse.text, red: true }]);
  });
  it('highlights Matthew 5:8 while preserving the exact verse', () => {
    const verse = 'Blessed are the pure in heart: for they shall see God.';
    const parts = alignRedLetters(verse, verse, [{ start: 0, end: 7 }, { start: 12, end: 54 }]);
    expect(parts.map((part) => part.text).join('')).toBe(verse);
    expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe('Blessedthe pure in heart: for they shall see God.');
  });

  it('keeps translated words red within Jesus speech but not in narration', () => {
    const verse = 'Narration: Blessed are the poor in spirit: for theirs is the kingdom of heaven.';
    const start = verse.indexOf('Blessed');
    const parts = alignRedLetters(verse, verse, [{ start, end: start + 7 }, { start: start + 12, end: verse.length }], [{ start: start + 8, end: start + 11 }]);
    expect(parts).toEqual([{ text: 'Narration: ', red: false }, { text: verse.slice(start), red: true }]);
  });

  it('does not color narration outside Jesus speech', () => {
    const verse = 'Jesus said, Peace be unto you.';
    const parts = alignRedLetters(verse, verse, [{ start: 12, end: verse.length }]);
    expect(parts[0]).toEqual({ text: 'Jesus said, ', red: false });
    expect(parts[1].red).toBe(true);
  });

  it('refuses mismatched text and invalid offsets', () => {
    expect(alignRedLetters('KJV wording', 'other wording', [{ start: 0, end: 3 }])).toEqual([{ text: 'other wording', red: false }]);
    expect(alignRedLetters('text', 'text', [{ start: 0, end: 99 }])).toEqual([{ text: 'text', red: false }]);
  });
});

import webMatthew from '../data/webRedLetters/Matthew.json';
import webJohn from '../data/webRedLetters/John.json';

describe('WEB red-letter annotations', () => {
  it('highlights Jesus speech in Matthew 5:8 with exact WEB text', () => {
    const verse = webMatthew['5']['8'];
    expect(redLetterVerse(webMatthew, 5, 8, verse.text)).toEqual([{ text: verse.text, red: true }]);
  });
  it('keeps John 3:3 narration black and speech red', () => {
    const verse = webJohn['3']['3'];
    const parts = redLetterVerse(webJohn, 3, 3, verse.text);
    expect(parts[0]).toEqual({ text: 'Jesus answered him, “', red: false });
    expect(parts.some(part => part.red)).toBe(true);
    expect(parts.map(part => part.text).join('')).toBe(verse.text);
  });
  it('does not invent WEB red letters in unreviewed verses', () => {
    expect(redLetterVerse(webJohn, 3, 2, 'Nicodemus spoke')).toEqual([{ text: 'Nicodemus spoke', red: false }]);
  });
  it('does not apply red letters when WEB wording changes', () => {
    expect(redLetterVerse(webMatthew, 5, 8, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});
