import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getNextChapterLocation,
  prefetchNextChapter,
  prefetchBibleChapter,
} from './bibleChapterPrefetch';

const loadBibleChapterMock = vi.fn();

vi.mock('./bibleReader', () => ({
  loadBibleChapter: loadBibleChapterMock,
}));

describe('bibleChapterPrefetch', () => {
  beforeEach(() => {
    loadBibleChapterMock.mockReset();
    loadBibleChapterMock.mockResolvedValue({});
  });

  it('calculates the next chapter', () => {
    expect(
      getNextChapterLocation(
        { translationId: 'v1', bookId: 'matthew', chapterNumber: 4 },
        28,
      ),
    ).toEqual({ translationId: 'v1', bookId: 'matthew', chapterNumber: 5 });
  });

  it('does not prefetch after the final chapter', () => {
    expect(
      getNextChapterLocation(
        { translationId: 'v1', bookId: 'matthew', chapterNumber: 28 },
        28,
      ),
    ).toBeNull();
    expect(loadBibleChapterMock).not.toHaveBeenCalled();
  });

  it('prefetches the next chapter without making it blocking', () => {
    const next = prefetchNextChapter(
      { translationId: 'v1', bookId: 'matthew', chapterNumber: 4 },
      28,
    );

    expect(next).toEqual({ translationId: 'v1', bookId: 'matthew', chapterNumber: 5 });
    expect(loadBibleChapterMock).toHaveBeenCalledWith('v1', 'matthew', 5);
  });

  it('prefetch helper swallows failures', () => {
    loadBibleChapterMock.mockRejectedValueOnce(new Error('network error'));

    expect(() =>
      prefetchBibleChapter({ translationId: 'v1', bookId: 'matthew', chapterNumber: 5 }),
    ).not.toThrow();
  });
});
