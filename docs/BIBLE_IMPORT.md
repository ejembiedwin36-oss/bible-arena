# Bible Arena — Bible Import Procedure

## Phase 1 source

The first production Reader dataset is **King James Version (KJV)** because the current project has an active KJV version record and the selected source repository provides the KJV book files in JSON format.

Source repository:

- `https://github.com/aruljohn/Bible-kjv`
- Source license: MIT License (see the source repository's LICENSE file).

The importer records the source URL, license metadata, expected verse count, imported verse count, and completion status in `bible_import_batches`.

## Import command

From the repository root:

```bash
SUPABASE_URL="..." \
SUPABASE_SERVICE_ROLE_KEY="..." \
node scripts/import-kjv.mjs
```

The default mode is a **dry run**. It downloads and validates all 66 books, their chapter counts, and the total verse count without changing the database.

To write the validated import:

```bash
SUPABASE_URL="..." \
SUPABASE_SERVICE_ROLE_KEY="..." \
node scripts/import-kjv.mjs --apply
```

The service-role key must only be used in a trusted local/admin environment. Never place it in frontend code or commit it to Git.

## Validation performed

Before writing, the importer verifies:

- 66 canonical books exist in Supabase.
- Every source book maps to one canonical book.
- Every source chapter count matches the database catalogue.
- The total chapter count is 1,189.
- Every verse is inserted against the canonical chapter/verse identity.
- Translation text is stored separately in `bible_translation_verses`.
- Import provenance is recorded.

## Important language rule

This import establishes the **English baseline only**. It does not mark Idoma as having Bible text.

Idoma remains the next language priority, and its Bible text must come from a separately verified source before the language capability is changed from unavailable to active.
