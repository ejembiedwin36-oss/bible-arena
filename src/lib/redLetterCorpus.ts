import { useEffect, useState } from 'react';
import type { RedLetterSegment } from './redLetter';

type Span = { start: number; end: number };
type AnnotatedVerse = { text: string; spans: Span[] };
type CorpusBook = Record<string, Record<string, AnnotatedVerse>>;
export type RedLetterLoadState = { data: CorpusBook | null; loading: boolean; error: boolean };

// Bundled at build time, not fetched from GitHub in the reader's browser.
// This prevents external network failures from silently hiding all red letters.
const loaders: Record<string, () => Promise<{ default: CorpusBook }>> = {
  matthew: () => import('../data/redLetters/Matthew.json'),
  mark: () => import('../data/redLetters/Mark.json'),
  luke: () => import('../data/redLetters/Luke.json'),
  john: () => import('../data/redLetters/John.json'),
  acts: () => import('../data/redLetters/Acts.json'),
  '1 corinthians': () => import('../data/redLetters/1Corinthians.json'),
  '2 corinthians': () => import('../data/redLetters/2Corinthians.json'),
  revelation: () => import('../data/redLetters/Revelation.json'),
};
const cache = new Map<string, Promise<CorpusBook | null>>();
async function loadBook(book: string): Promise<CorpusBook | null> {
  const key = book.toLowerCase();
  const loader = loaders[key];
  if (!loader) return null;
  if (!cache.has(key)) cache.set(key, loader().then((module) => module.default).catch(() => null));
  return (await cache.get(key)) ?? null;
}

export function useRedLetterBook(book: string | undefined, enabled: boolean): RedLetterLoadState {
  const [state, setState] = useState<RedLetterLoadState>({ data: null, loading: false, error: false });
  useEffect(() => {
    let active = true;
    const supported = Boolean(book && loaders[book.toLowerCase()]);
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
  const annotation = data?.[String(chapter)]?.[String(verse)];
  return annotation ? alignRedLetters(annotation.text, displayed, annotation.spans) : [{ text: displayed, red: false }];
}
