import { supabase } from './supabase';
import { withSupabaseTimeout } from './resilientSupabase';
import { prefetchChapter } from './biblePrefetch';

/**
 * Prefetch exactly one next chapter with the minimum metadata queries needed.
 * Normal chapters require only the current chapter lookup + next chapter lookup.
 * A next-book lookup is performed only at a book boundary.
 */
export async function prefetchNextChapter(chapterId: string, versionId: string) {
  const { data: current, error: currentError } = await withSupabaseTimeout(
    supabase
      .from('bible_chapters')
      .select('id,book_id,chapter_number')
      .eq('id', chapterId)
      .maybeSingle(),
  );

  if (currentError || !current) return;

  const { data: book, error: bookError } = await withSupabaseTimeout(
    supabase
      .from('bible_books')
      .select('id,book_order,chapter_count')
      .eq('id', current.book_id)
      .maybeSingle(),
  );

  if (bookError || !book) return;

  // Most navigation stays inside the same book, so avoid querying the next
  // book unless the current chapter is the final chapter of this book.
  if (current.chapter_number < book.chapter_count) {
    const { data: nextChapter, error: nextError } = await withSupabaseTimeout(
      supabase
        .from('bible_chapters')
        .select('id')
        .eq('book_id', book.id)
        .eq('chapter_number', current.chapter_number + 1)
        .maybeSingle(),
    );

    if (!nextError && nextChapter) {
      prefetchChapter(nextChapter.id, versionId);
    }
    return;
  }

  // We reached the final chapter of a book. Find the next book, then its
  // first chapter. If there is no next book, this is the end of the Bible.
  const { data: nextBook, error: nextBookError } = await withSupabaseTimeout(
    supabase
      .from('bible_books')
      .select('id')
      .eq('book_order', book.book_order + 1)
      .maybeSingle(),
  );

  if (nextBookError || !nextBook) return;

  const { data: nextChapter, error: nextChapterError } = await withSupabaseTimeout(
    supabase
      .from('bible_chapters')
      .select('id')
      .eq('book_id', nextBook.id)
      .eq('chapter_number', 1)
      .maybeSingle(),
  );

  if (!nextChapterError && nextChapter) {
    prefetchChapter(nextChapter.id, versionId);
  }
}
