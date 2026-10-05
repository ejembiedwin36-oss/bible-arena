# Reviewer Navigation Integration

The protected reviewer workspace is implemented in `src/features/ReviewerWorkspace.tsx` and should remain outside the public Bible-reading navigation.

## Required behavior

- Only authenticated users with an active language-review assignment should see the reviewer entry.
- The workspace itself must still verify access; hiding a navigation item is not a security boundary.
- Database RLS remains the source of truth for voice sample access.
- Reviewers can work only on their assigned language.
- Validators are the only role allowed to finalize a sample as `validated`.

## Current integration point

The application shell in `src/App.tsx` is the existing navigation/router surface. The workspace is intentionally kept as a standalone feature until the shell can be patched without replacing unrelated application code.

## Next safe change

Add a role-aware navigation entry and a protected route that renders `ReviewerWorkspace`. Keep the existing public navigation unchanged for ordinary users.
