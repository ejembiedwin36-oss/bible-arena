import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function chapterKey(book, chapter) { return `${book}\u0000${chapter}`; }

/** Validate and map a normalized edition corpus without contacting Supabase. */
export function prepareBibleVersionImport(corpus, chapterMapRows, expected) {
  if (!Array.isArray(corpus) || !Array.isArray(chapterMapRows)) {
    throw new Error('Both corpus and chapter map must be JSON arrays.');
  }
  for (const field of ['books', 'chapters', 'verses']) {
    if (!Number.isInteger(expected?.[field]) || expected[field] < 1) {
      throw new Error(`Expected ${field} count must be a positive integer.`);
    }
  }
  const chapterMap = new Map();
  for (const row of chapterMapRows) {
    const { book, chapter, chapter_id: chapterId } = row ?? {};
    if (typeof book !== 'string' || !book.trim() || !Number.isInteger(chapter) || chapter < 1 || typeof chapterId !== 'string' || !chapterId.trim()) {
      throw new Error('Invalid chapter-map row.');
    }
    const key = chapterKey(book.trim(), chapter);
    if (chapterMap.has(key)) throw new Error(`Duplicate chapter mapping: ${book} ${chapter}.`);
    chapterMap.set(key, chapterId.trim());
  }
  if (chapterMap.size !== expected.chapters) {
    throw new Error(`Expected ${expected.chapters} chapter mappings; received ${chapterMap.size}.`);
  }
  const books = new Set();
  const chapters = new Set();
  const verseKeys = new Set();
  const prepared = [];
  for (const row of corpus) {
    const { book, chapter, verse, text } = row ?? {};
    if (typeof book !== 'string' || !book.trim()) throw new Error('Invalid book name in corpus.');
    const normalizedBook = book.trim();
    if (!Number.isInteger(chapter) || chapter < 1) throw new Error(`Invalid chapter in ${normalizedBook}.`);
    if (!Number.isInteger(verse) || verse < 1) throw new Error(`Invalid verse in ${normalizedBook} ${chapter}.`);
    if (typeof text !== 'string' || !text.trim()) throw new Error(`Empty text at ${normalizedBook} ${chapter}:${verse}.`);
    const cKey = chapterKey(normalizedBook, chapter);
    const vKey = `${cKey}\u0000${verse}`;
    const chapterId = chapterMap.get(cKey);
    if (!chapterId) throw new Error(`No Bible Arena chapter mapping for ${normalizedBook} ${chapter}.`);
    if (verseKeys.has(vKey)) throw new Error(`Duplicate verse: ${normalizedBook} ${chapter}:${verse}.`);
    books.add(normalizedBook); chapters.add(cKey); verseKeys.add(vKey);
    const output = { book: normalizedBook, chapter, chapter_id: chapterId, verse_number: verse, text: text.trim() };
    if (typeof row.is_jesus_words === 'boolean') output.is_jesus_words = row.is_jesus_words;
    prepared.push(output);
  }
  const actual = { books: books.size, chapters: chapters.size, verses: verseKeys.size };
  for (const field of Object.keys(actual)) {
    if (actual[field] !== expected[field]) throw new Error(`Expected ${expected[field]} ${field}; received ${actual[field]}.`);
  }
  return { rows: prepared, counts: actual };
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath && import.meta.url === invokedPath) {
  const [corpusPath, mapPath, outputPath, booksArg, chaptersArg, versesArg] = process.argv.slice(2);
  if (!corpusPath || !mapPath || !outputPath || !booksArg || !chaptersArg || !versesArg) {
    console.error('Usage: node scripts/prepare-bible-version-import.mjs <corpus.json> <chapter-map.json> <output.json> <books> <chapters> <verses>');
    process.exit(1);
  }
  const expected = { books: Number(booksArg), chapters: Number(chaptersArg), verses: Number(versesArg) };
  const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const result = prepareBibleVersionImport(corpus, map, expected);
  fs.writeFileSync(outputPath, `${JSON.stringify(result.rows, null, 2)}\n`, 'utf8');
  console.log(`Prepared ${result.counts.books} books, ${result.counts.chapters} chapters, ${result.counts.verses} verses.`);
  console.log(`Output: ${outputPath}`);
  console.log('Offline preparation only. No Supabase changes were made.');
}