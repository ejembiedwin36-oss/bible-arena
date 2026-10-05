# Voice Reviewer Authorization

Bible Arena voice recordings are private user data. Reviewer access must be explicit and language-scoped.

## Roles

- `reviewer`: may perform the first native-language review for assigned languages.
- `validator`: may perform validation for assigned languages and may also perform reviewer-level work.

## Assignment model

Assignments are stored in Supabase as:

- `user_id`
- `language_code`
- `role`
- `active`

A user must have an active assignment for the sample language before reviewer access is granted.

## Security rule

Do not grant a global policy that exposes all voice samples to all authenticated users. The existing owner-level privacy boundary remains in place until language-scoped reviewer access is deliberately enabled and tested.

## Validation flow

`unverified` → `native_reviewed` → `validated`

A reviewer does not automatically become a validator. Validation should require the validator role and a second qualified review.

## Language independence

The authorization model is not Idoma-specific. The same assignment mechanism supports `id`, `ig`, `yo`, `ha`, `tiv`, `igala`, Efik/Cross River language codes, and future supported languages.
