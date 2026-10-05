import { describe, expect, it } from 'vitest';
import { LanguageUnderstandingRouter } from './languageUnderstanding';

describe('LanguageUnderstandingRouter', () => {
  it('routes a verified language to its provider', async () => {
    const router = new LanguageUnderstandingRouter(new Map([
      ['id', {
        understand: async ({ transcript }) => ({ type: 'open_book', bookName: transcript }),
      }],
    ]));

    await expect(router.understand({ transcript: 'open Matthew', languageCode: 'id' })).resolves.toEqual({
      type: 'open_book',
      bookName: 'open Matthew',
    });
  });

  it('fails closed for an unverified language', async () => {
    const router = new LanguageUnderstandingRouter(new Map());

    await expect(router.understand({ transcript: 'Idoma command', languageCode: 'id' })).resolves.toEqual({
      type: 'unknown',
      transcript: 'Idoma command',
    });
  });
});
