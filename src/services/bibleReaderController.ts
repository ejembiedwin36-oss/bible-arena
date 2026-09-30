import { listBibleBooks, listBibleVersions, type BibleBook, type BibleVersion } from './bibleCatalogue';
import { loadBibleChapter, type BibleChapter } from './bibleReader';

export type BibleReaderState = {
  languageId: string | null;
  versionId: string | null;
  bookId: string | null;
  chapterNumber: number | null;
  versions: BibleVersion[];
  books: BibleBook[];
  chapter: BibleChapter | null;
  loading: boolean;
  error: Error | null;
};

export function createInitialBibleReaderState(): BibleReaderState {
  return {
    languageId: null,
    versionId: null,
    bookId: null,
    chapterNumber: null,
    versions: [],
    books: [],
    chapter: null,
    loading: false,
    error: null,
  };
}

export async function selectBibleLanguage(
  state: BibleReaderState,
  languageId: string,
): Promise<BibleReaderState> {
  const versions = await listBibleVersions(languageId);
  return {
    ...state,
    languageId,
    versionId: versions[0]?.id ?? null,
    bookId: null,
    chapterNumber: null,
    versions,
    chapter: null,
    loading: false,
    error: null,
  };
}

export async function loadBibleBooks(state: BibleReaderState): Promise<BibleReaderState> {
  const books = await listBibleBooks();
  return { ...state, books };
}

export async function selectBibleLocation(
  state: BibleReaderState,
  versionId: string,
  bookId: string,
  chapterNumber: number,
): Promise<BibleReaderState> {
  const chapter = await loadBibleChapter(versionId, bookId, chapterNumber);
  return {
    ...state,
    versionId,
    bookId,
    chapterNumber,
    chapter,
    loading: false,
    error: null,
  };
}
