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
| Berean Standard Bible | BSB | Not imported; public-domain claim/source package still needs local verification |
| American Standard Version (1901) | ASV | Not imported; public-domain source package still needs local verification |
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
