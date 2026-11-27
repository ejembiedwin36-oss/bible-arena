import { supabase } from '../lib/supabase';

export type BibleChapterVerse = {
  id: string;
  verseNumber: number;
  text: string;
};

export type BibleChapter = {
  translationId: string;
  bookId: string;
  chapterNumber: number;
  verses: BibleChapterVerse[];
};

type ChapterKey = string;

const chapterCache = new Map<ChapterKey, BibleChapter>();
const inFlightRequests = new Map<ChapterKey, Promise<BibleChapter>>();

function makeChapterKey(translationId: string, bookId: string, chapterNumber: number): ChapterKey {
  return `${translationId}:${bookId}:${chapterNumber}`;
}

export function clearBibleChapterCache() {
  chapterCache.clear();
}

export function getCachedBibleChapter(
  translationId: string,
  bookId: string,
  chapterNumber: number,
): BibleChapter | null {
  return chapterCache.get(makeChapterKey(translationId, bookId, chapterNumber)) ?? null;
}

export async function loadBibleChapter(
  versionId: string,
  bookId: string,
  chapterNumber: number,
  legacyTranslationId: string = versionId,
): Promise<BibleChapter> {
  const key = makeChapterKey(versionId, bookId, chapterNumber);

  const cached = chapterCache.get(key);
  if (cached) return cached;

  const existingRequest = inFlightRequests.get(key);
  if (existingRequest) return existingRequest;

  const request = fetchBibleChapter(versionId, bookId, chapterNumber, legacyTranslationId)
    .then((chapter) => {
      chapterCache.set(key, chapter);
      return chapter;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);
  return request;
}

async function fetchBibleChapter(
  versionId: string,
  bookId: string,
  chapterNumber: number,
  legacyTranslationId: string,
): Promise<BibleChapter> {
  // First query the version-backed corpus by bible_versions.id. If this version
  // has no direct rows, fall back to the legacy translation-backed corpus.
  const { data: directRows, error: directError } = await supabase
    .from('bible_verses')
    .select('id, verse_number, text, bible_chapters!inner(chapter_number, book_id)')
    .eq('version_id', versionId)
    .eq('bible_chapters.book_id', bookId)
    .eq('bible_chapters.chapter_number', chapterNumber)
    .order('verse_number', { ascending: true });

  if (directError) throw directError;
  if ((directRows ?? []).length > 0) {
    return {
      translationId: versionId,
      bookId,
      chapterNumber,
      verses: (directRows ?? []).map((row) => ({
        id: row.id,
        verseNumber: row.verse_number,
        text: row.text,
      })),
    };
  }

  const { data, error } = await supabase
    .from('bible_translation_verses')
    .select('verse_id, verse_text, bible_verses!inner(verse_number, chapter_id, bible_chapters!inner(chapter_number, book_id))')
    .eq('translation_id', legacyTranslationId)
    .eq('bible_verses.bible_chapters.book_id', bookId)
    .eq('bible_verses.bible_chapters.chapter_number', chapterNumber)
    .order('verse_number', { referencedTable: 'bible_verses', ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as unknown as Array<{
    verse_id: string;
    verse_text: string;
    bible_verses: {
      verse_number: number;
      chapter_id: string;
      bible_chapters: {
        chapter_number: number;
        book_id: string;
      };
    };
  }>;

  return {
    translationId: versionId,
    bookId,
    chapterNumber,
    verses: rows.map((row) => ({
      id: row.verse_id,
      verseNumber: row.bible_verses.verse_number,
      text: row.verse_text,
    })),
  };
}
