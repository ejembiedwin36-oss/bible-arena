import { loadBibleChapter, type BibleChapter } from './bibleReader';

export type ChapterLocation = {
  translationId: string;
  bookId: string;
  chapterNumber: number;
};

export function getNextChapterLocation(
  location: ChapterLocation,
  chapterCount: number,
): ChapterLocation | null {
  if (location.chapterNumber >= chapterCount) return null;

  return {
    ...location,
    chapterNumber: location.chapterNumber + 1,
  };
}

/**
 * Warm the existing Bible chapter cache without blocking the current Reader.
 * The underlying chapter service deduplicates an already-running request.
 */
export function prefetchBibleChapter(
  location: ChapterLocation,
): void {
  void loadBibleChapter(location.translationId, location.bookId, location.chapterNumber).catch(() => {
    // Prefetch is opportunistic. A failed prefetch must not interrupt reading.
  });
}

export function prefetchNextChapter(
  location: ChapterLocation,
  chapterCount: number,
): ChapterLocation | null {
  const next = getNextChapterLocation(location, chapterCount);
  if (!next) return null;

  prefetchBibleChapter(next);
  return next;
}

export async function preloadChapter(
  location: ChapterLocation,
): Promise<BibleChapter> {
  return loadBibleChapter(location.translationId, location.bookId, location.chapterNumber);
}
