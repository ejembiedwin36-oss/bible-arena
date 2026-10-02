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
    .select('verse_id, verse_text, bible_verses!inner(verse_number, chapter_id, bible_chapters!inner(chapter_number, book_id))')
    .eq('translation_id', translationId)
    .eq('bible_verses.bible_chapters.book_id', bookId)
    .eq('bible_verses.bible_chapters.chapter_number', chapterNumber)
    .order('verse_number', { referencedTable: 'bible_verses', ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as Array<{
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
    translationId,
    bookId,
    chapterNumber,
    verses: rows.map((row) => ({
      verseNumber: row.bible_verses.verse_number,
      text: row.verse_text,
    })),
  };
}
