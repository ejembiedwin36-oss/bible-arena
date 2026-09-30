# Bible Import & Validation Pipeline

## Purpose

Bible Arena stores Bible text in Supabase so the Reader does not depend on a third-party Bible API for every reading request.

The first production seed will use a source whose redistribution terms permit the intended use. The World English Bible (WEB) is a candidate because eBible.org states that it is public domain; the WEB name is a trademark and the source asks that modified text not be called the World English Bible.

## Pipeline

```text
Approved source
    -> raw staging
    -> normalize
    -> validate
    -> map to Bible Arena IDs
    -> transactional import
    -> post-import validation
    -> publish version
```

## Data model

Each imported verse must resolve to:

- `version_id`
- `chapter_id`
- `verse_number`
- `text`
- `is_jesus_words`

The importer must never create orphaned verses or duplicate `(version_id, chapter_id, verse_number)` records.

## Validation gates

1. Exactly 66 canonical books for the first WEB canon.
2. Book order matches Bible Arena's `book_order`.
3. Every chapter maps to an existing `bible_chapters.id`.
4. Every verse maps to an existing chapter.
5. Verse numbers are positive and unique within a chapter/version.
6. No unexpected duplicate verse keys.
7. No empty verse text.
8. Imported version metadata exists before verse insertion.
9. Import is idempotent: rerunning the same source/version must not duplicate rows.
10. Post-import counts are recorded and checked before the version is marked published.

## Red-letter metadata

`is_jesus_words` must come from a documented source or manually reviewed dataset. It must not be inferred by an unreviewed AI pass and silently treated as authoritative.

If reliable red-letter metadata is unavailable for a source, the import must leave the field false/null according to the schema policy rather than inventing classifications.

## Licensing rule

Every imported version must have a recorded source and license/permission note. Do not import or redistribute a translation merely because its text is available online.

For WEB, preserve the source attribution and trademark naming requirements. If Bible Arena changes the actual WEB text, it must not present that modified text as the World English Bible.

## Rollout

- Stage 1: import WEB into a non-production/staging target.
- Stage 2: run structural and count validation.
- Stage 3: spot-check representative chapters from every book.
- Stage 4: validate Reader queries against the imported version.
- Stage 5: publish the version only after all gates pass.
- Stage 6: repeat the pipeline for each additional language/version after licensing and source validation.
