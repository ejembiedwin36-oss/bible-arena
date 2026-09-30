import { describe, expect, it, vi } from 'vitest';
import { createInitialBibleReaderState, selectBibleLanguage, selectBibleLocation } from './bibleReaderController';

vi.mock('./bibleCatalogue', () => ({
  listBibleVersions: vi.fn().mockResolvedValue([
    { id: 'idoma-v1', name: 'Idoma Bible', abbreviation: 'IDB', languageId: 'idoma' },
  ]),
  listBibleBooks: vi.fn(),
}));

vi.mock('./bibleReader', () => ({
  loadBibleChapter: vi.fn().mockResolvedValue({
    translationId: 'idoma-v1',
    bookId: 'matthew',
    chapterNumber: 5,
    verses: [{ verseNumber: 1, text: 'Test verse' }],
  }),
}));

describe('bibleReaderController', () => {
  it('selects a language and chooses its first available version', async () => {
    const state = await selectBibleLanguage(createInitialBibleReaderState(), 'idoma');

    expect(state.languageId).toBe('idoma');
    expect(state.versionId).toBe('idoma-v1');
    expect(state.versions).toHaveLength(1);
  });

  it('loads the selected Bible location', async () => {
    const state = await selectBibleLocation(
      createInitialBibleReaderState(),
      'idoma-v1',
      'matthew',
      5,
    );

    expect(state.bookId).toBe('matthew');
    expect(state.chapterNumber).toBe(5);
    expect(state.chapter?.verses[0].text).toBe('Test verse');
  });
});
