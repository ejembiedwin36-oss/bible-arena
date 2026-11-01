# KJV production import runbook

This runbook documents the one-time production KJV import without exposing credentials or weakening Edge Function authentication.

## Security model

- `kjv-bulk-import` remains protected by JWT verification.
- The caller must already be signed in to Bible Arena.
- `src/lib/maintenance.ts` invokes the Edge Function through the existing Supabase client/session.
- The Edge Function independently verifies the caller and requires membership in `public.maintenance_users`.
- Never place a service-role key or a user access token in frontend source, GitHub, chat, or documentation.

## Before running

Confirm:

- KJV version ID: `60fa2dbc-7128-43cd-9593-cb1e1942b3b3`
- Import batch ID: `d5ef905f-d4ee-4bec-96a8-0a19f1feb628`
- Expected final KJV verse count: `31102`
- Bible books: `66`
- Bible chapters: `1189`
- Logical duplicate KJV verse groups: `0`

The importer uses conflict-safe upserts with `ignoreDuplicates: true`. Existing verses must not be deleted and recreated.

## Protected Luke ID snapshot

These IDs must be unchanged after the import:

- Luke 1:1 `17789258-b986-4bbc-94e5-78dde78a3bba`
- Luke 1:2 `95302030-7fdd-4cf1-ae6d-a38308c96ad4`
- Luke 1:3 `2a1c09b8-08f9-4fe9-a8c7-72cdc82992c3`
- Luke 1:4 `39035e56-4f73-4638-b83e-7ea1d728b0d3`
- Luke 1:5 `f3076eb1-8934-46f8-9fc8-59102a761695`
- Luke 1:6 `55745051-69ed-4995-81b2-4f46a6c24ddc`
- Luke 1:7 `66d0c049-5edb-4305-bd6d-3f9e5ff55681`
- Luke 1:8 `d3c584ff-3c4c-4734-8947-81f4eea15bd3`
- Luke 1:9 `243a510b-90ea-49bb-a6cf-71ecfa56705c`
- Luke 1:10 `26e6e217-6d56-407b-bf7f-e456dedc0e9a`

## Run

Run the importer only from an authenticated Bible Arena maintenance session. The frontend helper is `runKjvBulkImport()` in `src/lib/maintenance.ts`.

Do not automatically run this operation on login or page load. It is a maintenance operation and must require an intentional action.

## Acceptance checks

After the invocation finishes, verify all of the following:

1. KJV verse count is exactly `31102`.
2. There are still `66` books and `1189` chapters.
3. Logical duplicate KJV verse groups are `0`.
4. Luke 1:1-10 IDs exactly match the protected snapshot above.
5. Import batch status is `completed`.
6. `imported_verse_count` is `31102`.
7. `error_message` is null.
8. `completed_at` is populated.
9. Genesis 1:1, Psalm 23:1, John 3:16, and Revelation 22:21 are present.
10. Existing topic/study references to the protected Luke verses still resolve.

If any acceptance check fails, stop and investigate. Do not delete existing Scripture rows or rerun destructive SQL as a recovery shortcut.
