export type BibleDatasetVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  is_jesus_words?: boolean;
};

export type BibleDatasetValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateBibleDataset(
  verses: BibleDatasetVerse[],
  expectedBooks: readonly string[],
  expectedChapterCounts?: Readonly<Record<string, number>>,
): BibleDatasetValidationResult {
  const errors: string[] = [];
  const seen = new Set<string>();
  const books = new Set<string>();
  const chaptersByBook = new Map<string, Set<number>>();

  for (const [index, verse] of verses.entries()) {
    const row = index + 1;
    const book = verse.book?.trim();

    if (!book) errors.push(`Row ${row}: missing book.`);
    if (!Number.isInteger(verse.chapter) || verse.chapter < 1) {
      errors.push(`Row ${row}: invalid chapter.`);
    }
    if (!Number.isInteger(verse.verse) || verse.verse < 1) {
      errors.push(`Row ${row}: invalid verse.`);
    }
    if (!verse.text?.trim()) errors.push(`Row ${row}: empty verse text.`);

    if (!book || !Number.isInteger(verse.chapter) || !Number.isInteger(verse.verse)) continue;

    const key = `${book}:${verse.chapter}:${verse.verse}`;
    if (seen.has(key)) errors.push(`Duplicate verse: ${key}.`);
    seen.add(key);
    books.add(book);

    const chapters = chaptersByBook.get(book) ?? new Set<number>();
    chapters.add(verse.chapter);
    chaptersByBook.set(book, chapters);
  }

  for (const book of expectedBooks) {
    if (!books.has(book)) {
      errors.push(`Missing book: ${book}.`);
      continue;
    }

    if (!expectedChapterCounts) continue;

    const expectedCount = expectedChapterCounts[book];
    const chapters = chaptersByBook.get(book) ?? new Set<number>();

    if (expectedCount === undefined) {
      errors.push(`Missing expected chapter count for book: ${book}.`);
      continue;
    }

    for (let chapter = 1; chapter <= expectedCount; chapter += 1) {
      if (!chapters.has(chapter)) {
        errors.push(`Missing chapter: ${book} ${chapter}.`);
      }
    }

    for (const chapter of chapters) {
      if (chapter > expectedCount) {
        errors.push(`Unexpected chapter: ${book} ${chapter}.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Bible Arena dataset validator loaded. Import a dataset and call validateBibleDataset().');
}
