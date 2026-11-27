# Bible Arena — Project Activity Log

> **Living project record.** Update this file after every meaningful work session until Bible Arena is completed. Record what was actually done, what was verified, what failed, decisions and reasons, and the next safe step. Do not rewrite history to make unfinished work look complete.

## 1. How to use this log

For each session, add a newest-first or chronological dated entry under **Session history**. Each entry should capture:
- Goal and scope
- Repository/branch and relevant files
- Actions and commands (omit secrets and private credentials)
- Results and verification evidence
- Challenges/errors and how they were handled
- Decisions and why they were made
- Remaining work and the exact next step

Keep this file factual. Distinguish **implemented**, **tested**, **deployed**, **available to users**, and **planned**. A successful build is not proof that a live feature works end to end.

## 2. Project identity and mission

- **Project:** Bible Arena
- **Repository:** https://github.com/ejembiedwin36-oss/bible-arena
- **Default branch:** `main`
- **Owner's GitHub account:** `ejembiedwin36-oss`
- **Product:** multilingual Bible reading, study, devotion, learning/challenges, audio, and AI-assisted Scripture platform.
- **First major local-language priority:** Idoma.
- **Planned languages:** English, Idoma, Igbo, Yoruba, Hausa, Tiv, Igala, and Efik/Calabar/Cross River coverage.
- **Core rule:** Scripture text must be clearly distinguished from commentary, study material, and AI-generated explanations. Only content with appropriate rights may be imported or distributed.

See also:
- [Product Requirements](PRODUCT_REQUIREMENTS.md)
- [Implementation Roadmap](IMPLEMENTATION_ROADMAP.md)
- [Beginner Project Guide](BIBLE_ARENA_BEGINNER_PROJECT_GUIDE.md)
- [Agent instructions](../AGENTS.md)

## 3. Working rules

1. Protect the live application and production database. Do not run destructive, schema-changing, migration-changing, billing, or deployment actions without explaining the impact and receiving the owner's explicit approval.
2. Prefer small, reviewable changes. Inspect the current code and repository state before editing.
3. Never invent historical migrations, Bible text, licensing permissions, test results, deployment URLs, or feature completion.
4. Never commit passwords, access tokens, service-role keys, database URLs containing credentials, or other secrets. Do not copy terminal output containing credentials into this log.
5. Explain unfamiliar concepts and commands in beginner-friendly language. Work step by step and let the owner run local commands when local access is required.
6. After code changes, run relevant tests/build/type checks where possible and report exactly what passed, failed, or could not be run.
7. After every work session, update this log and the relevant learning/challenge notes. Keep the README documentation links current.
8. Preserve existing working features and user data. Do not perform broad refactors as a side effect of an unrelated fix.
9. A language catalogue row is not proof that Scripture in that language is imported. A speech model integration is not proof of transcription accuracy.
10. Keep a clear next-step handover so work can resume without guessing.

## 4. Current technology

- Frontend: React 19, TypeScript, Vite 7, React Router
- Backend/database: Supabase and PostgreSQL
- Tests: Vitest and repository CI
- Deployment: Vercel
- Source control: GitHub
- Idoma ASR baseline: Meta OmniASR; GPU hosting has been postponed
- Local owner workstation for this current recovery task: Windows, repository at `C:\\Users\\DELL\\Desktop\\bible-arena`
- Supabase project ref: `fqsjzjduawcevqlammzm` (project name: `bible-arena`)

## 5. Current verified product and data status

### Application features

The active application includes the Bible Reader, Verse Study, Topic Study, bookmarks, verse-linked notes, Daily Devotion route, and a starter Bible Arena Challenge. Some features have limited or empty content and must not be described as fully populated.

Recent bookmark reliability work:
- Commit `89d9d7e12c8ebe29370d326095abbbaa51e91f12` — `fix(bookmarks): prevent duplicate toggles and surface save errors`.
- Commit `1b102a4303c487b7cafb220c4582ee02e3571825` — `fix(bookmarks): disable verse action while saving`.
- At the time of that work, CI and Reader verification passed for the latest commit. Live signed-in bookmark verification remained a user-side follow-up.
- A successful Vercel deployment was reported, but the direct production application URL had not yet been confirmed in the handover. Do not treat a Vercel dashboard URL as the public app URL.

### Supabase project and database

On 2026-11-19, the Supabase project was restored from inactive status and reached `ACTIVE_HEALTHY`. The restore was explicitly approved by the owner. The audit described below was read-only; no schema or data changes were made.

Read-only audit findings recorded on 2026-11-19:
- `bible_books`: 66
- `bible_chapters`: 1,189
- `bible_verses`: approximately 62,200 total (31,102 KJV and 31,098 WEB in the audit)
- `bible_versions`: KJV and WEB present, active, and marked rights-verified in the database
- `languages`: 8 catalogue entries
- `devotions`, `devotion_scriptures`, `devotion_completions`: 0 rows
- `bookmarks`, `user_notes`: 0 rows at audit time
- `topics`: 4; `topic_scriptures`: 8
- `reading_plans`: 1; `reading_plan_days`: 3; `reading_plan_readings`: 3
- `arena_questions`, `arena_question_options`: 0 rows
- `prayer_entries`: 0 rows
- Idoma has a language catalogue entry but `bible_text=false`; its Bible text has not been imported.
- John 3:16 was read directly from the live database and KJV and WEB wording differed as expected.

Two Bible data models exist:
- The newer active reader path uses `bible_versions` and `bible_verses`.
- A legacy `bible_translations` / `bible_translation_verses` structure also exists; the audited legacy verse rows matched the joined KJV verse text.
- Do not delete, merge, or migrate either model until all code and database dependencies have been reviewed.

### Database security/performance audit

