# Scripture accuracy and bookmark release verification

Status: **Not yet certified**. Automated cache isolation and retry regression tests do not prove verse text accuracy or signed-in bookmark persistence.

## Scripture text comparison

For each passage below, load KJV and WEB separately in the deployed Bible Reader. Compare the **entire displayed verse**, including verse number and punctuation, against a trusted, version-specific reference text. Record source URL, date, result and any mismatch. Do not use the KJV text as the reference for WEB or vice versa.

| Passage | KJV | WEB | Notes |
| --- | --- | --- | --- |
| John 3:16 | Pending | Pending | Distinct translation wording |
| John 1:1-3 | Pending | Pending | Chapter opening |
| Luke 1:1-2 | Pending | Pending | Multi-verse navigation |
| John 3:17 | Pending | Pending | Adjacent verse |

Check book/chapter/verse IDs, missing or duplicated verses, verse order, version switch, back navigation, and refresh. Repeat a chapter after a simulated temporary fetch failure.

## Signed-in bookmark persistence

1. Sign in with a test account; record the account identifier privately (never commit credentials).
2. Open John 3:16 in KJV; save a bookmark. Verify it appears once.
3. Refresh; verify it remains. Navigate away and back; verify it remains.
4. Sign out and sign in to the **same** test account; verify the bookmark is restored.
5. Remove the bookmark; refresh and sign in again; verify removal persists.
6. Switch KJV to WEB and back. Confirm bookmark behavior matches the product's intended verse-versus-translation identity semantics.
7. Simulate slow bookmark loading; save/remove during loading; confirm an older response does not overwrite the newer action.
8. Repeat on mobile viewport and capture any errors without exposing personal information.

## Release gate

- [ ] KJV verse text compared with trusted KJV reference
- [ ] WEB verse text compared with trusted WEB reference
- [ ] Translation switching and retry checked live
- [ ] Signed-in bookmark save, refresh, sign-out/in and removal verified
- [ ] Main CI and Reader verification green on release commit
- [ ] Deployed Vercel version corresponds to verified commit

Only mark an item complete with recorded evidence. Copyrighted Amplified, TPT and Good News texts require appropriate licensing before full-text integration.
