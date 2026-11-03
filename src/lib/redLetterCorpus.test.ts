import { describe, expect, it } from 'vitest';
import { alignRedLetters } from './redLetterCorpus';

describe('KJV red-letter marker alignment', () => {
  it('highlights Matthew 5:8 while preserving the exact verse', () => {
    const verse = 'Blessed are the pure in heart: for they shall see God.';
    const parts = alignRedLetters(verse, verse, [{ start: 0, end: 7 }, { start: 12, end: 54 }]);
    expect(parts.map((part) => part.text).join('')).toBe(verse);
    expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe('Blessed the pure in heart: for they shall see God.');
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
