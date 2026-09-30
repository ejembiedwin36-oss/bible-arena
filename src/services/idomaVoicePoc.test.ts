import { describe, expect, it } from 'vitest';
import { prepareIdomaVoicePoc } from './idomaVoicePoc';

describe('idomaVoicePoc', () => {
  it('creates a real-provider test boundary without faking recognition or synthesis', () => {
    const result = prepareIdomaVoicePoc({
      audioReference: 'fixtures/idoma/matthew-5-command.wav',
      expectedIntent: {
        type: 'open_book_chapter',
        bookName: 'Matthew',
        chapterNumber: 5,
      },
    });

    expect(result.languageCode).toBe('id');
    expect(result.status).toBe('ready_for_provider_test');
    expect(result.expectedIntent).toEqual({
      type: 'open_book_chapter',
      bookName: 'Matthew',
      chapterNumber: 5,
    });
    expect(result.notes.join(' ')).toContain('native-speaker');
  });
});