The 2026-11-19 read-only advisor review reported:
- RLS enabled on all 34 public tables.
- `maintenance_users` and `voice_speaker_dataset_assignments` had RLS enabled but no direct policies; the first is documented as service-role-only, and the second appears to use a secured RPC path.
- Six voice workflow SECURITY DEFINER RPCs were executable by authenticated users. Their bodies were inspected for authorization/ownership/consent checks; do not revoke them blindly.
- Admin role-management functions were executable only by postgres/service_role.
- Advisor warnings included disabled leaked-password protection, unindexed foreign keys, RLS policies re-evaluating `auth.uid()`, multiple permissive SELECT policies, duplicate index pairs, and unused indexes.
- No security/performance fixes were applied during the audit. Any changes require a focused plan and explicit approval.

### Migration history and recovery

- The live Supabase migration history showed 38 migration records, dated 2026-09-14 through 2026-10-25.
- GitHub `supabase/migrations` currently contains a README and one SQL file, not the full historical SQL set.
- The migration README says live migration history is the production source of truth.
- The missing historical SQL files were not found in the inspected GitHub directory history. Do not fabricate them or pretend that a reconstructed schema dump is the original migration history.
- The safe recovery approach is to preserve a reviewed schema-only dump, compare it with the SQL files actually present in GitHub, document the live migration inventory, and agree on a clean forward-looking baseline. Do not run `db pull`, `db push`, `migration repair`, or reset as a shortcut.

## 6. Session history
### 2026-11-22 — Reusable English version preparation and source-rights review

**Goal:** Move English Bible version expansion forward without touching production data or beginning Idoma work.

**Implemented in GitHub `main`:**
- Added `scripts/prepare-bible-version-import.mjs`, a reusable offline preparation module/CLI. It validates expected book/chapter/verse counts, rejects malformed and duplicate chapter/verse keys, requires every verse to map to a supplied existing chapter ID, rejects empty text, and preserves red-letter booleans only when explicitly supplied by the source.
- Added `scripts/prepare-bible-version-import.test.ts` with tests for successful mapping, duplicate rejection, missing chapter mappings, count mismatch, and explicit red-letter metadata.
- Added `docs/REUSABLE_ENGLISH_VERSION_IMPORT.md` documenting the command, input shape, safeguards, and source candidates.
- Existing KJV-specific preparation/import scripts were left unchanged. The new utility does not contain Supabase credentials, network calls, database writes, or catalogue activation logic.

**Source/rights review:**
- eBible.org's ASV 1901 edition page identifies the translation as public domain and offers USFM/USFX/VPL formats.
- Berean Bible's publisher terms state that the Berean Bible and Majority Bible texts were dedicated to the public domain on 2023-04-30, and the publisher download page offers USFM/USJ/USX. eBible.org also lists the BSB as public domain.
- ASV and BSB are the first practical English source packages to prepare, subject to verifying the downloaded file's origin, edition, canon, checksum, and normalized corpus. This does not imply that they have already been imported.
- TPT, Amplified, and GNT remain blocked for full-text app distribution until the appropriate written permissions are obtained.

**Verification state:**
- The new files were fetched back from GitHub after creation.
- The initial script commit's Vercel status was reported `success`; later commits for tests/docs were still `pending` at the last status check. This is not a confirmed all-green CI result.
- No local `npm test` or build was run from the connected GitHub operation.
- No production database rows, schema, grants, Auth settings, migrations, or deployment settings were changed.

**Next exact step:** Obtain the publisher/eBible ASV and BSB source archives, inspect their license/copyright files and archive contents, calculate checksums, normalize a staging corpus, and run the reusable validator against the live canonical book/chapter map exported read-only. Do not insert or activate either edition in production until all validation and Reader mapping checks pass.

### 2026-11-19 — Supabase recovery and schema-export preparation

**Goal:** Preserve the live Supabase schema and establish a safe way to inspect/reconcile the missing migration history.

**Completed and verified:**
1. The owner approved restoring the inactive Supabase project. Restore succeeded and the project reached `ACTIVE_HEALTHY`.
2. Performed read-only data, schema, migration-history, RLS, function, and advisor inspections. No database writes were performed.
3. Confirmed 38 live migration-history records and the incomplete migration SQL history in GitHub.
4. On the Windows workstation, confirmed Git repository at `C:\\Users\\DELL\\Desktop\\bible-arena`, branch `main`, initially clean and up to date with `origin/main`.
5. Confirmed Node.js `v24.22.1`, npm `11.19.1`, and Supabase CLI `3.2.0` through `npx --yes supabase@latest`.
6. Authenticated the Supabase CLI and linked the local repository to project ref `fqsjzjduawcevqlammzm`.
7. Checked `supabase db dump --help`. The intended export is schema-only, limited to schema `public`, and saved outside the repository in `C:\\Users\\DELL\\Desktop\\bible-arena-schema-audit\\public-schema.sql`.
8. A dry run confirmed the target project and options but did not create a file.
9. The real export did not complete because Docker's Linux engine was unavailable. Docker CLI/Desktop are installed, but `docker info` still reports that it cannot connect to `dockerDesktopLinuxEngine`.

**Challenges and lessons:**
- Supabase CLI `db dump` depends on Docker. Having the Docker command installed is not enough; the Docker Desktop engine/daemon must be running.
- The owner shared a temporary CLI login-role credential in a dry-run output. It was not the main database password or Supabase API token. Treat it as exposed and expired/short-lived; never repeat it, save it, or ask the owner to paste credentials. Do not request the main database password.
- The Supabase CLI created `supabase/.temp/` locally. This folder was untracked, and the repository has no root `.gitignore` according to the local inspection. Do not commit `.temp` or other local cache files. Review ignore rules before changing them.

**No changes made:** No database schema/data changes, no migration history repair, no migration push/pull, and no schema export file was produced.

**Handover update:** This original preparation entry is superseded by the later `2026-11-19 — Docker recovery, schema-only export, and first inventory` entry below. Docker is running and the schema export is complete; continue from that later entry's read-only inspection step. Do not repeat the export or execute the dump unless a new snapshot is deliberately required.



### 2026-11-19 — Docker recovery, schema-only export, and first inventory

**Goal:** Complete the safe production schema snapshot after Docker became available, verify the export, inspect its object inventory, and compare the repository's tracked migration directory.

