import { useEffect, useState } from 'react';
import type { RedLetterSegment } from './redLetter';

/**
 * Red-letter marker sidecars from renniemaharaj/kjv-bible (MIT per README).
 * Only apply a marker when the source verse matches the displayed KJV exactly.
 * Marker offsets are Unicode code points, not JavaScript UTF-16 offsets.
 */
type Span = { start: number; end: number };
type MarkerBook = { chapters: Record<string, Record<string, { words_of_christ: Span[] }>> };
type CleanBook = Record<string, Record<string, string>>;
type CorpusBook = { markers: MarkerBook; verses: CleanBook };
export type RedLetterLoadState = { data: CorpusBook | null; loading: boolean; error: boolean };
const books = new Set(['matthew','mark','luke','john','acts','1 corinthians','2 corinthians','revelation']);
const cache = new Map<string, Promise<CorpusBook | null>>();
const base = 'https://raw.githubusercontent.com/renniemaharaj/kjv-bible/main';

async function loadBook(book: string): Promise<CorpusBook | null> {
  const key = book.toLowerCase();
  if (!books.has(key)) return null;
  if (!cache.has(key)) {
    cache.set(key, Promise.all([
      fetch(`${base}/markers/${encodeURIComponent(book)}.json`),
      fetch(`${base}/${encodeURIComponent(book)}.json`),
    ]).then(async ([markerResponse, verseResponse]) => {
      if (!markerResponse.ok || !verseResponse.ok) throw new Error('Annotation data unavailable');
      return {
        markers: await markerResponse.json() as MarkerBook,
        verses: await verseResponse.json() as CleanBook,
      };
    }).catch(() => null));
  }
  return (await cache.get(key)) ?? null;
}

export function useRedLetterBook(book: string | undefined, enabled: boolean): RedLetterLoadState {
  const [state, setState] = useState<RedLetterLoadState>({ data: null, loading: false, error: false });
  useEffect(() => {
    let active = true;
    const supported = Boolean(book && books.has(book.toLowerCase()));
    setState({ data: null, loading: enabled && supported, error: false });
    if (enabled && book && supported) void loadBook(book).then((data) => {
      if (active) setState({ data, loading: false, error: !data });
    });
    return () => { active = false; };
  }, [book, enabled]);
  return state;
}

export function alignRedLetters(source: string, displayed: string, spans: Span[]): RedLetterSegment[] {
  if (source !== displayed) return [{ text: displayed, red: false }];
  const characters = Array.from(displayed);
  const valid = spans.every((span) =>
    Number.isInteger(span.start) && Number.isInteger(span.end) &&
    span.start >= 0 && span.end <= characters.length && span.start < span.end,
  );
  if (!valid) return [{ text: displayed, red: false }];
  const red = Array(characters.length).fill(false) as boolean[];
  for (const span of spans) for (let i = span.start; i < span.end; i++) red[i] = true;
  const result: RedLetterSegment[] = [];
  for (let i = 0; i < characters.length; i++) {
    const previous = result[result.length - 1];
    if (previous && previous.red === red[i]) previous.text += characters[i];
    else result.push({ text: characters[i], red: red[i] });
  }
  return result;
}

export function redLetterVerse(data: CorpusBook | null, chapter: number, verse: number, displayed: string): RedLetterSegment[] {
  const key = String(chapter);
  const verseKey = String(verse);
  const source = data?.verses[key]?.[verseKey];
  const spans = data?.markers.chapters[key]?.[verseKey]?.words_of_christ;
  return source !== undefined && spans ? alignRedLetters(source, displayed, spans) : [{ text: displayed, red: false }];
}
