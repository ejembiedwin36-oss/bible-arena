import { describe, expect, it } from 'vitest';
import { parseUsfmBook } from './parse-usfm-corpus.mjs';

const names = { GEN: 'Genesis' };

describe('parseUsfmBook', () => {
  it('parses chapter and verse markers and strips basic formatting markers', () => {
    const usfm = [
      '\\id GEN - Genesis',
      '\\c 1',
      '\\p',
      '\\v 1 In the \\add beginning\\add*.',
      '\\v 2 God said.\\f + \\ft a note\\f*',
      '\\c 2',
      '\\p',
      '\\v 1 Another chapter.'
    ].join('\n');
    expect(parseUsfmBook(usfm, names)).toEqual([
      { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning.' },
      { book: 'Genesis', chapter: 1, verse: 2, text: 'God said.' },
      { book: 'Genesis', chapter: 2, verse: 1, text: 'Another chapter.' },
    ]);
  });

  it('rejects missing book-code mappings', () => {
    const source = ['\\id GEN - Genesis', '\\c 1', '\\v 1 Text'].join('\n');
    expect(() => parseUsfmBook(source, {})).toThrow('No canonical book-name mapping for USFM code GEN.');
  });

  it('reports empty omitted verse markers when a report callback is supplied', () => {
    const source = [
      '\\id GEN - Genesis',
      '\\c 1',
      '\\v 1 Text',
      '\\v 21 \\f + \\ft Some witnesses omit this verse.\\f*'
    ].join('\n');
    const omitted = [];
    const rows = parseUsfmBook(source, names, row => omitted.push(row));
    expect(rows).toEqual([{ book: 'Genesis', chapter: 1, verse: 1, text: 'Text' }]);
    expect(omitted).toEqual([{ book: 'Genesis', chapter: 1, verse: 21 }]);
  });

  it('rejects verse bridges and suffix labels for manual review', () => {
    const source = ['\\id GEN - Genesis', '\\c 1', '\\v 1-2 Combined'].join('\n');
    expect(() => parseUsfmBook(source, names)).toThrow('Unsupported verse label "1-2"');
  });
});
