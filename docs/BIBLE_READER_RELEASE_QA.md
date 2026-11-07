# Bible Reader reliability verification

This checklist documents the release gate following the chapter navigation, prefetch, and bookmark race-condition improvements. It is a test plan, not a claim that tests have passed.

## Automated checks

- Run the repository's existing lint/typecheck, unit tests, and production build commands as configured in package.json and GitHub Actions.
- Record the workflow URL, commit SHA, pass/fail status, and date. A successful Vercel deployment is not a substitute for passing tests.
- If any check fails, investigate and fix the failure before describing the release as verified.

## Reader regression scenarios

1. Open John 3, navigate to John 4, then return to John 3. Measure both first-time and repeat navigation on Wi-Fi and a slower network. Record device, network, and timings; do not infer speed from one run.
2. Switch between KJV and WEB in the same chapter. Verify book, chapter, verse numbering, and displayed translation; compare sampled passages against trusted licensed/public-domain sources.
3. Save a verse bookmark, navigate away, return, reload, and confirm it remains saved. Remove it and confirm it stays removed after reload.
4. While initial bookmarks are loading, add or remove a bookmark. Confirm a late response cannot replace the user's newer action.
5. Test signed-out, signed-in, slow-network, offline, and failed-request states. Confirm clear retry/error feedback rather than indefinite loading.
6. Confirm adjacent-chapter prefetch does not display verses from the wrong translation or chapter, and does not block the currently requested chapter.
7. Check keyboard and mobile touch navigation, including back/forward and refresh.

## Release decision

Mark each scenario PASS, FAIL, or NOT RUN with evidence. Do not claim all translations are validated until each supported version has been sampled and its source checked. Preserve the currently working chapter-navigation behavior while fixing any regressions.
