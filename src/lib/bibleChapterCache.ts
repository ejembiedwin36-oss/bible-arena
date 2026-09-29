import type { BibleChapterVerse } from './bibleData';

type CacheEntry = {
  verses: BibleChapterVerse[];
  expiresAt: number;
};

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function key(chapterId: string, versionId: string) {
  return `${versionId}:${chapterId}`;
}

export function getCachedChapter(chapterId: string, versionId: string) {
  const entry = cache.get(key(chapterId, versionId));
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key(chapterId, versionId));
    return null;
  }
  return entry.verses;
}

export function setCachedChapter(
  chapterId: string,
  versionId: string,
  verses: BibleChapterVerse[],
  ttlMs = DEFAULT_TTL_MS,
) {
  cache.set(key(chapterId, versionId), {
    verses,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearBibleChapterCache() {
  cache.clear();
}
