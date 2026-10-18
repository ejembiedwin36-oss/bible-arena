import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearBibleCatalogueCache, listBibleBooks, listBibleLanguages, listBibleVersions } from './bibleCatalogue';

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

function orderedQueryReturning(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

describe('bibleCatalogue', () => {
  beforeEach(() => {
    clearBibleCatalogueCache();
    fromMock.mockReset();
  });

  it('lists active languages in configured order', async () => {
    fromMock.mockReturnValue(orderedQueryReturning([
      { id: 'en-id', code: 'en', name: 'English' },
      { id: 'id-id', code: 'id', name: 'Idoma' },
    ]));

    await expect(listBibleLanguages()).resolves.toEqual([
      { id: 'en-id', code: 'en', name: 'English' },
      { id: 'id-id', code: 'id', name: 'Idoma' },
    ]);
  });

  it('caches language catalogue requests', async () => {
    fromMock.mockReturnValue(orderedQueryReturning([
      { id: 'en-id', code: 'en', name: 'English' },
    ]));

    await listBibleLanguages();
    await listBibleLanguages();

    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it('lists versions for a selected language and matches its translation', async () => {
    const versionQuery = orderedQueryReturning([
      { id: 'v1', name: 'English Bible', abbreviation: 'EB', language_id: 'en-id' },
    ]);
    const languageQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { code: 'en' }, error: null }),
    };
    const translationQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({
        data: [{ id: 'translation-1', code: 'EB', name: 'English Bible' }],
        error: null,
      }).then(resolve),
    };

    fromMock
      .mockReturnValueOnce(versionQuery)
      .mockReturnValueOnce(languageQuery)
      .mockReturnValueOnce(translationQuery);

    await expect(listBibleVersions('en-id')).resolves.toEqual([
      {
        id: 'v1',
        name: 'English Bible',
        abbreviation: 'EB',
        languageId: 'en-id',
        translationId: 'translation-1',
      },
    ]);
  });

  it('lists books in canonical order', async () => {
    fromMock.mockReturnValue(orderedQueryReturning([
      { id: 'gen', name: 'Genesis', abbreviation: 'Gen', book_order: 1, chapter_count: 50 },
      { id: 'exo', name: 'Exodus', abbreviation: 'Exo', book_order: 2, chapter_count: 40 },
    ]));

    await expect(listBibleBooks()).resolves.toEqual([
      { id: 'gen', name: 'Genesis', abbreviation: 'Gen', bookOrder: 1, chapterCount: 50 },
      { id: 'exo', name: 'Exodus', abbreviation: 'Exo', bookOrder: 2, chapterCount: 40 },
    ]);
  });
});
