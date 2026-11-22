import { describe, expect, it } from 'vitest';
import { prepareBibleVersionImport } from './prepare-bible-version-import.mjs';

const expected = { books: 2, chapters: 2, verses: 3 };
const chapterMap = [
  { book: 'Genesis', chapter: 1, chapter_id: 'chapter-gen-1' },
  { book: 'Exodus', chapter: 1, chapter_id: 'chapter-exo-1' },
];
const corpus = [
  { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning' },
  { book: 'Genesis', chapter: 1, verse: 2, text: 'The earth was' },
  { book: 'Exodus', chapter: 1, verse: 1, text: 'Now these are' },
];

describe('prepareBibleVersionImport', () => {
  it('maps valid normalized verses to existing chapter IDs', () => {
    const result = prepareBibleVersionImport(corpus, chapterMap, expected);
    expect(result.counts).toEqual(expected);
    expect(result.rows[0]).toEqual({ book: 'Genesis', chapter: 1, chapter_id: 'chapter-gen-1', verse_number: 1, text: 'In the beginning' });
  });
  it('rejects duplicate verse keys', () => {
    expect(() => prepareBibleVersionImport([...corpus, corpus[0]], chapterMap, { ...expected, verses: 4 }))
      .toThrow('Duplicate verse: Genesis 1:1.');
  });
  it('rejects missing chapter mappings', () => {
    expect(() => prepareBibleVersionImport(corpus, chapterMap.slice(0, 1), expected))
      .toThrow('Expected 2 chapter mappings; received 1.');
  });
  it('rejects incorrect corpus counts', () => {
    expect(() => prepareBibleVersionImport(corpus, chapterMap, { ...expected, verses: 4 }))
      .toThrow('Expected 4 verses; received 3.');
  });
  it('preserves explicitly supplied red-letter booleans only', () => {
    const input = corpus.map((row, index) => index === 0 ? { ...row, is_jesus_words: true } : row);
    const result = prepareBibleVersionImport(input, chapterMap, expected);
    expect(result.rows[0].is_jesus_words).toBe(true);
    expect(result.rows[1]).not.toHaveProperty('is_jesus_words');
  });
});