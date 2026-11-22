# Bible Arena — Multi-Version Bible Text Expansion Plan

## Goal

Expand the Reader beyond KJV and WEB while preserving accurate verse references, version metadata, source attribution, and the existing user data linked to verse IDs.

## Current confirmed state (2026-11-22)

- Production has two Bible versions: KJV and WEB.
- The existing KJV importer is source-specific and reads the aruljohn/Bible-kjv JSON files.
- A general dataset validator exists at `scripts/validateBibleDataset.ts`, with tests at `scripts/validateBibleDataset.test.ts`.
- The import pipeline is documented in `docs/bible-import-pipeline.md`.
- Live KJV/WEB verse-key differences are documented in `docs/PROJECT_LOG.md`; resolve against the actual source/versification before correcting rows.
- No production data or schema changes are part of this plan.

## Work sequence

1. **Reconcile WEB**: identify and record the exact source/version currently represented in production; compare its source verse keys with the live database; classify intentional versification differences versus omissions. Do not auto-add or delete verses.
2. **Generalize the importer**: separate source retrieval, normalization, validation, chapter-ID mapping, and database writing. Require explicit version/translation IDs and source/license metadata. Keep dry-run as the default.
3. **Test importer safety**: reject duplicate keys, missing/empty text, invalid chapter mappings, unexpected book/chapter/verse counts, and incomplete source data. Verify idempotent upsert and preservation of existing verse IDs.
4. **Rights/source gate for each version**: record the exact edition, source URL, license or written permission, attribution requirements, and any trademark/naming restrictions before importing or publishing text.
5. **Add versions in order of verified readiness**: first finish and validate WEB; then add only versions with verified sources and redistribution rights. Good News Translation and The Passion Translation must not be assumed freely redistributable merely because they are accessible online. Obtain the required permission/license before storing or serving their full text.
6. **Staging validation**: import to a non-production target, compare counts and verse keys, sample every book, test version switching and reader queries, and only then prepare a reviewed production rollout.
7. **Publish metadata last**: a version must remain inactive/unverified until its import and rights checks pass. Do not activate a placeholder record as if full text were available.

## Important architecture rule

The Reader should obtain the selected version from the version catalogue and load that version's verse records. Adding a version should primarily be a validated data/import operation, not a UI hardcoding exercise. Preserve canonical book/chapter IDs and existing verse IDs so bookmarks, notes, topics, and Arena references remain stable.

## Completion checklist

- [ ] Confirm current WEB source and edition.
- [ ] Resolve the known WEB verse-key differences.
- [ ] Add regression tests for allowed versification exceptions.
- [ ] Refactor importer into reusable source/normalization/validation/write stages.
- [ ] Document source and rights for each proposed version.
- [ ] Validate each new dataset in staging.
- [ ] Test Reader version switching and empty/missing chapter handling.
- [ ] Publish only verified, rights-cleared versions.

This plan is an engineering and rights checklist, not a claim that the listed translations have been acquired or imported.
