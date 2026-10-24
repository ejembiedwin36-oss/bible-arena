// Verify that a local KJV source checkout is the exact audited corpus approved
// for Bible Arena's controlled KJV import.
//
// This script does NOT write to Supabase. It checks the source repository's
// canonical SHA-512 manifest before normalization/import preparation.
//
// Approved source snapshot:
//   https://github.com/renniemaharaj/kjv-bible
// Corpus fingerprint documented by that repository on 2026-07-30:
//   7c2eff0219d59c683b1d12739a64facb22807770e05daf20cf1a4d22ef1b739d5ec03268abb8c3201fd69eb1014cc45a37697cb8abaceccd316c2e473db0b264
//
// Usage:
//   node scripts/verify-kjv-source.mjs path/to/kjv-bible

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const EXPECTED_BOOKS = 66;
const EXPECTED_CORPUS_FINGERPRINT =
  '7c2eff0219d59c683b1d12739a64facb22807770e05daf20cf1a4d22ef1b739d5ec03268abb8c3201fd69eb1014cc45a37697cb8abaceccd316c2e473db0b264';
const DOMAIN = Buffer.from('KJV-JSON-CORPUS\0v1\0', 'utf8');

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

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error('Usage: node scripts/verify-kjv-source.mjs <kjv-source-directory>');
  process.exit(1);
}

if (BOOKS.length !== EXPECTED_BOOKS) {
  throw new Error(`Internal verification error: expected ${EXPECTED_BOOKS} canonical books.`);
}

const hash = crypto.createHash('sha512');
hash.update(DOMAIN);

for (const book of BOOKS) {
  const filename = `${book}.json`;
  const filePath = path.join(sourceDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`KJV source verification rejected: missing ${filename}.`);
  }

  const filenameBytes = Buffer.from(filename, 'utf8');
  const fileBytes = fs.readFileSync(filePath);
  const filenameLength = Buffer.alloc(4);
  filenameLength.writeUInt32BE(filenameBytes.length);
  const fileLength = Buffer.alloc(8);
  fileLength.writeBigUInt64BE(BigInt(fileBytes.length));

  hash.update(filenameLength);
  hash.update(filenameBytes);
  hash.update(fileLength);
  hash.update(fileBytes);
}

const fingerprint = hash.digest('hex');
if (fingerprint !== EXPECTED_CORPUS_FINGERPRINT) {
  throw new Error(
    'KJV source verification rejected: corpus fingerprint does not match the approved audited snapshot.\n' +
      `Expected: ${EXPECTED_CORPUS_FINGERPRINT}\nReceived: ${fingerprint}`,
  );
}

console.log('KJV source verification passed.');
console.log(`${EXPECTED_BOOKS} canonical book files match the approved audited corpus fingerprint.`);
console.log(`SHA-512 corpus fingerprint: ${fingerprint}`);
console.log('No database changes were made.');
