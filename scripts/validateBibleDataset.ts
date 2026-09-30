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
  expectedVerseCounts?: Readonly<Record<string, Readonly<Record<number, number>>>>,
): BibleDatasetValidationResult {
  const errors: string[] = [];
  const seen = new Set<string>();
  const books = new Set<string>();
  const chaptersByBook = new Map<string, Set<number>>();
  const versesByChapter = new Map<string, Set<number>>();

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

    const chapterKey = `${book}:${verse.chapter}`;
    const chapterVerses = versesByChapter.get(chapterKey) ?? new Set<number>();
    chapterVerses.add(verse.verse);
    versesByChapter.set(chapterKey, chapterVerses);
  }

  for (const book of expectedBooks) {
    if (!books.has(book)) {
      errors.push(`Missing book: ${book}.`);
      continue;
    }

    const expectedChapterCount = expectedChapterCounts?.[book];
    const chapters = chaptersByBook.get(book) ?? new Set<number>();

    if (expectedChapterCounts && expectedChapterCount === undefined) {
      errors.push(`Missing expected chapter count for book: ${book}.`);
      continue;
    }

    if (expectedChapterCount !== undefined) {
      for (let chapter = 1; chapter <= expectedChapterCount; chapter += 1) {
        if (!chapters.has(chapter)) errors.push(`Missing chapter: ${book} ${chapter}.`);
      }

      for (const chapter of chapters) {
        if (chapter > expectedChapterCount) {
          errors.push(`Unexpected chapter: ${book} ${chapter}.`);
        }
      }
    }

    const expectedBookVerseCounts = expectedVerseCounts?.[book];
    if (!expectedBookVerseCounts) continue;

    for (const [chapterString, expectedLastVerse] of Object.entries(expectedBookVerseCounts)) {
      const chapter = Number(chapterString);
      const actualVerses = versesByChapter.get(`${book}:${chapter}`) ?? new Set<number>();

      for (let verse = 1; verse <= expectedLastVerse; verse += 1) {
        if (!actualVerses.has(verse)) {
          errors.push(`Missing verse: ${book} ${chapter}:${verse}.`);
        }
      }

      for (const actualVerse of actualVerses) {
        if (actualVerse > expectedLastVerse) {
          errors.push(`Unexpected verse: ${book} ${chapter}:${actualVerse}.`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Bible Arena dataset validator loaded. Import a dataset and call validateBibleDataset().');
}