**Completed and verified:**
1. Owner opened Docker Desktop. `docker info` displayed a healthy Client and Server section (Docker Engine 29.9.2, Docker Desktop on Linux/WSL2); the earlier missing `dockerDesktopLinuxEngine` pipe error was resolved.
2. Created the external audit folder `C:\\Users\\DELL\\Desktop\\bible-arena-schema-audit`.
3. Successfully ran the read-only schema-only export:
   ```powershell
   npx --yes supabase@latest db dump --remote --schema public --file "$HOME\\Desktop\\bible-arena-schema-audit\\public-schema.sql"
   ```
4. PowerShell verified the file exists (`Test-Path` returned `True`) and its size is **93,729 bytes**.
5. Inspected the dump header and counted declarations: **34 tables**, **64 RLS policies**, **15 functions**, and **65 indexes**. The initial exact search for `^CREATE FUNCTION` returned zero because this dump uses `CREATE OR REPLACE FUNCTION`; the corrected search found 15. This was a search-pattern correction, not missing database functions.
6. Inspected GitHub `supabase/migrations`: it contains `README.md` and one tracked SQL file, `20261025223416_maintenance_users.sql`. That SQL file's comments refer to a preceding production migration version `20261025223408`; that earlier SQL file is not present in the current directory listing.
7. Confirmed the export is stored outside the repository. It has not been committed. No production schema/data changes, migration repairs, pushes, pulls, resets, or local migration-history edits were performed.

**Challenges and lessons:**
- Docker CLI being installed did not mean the Docker Engine was running. Starting Docker Desktop made the Linux Server endpoint available.
- The first function-count pattern was too narrow. PostgreSQL's `CREATE OR REPLACE FUNCTION` declaration needed to be included.
- A schema dump is a snapshot of the current schema; it is not the original 38-step migration history and does not recreate missing historical migration SQL.
- The GitHub migration folder has one SQL file plus its README, not the complete historical set. Do not fabricate the missing 37 migration files or infer their contents from the final schema.
- The 93,729-byte dump remains a local audit artifact outside Git. Do not commit it or paste its full contents into chat.

**Decisions:** Keep the export outside the repository; continue read-only comparison and inventory. Do not run `db pull`, `db push`, `migration repair`, reset, or any schema-changing command as part of this recovery.

**Database/deployment impact:** Read-only production schema export only. No production writes and no deployment changes.

**Remaining work:**
- [ ] Build a complete, verified inventory of exported tables, functions, policies, indexes, triggers, views, types, grants, and dependencies.
- [ ] Compare the current schema snapshot with the single tracked SQL migration and identify what can and cannot be explained by that file.
- [ ] Capture the exact 38 live migration version identifiers from the read-only migration-history source (if not already recorded in a durable, safe audit note).
- [ ] Review repository status and ignore rules before any local source-control operation; keep `supabase/.temp/` and the external dump out of commits.
- [ ] Agree on a forward-only migration/baseline plan before changing migration files or database state.

**Next exact step:** Continue read-only inspection of the schema dump and compare its `maintenance_users` definition with the tracked `20261025223416_maintenance_users.sql`. Do not execute the dump or migration SQL.

### Earlier verified implementation work (before 2026-11-19)

- The bookmark duplicate-toggle/error-handling fix was committed as `89d9d7e12c8ebe29370d326095abbbaa51e91f12`.
- The bookmark button saving/disabled-state fix was committed as `1b102a4303c487b7cafb220c4582ee02e3571825`.
- CI and Reader verification were reported successful for the latest bookmark commit.
- Daily Devotion route and starter Bible Arena Challenge route exist, but the live devotional/question content tables were empty in the 2026-11-19 audit.
- KJV and WEB were verified in the live database. Do not claim other translations are imported without new evidence.
- Idoma ASR integration code and secure server-side proxy exist, but no live paid GPU endpoint is deployed and real Idoma accuracy has not been measured. No Runpod charge was incurred in the earlier deployment attempt.


**Additional English-source review (2026-11-22):**
- Expanded the candidate register with YLT and Darby, both listed by eBible.org as public domain with structured download formats.
- Added BBE as a candidate pending exact edition/package review.
- Added Douay-Rheims 1899 and Revised Version 1895 as conditional candidates; their canon/package content requires an explicit decision because they include books outside the 66-book Protestant canon.
- Source archives for ASV and BSB were identified from their official download pages, but automated archive downloads were unsuccessful in this environment. No third-party mirror was substituted.
- Updated the CLI entry-point detection to use a resolved file URL, avoiding platform-specific path comparison; removed an unused import.
- GitHub Actions CI and Reader verification both completed successfully for commit `69366283f1625bb197b5499b98baeee48cdf3e45`. The CI job's dependency install, API type-check, web/API tests, and production build steps all reported success. Subsequent documentation and one-line CLI cleanup commits are newer; their own latest workflow status must still be checked before claiming the tip of `main` is green.

**Next exact step:** Secure the official ASV and BSB archives through a reliable download route, inspect the embedded copyright files and USFM book/chapter markers, then write and test a source-specific normalizer. Keep TPT/AMP/GNT permission-gated. Do not use mirrors or create version records as a shortcut.


**Publisher package pinning:** Inspected the official `BSB-publishing/bsb2usfm` repository. Its `LICENSING_INFO.md` explicitly separates public-domain BSB/MSB text from MIT-licensed conversion software; its README identifies BSB as a full 66-book edition. The latest release inspected was `v5.24`, with standard `BSB_usfm.zip` asset size 1,647,915 bytes. The importer documentation now pins this release and the eBible ASV USFM/USFX package links. The release archive itself could not be downloaded in this execution environment, so no BSB/ASV corpus has been staged or imported.

## 7. Open challenges and backlog

