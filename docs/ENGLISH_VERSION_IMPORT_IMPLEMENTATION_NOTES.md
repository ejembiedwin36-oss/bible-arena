# English Version Import — Application Integration Notes

**Reviewed:** 2026-11-22

## Live catalogue findings

Read-only production inspection confirmed:

- Active English `bible_versions`: KJV and WEB only.
- Direct `bible_verses` rows: KJV 31,102; WEB 31,098.
- `bible_translations` currently contains only the active English KJV record.
- No TPT, AMP/AMPC, or GNT records are currently available in the English translation catalogue.

## How the Reader resolves a version

The current Reader first queries `bible_verses` using `version_id`. If no direct rows are found, it falls back to `bible_translation_verses` using `translation_id`.

The catalogue service resolves `translationId` by matching the version abbreviation/name to an active `bible_translations` record. KJV and WEB currently use their direct `bible_versions.id` as the Reader lookup ID; other versions depend on a matching translation record.

Therefore, every new edition must have a deliberate, tested mapping between:
- its `bible_versions` catalogue record;
- its `bible_translations` record, if using the legacy translation-backed path;
- its actual verse storage path (`bible_verses` or `bible_translation_verses`).

Do not create placeholder catalogue records that look selectable but have no complete verse corpus. Do not change existing KJV/WEB mappings while introducing new editions.

## Import requirements for each edition

1. Exact edition identity (for example AMP 2015 is not AMPC 1987).
2. Written permission/license that covers Bible Arena's actual app use.
3. Source provenance and required copyright attribution.
4. Complete source corpus in a normalized staging file.
5. Canonical book/chapter mapping and edition-specific versification exceptions.
6. Duplicate, missing, empty-text, and count validation.
7. Idempotent staging import and post-import Reader smoke tests.
8. Only after review, a production migration/import and activation decision.

## Current boundary

This review did not modify production catalogue rows, verse data, permissions, or schema. It records the application integration requirements so future version imports do not break existing Reader behavior.
