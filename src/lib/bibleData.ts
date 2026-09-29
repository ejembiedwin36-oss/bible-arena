import { supabase } from './supabase';
import { withSupabaseTimeout } from './resilientSupabase';
import { getCachedChapter, setCachedChapter } from './bibleChapterCache';

export type BibleChapterVerse = {
  id: string;
  verse_number: number;
  text: string;
  is_jesus_words: boolean;
};

/** Fetch one chapter only, using a bounded in-memory cache first. */
export async function getChapterVerses(chapterId: string, versionId: string) {
  const cached = getCachedChapter(chapterId, versionId);
  if (cached) return { data: cached, error: null };

  const result = await withSupabaseTimeout(
    supabase
      .from('bible_translation_verses')
      .select('id,verse_number,text,is_jesus_words')
      .eq('chapter_id', chapterId)
      .eq('version_id', versionId)
      .order('verse_number', { ascending: true }),
  );

  if (!result.error && result.data) {
    setCachedChapter(chapterId, versionId, result.data as BibleChapterVerse[]);
  }

  return result;
}