### P0 — Preserve production schema safely
- [x] Start Docker Desktop and confirm Docker engine is healthy.
- [x] Export the live `public` schema to the external audit folder (schema-only; read-only).
- [x] Verify the export file exists and record its byte size (93,729 bytes).
- [x] Inspect the first object counts: 34 tables, 64 policies, 15 functions, 65 indexes.
- [ ] Complete the detailed dump-to-tracked-SQL comparison and dependency inventory.
- [ ] Document all 38 live migration version identifiers using verified output; do not invent missing migration SQL.
- [ ] Agree on a safe forward migration/baseline strategy before any migration command changes production or local migration history.

### P1 — Repository hygiene and reproducibility
- [ ] Review local `git status` and `.gitignore` before committing any local changes.
- [ ] Ensure Supabase CLI cache `supabase/.temp/` is ignored and never committed.
- [ ] Record the exact local setup and safe commands in the beginner guide.

### P1 — Product content completeness
- [ ] Decide and implement a legitimate licensed-content path for additional translations, especially Idoma.
- [ ] Populate devotional content only from reviewed, authorized material.
- [ ] Build and review a real Arena question bank with sourced/checked answers.
- [ ] Verify reading-plan content and progression with a real user flow.
- [ ] Test signed-in bookmarks and notes against the live application.

### P1 — Production readiness
- [ ] Confirm the canonical public Vercel app URL.
- [ ] Review Supabase security advisor findings and decide on each remediation individually.
- [ ] Consider enabling leaked-password protection only after explaining and receiving owner approval.
- [ ] Review database performance findings and apply only justified, tested changes.
- [ ] Run complete frontend, API, and relevant database integration tests.

### P2 — Idoma voice and multilingual expansion
- [ ] Choose an affordable and sustainable ASR hosting path.
- [ ] Deploy only after owner approval of any costs.
- [ ] Obtain properly consented Idoma speech samples and appropriate usage rights.
- [ ] Benchmark real transcription accuracy with native speakers before making quality claims.
- [ ] Add licensed written Idoma Scripture when a legitimate source and permission are secured.
- [ ] Expand other local languages and translations only when content and rights are verified.

### Product completion
- [ ] Complete the roadmap phases in a tested, release-ready state.
- [ ] Complete security, accessibility, mobile, performance, backup/recovery, and deployment checks.
- [ ] Prepare user-facing documentation and a verified launch checklist.
- [ ] Record final release version, commit, deployment URL, and known limitations here.

## 8. Session entry template

Copy this section for every future work session:

```markdown
### YYYY-MM-DD — Short session title

**Goal:**
**Branch / starting commit:**
**Files or services inspected:**
**Actions taken:**
**Commands run (secrets removed):**
**Verification and results:**
**Challenges / errors:**
**Decisions and reasons:**
**Changes committed (SHA and message):**
**Database/deployment impact:**
**Remaining work:**
**Next exact step:**
```

## 9. Completion rule

This log remains active until the owner and project team agree that Bible Arena has met its release requirements. At completion, add a final release report with verified functionality, test results, security review, content/licensing status, deployment URL, commit/tag, known limitations, and post-launch maintenance plan.


### 2026-11-19 — Verified tracked maintenance_users migration against production schema

**Goal:** Finish the first exact comparison between the checked-in `maintenance_users` migration and the read-only production schema snapshot.

**Files/services inspected:** External schema snapshot `C:\\Users\\DELL\\Desktop\\bible-arena-schema-audit\\public-schema.sql`; GitHub file `supabase/migrations/20261025223416_maintenance_users.sql`.

**Verification evidence from PowerShell output:**
- Production table has `user_id uuid NOT NULL` and `created_at timestamptz DEFAULT now() NOT NULL`.
- Production primary key is `maintenance_users_pkey` on `user_id`.
- Production foreign key references `auth.users(id)` with `ON DELETE CASCADE`.
- Production has `ENABLE ROW LEVEL SECURITY` for this table.
- The dump shows a `SELECT` grant to `service_role`; it shows no grants to `anon` or `authenticated`. This is consistent with the tracked migration's revoke-and-grant intent.
- The tracked migration defines the same columns, primary key, foreign key, RLS enablement, and service-role-only direct table access.

**Result:** The tracked `20261025223416_maintenance_users.sql` migration matches the inspected production table structure and security state. This conclusion is limited to this one table/migration; it does not reconcile the full 38-entry production migration history.

**Actions / production impact:** Read-only inspection only. No SQL was executed against production, no migration history was changed, and no database schema or data was modified. The schema dump remains outside Git and must not be committed.

**Challenges / decisions:** The dump formats the table's final permissions as a grant to `service_role`; it does not need to reproduce the migration's original `REVOKE` statements verbatim to represent the same resulting access state.

**Next exact step:** Continue the read-only inventory by recording the exact 38 production migration version identifiers from verified migration-history output, then assess the broader schema/object/dependency differences. Do not run `db pull`, `db push`, migration repair, reset, or schema-changing SQL until a safe forward-only plan is reviewed and explicitly approved.


### 2026-11-19 — Captured exact production migration history

**Goal:** Record the complete production migration version list from the live Supabase migration history, using a read-only operation.

**Service / project:** Supabase project `bible-arena` (`fqsjzjduawcevqlammzm`).

**Action:** Listed production migrations using the Supabase migration-history listing operation. No SQL was executed and no migration was applied, repaired, deleted, or reordered.

**Verified result:** Exactly 38 migration records were returned, spanning `20260914130719` through `20261025223416`. The exact version/name pairs are:

