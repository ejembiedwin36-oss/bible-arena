import { describe, expect, it } from 'vitest';
import { parseUsfmBook } from './parse-usfm-corpus.mjs';

const names = { GEN: 'Genesis' };

describe('parseUsfmBook', () => {
  it('parses chapter and verse markers and strips basic formatting markers', () => {
    const usfm = `\\id GEN - Genesis
\\c 1
\\p
\\v 1 In the \\add beginning\\add*.
\\v 2 God said.\\f + \\ft a note\\f*
\\c 2
\\p
\\v 1 Another chapter.`;
    expect(parseUsfmBook(usfm, names)).toEqual([
      { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning .' },
      { book: 'Genesis', chapter: 1, verse: 2, text: 'God said.' },
      { book: 'Genesis', chapter: 2, verse: 1, text: 'Another chapter.' },
    ]);
  });

  it('rejects missing book-code mappings', () => {
    expect(() => parseUsfmBook('\\\\id GEN - Genesis\\n\\\\c 1\\n\\\\v 1 Text', {}))
      .toThrow('No canonical book-name mapping for USFM code GEN.');
  });

  it('rejects verse bridges and suffix labels for manual review', () => {
    expect(() => parseUsfmBook('\\\\id GEN - Genesis\\n\\\\c 1\\n\\\\v 1-2 Combined', names))
      .toThrow('Unsupported verse label "1-2"');
  });
});
