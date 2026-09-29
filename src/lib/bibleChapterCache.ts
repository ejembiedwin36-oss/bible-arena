import type { BibleChapterVerse } from './bibleData';

type CacheEntry = {
  verses: BibleChapterVerse[];
  expiresAt: number;
  lastAccessedAt: number;
};

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 50;
const cache = new Map<string, CacheEntry>();

function key(chapterId: string, versionId: string) {
  return `${versionId}:${chapterId}`;
}

function evictIfNeeded() {
  if (cache.size < MAX_ENTRIES) return;
  let oldestKey: string | undefined;
  let oldestAccess = Infinity;
  for (const [entryKey, entry] of cache) {
    if (entry.lastAccessedAt < oldestAccess) {
      oldestAccess = entry.lastAccessedAt;
      oldestKey = entryKey;
    }
  }
  if (oldestKey) cache.delete(oldestKey);
}

export function getCachedChapter(chapterId: string, versionId: string) {
  const entry = cache.get(key(chapterId, versionId));
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key(chapterId, versionId));
    return null;
  }
  entry.lastAccessedAt = Date.now();
  return entry.verses;
}

export function setCachedChapter(
  chapterId: string,
  versionId: string,
  verses: BibleChapterVerse[],
  ttlMs = DEFAULT_TTL_MS,
) {
  evictIfNeeded();
  cache.set(key(chapterId, versionId), {
    verses,
    expiresAt: Date.now() + ttlMs,
    lastAccessedAt: Date.now(),
  });
}

export function clearBibleChapterCache() {
  cache.clear();
}