- `20260914130719` — `initial_bible_arena_foundation`
- `20260914130724` — `seed_initial_language_catalog`
- `20260914130734` — `harden_foundation_functions`
- `20260914130749` — `revoke_public_function_execute`
- `20260916075538` — `add_jesus_words_to_bible_verses`
- `20260920220547` — `add_reading_plan_day_structure`
- `20260923081412` — `add_bible_import_batches`
- `20260923222027` — `scale_foreign_key_indexes`
- `20260929151156` — `scale_user_activity_indexes`
- `20260929213709` — `add_bible_verses_reader_index`
- `20260929214156` — `remove_duplicate_bible_verse_index`
- `20260930135105` — `add_independent_language_preferences`
- `20260930223901` — `create_voice_audio_uploads`
- `20260930223910` — `create_voice_audio_storage_policies`
- `20260930224914` — `optimize_voice_audio_rls_policies`
- `20261002092854` — `phase1_language_capabilities_and_reader_integrity`
- `20261002094407` — `harden_bible_reader_integrity`
- `20261002094456` — `add_bible_book_order`
- `20261002094528` — `remove_redundant_reader_indexes`
- `20261002161253` — `add_translation_verse_fk_index`
- `20261005090448` — `add_voice_language_evaluation_samples`
- `20261005090456` — `harden_voice_evaluation_trigger_function`
- `20261005092734` — `fix_voice_review_notes_column`
- `20261005143538` — `create_voice_reviewer_assignments`
- `20261005143940` — `secure_voice_language_reviewer_workflow`
- `20261005144017` — `allow_assigned_voice_upload_review`
- `20261005145143` — `add_voice_asr_dataset_export_fields`
- `20261011175727` — `harden_voice_asr_review_permissions`
- `20261011175736` — `remove_legacy_voice_sample_update_policy`
- `20261011180347` — `add_voice_speaker_consent_foundation`
- `20261011180502` — `secure_voice_contribution_rpc`
- `20261011181113` — `add_voice_consent_withdrawal`
- `20261011181501` — `add_speaker_dataset_assignments`
- `20261011182639` — `add_voice_reviewer_assignment_admin_rpc`
- `20261011182811` — `enforce_speaker_split_on_asr_eligibility`
- `20261011184036` — `make_speaker_dataset_split_immutable`
- `20261025223408` — `add_maintenance_users`
- `20261025223416` — `expose_maintenance_users_to_service_role`

**Interpretation:** The live migration history is now documented from the returned records. The GitHub `supabase/migrations` directory was previously observed to contain only `20261025223416_maintenance_users.sql` and its README. Therefore, the 37 earlier production migration SQL files are not currently represented in that directory listing. Do not fabricate those files from the final schema dump or mark the repository fully reconciled.

**Production impact:** Read-only history listing. No schema, data, or migration-history changes.

**Next exact step:** Perform a read-only comparison of the 38 production version/name pairs against the repository's tracked migration filenames and inspect the existing Supabase migration README. Then decide, with explicit owner review, whether a safe baseline/forward-only migration-history strategy is needed. Do not run migration repair, reset, `db pull`, `db push`, or schema-changing SQL during this audit.


### 2026-11-19 — Compared production migration history with tracked migration directory

**Goal:** Check whether the 38 live migration records have matching SQL files in the repository, and read the migration directory guidance.

**GitHub evidence:** Fetched `supabase/migrations` directory on `main`. It contains exactly two files:
- `README.md`
- `20261025223416_maintenance_users.sql`

Read `supabase/migrations/README.md`. It says the live Supabase migration history remains the source of truth for migrations already applied to production, and new database changes should be represented as SQL migration files and applied through the controlled workflow. It also summarizes recent voice/Idoma ASR database work.

**Comparison result:** The only tracked SQL migration filename corresponds to production version `20261025223416`. The other 37 production history records do not have matching SQL files in this directory. The README is guidance, not a substitute for those historical SQL files.

**Decision:** Do not fabricate the missing 37 migration SQL files from names, comments, or the final schema dump. Preserve the verified production history and schema snapshot as separate evidence. Any baseline or forward-only recovery plan must be reviewed before changing migration history or production.

**Next exact step:** Continue read-only schema inventory: compare production objects (tables, columns, constraints, indexes, policies, functions, triggers, views, grants) with the repository's tracked schema/migration artifacts and identify dependencies. No migration repair, reset, `db pull`, `db push`, or schema-changing SQL.


### 2026-11-19 — Read-only audit of bible_books and its chapter relationship

**Goal:** Continue the production schema audit by documenting the verified structure, constraints, indexes, RLS policy, and grants for the Bible book catalogue.

**Source and scope:** Read-only inspection of the schema-only export at `C:\\Users\\DELL\\Desktop\\bible-arena-schema-audit\\public-schema.sql`. No SQL was executed against production and no database objects or data were changed.

**Verified findings:**
- `bible_books` has columns `id`, `canonical_key`, `name`, `abbreviation`, `testament`, `category`, `chapter_count`, `traditional_author`, `authorship_status`, `historical_context`, `intended_audience`, `purpose`, `summary`, `created_at`, and `book_order`.
- Check constraints require `chapter_count > 0` and `testament` to be either `old` or `new`.
- Primary key: `bible_books_pkey` on `id`.
- Unique constraints: `bible_books_abbreviation_key` on `abbreviation`; `bible_books_canonical_key_key` on `canonical_key`.
- Additional unique indexes observed: `bible_books_book_order_uq` on `book_order`; `bible_books_canonical_key_uidx` on `canonical_key`.
- The separate unique index on `canonical_key` may duplicate the index backing the unique constraint. This is a review finding only; do not drop or alter either index without checking index definitions, dependencies, and query impact.
- `bible_chapters` has `id`, `book_id`, and `chapter_number`; it has a primary key on `id`, a unique constraint on `(book_id, chapter_number)`, and a check requiring `chapter_number > 0`.
- Verified foreign key: `bible_chapters.book_id` references `bible_books.id` with `ON DELETE CASCADE`. Thus a book deletion cascades to its chapter rows.
- RLS is enabled on `bible_books`.
- Policy `books_public_read` grants SELECT visibility to `anon` and `authenticated` using `USING (true)`.
- Table-level grants in the dump show `ALL` to `anon`, `authenticated`, and `service_role`. These grants must be interpreted together with RLS: the only inspected policy for ordinary roles is SELECT, and no INSERT/UPDATE/DELETE policy was identified in this inspection. Do not infer that anon/authenticated can modify rows from GRANT ALL alone. The privileged service_role normally bypasses RLS.
- The schema dump also contains `chapters_public_read` on `bible_chapters`; a complete chapter-table policy/grant review remains separate work.

