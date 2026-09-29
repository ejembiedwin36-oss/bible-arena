import { useEffect, useState } from 'react';
import { getChapterVerses, type BibleChapterVerse } from '../lib/bibleData';
import { prefetchNextChapter } from '../lib/bibleChapterNavigation';

export function useBibleChapterVerses(chapterId: string | null, versionId: string | null) {
  const [verses, setVerses] = useState<BibleChapterVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chapterId || !versionId) {
      setVerses([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getChapterVerses(chapterId, versionId).then(({ data, error: queryError }) => {
      if (cancelled) return;
      if (queryError) {
        setError(queryError.message);
        setVerses([]);
      } else {
        setVerses((data ?? []) as BibleChapterVerse[]);
        void prefetchNextChapter(chapterId, versionId);
      }
      setLoading(false);
    }).catch((requestError) => {
      if (cancelled) return;
      setError(requestError instanceof Error ? requestError.message : 'Unable to load this chapter.');
      setVerses([]);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [chapterId, versionId]);

  return { verses, loading, error };
}
