# English Bible Version Expansion — Source & Rights Gate

**Reviewed:** 2026-11-22  
**Scope:** English versions only. Idoma and other language work is intentionally out of scope for this phase.

## Current production catalogue

A read-only production query confirmed exactly two active English versions:

| Version | Abbreviation | Active | Rights verified | Direct verse rows |
|---|---|---:|---:|---:|
| King James Version | KJV | yes | yes | 31,102 |
| World English Bible | WEB | yes | yes | 31,098 |

No Amplified, Good News Translation, or The Passion Translation version record is currently present in the active English catalogue.

## Requested translations

### The Passion Translation (TPT)

- Publisher permissions page: https://www.thepassiontranslation.com/permissions/
- The publisher's published quotation allowance is up to 500 verses, subject to conditions; quotations may not amount to a complete Bible book or exceed 20% of the work in which they appear.
- Use beyond those limits requires written approval.
- **Decision:** Do not bulk import or publish the complete TPT text without a written licence covering full digital app display, storage, and distribution.

### Amplified Bible (AMP / AMPC)

- Lockman Foundation permissions: https://www.lockman.org/permission-to-quote-copyright-trademark-information/
- The published allowance for AMP/AMPC is up to 1,000 verses, subject to conditions; quotations may not make up a complete book, exceed 50% of the work, or exceed 1,000 verses stored in an electronic retrieval system.
- The same policy says web pages/apps require the full copyright notice and a clickable Lockman link. The allowance is not a licence for a complete Bible database.
- **Decision:** Obtain written permission for the intended full-text Bible Arena app integration before importing AMP 2015 or AMPC 1987. Keep editions distinct.

### Good News Translation (GNT / TEV)

- American Bible Society rights and permissions: https://www.americanbible.org/rights-and-permissions/
- GNT quotation guidelines allow up to 500 verses subject to conditions, but the policy explicitly requires written permission for electronic use in software applications and similar interactive technology.
- GNT resource page: https://gnt.bible/resources/
- **Decision:** Written permission is required for the Bible Arena app integration. Do not scrape or bulk import from public reading websites.

## Safe technical approach

1. Record the exact edition, publisher, source, permission document, attribution wording, and permitted distribution modes for each translation.
2. Keep each edition separate (for example AMP 2015 versus AMPC 1987).
3. Only create an active, rights-verified production catalogue record after the appropriate permission is documented and the complete dataset has passed validation.
4. Prefer a licensed API/provider if its contract permits Bible Arena's intended display, caching, storage, offline access, and user scale. Confirm those rights explicitly; API access alone is not necessarily a redistribution licence.
5. Do not copy text from websites or use a public API to bypass publisher licensing.
6. Continue improving the generic importer and test it using public-domain datasets first. Import only into a non-production target until review is complete.

## Immediate next actions

- [ ] Prepare permission requests to BroadStreet Publishing Group / The Passion Translation rights holder for TPT full-text app use.
- [ ] Prepare a permission request to The Lockman Foundation for AMP 2015 and/or AMPC 1987 full-text app use.
- [ ] Prepare a permission request to American Bible Society for GNT full-text app use.
- [ ] Ask each rights holder to specify display, storage, caching, offline, audio/TTS, commercial/non-commercial, geographic, and attribution terms.
- [ ] Evaluate additional public-domain English translations as separate candidates, verifying each edition and source before import.
- [ ] Do not mark a version active or rights-verified based only on an internet dataset or an API endpoint.

## Important distinction

A translation may be quotable in a limited number of verses but still not be legally available for a complete Bible reader. Bible Arena's requirement is full-version reading, so limited quotation permissions do not satisfy the product requirement.
