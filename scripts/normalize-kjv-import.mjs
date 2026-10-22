// Normalize the maintained KJV corpus into Bible Arena's import shape.
//
// Input: a directory containing one JSON file per Bible book. Each book file is
// an object whose keys are chapter numbers and whose values are objects mapping
// verse numbers to verse text.
//
// Output: [{ book, chapter, verse, text }, ...]
//
// This script is deliberately database-free. Run validate-kjv-import.mjs on the
// generated file before any Supabase import.
//
// Usage:
//   node scripts/normalize-kjv-import.mjs path/to/kjv-books path/to/kjv-normalized.json

import fs from 'node:fs';
import path from 'node:path';

const BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah',
  'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
  '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
];

const inputDir = process.argv[2];
const outputPath = process.argv[3];

if (!inputDir || !outputPath) {
  console.error('Usage: node scripts/normalize-kjv-import.mjs <book-directory> <output.json>');
  process.exit(1);
}

const rows = [];

for (const book of BOOKS) {
  const filePath = path.join(inputDir, `${book}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`KJV normalization rejected: missing ${book}.json.`);
  }

  const chapters = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!chapters || typeof chapters !== 'object' || Array.isArray(chapters)) {
    throw new Error(`KJV normalization rejected: invalid structure in ${book}.json.`);
  }

  for (const [chapterRaw, verses] of Object.entries(chapters)) {
    const chapter = Number(chapterRaw);
    if (!Number.isInteger(chapter) || chapter < 1 || !verses || typeof verses !== 'object' || Array.isArray(verses)) {
      throw new Error(`KJV normalization rejected: invalid chapter ${chapterRaw} in ${book}.`);
    }

    for (const [verseRaw, text] of Object.entries(verses)) {
      const verse = Number(verseRaw);
      if (!Number.isInteger(verse) || verse < 1 || typeof text !== 'string' || !text.trim()) {
        throw new Error(`KJV normalization rejected: invalid verse ${book} ${chapterRaw}:${verseRaw}.`);
      }
      rows.push({ book, chapter, verse, text });
    }
  }
}

fs.writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
console.log(`Normalized ${rows.length} KJV verses to ${outputPath}.`);
console.log('No database changes were made.');
