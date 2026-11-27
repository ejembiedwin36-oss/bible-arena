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
| American Standard Version (1901) | ASV | eBible.org labels the 1901 edition public domain and provides USFM, USFX, and VPL downloads. See [edition details](https://ebible.org/find/details.php?id=eng-asv) and [copyright notice](https://ebible.org/eng-asv/copyright.htm). |
| Berean Standard Bible (current 3rd printing) | BSB | The publisher dedicates the Berean Bible texts to the public domain and provides USFM, USJ, and USX downloads. See [publisher terms](https://berean.bible/terms.htm) and [downloads](https://berean.bible/downloads.htm); eBible.org also lists the BSB as public domain. See [eBible edition details](https://ebible.org/details.php?id=engbsb). |
| Young's Literal Translation | YLT | eBible.org lists the edition as public domain and provides USFM/USFX. See [edition details](https://ebible.org/bible/details.php?id=engylt). |
| Darby Translation | DBY | eBible.org lists the edition as public domain and provides USFM/USFX. See [edition details](https://ebible.org/bible/details.php?id=engDBY). |
| Bible in Basic English (1949/1964) | BBE | eBible.org's copyright catalogue lists it as public domain. Exact source files and edition history still need review before import. See [copyright catalogue](https://ebible.org/Scriptures/copyright.php). |
| Douay-Rheims 1899 American Edition | DRV | eBible.org lists it as public domain and provides USFM/USFX. It has a Catholic canon; confirm the intended 66-book policy and any deuterocanonical handling before import. See [edition details](https://www.ebible.org/find/details.php?id=engDRA). |
| Revised Version (1895 package) | RV | eBible.org lists it as public domain and provides USFM/USFX, but this package includes Apocrypha; filter and audit canon explicitly rather than assuming a 66-book corpus. See [edition details](https://ebible.org/find/details.php?id=engrv5). |

ASV and BSB are the first candidates to prepare; YLT and DBY are the next low-friction candidates. BBE remains pending exact source/edition review. DRV and RV require explicit canon decisions because their source traditions/packages include books beyond the 66-book Protestant canon. This is not a legal opinion about every jurisdiction or every third-party package. Prefer the publisher/eBible source package, record its date and checksum, preserve the edition attribution, confirm the precise edition and canon, normalize it, and validate it before any database operation. Do not treat an aggregator's repackaged file as automatically equivalent to the publisher's source.

## Exact source packages identified

- **BSB:** The publisher's GitHub repository, [BSB-publishing/bsb2usfm](https://github.com/BSB-publishing/bsb2usfm), separates public-domain Bible text from MIT-licensed conversion tools. Its README states that BSB is a complete 66-book edition. Latest release inspected: [v5.24](https://github.com/BSB-publishing/bsb2usfm/releases/tag/v5.24); standard asset: `BSB_usfm.zip` (1,647,915 bytes). The repository's `LICENSING_INFO.md` and `UNLICENSE` are the relevant text-rights records. Prefer the standard USFM package, not interlinear/Strong's variants, for a plain Reader import.
- **ASV:** eBible.org's edition page links the `eng-asv_usfm.zip` and `eng-asv_usfx.zip` packages. Record the archive's own source date and checksum after download.
- **Download status:** The official archive URLs have been identified, but archive downloads from this execution environment failed. No mirror or scraped online text has been substituted, and no Scripture corpus has been imported.
## Existing KJV workflow

The existing KJV-specific scripts remain in place and unchanged. This new script is additive, so the known KJV import procedure is not silently altered.

## Tests

Run `npm test` to execute the Vitest suite, including `scripts/prepare-bible-version-import.test.ts`.

Do not add a version to the active catalogue until source rights, complete corpus validation, storage mapping, and Reader smoke tests have all passed.

## USFM source parsing (offline only)

A cautious parser and standard 66-book map are now in the repository:

- scripts/parse-usfm-corpus.mjs
- scripts/usfm-book-code-map.json
- scripts/parse-usfm-corpus.test.ts

After downloading and extracting an official USFM archive into a directory outside the repository, run these commands:

node scripts/parse-usfm-corpus.mjs <usfm-directory> scripts/usfm-book-code-map.json <normalized-corpus.json>

node scripts/prepare-bible-version-import.mjs <normalized-corpus.json> <chapter-map.json> <prepared-rows.json> <book-count> <chapter-count> <verse-count>

The parser currently handles the basic \id, \c, and \v structure and strips common formatting/footnote markers. It intentionally rejects verse bridges and suffix labels that the current integer verse schema cannot represent safely. This is an initial parser, not a certification of every USFM 3.0 feature; inspect source files and run the tests before using it on a full corpus. No database writes are performed by either command.

The official archive download attempt from the connected execution environment failed. Do not substitute scraped text or an unverified mirror; obtain the source archive from eBible.org/publisher, record the exact source URL, release/printing, and checksum, then validate the complete corpus.
