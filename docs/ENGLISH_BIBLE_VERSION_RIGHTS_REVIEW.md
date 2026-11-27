# English Bible Version Expansion — Source & Rights Gate

**Reviewed:** 2026-11-27  
**Scope:** English translation catalogue, source verification, and full-text app rights.

## Current production catalogue

A read-only production query on 2026-11-27 confirmed these four English versions are active, rights-verified, and populated:

| Version | Abbreviation | Active | Rights verified | Direct verse rows |
|---|---|---:|---:|---:|
| American Standard Version (1901) | ASV | yes | yes | 31,086 |
| Berean Standard Bible | BSB | yes | yes | 31,086 |
| King James Version | KJV | yes | yes | 31,102 |
| World English Bible | WEB | yes | yes | 31,098 |

The Reader has been tested with all four versions. This table supersedes the older two-version inventory recorded in the 2026-11-22 review.

## Requested additional English translations

The owner requested TPT, Good News, AMP, MSG, NLT (the owner confirmed this is the intended translation; the earlier "NTL" was a typo), and NIV.

### The Passion Translation (TPT)

- Rights holder permissions page: https://www.thepassiontranslation.com/permissions/
- Limited quotation allowances do not authorize a complete Bible database or full-version reader.
- **Decision:** Obtain written permission covering full digital app display, storage, and distribution before importing.

### Amplified Bible (AMP / AMPC)

- Lockman Foundation permissions: https://www.lockman.org/permission-to-quote-copyright-trademark-information/
- AMP 2015 and AMPC 1987 are distinct editions and must not be conflated.
- Published quotation limits are not a licence for a complete Bible database.
- **Decision:** Request written permission for the exact edition and intended app use before importing. Confirm whether the requested edition is AMP 2015 (not AMPC 1987).

### Good News Translation (GNT / TEV)

- American Bible Society rights and permissions: https://www.americanbible.org/rights-and-permissions/
- The published guidance requires written permission for electronic use in software applications and similar interactive technology.
- **Decision:** Request written permission for full Bible Arena integration. Do not scrape or bulk-import from public reading websites.

### The Message (MSG) and New Living Translation (NLT)

- Tyndale permissions information: https://www.tyndale.com/permissions
- Limited quotation guidance is not a full-text app licence. Bible app use should be referred to the publisher's authorized licensing/API process.
- **Decision:** Request written authorization for the exact edition and intended display, storage, caching, offline, audio/TTS, and distribution features before importing.


### New Living Translation (NLT) — additional API finding

- Tyndale's official permissions page directs Bible app requests to its authorized Bible API process: https://www.tyndale.com/permissions
- The published 500-verse / 25% quotation allowance is not permission to reproduce the complete Bible in Bible Arena.
- The NLT API site currently announces that public API access ends on **2027-01-01**. Anonymous access is limited to 50 verses per request and 500 requests per day for non-commercial use; key-based access has separate limits, and commercial use requires further licensing discussion: https://api.nlt.to/
- **Decision:** Do not build a production dependency on the public NLT API because its announced shutdown is imminent. Request a durable app licence or authorized provider arrangement from Tyndale, and confirm what access (if any) remains available after the public API shutdown.

### New International Version (NIV)

- Biblica permissions: https://www.biblica.com/permissions/
- Online/app use is subject to Biblica's terms and permissions process; personal-use access or limited quotation guidance does not establish redistribution rights for Bible Arena.
- **Decision:** Obtain written permission or an authorized provider agreement covering Bible Arena's intended use before importing.

## Additional public-domain candidates

Potential candidates discussed for evaluation include Young's Literal Translation (YLT), Darby Bible (DBY), English Revised Version (ERV), Webster's Bible (WBS), and Douay-Rheims (DRA).

**None of these candidates is approved for import by this document.** Before selecting one, verify the exact edition, jurisdiction/territory, authoritative source, redistribution terms, text integrity, and any source-specific attribution requirements. Public availability alone is not sufficient evidence of public-domain status.

## Safe technical approach

1. Record the exact edition, publisher/rights holder, authoritative source, licence or permission document, attribution wording, and permitted distribution modes.
2. Keep editions distinct (for example AMP 2015 versus AMPC 1987).
3. Only create an active, rights-verified production catalogue record after the appropriate permission is documented and the complete dataset has passed validation.
4. A licensed API/provider must explicitly permit Bible Arena's intended display, caching, storage, offline access, audio/TTS, user scale, and geographic distribution. API access alone is not necessarily a redistribution licence.
5. Do not copy text from websites or use a public API to bypass publisher licensing.
6. Continue testing the import pipeline with independently verified public-domain datasets. Keep new editions inactive until validation is complete.
7. Preserve the four existing active versions; do not alter their production records as part of expansion work.

## Immediate next actions

- [ ] Verify one additional public-domain candidate from an authoritative source, beginning with YLT or Darby only after its exact source and terms are confirmed.
- [ ] Prepare permission requests for TPT, AMP (confirm AMP 2015 versus AMPC), GNT, MSG, NLT, and NIV.
- [ ] Ask rights holders to specify display, storage, caching, offline, audio/TTS, commercial/non-commercial, geographic, and attribution terms.
- [x] Confirmed: "NTL" meant NLT (New Living Translation).
- [ ] Do not mark any new version active or rights-verified based only on an internet dataset, public reading website, or API endpoint.

## Important distinction

A translation may be quotable in a limited number of verses but still not be legally available for a complete Bible reader. Bible Arena requires full-version reading, so limited quotation permissions do not satisfy the product requirement.
