# Bible Arena data scripts

This directory is reserved for repeatable Bible-content import and validation tooling.

## Import pipeline

1. Obtain an approved Bible source and record its license/source metadata.
2. Parse the source into the canonical book/chapter/verse shape.
3. Validate the complete 66-book structure and references.
4. Validate duplicate, missing, empty, and orphaned records.
5. Map records to the existing Supabase `bible_books` and `bible_chapters` IDs.
6. Import only validated records into the selected Bible version.
7. Run post-import counts and integrity checks before publishing the version.

## Rules

- Do not commit copyrighted Bible text unless its license permits redistribution.
- Do not use AI to guess `is_jesus_words` metadata.
- Imports must be repeatable and safe to re-run.
- Never write unvalidated source data directly to production tables.
