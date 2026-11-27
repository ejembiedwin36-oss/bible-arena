import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Parse basic USFM book/chapter/verse structure into normalized rows.
 * Verse bridges and suffixes are rejected because the current integer
 * verse_number schema cannot represent them without an explicit mapping.
 */
export function parseUsfmBook(source, bookNameByCode, onOmittedVerse) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('USFM source must be non-empty text.');
    const idMatch = source.match(/^\s*\\id\s+([A-Z0-9]{3})\b/m);
  if (!idMatch) throw new Error('USFM book is missing a valid \\id marker.');
  const code = idMatch[1];
  const book = bookNameByCode && bookNameByCode[code];
  if (typeof book !== 'string' || !book.trim()) {
    throw new Error('No canonical book-name mapping for USFM code ' + code + '.');
  }

  const chapterMatches = Array.from(source.matchAll(/\\c\s+(\d+)\b/g));
  if (!chapterMatches.length) throw new Error('USFM book ' + code + ' has no chapter markers.');
  const rows = [];

  for (let chapterIndex = 0; chapterIndex < chapterMatches.length; chapterIndex++) {
    const chapter = Number(chapterMatches[chapterIndex][1]);
    const chapterStart = chapterMatches[chapterIndex].index + chapterMatches[chapterIndex][0].length;
    const chapterEnd = chapterIndex + 1 < chapterMatches.length ? chapterMatches[chapterIndex + 1].index : source.length;
    const chapterText = source.slice(chapterStart, chapterEnd);
    const verseMatches = Array.from(chapterText.matchAll(/\\v\s+([^\s]+)\s*/g));

    for (let verseIndex = 0; verseIndex < verseMatches.length; verseIndex++) {
      const verseToken = verseMatches[verseIndex][1];
      if (!/^\d+$/.test(verseToken)) {
        throw new Error('Unsupported verse label "' + verseToken + '" at ' + book + ' ' + chapter + '; review versification manually.');
      }
      const verse = Number(verseToken);
      const textStart = verseMatches[verseIndex].index + verseMatches[verseIndex][0].length;
      const textEnd = verseIndex + 1 < verseMatches.length ? verseMatches[verseIndex + 1].index : chapterText.length;
      const rawVerseText = chapterText.slice(textStart, textEnd);
      const wjSegments = rawVerseText.match(/\\wj\\b[\\s\\S]*?\\wj\\*/g) || [];
      const outsideWj = rawVerseText
        .replace(/\\wj\\b[\\s\\S]*?\\wj\\*/g, ' ')
        .replace(/\\[a-zA-Z]+[0-9]*\\*?/g, ' ')
        .replace(/\\\\\\*/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();
      const isJesusWords = wjSegments.length > 0 && !/[A-Za-z0-9]/.test(outsideWj);
      let verseText = rawVerseText;
      verseText = verseText
        .replace(/\\f\b[\s\S]*?\\f\*/g, ' ')
        .replace(/\\x\b[\s\S]*?\\x\*/g, ' ')
        .replace(/\\fig\b[\s\S]*?\\fig\*/g, ' ')
        .replace(/\\w\s+([^|\\]+)\|[^\\]*?\\w\*/g, '$1')
        .replace(/\\[a-zA-Z]+[0-9]*\*?/g, ' ')
        .replace(/\\\*/g, ' ')
        .replace(/\\\\/g, ' ')
        .replace(/\s+([.,;:!?])/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
      if (!verseText) {
        const omitted = { book: book.trim(), chapter: chapter, verse: verse };
        if (typeof onOmittedVerse === 'function') { onOmittedVerse(omitted); continue; }
        throw new Error('Empty normalized verse at ' + book + ' ' + chapter + ':' + verse + '.');
      }
      const row = { book: book.trim(), chapter: chapter, verse: verse, text: verseText };
      if (isJesusWords) row.is_jesus_words = true;
      rows.push(row);
    }
  }
  if (!rows.length) throw new Error('USFM book ' + code + ' contained no verse rows.');
  return rows;
}

export function parseUsfmDirectory(directory, bookNameByCode, onOmittedVerse) {
  const files = fs.readdirSync(directory).filter(function (name) { return /\.(usfm|sfm)$/i.test(name); }).sort();
  if (!files.length) throw new Error('No .usfm files found in ' + directory + '.');
  const allRows = [];
  const nonBookFiles = new Set(['FRT', 'INT']);
  for (const file of files) {
    const source = fs.readFileSync(path.join(directory, file), 'utf8');
    const idMatch = source.match(/^\s*\\id\s+([A-Z0-9]{3})\b/m);
    if (!idMatch) throw new Error('USFM file is missing a valid \\id marker: ' + file);
    const code = idMatch[1];
    if (!bookNameByCode[code] && nonBookFiles.has(code)) continue;
    if (!bookNameByCode[code]) throw new Error('Unmapped USFM book code ' + code + ' in ' + file + '. Review canon/source before parsing.');
    allRows.push(...parseUsfmBook(source, bookNameByCode, onOmittedVerse));
  }
  const seen = new Set();
  for (const row of allRows) {
    const key = row.book + '\u0000' + row.chapter + '\u0000' + row.verse;
    if (seen.has(key)) throw new Error('Duplicate verse in USFM directory: ' + row.book + ' ' + row.chapter + ':' + row.verse + '.');
    seen.add(key);
  }
  return allRows;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath && import.meta.url === invokedPath) {
  const args = process.argv.slice(2);
  const directory = args[0];
  const bookMapPath = args[1];
  const outputPath = args[2];
  if (!directory || !bookMapPath || !outputPath) {
    console.error('Usage: node scripts/parse-usfm-corpus.mjs <usfm-directory> <book-code-map.json> <normalized-corpus.json>');
    process.exit(1);
  }
  const bookMap = JSON.parse(fs.readFileSync(bookMapPath, 'utf8'));
  const omitted = [];
  const rows = parseUsfmDirectory(directory, bookMap, function (row) { omitted.push(row); });
  fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2) + '\n', 'utf8');
  if (omitted.length) fs.writeFileSync(outputPath + '.omitted.json', JSON.stringify(omitted, null, 2) + '\n', 'utf8');
  console.log('Parsed ' + rows.length + ' verse rows from USFM. Output: ' + outputPath);
  if (omitted.length) console.log('Omitted empty verse markers (review required): ' + JSON.stringify(omitted));
  console.log('Review source metadata and verse counts, then run the existing offline importer. No database changes were made.');
}