**Beginner lesson:** A primary key identifies a row; a unique constraint prevents duplicate values/combinations; a foreign key connects related tables; an index supports efficient lookup/order; a GRANT provides table privileges while RLS policies further restrict which rows/actions are allowed.

**Decisions:** Keep the audit read-only. Flag the possible canonical-key duplicate index for later evidence-based review, but do not make a database change. Do not treat table-level GRANT ALL as proof that ordinary users can write rows when RLS is enabled.

**Next exact step:** Inspect the `languages` table columns, then its constraints/indexes, policies, RLS setting, and grants using the same read-only schema-export workflow. Continue verifying relationships from explicit foreign-key declarations rather than assumptions.


### 2026-11-22 — Direct read-only production check: bible_versions and security advisors

**Goal:** Resume the schema/security audit without requiring the owner to open VS Code, using connected GitHub and Supabase access. This entry records verified live-production findings; it does not replace the external schema dump.

**Project status:** Supabase project `fqsjzjduawcevqlammzm` (`bible-arena`, `eu-west-1`) returned `ACTIVE_HEALTHY`, PostgreSQL 17.6.1.166. Read-only migration listing returned 38 records, consistent with the documented production history.

**Verified live `public.bible_versions` structure:**
- Columns: `id` UUID PK; `language_id` UUID NOT NULL; `name` and `abbreviation` text NOT NULL; optional `publisher`, `license_name`, `license_url`; `rights_verified` and `is_active` booleans default false; `created_at` timestamptz default now().
- Unique constraint on `(language_id, abbreviation)`; FK `language_id` → `languages.id` with `ON DELETE RESTRICT`.
- B-tree indexes: primary key, unique language/abbreviation index, and `idx_bible_versions_language` on `language_id`.
- RLS enabled; policy `versions_public_read` is SELECT-only for PUBLIC and requires both `is_active = true` and `rights_verified = true`.
- Live metadata query returned KJV and WEB, both English (`en`), active and rights-verified. KJV is marked Public Domain; WEB is marked Public domain with the project license URL recorded.

**Security finding — broad table privileges:** Read-only effective-privilege checks confirmed that `anon` and `authenticated` have INSERT, UPDATE, DELETE, and TRUNCATE privileges on 27 public tables, including `languages`, `bible_books`, and `bible_versions`. RLS does not protect TRUNCATE. This is a significant least-privilege review item; it does not by itself prove an ordinary REST request can invoke TRUNCATE, since PostgREST does not expose a general SQL execution endpoint. Do not revoke grants yet; map intended app/admin/service-role workflows and review the API exposure before proposing a change.

**Supabase security advisor (read-only) findings:**
- INFO: RLS enabled with no policies on `maintenance_users` and `voice_speaker_dataset_assignments`. This is deny-by-default for ordinary roles; confirm intended access path.
- WARN: six SECURITY DEFINER RPCs are executable by authenticated users: `assign_voice_speaker_dataset_split`, `create_voice_contribution`, `has_voice_language_role`, `mark_voice_sample_asr_eligible`, `review_voice_language_sample`, and `withdraw_voice_consent`.
- Read-only inspection of all six function definitions found `search_path = ''` and authentication/ownership or language-role checks in the function bodies. The advisor warning should therefore be reviewed against intended RPC access, not blindly fixed by revoking every function.
- WARN: Supabase Auth leaked-password protection is disabled. This is an Auth configuration item; no setting was changed.

**Decision / production impact:** No database writes, schema changes, grant changes, Auth changes, migration repairs, or deployment actions were performed. The production audit remains read-only.

**Next exact step:** Build a table-by-table least-privilege matrix for the 27 public tables with broad anon/authenticated privileges, correlate each table's RLS policies and actual frontend/RPC usage, then prepare a safe, reviewable remediation proposal. Do not apply grants/policies or change Auth settings without owner approval.


### 2026-11-22 — TRUNCATE/RLS table-by-table mapping (read-only)

A direct read-only query of live PostgreSQL privilege metadata and `pg_policies` enumerated 27 public tables for which both `anon` and `authenticated` have TRUNCATE. Each has RLS enabled. The current policy command sets are:

- SELECT-only catalogue/content: `arena_question_options`, `arena_questions`, `bible_books`, `bible_chapters`, `bible_translation_verses`, `bible_translations`, `bible_verses`, `bible_versions`, `devotion_scriptures`, `devotions`, `languages`, `reading_plan_days`, `reading_plan_readings`, `reading_plans`, `topic_scriptures`, `topics`.
- User-scoped data policies: `bookmarks`, `devotion_completions`, `highlights`, `prayer_entries`, `profiles`, `reading_history`, `user_notes`, `user_reading_plan_days`, `user_reading_plans`.
- Mixed/special policy: `arena_attempts` has INSERT and SELECT policies; `bible_import_batches` has an authenticated ALL policy (admin-oriented). 

**Remediation planning order (not applied):** (1) preserve a fresh schema/ACL snapshot; (2) identify all app REST table calls and RPC paths; (3) separate public read-only content, user-owned CRUD, and admin/service-role operations; (4) prepare explicit least-privilege GRANT statements and any required policy adjustments in a reviewed migration; (5) test in staging, including app flows and negative access tests; (6) apply only after approval and verify production effective privileges. First priority for review is removal of TRUNCATE from client roles, but no ACL change is safe until inherited grants and operational workflows are accounted for.

No production changes made.


### 2026-11-22 — Reader table usage and live KJV/WEB completeness comparison (read-only)

