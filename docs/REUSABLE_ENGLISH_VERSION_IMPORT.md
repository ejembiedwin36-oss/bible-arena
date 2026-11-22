# Reusable English Bible Version Importer

**Scope:** English editions only. This is an offline preparation tool; it does not write to Supabase.

## Command

```bash
node scripts/prepare-bible-version-import.mjs <normalized-corpus.json> <chapter-map.json> <output.json> <book-count> <chapter-count> <verse-count>
```

The corpus must be an array of `{ book, chapter, verse, text }` objects. The chapter map must be an array of `{ book, chapter, chapter_id }` objects exported from the target Bible Arena database.

The expected counts are mandatory and edition-specific. Do not blindly assume every edition has identical verse counts or versification. Check any known differences against a trusted edition-specific source before setting the expected values.

## Safety checks

- Rejects malformed corpus and chapter-map rows.
- Rejects duplicate chapter mappings and duplicate verse references.
- Requires every verse to map to a real chapter ID.
- Requires explicit expected book, chapter, and verse counts.
- Rejects empty verse text.
- Preserves `is_jesus_words` only when the source explicitly provides a boolean; it never invents red-letter labels.
- Writes a prepared JSON file only. No credentials, network calls, or database writes.

## First English candidates to evaluate

| Edition | Abbreviation | Current source evidence |
|---|---|---|
| American Standard Version (1901) | ASV | eBible.org lists it as public domain and provides USFM/VPL downloads. |
| Berean Standard Bible | BSB | eBible.org lists it as public domain and provides USFM/VPL downloads. |

These are candidates, not yet imported or approved for production. Download the official source, preserve its stated attribution, confirm its precise edition/canon, normalize it, and validate it before any database operation.

## Existing KJV workflow

The existing KJV-specific scripts remain in place and unchanged. This new script is additive, so the known KJV import procedure is not silently altered.

## Tests

Run `npm test` to execute the Vitest suite, including `scripts/prepare-bible-version-import.test.ts`.

Do not add a version to the active catalogue until source rights, complete corpus validation, storage mapping, and Reader smoke tests have all passed.