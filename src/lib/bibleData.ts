import { supabase } from './supabase';
import { withSupabaseTimeout } from './resilientSupabase';

export type BibleChapterVerse = {
  id: string;
  verse_number: number;
  text: string;
  is_jesus_words: boolean;
};

/** Fetch one chapter only. Keep the payload intentionally small for high traffic. */
export async function getChapterVerses(chapterId: string, versionId: string) {
  return withSupabaseTimeout(
    supabase
      .from('bible_translation_verses')
      .select('id,verse_number,text,is_jesus_words')
      .eq('chapter_id', chapterId)
      .eq('version_id', versionId)
      .order('verse_number', { ascending: true }),
  );
}
