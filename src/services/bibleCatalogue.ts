import { supabase } from '../lib/supabase';

export type BibleLanguage = {
  id: string;
  code: string;
  name: string;
};

export type BibleVersion = {
  id: string;
  name: string;
  abbreviation: string | null;
  languageId: string;
  translationId: string | null;
};

export type BibleBook = {
  id: string;
  name: string;
  abbreviation: string | null;
  bookOrder: number;
  chapterCount: number;
};

const languageCache = new Map<string, BibleLanguage[]>();
const versionCache = new Map<string, BibleVersion[]>();
const bookCache = new Map<string, BibleBook[]>();

export function clearBibleCatalogueCache() {
  languageCache.clear();
  versionCache.clear();
  bookCache.clear();
}

export async function listBibleLanguages(): Promise<BibleLanguage[]> {
  const key = 'all';
  const cached = languageCache.get(key);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('languages')
    .select('id, code, name')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (error) throw error;

  const result = (data ?? []).map((language) => ({
    id: language.id,
    code: language.code,
    name: language.name,
  }));

  languageCache.set(key, result);
  return result;
}

export async function listBibleVersions(languageId: string): Promise<BibleVersion[]> {
  const cached = versionCache.get(languageId);
  if (cached) return cached;

  const { data: versionRows, error: versionError } = await supabase
    .from('bible_versions')
    .select('id, name, abbreviation, language_id')
    .eq('language_id', languageId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (versionError) throw versionError;

  const language = await supabase
    .from('languages')
    .select('code')
    .eq('id', languageId)
    .maybeSingle();

  if (language.error) throw language.error;

  const { data: translations, error: translationError } = await supabase
    .from('bible_translations')
    .select('id, code, name')
    .eq('language_code', language.data?.code ?? '')
    .eq('is_active', true);

  if (translationError) throw translationError;

  const result = (versionRows ?? []).map((version) => {
    const translation = (translations ?? []).find(
      (candidate) =>
        candidate.code?.toLowerCase() === version.abbreviation?.toLowerCase() ||
        candidate.name?.toLowerCase() === version.name?.toLowerCase(),
    );

    return {
      id: version.id,
      name: version.name,
      abbreviation: version.abbreviation,
      languageId: version.language_id,
      translationId: translation?.id ?? null,
    };
  });

  versionCache.set(languageId, result);
  return result;
}

export async function listBibleBooks(): Promise<BibleBook[]> {
  const key = 'all';
  const cached = bookCache.get(key);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('bible_books')
    .select('id, name, abbreviation, book_order, chapter_count')
    .order('book_order', { ascending: true });

  if (error) throw error;

  const result = (data ?? []).map((book) => ({
    id: book.id,
    name: book.name,
    abbreviation: book.abbreviation,
    bookOrder: book.book_order,
    chapterCount: book.chapter_count,
  }));

  bookCache.set(key, result);
  return result;
}
