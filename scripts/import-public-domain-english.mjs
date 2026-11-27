import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const PUBLIC_DOMAIN_ENGLISH_EDITIONS = {
  ASV: {
    name: 'American Standard Version (1901)',
    abbreviation: 'ASV',
    publisher: 'eBible.org',
    source_name: 'eBible.org ASV 1901 USFM sha256=00b7b6c76cb1eb67b22ca51bd5ac13c2df526c13e1c38e78b862a7a2367f7071',
    source_url: 'https://ebible.org/find/show.php?id=eng-asv',
    license_name: 'Public Domain',
    license_url: 'https://ebible.org/asv/copyright.htm',
    expected: { books: 66, chapters: 1189, verses: 31086 },
  },
  BSB: {
    name: 'Berean Standard Bible',
    abbreviation: 'BSB',
    publisher: 'BSB Publishing, LLC',
    source_name: 'Berean Standard Bible USFM v5.24 sha256=be31ef23eb38492de9e6e17983b7d46a1a4abe010bd1ff2ad3e338795d21233d',
    source_url: 'https://github.com/BSB-publishing/bsb2usfm/releases/download/v5.24/BSB_usfm.zip',
    license_name: 'Public Domain',
    license_url: 'https://berean.bible/terms.htm',
    expected: { books: 66, chapters: 1189, verses: 31086 },
  },
  YLT: {
    name: "Young's Literal Translation (1898)",
    abbreviation: 'YLT',
    publisher: 'Robert Young; digital USFM source: eBible.org',
    source_name: 'Young\'s Literal Translation 1898 USFM sha256=c526b4e362fef13916a14765a7e331267f6a1227db58549fc61d3288a930a12b',
    source_url: 'https://ebible.org/Scriptures/engylt_usfm.zip',
    license_name: 'Public Domain',
    license_url: 'https://ebible.org/Bible/details.php?id=engylt',
    expected: { books: 66, chapters: 1189, verses: 31102 },
  },
};

export function validatePreparedRows(rows, expected = { books: 66, chapters: 1189, verses: 31086 }) {
  if (!Array.isArray(rows)) throw new Error('Prepared corpus must be a JSON array.');
  const books = new Set();
  const chapters = new Set();
  const verses = new Set();
  for (const row of rows) {
    if (!row || typeof row.book !== 'string' || !row.book.trim()) throw new Error('Prepared row has an invalid book name.');
    if (!Number.isInteger(row.chapter) || row.chapter < 1) throw new Error('Prepared row has an invalid chapter.');
    if (!Number.isInteger(row.verse_number) || row.verse_number < 1) throw new Error('Prepared row has an invalid verse number.');
    if (typeof row.chapter_id !== 'string' || !row.chapter_id.trim()) throw new Error('Prepared row is missing chapter_id.');
    if (typeof row.text !== 'string' || !row.text.trim()) throw new Error('Prepared row has empty Scripture text.');
    if (row.is_jesus_words !== undefined && typeof row.is_jesus_words !== 'boolean') throw new Error('is_jesus_words must be boolean when supplied.');
    const chapterKey = row.book.trim() + '\u0000' + row.chapter;
    const verseKey = row.chapter_id + '\u0000' + row.verse_number;
    if (verses.has(verseKey)) throw new Error('Duplicate prepared verse key: ' + row.book + ' ' + row.chapter + ':' + row.verse_number);
    books.add(row.book.trim());
    chapters.add(chapterKey);
    verses.add(verseKey);
  }
  const counts = { books: books.size, chapters: chapters.size, verses: verses.size };
  for (const key of Object.keys(expected)) {
    if (counts[key] !== expected[key]) throw new Error('Expected ' + expected[key] + ' ' + key + '; received ' + counts[key] + '.');
  }
  return counts;
}

function restUrl(base, resource, query) {
  const url = new URL(base.replace(/\/+$/, '') + '/rest/v1/' + resource);
  for (const [key, value] of Object.entries(query || {})) url.searchParams.set(key, value);
  return url.toString();
}

