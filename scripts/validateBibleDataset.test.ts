import { validateBibleDataset, type BibleDatasetVerse } from './validateBibleDataset';

const books = ['Genesis', 'Exodus'];

function expectValid(verses: BibleDatasetVerse[]) {
  const result = validateBibleDataset(verses, books);
  if (!result.valid) throw new Error(result.errors.join('\n'));
}

function expectInvalid(verses: BibleDatasetVerse[], message: string) {
  const result = validateBibleDataset(verses, books);
  if (result.valid || !result.errors.some((error) => error.includes(message))) {
    throw new Error(`Expected validation error containing: ${message}`);
  }
}

expectValid([
  { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning...' },
  { book: 'Exodus', chapter: 1, verse: 1, text: 'Now these are...' },
]);

expectInvalid([
  { book: 'Genesis', chapter: 0, verse: 1, text: 'Invalid chapter' },
  { book: 'Exodus', chapter: 1, verse: 0, text: 'Invalid verse' },
], 'invalid');

expectInvalid([
  { book: 'Genesis', chapter: 1, verse: 1, text: 'Duplicate' },
  { book: 'Genesis', chapter: 1, verse: 1, text: 'Duplicate' },
], 'Duplicate verse');

expectInvalid([
  { book: 'Genesis', chapter: 1, verse: 1, text: '' },
], 'empty verse text');

expectInvalid([
  { book: 'Genesis', chapter: 1, verse: 1, text: 'Only one book' },
], 'Missing book: Exodus');

console.log('Bible dataset validator tests passed.');
