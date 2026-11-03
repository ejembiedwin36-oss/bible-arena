import { describe, expect, it } from 'vitest';
import { alignRedLetters } from './redLetterCorpus';

describe('full KJV red-letter alignment', () => {
  it('marks Jesus words while preserving narration and verse text', () => {
    const text = 'And Jesus answering said unto him, Suffer it to be so now: for thus it becometh us to fulfil all righteousness. Then he suffered him.';
    const source = 'And Jesus answering said unto him, {Suffer [it to be so] now: for thus it becometh us to fulfil all righteousness.} Then he suffered him.';
    const parts = alignRedLetters(source, text);
    expect(parts.map((part) => part.text).join('')).toBe(text);
    expect(parts.some((part) => part.red && part.text.includes('Suffer'))).toBe(true);
    expect(parts[0].red).toBe(false);
    expect(parts[parts.length - 1].red).toBe(false);
  });

  it('marks Matthew 5:8 entirely red when the KJV words match', () => {
    const verse = 'Blessed are the pure in heart: for they shall see God.';
    expect(alignRedLetters('{Blessed [are] the pure in heart: for they shall see God.}', verse)).toEqual([
      { text: verse, red: true },
    ]);
  });

  it('refuses to highlight text when the translation does not align', () => {
    expect(alignRedLetters('{I am the way}', 'I am a different translation')).toEqual([
      { text: 'I am a different translation', red: false },
    ]);
  });

  it('handles consecutive red and non-red segments without changing text', () => {
    const parts = alignRedLetters('He said {Peace be unto you} and departed.', 'He said Peace be unto you and departed.');
    expect(parts.map((part) => part.text).join('')).toBe('He said Peace be unto you and departed.');
    expect(parts.some((part) => part.red)).toBe(true);
  });
});
