import { useEffect, useState } from 'react';
import type { RedLetterSegment } from './redLetter';

type BookData = { book: string; chapters: Record<string, Record<string, string>> };
const sourceCommit = '5b6675c85615e1b9f5d6bf6ec955d6f2e8f4aaaa';
const files: Record<string, string> = {
  matthew: 'matthew', mark: 'mark', luke: 'luke', john: 'john',
  acts: 'acts', '1 corinthians': '1_corinthians',
  '2 corinthians': '2_corinthians', revelation: 'revelation',
};
const cache = new Map<string, Promise<BookData | null>>();

function loadBook(book: string): Promise<BookData | null> {
  const file = files[book.toLowerCase()];
  if (!file) return Promise.resolve(null);
  const cached = cache.get(file);
  if (cached) return cached;
  const request = fetch(`https://raw.githubusercontent.com/nolanbaxter/kjv-bible/${sourceCommit}/${file}.json`)
    .then(async (response) => {
      if (!response.ok) throw new Error('Red-letter source unavailable');
      return (await response.json()) as BookData;
    })
    .catch(() => null);
  cache.set(file, request);
  return request;
}

/** Convert source red-letter markup into spans, only when words align exactly.
 * Source uses [brackets] for translator additions and {braces} for Jesus' words.
 */
export function alignRedLetters(source: string, displayed: string): RedLetterSegment[] {
  const tokens: Array<{ word: string; red: boolean }> = [];
  let red = false;
  let buffer = '';
  for (const char of source) {
    if (char === '{' || char === '}') {
      if (buffer) {
        tokens.push(...tokenize(buffer).map((word) => ({ word, red })));
        buffer = '';
      }
      red = char === '{';
    } else if (char !== '[' && char !== ']') {
      buffer += char;
    }
  }
  if (buffer) tokens.push(...tokenize(buffer).map((word) => ({ word, red })));
  const displayedWords = [...displayed.matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)];
  if (tokens.length !== displayedWords.length ||
      tokens.some((token, index) => normalize(token.word) !== normalize(displayedWords[index][0]))) {
    return [{ text: displayed, red: false }];
  }
  const segments: RedLetterSegment[] = [];
  let cursor = 0;
  for (let i = 0; i < displayedWords.length; i++) {
    const word = displayedWords[i];
    const start = word.index ?? cursor;
    const end = start + word[0].length;
    if (start > cursor) append(segments, displayed.slice(cursor, start), i > 0 ? tokens[i - 1].red : tokens[i].red);
    append(segments, displayed.slice(start, end), tokens[i].red);
    cursor = end;
  }
  if (cursor < displayed.length) append(segments, displayed.slice(cursor), tokens.at(-1)?.red ?? false);
  return segments;
}

function tokenize(text: string): string[] {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
}
function normalize(text: string): string {
  return text.toLowerCase().replace(/’/g, "'");
}
function append(parts: RedLetterSegment[], text: string, red: boolean) {
  if (!text) return;
  const last = parts[parts.length - 1];
  if (last?.red === red) last.text += text;
  else parts.push({ text, red });
}

export function useRedLetterBook(book: string | undefined, enabled: boolean) {
  const [data, setData] = useState<BookData | null>(null);
  useEffect(() => {
    let active = true;
    setData(null);
    if (enabled && book) void loadBook(book).then((result) => { if (active) setData(result); });
    return () => { active = false; };
  }, [book, enabled]);
  return data;
}

export function redLetterVerse(data: BookData | null, chapter: number, verse: number, displayed: string): RedLetterSegment[] {
  const source = data?.chapters[String(chapter)]?.[String(verse)];
  return source ? alignRedLetters(source, displayed) : [{ text: displayed, red: false }];
}