**Frontend access map from current main branch source:**
- Reader chapter data: `src/services/bibleReader.ts` reads `bible_verses` and `bible_translation_verses`.
- Version/language/book catalogue: `src/services/bibleCatalogue.ts` reads `languages`, `bible_versions`, `bible_translations`, and `bible_books`.
- Daily devotion: `src/features/DailyDevotion.tsx` reads `devotions` and `devotion_completions`.
- Topic search: `src/features/TopicSearch.tsx` reads `topics`, `bible_verses`, and `topic_scriptures`.
- Verse study: `src/features/VerseStudy.tsx` reads `bible_verses`, `bookmarks`, `user_notes`, and `topic_scriptures`.
- User profile: `src/lib/userData.ts` selects/creates/updates only the signed-in user's `profiles` row.
- KJV import client: `src/lib/maintenance.ts` invokes the `kjv-bulk-import` Edge Function after checking that a session exists; the function itself verifies the caller and maintenance membership before using the service-role client.

This is an initial source-reference map, not yet a complete audit of all files or policies. It provides concrete separation between public catalogue/reader reads, user-owned records, and privileged import workflows. The KJV bulk import Edge Function has an authenticated maintenance-user check before privileged writes; do not grant client-side table write access merely to support this workflow.

**Live scripture row counts (read-only, 2026-11-22):**
- KJV in `bible_verses`: 31,102 rows across all 1,189 chapters.
- WEB in `bible_verses`: 31,098 rows across all 1,189 chapters.
- `bible_translation_verses`: 31,102 rows.
- Total `bible_verses`: 62,200 rows; 66 books and 1,189 chapters.

**New data-quality finding:** A key comparison of KJV and WEB chapter/verse identifiers found seven KJV keys absent from WEB: Luke 17:36; Acts 8:37, 15:34, 24:7; Romans 16:25–27. It also found three WEB keys absent from KJV: Romans 14:24–26. This explains the net difference of four rows, but it does not establish whether each difference is an intentional translation/versification difference or an import-data issue. Do not auto-fill or delete these verses. Next inspect the source datasets and translation-specific versification, then document an expected-key exception list and add a validator/test if the differences are intentional.

**Safety:** All production queries in this entry were SELECT-only. No data, schema, grants, migrations, Edge Functions, or Auth settings were changed.


### 2026-11-22 — Rechecked English import sources and active Reader data path (read-only)

**Goal:** Continue English edition expansion and remove ambiguity about how new Bible text must connect to the live Reader.

**Verified active Reader implementation on GitHub `main`:**
- `src/App.tsx` contains the active `loadReaderOptions()` path. It reads active `languages` and `bible_versions` rows.
- The active chapter reader calls `cachedChapterVerses(chapterId, versionId)`, which reads `bible_verses` using `chapter_id` and the selected `bible_versions.id`.
- The active Reader path does not call the separate `src/services/bibleCatalogue.ts` and `src/services/bibleReader.ts` helpers. Those helpers contain translation-matching and legacy fallback behavior, but they must not be mistaken for the current Reader's actual loading path.
- Therefore a new edition must have a complete validated corpus in `bible_verses` keyed by its own `bible_versions.id`. A `bible_translations` catalogue record or legacy `bible_translation_verses` rows alone will not populate the active Reader.

**Live production recheck (SELECT only):**
- KJV: active, rights-verified, 31,102 rows in `bible_verses`.
- WEB: active, rights-verified, 31,098 rows in `bible_verses`.
- These remain the only two English `bible_versions` records returned by the live query.
- No production rows or schema were changed.

**Official source verification:**
- eBible.org's current ASV 1901 listing identifies the edition as public domain and lists USFM/USFX packages. Its directory index lists `eng-asv_usfm.zip` at 2,875,616 bytes (timestamp 2026-10-30). The direct archive download attempt from this environment failed; no substitute or scraped text was used.
- The official BSB publisher GitHub release API confirms `v5.24`, published 2026-11-19, with the standard `BSB_usfm.zip` asset (1,647,915 bytes; SHA-256 `be31ef23eb38492de9e6e17983b7d46a1a4abe010bd1ff2ad3e338795d21233d`). The publisher terms dedicate the BSB text to the public domain. The archive download attempt from this environment failed; no BSB corpus was staged.
- The BSB release also provides MSB, which is New Testament-only; it is not a complete 66-book Bible edition.

**Verification and deployment:** The prior main-branch commit `47cf264743835e9f499dc2fe1a0724c267363fbd` has successful `build-and-test` and `verify` GitHub checks, and its Vercel status is `success` (deployment completed). This confirms the code/documentation build, not the availability of any new translation.

**Decisions:** Corrected the implementation notes to describe the active `src/App.tsx` Reader path. Keep TPT, Amplified, and GNT permission-gated. Do not add catalogue rows or write Bible text until a complete permitted source has been obtained, parsed, validated, and reviewed.

**Next exact step:** Obtain the official ASV and BSB archives through a working download route; inspect their internal USFM structure, attribution and checksums; implement source-specific normalization; validate against the canonical chapter map; then prepare (but do not execute without approval) the production import plan.

### 2026-11-27 — USFM import preparation and live version recheck

**Goal:** Continue English public-domain edition preparation without relying on the owner's local VS Code and without modifying production Scripture data.

**Live Supabase verification (read-only):**
- Rechecked effective privileges on languages, bible_versions, bible_books, bible_chapters, and bible_verses: anon and authenticated retain SELECT, while INSERT/UPDATE/DELETE/TRUNCATE are false on the checked tables.
- Rechecked English catalogue rows: only KJV and WEB are active and rights-verified; KJV has 31,102 verse rows and WEB 31,098. No ASV or BSB version row exists yet.
- No production data or schema changes were made in this session.

**Repository work on GitHub main:**
- Added scripts/parse-usfm-corpus.mjs to convert basic USFM book/chapter/verse markers into normalized {book, chapter, verse, text} rows for the existing offline validator.
- Added scripts/parse-usfm-corpus.test.ts for normal chapter/verse parsing, formatting-marker cleanup, missing book-code mapping, and rejection of verse bridges/suffixes that need manual versification review.
- Added scripts/usfm-book-code-map.json with the standard 66 Protestant-canon USFM book IDs mapped to existing canonical English book names.
- The parser deliberately rejects verse labels such as 1-2 and 1a; these must be resolved with an edition-specific mapping rather than silently flattened into the integer verse schema.
- A local regex smoke check verified that the USFM \id, \c, and \v marker patterns match and that a basic \add marker is stripped. The full Vitest suite has not been run from this connected GitHub-only environment.

