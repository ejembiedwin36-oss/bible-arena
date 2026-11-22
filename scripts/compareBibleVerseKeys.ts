export type BibleVerseKey = {
  book: string;
  chapter: number;
  verse: number;
};

export type VerseKeyDifference = {
  missingFromCandidate: string[];
  extraInCandidate: string[];
  unexpectedMissingFromCandidate: string[];
  unexpectedExtraInCandidate: string[];
  valid: boolean;
};

function toKey(verse: BibleVerseKey): string {
  return `${verse.book.trim()} ${verse.chapter}:${verse.verse}`;
}

/**
 * Compare verse references in a candidate edition with a reference edition.
 *
 * "Missing" means present in the reference but absent from the candidate.
 * "Extra" means present in the candidate but absent from the reference.
 * Differences are accepted only when explicitly listed as versification
 * exceptions. This checks reference keys only; it does not validate text,
 * source provenance, or redistribution rights.
 */
export function compareBibleVerseKeys(
  referenceVerses: readonly BibleVerseKey[],
  candidateVerses: readonly BibleVerseKey[],
  allowedMissingFromCandidate: readonly string[] = [],
  allowedExtraInCandidate: readonly string[] = [],
): VerseKeyDifference {
  const reference = new Set(referenceVerses.map(toKey));
  const candidate = new Set(candidateVerses.map(toKey));
  const allowedMissing = new Set(allowedMissingFromCandidate);
  const allowedExtra = new Set(allowedExtraInCandidate);

  const missingFromCandidate = [...reference]
    .filter((key) => !candidate.has(key))
    .sort();
  const extraInCandidate = [...candidate]
    .filter((key) => !reference.has(key))
    .sort();

  const unexpectedMissingFromCandidate = missingFromCandidate
    .filter((key) => !allowedMissing.has(key));
  const unexpectedExtraInCandidate = extraInCandidate
    .filter((key) => !allowedExtra.has(key));

  return {
    missingFromCandidate,
    extraInCandidate,
    unexpectedMissingFromCandidate,
    unexpectedExtraInCandidate,
    valid:
      unexpectedMissingFromCandidate.length === 0 &&
      unexpectedExtraInCandidate.length === 0,
  };
}
