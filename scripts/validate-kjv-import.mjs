// Safety gate for the Bible Arena KJV import.
//
// This script validates a normalized array of verse records BEFORE any database
// write happens. It intentionally does not contain Supabase credentials and it
// does not modify the database.
//
// Expected input JSON shape:
// [
//   { "book": "Genesis", "chapter": 1, "verse": 1, "text": "..." },
//   ...
// ]
//
// Usage:
//   node scripts/validate-kjv-import.mjs path/to/kjv-normalized.json

import fs from 'node:fs';

const EXPECTED_BOOKS = 66;
const EXPECTED_CHAPTERS = 1189;
const EXPECTED_VERSES = 31102;

const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node scripts/validate-kjv-import.mjs <normalized-kjv.json>');
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

if (!Array.isArray(rows)) {
  throw new Error('KJV import rejected: input must be a JSON array.');
}

const books = new Set();
const chapters = new Set();
const verseKeys = new Set();

for (const row of rows) {
  if (!row || typeof row !== 'object') {
    throw new Error('KJV import rejected: every verse must be an object.');
  }

  const { book, chapter, verse, text } = row;

  if (typeof book !== 'string' || !book.trim()) {
    throw new Error('KJV import rejected: verse has an invalid book name.');
  }
  if (!Number.isInteger(chapter) || chapter < 1) {
    throw new Error(`KJV import rejected: invalid chapter in ${book}.`);
  }
  if (!Number.isInteger(verse) || verse < 1) {
    throw new Error(`KJV import rejected: invalid verse in ${book} ${chapter}.`);
  }
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error(`KJV import rejected: empty text at ${book} ${chapter}:${verse}.`);
  }

  const chapterKey = `${book}\u0000${chapter}`;
  const verseKey = `${chapterKey}\u0000${verse}`;

  if (verseKeys.has(verseKey)) {
    throw new Error(`KJV import rejected: duplicate ${book} ${chapter}:${verse}.`);
  }

  books.add(book);
  chapters.add(chapterKey);
  verseKeys.add(verseKey);
}

const actual = {
  books: books.size,
  chapters: chapters.size,
  verses: verseKeys.size,
};

const expected = {
  books: EXPECTED_BOOKS,
  chapters: EXPECTED_CHAPTERS,
  verses: EXPECTED_VERSES,
};

if (
  actual.books !== expected.books ||
  actual.chapters !== expected.chapters ||
  actual.verses !== expected.verses
) {
  throw new Error(
    `KJV import rejected: expected ${EXPECTED_BOOKS} books, ${EXPECTED_CHAPTERS} chapters, ` +
      `${EXPECTED_VERSES} verses; received ${actual.books} books, ${actual.chapters} chapters, ` +
      `${actual.verses} verses.`,
  );
}

console.log('KJV corpus validation passed.');
console.log(`${actual.books} books | ${actual.chapters} chapters | ${actual.verses} verses`);
console.log('No database changes were made.');
