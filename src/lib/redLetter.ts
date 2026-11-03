/**
 * Verified, conservative red-letter spans. This list is intentionally partial:
 * never infer that an entire verse is Jesus' speech or color unverified text.
 * Add further passages only after checking the KJV wording and speaker.
 */
type Passage = { book: string; chapter: number; verse: number; start: string; end?: string };
const passages: Passage[] = [
  { book: 'John', chapter: 14, verse: 6, start: 'I am the way, the truth, and the life' },
  { book: 'John', chapter: 11, verse: 25, start: 'I am the resurrection, and the life' },
  { book: 'John', chapter: 8, verse: 12, start: 'I am the light of the world' },
  { book: 'Matthew', chapter: 11, verse: 28, start: 'Come unto me, all ye that labour and are heavy laden' },
  { book: 'John', chapter: 10, verse: 11, start: 'I am the good shepherd' },
  { book: 'John', chapter: 15, verse: 5, start: 'I am the vine, ye are the branches' },
];

export type RedLetterSegment = { text: string; red: boolean };

export function getRedLetterSegments(book: string, chapter: number, verse: number, text: string): RedLetterSegment[] {
  const passage = passages.find((item) => item.book.toLowerCase() === book.toLowerCase() && item.chapter === chapter && item.verse === verse);
  if (!passage) return [{ text, red: false }];
  const start = text.toLowerCase().indexOf(passage.start.toLowerCase());
  if (start < 0) return [{ text, red: false }];
  const end = passage.end ? text.toLowerCase().indexOf(passage.end.toLowerCase(), start) : text.length;
  if (end < 0 || end <= start) return [{ text, red: false }];
  return [
    ...(start > 0 ? [{ text: text.slice(0, start), red: false }] : []),
    { text: text.slice(start, end), red: true },
    ...(end < text.length ? [{ text: text.slice(end), red: false }] : []),
  ];
}
