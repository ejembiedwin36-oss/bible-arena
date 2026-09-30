import { supabase } from '../lib/supabase';

export type BibleChapterVerse = {
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
  translationId: string,
  bookId: string,
  chapterNumber: number,
): Promise<BibleChapter> {
  const key = makeChapterKey(translationId, bookId, chapterNumber);

  const cached = chapterCache.get(key);
  if (cached) return cached;

  const existingRequest = inFlightRequests.get(key);
  if (existingRequest) return existingRequest;

  const request = fetchBibleChapter(translationId, bookId, chapterNumber)
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
  translationId: string,
  bookId: string,
  chapterNumber: number,
): Promise<BibleChapter> {
  const { data, error } = await supabase
    .from('bible_translation_verses')
    .select('verse_number, text')
    .eq('translation_id', translationId)
    .eq('book_id', bookId)
    .eq('chapter_number', chapterNumber)
    .order('verse_number', { ascending: true });

  if (error) throw error;

  return {
    translationId,
    bookId,
    chapterNumber,
    verses: (data ?? []).map((verse) => ({
      verseNumber: verse.verse_number,
      text: verse.text,
    })),
  };
}
