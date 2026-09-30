import { describe, expect, it } from 'vitest';
import { parseVoiceIntent } from './voiceIntent';

describe('voiceIntent', () => {
  it('parses a chapter navigation command', () => {
    expect(parseVoiceIntent('Take me to Matthew chapter 5', { languageCode: 'en' })).toEqual({
      type: 'open_book_chapter',
      bookName: 'Matthew',
      chapterNumber: 5,
    });
  });

  it('parses a book command', () => {
    expect(parseVoiceIntent('open Psalms', { languageCode: 'en' })).toEqual({
      type: 'open_book',
      bookName: 'Psalms',
    });
  });

  it('parses a Bible search command', () => {
    expect(parseVoiceIntent('search faith and hope', { languageCode: 'en' })).toEqual({
      type: 'search_bible',
      query: 'faith and hope',
    });
  });

  it('does not pretend unsupported language understanding is complete', () => {
    const result = parseVoiceIntent('open Matthew chapter 5', { languageCode: 'id' });
    expect(result.type).toBe('open_book_chapter');
  });
});