**Source download limitation:**
- Official eBible ASV and BSB USFM archives were identified, and the browser link resolves to the official eBible archive, but the execution environment's direct binary download failed. No alternate scraped text or unverified mirror was substituted. No corpus has been staged or imported.
- Current eBible pages identify ASV 1901 and BSB as public domain and provide USFM source packages. Sources: [ASV edition](https://www.ebible.org/find/show.php?id=eng-asv), [ASV copyright](https://ebible.org/asv/copyright.htm), [BSB edition](https://www.ebible.org/find/show.php?id=engbsb), [publisher downloads](https://berean.bible/downloads.htm).

**Current status:** Parser and mapping files are committed to GitHub, but the source archives, full test run, canonical chapter-map export, normalized corpus, staging import, and Reader smoke test remain outstanding. KJV and WEB remain untouched.

**Next exact step:** Obtain the official eng-asv_usfm.zip and engbsb_usfm.zip files through a working download route; extract to a local non-repository staging folder; run the new parser and existing validator; inspect count/versification exceptions; then prepare a dry-run import plan. Do not add/activate production version rows until the owner reviews and approves the import.

### 2026-11-27 — CI verification follow-up

GitHub Actions CI completed successfully for main commit a7c72d598333bee820dff375e549978bf11a0190 (run 45930762789). The job passed server-side API type-checking, web/API tests (including the new USFM parser tests), and the application build. This is the first full automated verification of the parser files; the earlier note that tests were not yet run is superseded by this result.

The official BSB-publishing GitHub release API was rechecked: latest release is v5.24 (published 2026-11-19); standard BSB_usfm.zip is 1,647,915 bytes with SHA-256 be31ef23eb38492de9e6e17983b7d46a1a4abe010bd1ff2ad3e338795d21233d. The official archive still could not be downloaded by this execution environment, so the checksum is release metadata only and the file itself has not been locally verified.

No production version rows or verse data were added.

### 2026-11-27 — Official ASV and BSB prepared for import

**Official source acquisition:** A GitHub Actions preparation workflow successfully downloaded and checksum-verified the official eBible ASV 1901 archive and the BSB-publishing v5.24 standard USFM archive. The ASV archive SHA-256 is 00b7b6c76cb1eb67b22ca51bd5ac13c2df526c13e1c38e78b862a7a2367f7071. The BSB archive SHA-256 is be31ef23eb38492de9e6e17983b7d46a1a4abe010bd1ff2ad3e338795d21233d.

**Parsing and validation:**
- ASV: 66 books, 1,189 chapters, 31,086 non-empty verse rows. Sixteen empty verse markers in the source (traditional references absent from the edition) are preserved in a separate omission report; no text was invented.
- BSB: 66 books, 1,189 chapters, 31,086 verse rows.
- Both prepared corpora mapped to the live canonical chapter IDs and passed the offline import validator.
- A runtime check of the prepared files found 31,086 unique chapter/verse keys per edition, no empty text, no missing chapter IDs, and no invalid book/chapter mapping.
- The BSB source explicitly marks whole-verse red-letter speech for 1,218 verses; the parser preserves the boolean only when the entire verse is marked. ASV source yielded no whole-verse red-letter flags.

**Import tooling and safeguards:**
- Added scripts/import-public-domain-english.mjs and tests. It defaults to dry-run; production writes require the --apply flag plus SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
- The importer creates/uses one English version row per abbreviation, keeps new versions inactive during import, upserts by (version_id, chapter_id, verse_number), records bible_import_batches provenance, verifies exact row count, and activates only after the count matches 31,086.
- Added .github/workflows/import-approved-public-domain-english.yml. Its approval marker is currently approved=false. The resulting workflow run succeeded as a no-op; all download/import steps were skipped. No production Bible version rows or verse data were written.
- The prepared artifact is from workflow run 45931638883 and expires 2026-12-04. The approval marker references that run.

**Current state:** ASV and BSB are fully prepared and mapped but are not yet in the production Reader. The remaining action is explicit owner approval to change the marker to approved=true and run the guarded importer. KJV and WEB remain untouched.

## 2026-11-27 — ASV 1901 and BSB source preparation completed; production import paused

- GitHub Actions preparation run **45931638883** completed successfully using the official eBible.org ASV 1901 USFM archive and BSB Publishing v5.24 USFM archive.
- Verified archive sizes and SHA-256 values against the import script metadata: ASV 2,875,616 bytes, SHA-256 `00b7b6c76cb1eb67b22ca51bd5ac13c2df526c13e1c38e78b862a7a2367f7071`; BSB 1,647,915 bytes, SHA-256 `be31ef23eb38492de9e6e17983b7d46a1a4abe010bd1ff2ad3e338795d21233d`.
- Prepared both editions offline: each contains 66 books, 1,189 chapters, and 31,086 unique mapped verse rows. ASV has 16 blank source verse markers recorded in its omission report; they were not filled with invented text.
- Downloaded the short-lived GitHub Actions artifact for local inspection and confirmed both prepared JSON files contain 31,086 rows and no duplicate prepared verse keys. Artifact SHA-256: `2496288c5885a9d25efcfa901422a3a09406e454993fe6b684b7e50cb7a898a5`.
- The owner approved adding/activating ASV and BSB. The production workflow was started, but its secret-check step failed because GitHub Actions repository secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are absent. Both import steps were skipped; no database requests were sent.
- Re-checked production after the failed run: only KJV (31,102 rows) and WEB (31,098 rows) remain active. The approval marker was returned to `approved=false` so a later rerun cannot unexpectedly import content until the required secrets are configured and approval is re-enabled.
- Next step: configure those two secrets in GitHub repository Settings → Secrets and variables → Actions, then re-enable the existing guarded workflow and verify ASV/BSB counts and Reader switching.

