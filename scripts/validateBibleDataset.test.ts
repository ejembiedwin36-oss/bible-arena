import { describe, expect, it } from 'vitest';
import { validateBibleDataset, type BibleDatasetVerse } from './validateBibleDataset';

const books = ['Genesis', 'Exodus'];

function expectValid(verses: BibleDatasetVerse[]) {
  const result = validateBibleDataset(verses, books);
  expect(result.valid, result.errors.join('\n')).toBe(true);
  expect(result.errors).toEqual([]);
}

function expectInvalid(verses: BibleDatasetVerse[], message: string) {
  const result = validateBibleDataset(verses, books);
  expect(result.valid).toBe(false);
  expect(result.errors.some((error) => error.includes(message))).toBe(true);
}

describe('Bible dataset validator', () => {
  it('accepts valid Bible verse data', () => {
    expectValid([
      { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning...' },
      { book: 'Exodus', chapter: 1, verse: 1, text: 'Now these are...' },
    ]);
  });

  it('rejects invalid chapter and verse numbers', () => {
    expectInvalid([
      { book: 'Genesis', chapter: 0, verse: 1, text: 'Invalid chapter' },
      { book: 'Exodus', chapter: 1, verse: 0, text: 'Invalid verse' },
    ], 'invalid');
  });

  it('rejects duplicate verses', () => {
    expectInvalid([
      { book: 'Genesis', chapter: 1, verse: 1, text: 'Duplicate' },
      { book: 'Genesis', chapter: 1, verse: 1, text: 'Duplicate' },
    ], 'Duplicate verse');
  });

  it('rejects empty verse text', () => {
    expectInvalid([
      { book: 'Genesis', chapter: 1, verse: 1, text: '' },
    ], 'empty verse text');
  });

  it('reports missing books', () => {
    expectInvalid([
      { book: 'Genesis', chapter: 1, verse: 1, text: 'Only one book' },
    ], 'Missing book: Exodus');
  });
});
