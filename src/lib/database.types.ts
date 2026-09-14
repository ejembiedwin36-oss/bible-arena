export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BibleVerseRow = {
  id: string;
  chapter_id: string;
  verse_number: number;
  text: string;
  version_id: string;
};

export type BibleChapterRow = {
  id: string;
  book_id: string;
  chapter_number: number;
};

export type BibleBookRow = {
  id: string;
  name: string;
  abbreviation: string;
  chapter_count: number;
};

export type BibleVersionRow = {
  id: string;
  name: string;
  abbreviation: string;
  language_id: string;
  is_active: boolean;
};