function authHeaders(key, prefer) {
  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

async function requestJson(fetchImpl, url, key, options = {}) {
  const response = await fetchImpl(url, { ...options, headers: { ...authHeaders(key, options.prefer), ...(options.headers || {}) } });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1200);
    throw new Error('Supabase REST request failed (' + response.status + '): ' + detail);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function getExactCount(fetchImpl, base, key, versionId) {
  const url = restUrl(base, 'bible_verses', { select: 'id', version_id: 'eq.' + versionId });
  const response = await fetchImpl(url, {
    method: 'GET',
    headers: { ...authHeaders(key, 'count=exact'), Range: '0-0' },
  });
  if (!response.ok) throw new Error('Unable to verify verse count (' + response.status + '): ' + (await response.text()).slice(0, 1000));
  const range = response.headers.get('content-range');
  const total = range && range.split('/')[1];
  if (!total || total === '*') throw new Error('Supabase did not return an exact verse count.');
  return Number(total);
}

async function patchBatch(fetchImpl, base, key, batchId, values) {
  return requestJson(fetchImpl, restUrl(base, 'bible_import_batches', { id: 'eq.' + batchId }), key, {
    method: 'PATCH',
    body: JSON.stringify(values),
    prefer: 'return=minimal',
  });
}

export async function importPublicDomainEdition(rows, editionCode, options = {}) {
  const config = PUBLIC_DOMAIN_ENGLISH_EDITIONS[editionCode];
  if (!config) throw new Error('Unknown public-domain edition code: ' + editionCode);
  const expected = options.expected || config.expected;
  const counts = validatePreparedRows(rows, expected);
  const apply = options.apply === true;
  if (!apply) return { edition: editionCode, counts, applied: false, message: 'Dry run only; no database requests were made.' };

  const base = options.supabaseUrl;
  const key = options.serviceRoleKey;
  const fetchImpl = options.fetchImpl || fetch;
  if (!base || !key) throw new Error('Apply mode requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  const languageRows = await requestJson(fetchImpl, restUrl(base, 'languages', { select: 'id,code', code: 'eq.en', limit: '2' }), key);
  if (!Array.isArray(languageRows) || languageRows.length !== 1) throw new Error('Expected exactly one English language catalogue row.');
  const languageId = languageRows[0].id;

  const existingRows = await requestJson(fetchImpl, restUrl(base, 'bible_versions', {
    select: 'id,name,abbreviation,is_active,rights_verified',
    language_id: 'eq.' + languageId,
    abbreviation: 'eq.' + config.abbreviation,
    limit: '2',
  }), key);
  if (!Array.isArray(existingRows) || existingRows.length > 1) throw new Error('Version lookup returned an unexpected number of rows.');

  let version = existingRows[0] || null;
  if (version && version.name !== config.name) {
    throw new Error('An existing ' + config.abbreviation + ' row has a different name; manual review is required.');
  }
  if (!version) {
    const created = await requestJson(fetchImpl, restUrl(base, 'bible_versions', { select: 'id,name,abbreviation,is_active,rights_verified' }), key, {
      method: 'POST',
      prefer: 'return=representation',
      body: JSON.stringify({
        language_id: languageId,
        name: config.name,
        abbreviation: config.abbreviation,
        publisher: config.publisher,
        license_name: config.license_name,
        license_url: config.license_url,
        rights_verified: true,
        is_active: false,
      }),
    });
    if (!Array.isArray(created) || created.length !== 1) throw new Error('Version creation did not return one version row.');
    version = created[0];
  } else {
    await requestJson(fetchImpl, restUrl(base, 'bible_versions', { id: 'eq.' + version.id }), key, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: JSON.stringify({
        publisher: config.publisher,
        license_name: config.license_name,
        license_url: config.license_url,
        rights_verified: true,
      }),
    });
  }

  const initialCount = await getExactCount(fetchImpl, base, key, version.id);
  if (initialCount > expected.verses) {
    throw new Error('Existing ' + editionCode + ' version has ' + initialCount + ' rows, more than the expected ' + expected.verses + '; no rows were changed.');
  }
  if (version.is_active && initialCount !== expected.verses) {
    throw new Error('Existing ' + editionCode + ' version is active but incomplete; manual review required before import.');
  }
  if (version.is_active && initialCount === expected.verses) {
    return { edition: editionCode, versionId: version.id, counts, applied: true, alreadyComplete: true };
  }

  const batches = await requestJson(fetchImpl, restUrl(base, 'bible_import_batches', { select: 'id' }), key, {
    method: 'POST',
    prefer: 'return=representation',
    body: JSON.stringify({
      version_id: version.id,
      source_name: config.source_name,
      source_url: config.source_url,
      license_name: config.license_name,
      license_url: config.license_url,
      rights_verified: true,
      import_status: 'importing',
      expected_verse_count: expected.verses,
      imported_verse_count: initialCount,
    }),
  });
  if (!Array.isArray(batches) || batches.length !== 1) throw new Error('Import batch creation did not return one batch row.');
  const batchId = batches[0].id;

  try {
    const payload = rows.map(function (row) {
      const result = {
        version_id: version.id,
        chapter_id: row.chapter_id,
        verse_number: row.verse_number,
        text: row.text,
      };
      // PostgREST bulk inserts require every object in a JSON array to have the same keys.
      // The BSB corpus omits this optional source annotation on some verses; use the
      // database's documented default (false) so all rows have a consistent shape.
      result.is_jesus_words = typeof row.is_jesus_words === 'boolean' ? row.is_jesus_words : false;
      return result;
    });
    const chunkSize = 500;
    let processed = 0;
    for (let start = 0; start < payload.length; start += chunkSize) {
      const chunk = payload.slice(start, start + chunkSize);
      await requestJson(fetchImpl, restUrl(base, 'bible_verses', {
        on_conflict: 'version_id,chapter_id,verse_number',
      }), key, {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=minimal',
        body: JSON.stringify(chunk),
      });
      processed += chunk.length;
      if (processed % 5000 === 0 || processed === payload.length) {
        await patchBatch(fetchImpl, base, key, batchId, { imported_verse_count: processed });
      }
    }

    const finalCount = await getExactCount(fetchImpl, base, key, version.id);
    if (finalCount !== expected.verses) {
      throw new Error('Post-import count mismatch for ' + editionCode + ': expected ' + expected.verses + ', received ' + finalCount + '. Version remains inactive.');
    }

    await requestJson(fetchImpl, restUrl(base, 'bible_versions', { id: 'eq.' + version.id }), key, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: JSON.stringify({ rights_verified: true, is_active: true }),
    });
    await patchBatch(fetchImpl, base, key, batchId, {
      import_status: 'completed',
      imported_verse_count: finalCount,
      error_message: null,
      completed_at: new Date().toISOString(),
    });
    return { edition: editionCode, versionId: version.id, batchId, counts, applied: true, active: true };
  } catch (error) {
    try {
      await patchBatch(fetchImpl, base, key, batchId, {
        import_status: 'failed',
        error_message: String(error).slice(0, 2000),
      });
    } catch {
      // Keep the original import error; batch status update is best-effort.
    }
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const files = args.filter(function (arg) { return arg !== '--apply'; });
  if (!files.length) {
    console.error('Usage: node scripts/import-public-domain-english.mjs [--apply] <ASV-, BSB-, or YLT-prepared.json> ...');
    process.exit(1);
  }
  for (const file of files) {
    const filename = path.basename(file).toLowerCase();
    const code = ['ASV', 'BSB', 'YLT'].find(function (edition) {
      return filename.includes(edition.toLowerCase());
    }) || null;
    if (!code) throw new Error('Cannot infer edition code from filename: ' + file);
    const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = await importPublicDomainEdition(rows, code, {
      apply,
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    console.log(JSON.stringify(result));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(function (error) {
    console.error(error.message || String(error));
    process.exit(1);
  });
}
