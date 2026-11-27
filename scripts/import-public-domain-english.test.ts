import { describe, expect, it } from 'vitest';
import { validatePreparedRows, importPublicDomainEdition } from './import-public-domain-english.mjs';

const expected = { books: 2, chapters: 2, verses: 3 };
const rows = [
  { book: 'Genesis', chapter: 1, chapter_id: 'chapter-gen-1', verse_number: 1, text: 'In the beginning' },
  { book: 'Genesis', chapter: 1, chapter_id: 'chapter-gen-1', verse_number: 2, text: 'The earth was' },
  { book: 'Exodus', chapter: 1, chapter_id: 'chapter-exo-1', verse_number: 1, text: 'Now these are' },
];

describe('validatePreparedRows', () => {
  it('accepts valid rows and reports exact counts', () => {
    expect(validatePreparedRows(rows, expected)).toEqual(expected);
  });

  it('rejects duplicate chapter/verse IDs', () => {
    expect(() => validatePreparedRows([...rows, rows[0]], { ...expected, verses: 4 }))
      .toThrow('Duplicate prepared verse key: Genesis 1:1');
  });

  it('rejects missing chapter IDs and empty text', () => {
    expect(() => validatePreparedRows([{ ...rows[0], chapter_id: '' }], { books: 1, chapters: 1, verses: 1 }))
      .toThrow('Prepared row is missing chapter_id.');
    expect(() => validatePreparedRows([{ ...rows[0], text: ' ' }], { books: 1, chapters: 1, verses: 1 }))
      .toThrow('Prepared row has empty Scripture text.');
  });

  it('dry-run import validates without making network calls', async () => {
    const result = await importPublicDomainEdition(rows, 'ASV', { apply: false, expected });
    expect(result.applied).toBe(false);
    expect(result.counts).toEqual({ books: 2, chapters: 2, verses: 3 });
  });
});
