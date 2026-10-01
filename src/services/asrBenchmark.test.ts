import { describe, expect, it } from 'vitest';
import { createAsrBenchmarkRun, wordErrorRate } from './asrBenchmark';

describe('asrBenchmark', () => {
  it('creates paired candidate runs for each test case', () => {
    const run = createAsrBenchmarkRun([
      {
        id: 'idoma-matthew-5',
        languageCode: 'id',
        audioReference: 'fixtures/idoma/matthew-5.wav',
        expectedIntent: { type: 'open_book_chapter', bookName: 'Matthew', chapterNumber: 5 },
      },
    ]);

    expect(run).toEqual([
      expect.objectContaining({
        caseId: 'idoma-matthew-5',
        candidates: ['omnilingual', 'idoma-specialist'],
        status: 'pending',
      }),
    ]);
  });

  it('calculates word error rate', () => {
    expect(wordErrorRate('open Matthew chapter five', 'open Matthew chapter five')).toBe(0);
    expect(wordErrorRate('open Matthew chapter five', 'open Matthew five')).toBe(0.25);
  });
});
