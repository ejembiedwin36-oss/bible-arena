# Reviewer Workspace

The reviewer workspace is a protected area of Bible Arena for assigned language reviewers and validators.

## Access

A signed-in user must have an active `voice_language_reviewer_roles` assignment. The assignment contains a language code and a role:

- `reviewer` — performs native-language review and can move a sample to `native_reviewed` or `rejected`.
- `validator` — performs validation and can move a sample to `validated` or `rejected`.

## Privacy

The workspace must never expose all voice recordings to all authenticated users. Database RLS remains the source of truth for sample access.

## UI behavior

The workspace displays only the languages assigned to the current account. Each language section loads its protected queue and provides a signed, time-limited audio URL for authorized playback.

## Integration

`ReviewerWorkspace` is intentionally separate from the public Bible reading experience. It can be mounted behind authenticated application navigation once the app's route shell exposes a role-gated workspace entry.
