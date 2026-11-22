import { describe, expect, it } from 'vitest';
import { compareBibleVerseKeys, type BibleVerseKey } from './compareBibleVerseKeys';

const reference: BibleVerseKey[] = [
  { book: 'Luke', chapter: 17, verse: 35 },
  { book: 'Luke', chapter: 17, verse: 36 },
  { book: 'Luke', chapter: 17, verse: 37 },
];

describe('compareBibleVerseKeys', () => {
  it('passes when editions have the same verse keys', () => {
    expect(compareBibleVerseKeys(reference, reference).valid).toBe(true);
  });

  it('reports missing and extra keys without silently accepting them', () => {
    const candidate = [
      { book: 'Luke', chapter: 17, verse: 35 },
      { book: 'Luke', chapter: 17, verse: 38 },
    ];
    const result = compareBibleVerseKeys(reference, candidate);

    expect(result.valid).toBe(false);
    expect(result.missingFromCandidate).toEqual(['Luke 17:36', 'Luke 17:37']);
    expect(result.extraInCandidate).toEqual(['Luke 17:38']);
    expect(result.unexpectedMissingFromCandidate).toEqual(['Luke 17:36', 'Luke 17:37']);
    expect(result.unexpectedExtraInCandidate).toEqual(['Luke 17:38']);
  });

  it('accepts only explicitly allowed versification exceptions', () => {
    const candidate = [
      { book: 'Luke', chapter: 17, verse: 35 },
      { book: 'Luke', chapter: 17, verse: 37 },
      { book: 'Luke', chapter: 17, verse: 38 },
    ];
    const result = compareBibleVerseKeys(
      reference,
      candidate,
      ['Luke 17:36'],
      ['Luke 17:38'],
    );

    expect(result.valid).toBe(true);
    expect(result.unexpectedMissingFromCandidate).toEqual([]);
    expect(result.unexpectedExtraInCandidate).toEqual([]);
  });

  it('does not treat an allowed exception as permission for unrelated gaps', () => {
    const candidate = [{ book: 'Luke', chapter: 17, verse: 35 }];
    const result = compareBibleVerseKeys(reference, candidate, ['Luke 17:36']);

    expect(result.valid).toBe(false);
    expect(result.unexpectedMissingFromCandidate).toEqual(['Luke 17:37']);
  });
});
