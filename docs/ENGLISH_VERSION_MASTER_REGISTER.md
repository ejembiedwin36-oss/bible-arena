# Bible Arena — English Edition Master Register

**Last reviewed:** 2026-11-22  
**Rule:** One catalogue entry per distinct published edition. Never create a second KJV or WEB entry. A language row is not a Bible edition, and a requested edition is not considered added until its complete text is legally usable, imported, and tested in the active Reader.

## Already present in production

| Edition | Abbreviation | State |
|---|---|---|
| King James Version | KJV | Active; keep exactly one entry |
| World English Bible | WEB | Active; keep exactly one entry |

## Requested additions — each listed once

| Edition | Abbreviation | State |
|---|---|---|
| New King James Version | NKJV | Not imported; separate edition from KJV |
| New Living Translation | NLT | Not imported |
| New American Standard Bible | NASB | Not imported; likely interpretation of the earlier spoken “WAS”, not a confirmed separate title |
| The Passion Translation | TPT | Not imported |
| Amplified Bible | AMP | Not imported; decide separately whether AMPC is also wanted |
| Good News Translation | GNT | Not imported; also known as TEV in some catalogue contexts |
| The Message | MSG | Not imported |
| Nigerian Pidgin Bible | PCM | Not imported |
| New International Version | NIV | Not imported |
| English Standard Version | ESV | Not imported |
| Christian Standard Bible | CSB | Not imported |
| New Revised Standard Version Updated Edition | NRSVue | Not imported |
| New International Reader's Version | NIrV | Not imported |
| Contemporary English Version | CEV | Not imported |
| New English Translation | NET | Not imported |
| The Living Bible | TLB | Not imported |
| Berean Standard Bible | BSB | Not imported; public-domain status confirmed; source package still needs staging |
| American Standard Version (1901) | ASV | Not imported; public-domain status confirmed; source package still needs staging |
| Darby Bible | DBY | Not imported; verify source and public-domain status for the exact edition |
| Young's Literal Translation | YLT | Not imported; verify source and public-domain status for the exact edition |

## Duplicate-prevention decisions

- KJV appears once and is not added again.
- WEB appears once and is not added again.
- NKJV is a distinct translation and is not a duplicate of KJV.
- GNT and TEV are aliases for the same translation family here; do not create separate GNT and TEV rows without proof that the source is a distinct edition.
- AMP and AMPC are distinct editions. AMP is the current requested entry; do not silently add AMPC as a duplicate or alias.
- The earlier spoken “WAS” has not been treated as a confirmed edition. NASB is only a working interpretation; confirm before creating any catalogue row.
- “Requested” does not mean “licensed”, “imported”, or “active”.

## Release gate for every new edition

1. Verify exact edition identity and publisher/source.
2. Record written rights for full app display, storage, caching, offline use, distribution, and any audio/TTS features that will be enabled.
3. Obtain the complete lawful source corpus and preserve provenance/checksum.
4. Normalize book/chapter/verse references and validate duplicates, missing verses, and empty text.
5. Map the dataset to existing canonical chapter IDs in a dry run.
6. Import idempotently to the approved target and verify counts.
7. Test the active Reader with that edition before activation.
8. Only then mark the edition active and rights-verified.

No copyrighted full-text edition may be bulk-imported based only on limited quotation allowances or public website visibility.


## Public-domain candidates — source-rights confirmation (2026-11-22)

- **ASV 1901:** eBible.org identifies the edition as public domain and explicitly says it may be copied freely. Its official edition page offers USFM and USFX source packages: https://www.ebible.org/find/details.php?id=eng-asv and https://www.ebible.org/eng-asv/copyright.htm. Rights status is confirmed for the source edition; the corpus has not yet been downloaded, inspected, normalized, or imported.
- **BSB:** eBible.org identifies the Berean Standard Bible as public domain and provides USFM/USFX source packages: https://www.ebible.org/find/details.php?id=engbsb. Berean Bible's publisher download page also offers the current USFM package: https://berean.bible/downloads.htm. Rights status is confirmed for the text; the corpus has not yet been downloaded, inspected, normalized, or imported.

These confirmations remove the need to seek a conventional copyright licence for these public-domain texts, but they do not waive source provenance, integrity, versification, or import validation.

## Preparation status update (2026-11-27)

- ASV 1901 and BSB source archives have now been downloaded by the successful official-source preparation workflow, checksum-verified, parsed, and mapped to the canonical chapter IDs. Both prepared corpora contain 66 books, 1,189 chapters, and 31,086 rows.
- They are **prepared but not yet imported or active**. Production import was blocked because the GitHub Actions Supabase URL and service-role secrets are missing. The approval marker has been reset to false to keep the production import guarded until credentials are configured.
- Current production remains KJV and WEB only. Do not mark ASV or BSB as active until the import workflow completes and the live database verifies the expected counts.

