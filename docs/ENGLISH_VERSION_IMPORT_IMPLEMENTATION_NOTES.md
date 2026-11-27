# English Version Import — Application Integration Notes

**Reviewed:** 2026-11-22

## Live catalogue findings

Read-only production inspection confirmed:

- Active English `bible_versions`: KJV and WEB only.
- Direct `bible_verses` rows: KJV 31,102; WEB 31,098.
- Both editions have rows across all 1,189 canonical chapters.
- `bible_translations` currently contains only the English KJV legacy record.
- No TPT, AMP/AMPC, GNT, ASV, BSB, or other new English edition has been imported and verified in the live catalogue.

## The active Reader's actual data path

The active Reader is implemented in `src/App.tsx`; it does not call the separate `src/services/bibleCatalogue.ts` and `src/services/bibleReader.ts` helpers for its main chapter-loading path.

The active path does the following:

1. `loadReaderOptions()` reads active rows from `languages` and `bible_versions`.
2. It stores the selected `bible_versions.id` on the selected version object.
3. `cachedChapterVerses(chapterId, versionId)` reads `bible_verses`, filtering by both `chapter_id` and `version_id`.
4. Chapter navigation and adjacent-chapter prefetch use the same `bible_versions.id`.

**Consequence:** To make a new edition readable by the current app, its complete validated verse corpus must be stored in `bible_verses` with the new edition's own `bible_versions.id` as `version_id`. A `bible_translations` row alone, or rows only in `bible_translation_verses`, will not make it appear in the active Reader path.

## Legacy helper distinction

The separate `src/services/bibleCatalogue.ts` helper matches version records to `bible_translations` and returns a translation ID for some editions. The separate `src/services/bibleReader.ts` helper attempts a direct `bible_verses` read and then a legacy `bible_translation_verses` fallback.

These helpers are not the active `src/App.tsx` Reader loading path inspected in this review. Treat them as a parallel/legacy service implementation until their callers and intended future role are fully reconciled. Do not rely on their fallback behavior when planning a production import for the active Reader.

## Import requirements for each edition

1. Exact edition identity (for example AMP 2015 is not AMPC 1987).
2. Written permission/license covering Bible Arena's actual app use and distribution.
3. Source provenance, edition/release identifier, archive checksum, and required attribution.
4. Complete source corpus in a normalized staging file; do not store copyrighted corpus text in Git unless its license permits it.
5. Canonical book/chapter mapping and edition-specific versification exceptions.
6. Duplicate, missing, empty-text, and count validation against the correct edition's expected reference set.
7. A dry-run plan that maps each normalized verse to the existing canonical `bible_chapters.id` and the intended `bible_versions.id`.
8. Idempotent staging/import logic and post-import Reader smoke tests.
9. Only after review, an explicitly approved production data import and activation decision.

## Source package verification (2026-11-22)

- **ASV 1901:** eBible.org currently labels the edition public domain and lists `eng-asv_usfm.zip` and `eng-asv_usfx.zip`. Its directory listing gives the USFM archive size as 2,875,616 bytes and a source timestamp of 2026-10-30. The archive download was attempted from this execution environment but did not complete. No ASV corpus has been staged.
- **BSB:** The official `BSB-publishing/bsb2usfm` GitHub release API confirms release `v5.24`, published 2026-11-19, and the standard `BSB_usfm.zip` asset at 1,647,915 bytes with SHA-256 `be31ef23eb38492de9e6e17983b7d46a1a4abe010bd1ff2ad3e338795d21233d`. The publisher's terms dedicate the Berean Bible text to the public domain. The archive download was attempted from this execution environment but did not complete. No BSB corpus has been staged.
- The official BSB release also contains the Majority Standard Bible, but that is New Testament-only; it must not be represented as a complete 66-book Bible edition.

## Current boundary

No production catalogue rows, verse data, schema, migrations, or deployment settings were changed during this review. Production table grants were hardened as documented in the section below. The next content step is to obtain the official ASV/BSB archives through a working download route, inspect their internal book files and metadata, implement/test a source-specific parser, and run the reusable validator against a read-only canonical chapter map. Do not create placeholder selectable versions or activate incomplete datasets.


## Production read-permission hardening (2026-11-22)

A live audit found that the five read-only Bible catalogue/content tables — `languages`, `bible_versions`, `bible_books`, `bible_chapters`, and `bible_verses` — had RLS enabled and SELECT-only policies, but the `anon` and `authenticated` roles also held unnecessary INSERT, UPDATE, DELETE, TRUNCATE, and other table privileges.

The production grants were corrected:

- Revoked all table privileges from `anon` and `authenticated` on those five tables.
- Re-granted only `SELECT` to both roles.
- Re-queried effective privileges after the change.

**Verification:** all five tables now return `SELECT=true` and `INSERT/UPDATE/DELETE/TRUNCATE=false` for both roles. The existing public-read RLS policies remain in place. This keeps the active Reader's required reads available while removing client-side mutation and table-truncation privileges. Service-role/owner maintenance remains separate from public client access.

The eight active language catalogue rows were rechecked and left unchanged: English (`en`), Idoma (`id`), Igbo (`ig`), Yoruba (`yo`), Hausa (`ha`), Tiv (`tiv`), Igala (`igl`), and Efik / Calabar (`efi`). These are language entries, not proof that a Bible edition in each language has been imported.

See [English Edition Master Register](ENGLISH_VERSION_MASTER_REGISTER.md) for the single-source, duplicate-free English edition list and release gate.

## Official ASV/BSB preparation and guarded import (2026-11-27)

The preparation workflow downloaded and verified official source archives:

- ASV 1901 eBible USFM: 2,875,616 bytes; SHA-256 00b7b6c76cb1eb67b22ca51bd5ac13c2df526c13e1c38e78b862a7a2367f7071.
- Berean Standard Bible USFM release v5.24: 1,647,915 bytes; SHA-256 be31ef23eb38492de9e6e17983b7d46a1a4abe010bd1ff2ad3e338795d21233d.

Both normalized corpora passed the current offline validator and were mapped to the live canonical chapter IDs: 66 books, 1,189 chapters, and 31,086 verse rows each. ASV has 16 empty verse markers in the source; the importer skips those empty markers and stores an omission report rather than fabricating text. BSB has 1,218 whole-verse red-letter flags preserved from explicit USFM markers.

The guarded importer is scripts/import-public-domain-english.mjs. It requires --apply and server-side Supabase credentials; it creates/uses one version row per language+abbreviation, writes in idempotent batches, records bible_import_batches provenance, verifies exact count, and only then activates the edition. The approval marker is currently false, so no production rows have been inserted. The import workflow was verified as a no-op while approval was false.

Prepared artifact workflow run: 45931638883 (expires 2026-12-04).
