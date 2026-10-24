// Prepare a validated KJV corpus for a safe Supabase import.
//
// This script does NOT write to Supabase. It joins a normalized KJV corpus to
// an exported Bible Arena chapter map and produces rows ready for controlled
// upsert. Existing verse IDs are intentionally not generated or replaced.
//
// Usage:
//   node scripts/prepare-kjv-import.mjs \
//     path/to/kjv-normalized.json \
//     path/to/bible-arena-chapter-map.json \
//     path/to/kjv-supabase-ready.json
//
// Chapter-map shape:
// [
//   { "book": "Genesis", "chapter": 1, "chapter_id": "uuid" },
//   ...
// ]

import fs from 'node:fs';

const EXPECTED_BOOKS = 66;
const EXPECTED_CHAPTERS = 1189;
const EXPECTED_VERSES = 31102;

const [corpusPath, chapterMapPath, outputPath] = process.argv.slice(2);

if (!corpusPath || !chapterMapPath || !outputPath) {
  console.error(
    'Usage: node scripts/prepare-kjv-import.mjs <normalized-kjv.json> <chapter-map.json> <output.json>',
  );
  process.exit(1);
}

const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const chapterMapRows = JSON.parse(fs.readFileSync(chapterMapPath, 'utf8'));

if (!Array.isArray(corpus) || !Array.isArray(chapterMapRows)) {
  throw new Error('Import preparation rejected: both inputs must be JSON arrays.');
}

const chapterMap = new Map();
for (const row of chapterMapRows) {
  const book = row?.book;
  const chapter = row?.chapter;
  const chapterId = row?.chapter_id;

  if (
    typeof book !== 'string' ||
    !book.trim() ||
    !Number.isInteger(chapter) ||
    chapter < 1 ||
    typeof chapterId !== 'string' ||
    !chapterId.trim()
  ) {
    throw new Error('Import preparation rejected: invalid chapter-map row.');
  }

  const key = `${book}\u0000${chapter}`;
  if (chapterMap.has(key)) {
    throw new Error(`Import preparation rejected: duplicate chapter mapping for ${book} ${chapter}.`);
  }
  chapterMap.set(key, chapterId);
}

if (chapterMap.size !== EXPECTED_CHAPTERS) {
  throw new Error(
    `Import preparation rejected: expected ${EXPECTED_CHAPTERS} chapter mappings; received ${chapterMap.size}.`,
  );
}

const books = new Set();
const chapters = new Set();
const verseKeys = new Set();
const prepared = [];

for (const row of corpus) {
  const { book, chapter, verse, text } = row ?? {};

  if (typeof book !== 'string' || !book.trim()) {
    throw new Error('Import preparation rejected: invalid book name.');
  }
  if (!Number.isInteger(chapter) || chapter < 1) {
    throw new Error(`Import preparation rejected: invalid chapter in ${book}.`);
  }
  if (!Number.isInteger(verse) || verse < 1) {
    throw new Error(`Import preparation rejected: invalid verse in ${book} ${chapter}.`);
  }
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error(`Import preparation rejected: empty text at ${book} ${chapter}:${verse}.`);
  }

  const chapterKey = `${book}\u0000${chapter}`;
  const verseKey = `${chapterKey}\u0000${verse}`;
  const chapterId = chapterMap.get(chapterKey);

  if (!chapterId) {
    throw new Error(`Import preparation rejected: no Bible Arena chapter for ${book} ${chapter}.`);
  }
  if (verseKeys.has(verseKey)) {
    throw new Error(`Import preparation rejected: duplicate ${book} ${chapter}:${verse}.`);
  }

  books.add(book);
  chapters.add(chapterKey);
  verseKeys.add(verseKey);
  prepared.push({
    book,
    chapter,
    chapter_id: chapterId,
    verse_number: verse,
    text: text.trim(),
  });
}

if (
  books.size !== EXPECTED_BOOKS ||
  chapters.size !== EXPECTED_CHAPTERS ||
  verseKeys.size !== EXPECTED_VERSES
) {
  throw new Error(
    `Import preparation rejected: expected ${EXPECTED_BOOKS} books, ${EXPECTED_CHAPTERS} chapters, ` +
      `${EXPECTED_VERSES} verses; received ${books.size} books, ${chapters.size} chapters, ` +
      `${verseKeys.size} verses.`,
  );
}

fs.writeFileSync(outputPath, `${JSON.stringify(prepared, null, 2)}\n`, 'utf8');

console.log('KJV Supabase import preparation passed.');
console.log(`${books.size} books | ${chapters.size} chapters | ${verseKeys.size} verses`);
console.log(`Prepared ${prepared.length} rows at ${outputPath}.`);
console.log('No Supabase changes were made.');
