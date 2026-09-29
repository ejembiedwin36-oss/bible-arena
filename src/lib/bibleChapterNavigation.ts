import { supabase } from './supabase';
import { withSupabaseTimeout } from './resilientSupabase';
import { getNextChapter, type ChapterNavigationRecord } from './bibleNavigation';
import { prefetchChapter } from './biblePrefetch';

type ChapterRow = {
  id: string;
  book_id: string;
  chapter_number: number;
};

type BookRow = {
  id: string;
  book_name: string;
  book_order: number;
  chapter_count: number;
};

export async function prefetchNextChapter(
  chapterId: string,
  versionId: string,
) {
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
      .select('id,book_name,book_order,chapter_count')
      .eq('id', current.book_id)
      .maybeSingle(),
  );

  if (bookError || !book) return;

  const { data: nextBook, error: nextBookError } = await withSupabaseTimeout(
    supabase
      .from('bible_books')
      .select('id,book_name,book_order,chapter_count')
      .eq('book_order', book.book_order + 1)
      .maybeSingle(),
  );

  if (nextBookError) return;

  const currentRecord: ChapterNavigationRecord = {
    id: current.id,
    bookId: book.id,
    bookName: book.book_name,
    bookOrder: book.book_order,
    chapterNumber: current.chapter_number,
    chapterCount: book.chapter_count,
  };

  const candidates: ChapterNavigationRecord[] = [
    currentRecord,
    ...(nextBook
      ? [{
          id: '',
          bookId: nextBook.id,
          bookName: nextBook.book_name,
          bookOrder: nextBook.book_order,
          chapterNumber: 1,
          chapterCount: nextBook.chapter_count,
        }]
      : []),
  ];

  if (current.chapter_number < book.chapter_count) {
    const { data: nextChapter } = await withSupabaseTimeout(
      supabase
        .from('bible_chapters')
        .select('id,book_id,chapter_number')
        .eq('book_id', book.id)
        .eq('chapter_number', current.chapter_number + 1)
        .maybeSingle(),
    );

    if (nextChapter) prefetchChapter(nextChapter.id, versionId);
    return;
  }

  const next = getNextChapter(currentRecord, candidates);
  if (!next?.id) return;

  const { data: nextChapter } = await withSupabaseTimeout(
    supabase
      .from('bible_chapters')
      .select('id')
      .eq('book_id', next.bookId)
      .eq('chapter_number', 1)
      .maybeSingle(),
  );

  if (nextChapter) prefetchChapter(nextChapter.id, versionId);
}

export type { ChapterRow, BookRow };
