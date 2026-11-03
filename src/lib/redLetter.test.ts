import { describe, expect, it } from 'vitest';
import { getRedLetterSegments } from './redLetter';

describe('red-letter KJV passages', () => {
  it('colors only the verified words and leaves introductory narration unchanged', () => {
    const text = 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.';
    const segments = getRedLetterSegments('John', 14, 6, text);
    expect(segments[0]).toEqual({ text: 'Jesus saith unto him, ', red: false });
    expect(segments.slice(1).map((segment) => segment.text).join('')).toBe(text.slice(22));
    expect(segments[1].red).toBe(true);
  });

  it('does not mark unknown verses or mismatched translations red', () => {
    expect(getRedLetterSegments('John', 14, 7, 'Some text')).toEqual([{ text: 'Some text', red: false }]);
    expect(getRedLetterSegments('John', 14, 6, 'Different translation')).toEqual([{ text: 'Different translation', red: false }]);
  });
});
