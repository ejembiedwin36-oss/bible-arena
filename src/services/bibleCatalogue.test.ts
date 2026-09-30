import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearBibleCatalogueCache, listBibleBooks, listBibleLanguages, listBibleVersions } from './bibleCatalogue';

const fromMock = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

function queryReturning(data: unknown[]) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error: null }),
  };
  fromMock.mockReturnValue(query);
  return query;
}

describe('bibleCatalogue', () => {
  beforeEach(() => {
    clearBibleCatalogueCache();
    fromMock.mockReset();
  });

  it('lists active languages in configured order', async () => {
    queryReturning([
      { id: 'en-id', code: 'en', name: 'English' },
      { id: 'id-id', code: 'id', name: 'Idoma' },
    ]);

    await expect(listBibleLanguages()).resolves.toEqual([
      { id: 'en-id', code: 'en', name: 'English' },
      { id: 'id-id', code: 'id', name: 'Idoma' },
    ]);
  });

  it('caches language catalogue requests', async () => {
    queryReturning([{ id: 'en-id', code: 'en', name: 'English' }]);

    await listBibleLanguages();
    await listBibleLanguages();

    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it('lists versions for a selected language', async () => {
    queryReturning([
      { id: 'v1', name: 'English Bible', abbreviation: 'EB', language_id: 'en-id' },
    ]);

    await expect(listBibleVersions('en-id')).resolves.toEqual([
      { id: 'v1', name: 'English Bible', abbreviation: 'EB', languageId: 'en-id' },
    ]);
  });

  it('lists books in canonical order', async () => {
    queryReturning([
      { id: 'gen', name: 'Genesis', abbreviation: 'Gen', book_order: 1 },
      { id: 'exo', name: 'Exodus', abbreviation: 'Exo', book_order: 2 },
    ]);

    await expect(listBibleBooks()).resolves.toEqual([
      { id: 'gen', name: 'Genesis', abbreviation: 'Gen', bookOrder: 1 },
      { id: 'exo', name: 'Exodus', abbreviation: 'Exo', bookOrder: 2 },
    ]);
  });
});
