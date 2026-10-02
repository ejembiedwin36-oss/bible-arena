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
};

export type BibleBook = {
  id: string;
  name: string;
  abbreviation: string | null;
  bookOrder: number;
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

  const { data, error } = await supabase
    .from('bible_versions')
    .select('id, name, abbreviation, language_id')
    .eq('language_id', languageId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;

  const result = (data ?? []).map((version) => ({
    id: version.id,
    name: version.name,
    abbreviation: version.abbreviation,
    languageId: version.language_id,
  }));

  versionCache.set(languageId, result);
  return result;
}

export async function listBibleBooks(): Promise<BibleBook[]> {
  const key = 'all';
  const cached = bookCache.get(key);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('bible_books')
    .select('id, name, abbreviation, book_order')
    .order('book_order', { ascending: true });

  if (error) throw error;

  const result = (data ?? []).map((book) => ({
    id: book.id,
    name: book.name,
    abbreviation: book.abbreviation,
    bookOrder: book.book_order,
  }));

  bookCache.set(key, result);
  return result;
}
