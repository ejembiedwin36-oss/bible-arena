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
): BibleDatasetValidationResult {
  const errors: string[] = [];
  const seen = new Set<string>();
  const books = new Set<string>();

  for (const [index, verse] of verses.entries()) {
    if (!verse.book?.trim()) errors.push(`Row ${index + 1}: missing book.`);
    if (!Number.isInteger(verse.chapter) || verse.chapter < 1) {
      errors.push(`Row ${index + 1}: invalid chapter.`);
    }
    if (!Number.isInteger(verse.verse) || verse.verse < 1) {
      errors.push(`Row ${index + 1}: invalid verse.`);
    }
    if (!verse.text?.trim()) errors.push(`Row ${index + 1}: empty verse text.`);

    const key = `${verse.book}:${verse.chapter}:${verse.verse}`;
    if (seen.has(key)) errors.push(`Duplicate verse: ${key}.`);
    seen.add(key);
    books.add(verse.book);
  }

  for (const book of expectedBooks) {
    if (!books.has(book)) errors.push(`Missing book: ${book}.`);
  }

  return { valid: errors.length === 0, errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Bible Arena dataset validator loaded. Import a dataset and call validateBibleDataset().');
}
