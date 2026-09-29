import { getCachedChapter } from './bibleChapterCache';
import { getChapterVerses } from './bibleData';

/** Warm the chapter cache without forcing the caller to wait for the result. */
export function prefetchChapter(chapterId: string, versionId: string) {
  if (getCachedChapter(chapterId, versionId)) return;

  void getChapterVerses(chapterId, versionId).catch(() => {
    // Prefetch is opportunistic. A failure must never interrupt reading.
  });
}
