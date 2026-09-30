import { describe, expect, it, vi, beforeEach } from 'vitest';
import { clearBibleChapterCache, getCachedBibleChapter, loadBibleChapter } from './bibleReader';

const fromMock = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

describe('bibleReader', () => {
  beforeEach(() => {
    clearBibleChapterCache();
    fromMock.mockReset();
  });

  it('loads and caches a chapter', async () => {
    const rows = [
      { verse_number: 1, text: 'In the beginning.' },
      { verse_number: 2, text: 'The earth was formless.' },
    ];

    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: rows, error: null }),
    };
    fromMock.mockReturnValue(query);

    const chapter = await loadBibleChapter('idoma-v1', 'genesis', 1);

    expect(chapter.verses).toEqual([
      { verseNumber: 1, text: 'In the beginning.' },
      { verseNumber: 2, text: 'The earth was formless.' },
    ]);
    expect(getCachedBibleChapter('idoma-v1', 'genesis', 1)).toEqual(chapter);
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent requests for the same chapter', async () => {
    let resolveQuery!: (value: { data: unknown[]; error: null }) => void;
    const pending = new Promise<{ data: unknown[]; error: null }>((resolve) => {
      resolveQuery = resolve;
    });

    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(pending),
    };
    fromMock.mockReturnValue(query);

    const first = loadBibleChapter('idoma-v1', 'genesis', 1);
    const second = loadBibleChapter('idoma-v1', 'genesis', 1);

    resolveQuery({ data: [{ verse_number: 1, text: 'In the beginning.' }], error: null });

    await expect(Promise.all([first, second])).resolves.toHaveLength(2);
    expect(fromMock).toHaveBeenCalledTimes(1);
  });
});
