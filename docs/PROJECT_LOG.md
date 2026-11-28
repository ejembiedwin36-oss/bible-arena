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



## 2026-11-27 — English Bible expansion resumed

**Read-only production verification:** Queried the English version catalogue and verse counts. Four versions are active and rights-verified: ASV (31,086 verses), BSB (31,086), KJV (31,102), and WEB (31,098). This supersedes older project-log statements that ASV and BSB were still pending or that only KJV and WEB were active. The owner has also tested all four Reader versions successfully.

**Repository inspection:** Confirmed that `AGENTS.md`, `docs/ENGLISH_BIBLE_VERSION_RIGHTS_REVIEW.md`, `docs/BIBLE_IMPORT.md`, and `scripts/import-public-domain-english.mjs` exist. The current public-domain importer is specifically configured for ASV and BSB; it is not yet a generic drop-in importer for arbitrary editions.

**Documentation correction:** Updated `docs/ENGLISH_BIBLE_VERSION_RIGHTS_REVIEW.md` to show the verified four-version production catalogue and record the additional requested versions: TPT, Good News/GNT, AMP, MSG, NLT (confirm the earlier "NTL" spelling), and NIV. The document now distinguishes limited quotation allowances from permission for full-text app distribution and marks YLT, DBY, ERV, WBS, and DRA as candidates requiring source/rights verification—not approved imports.

**Safety and scope:** No production data, schema, licence flags, or app code were changed. No additional translation was imported or activated.

**Next exact step:** Verify one candidate public-domain English edition from an authoritative source (including exact edition, source archive, redistribution terms, and text integrity). Only after that review should we extend the importer and prepare a dry-run corpus. In parallel, prepare publisher permission requests for the copyrighted translations. Keep KJV, WEB, ASV, and BSB unchanged.


## 2026-11-27 — YLT source and public-domain review

**Goal:** Select the next English public-domain candidate without changing the live catalogue or importing unverified text.

**Research completed:**
- Reviewed the exact 1898 revised edition of Young's Literal Translation (YLT).
- eBible.org identifies the `ENGYLT` edition as public domain and provides downloadable text and USFM/USFX formats: https://ebible.org/Scriptures/details.php?id=engylt
- CrossWire's SWORD module independently identifies Young's Literal Translation (1898) and states its distribution licence is Public Domain: https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=YLT
- BibleGateway also labels its 1898 YLT edition Public Domain: https://classic.biblegateway.com/versions/Youngs-Literal-Translation-YLT-Bible/
- The evidence supports proceeding with the 1898 YLT source for technical validation. It does not establish that a downloaded third-party modified copy is equivalent to the source edition.

**Repository change:**
- Updated `docs/ENGLISH_BIBLE_VERSION_RIGHTS_REVIEW.md` to record the source references, edition identity, public-domain assessment, attribution expectation, and technical validation gate.
- Commit: `a0d6533fa60365341bc80c83894c9c3563f4e94f` — `docs: verify public-domain status of 1898 YLT`.

**Not done / safety:**
- No Bible text archive has yet been downloaded or inspected.
- No parser run, corpus validation, production database write, catalogue row creation, activation, or deployment was performed.
- The four existing active English versions remain unchanged.
- YLT is approved only for the next technical acquisition and offline-validation stage; it is not yet approved for production import.

**Next exact step:** Obtain the official eBible.org 1898 YLT archive, inspect its licence/metadata and file structure, record its SHA-256 checksum, then run the existing USFM parser and canonical chapter-map validator in dry-run mode. Review all parser exceptions and verse counts before considering any importer change.


### 2026-11-27 — YLT official USFM archive preparation added

**Goal:** Obtain and parse the exact eBible.org 1898 YLT source without changing production Bible data.

**Source confirmation:**
- The official eBible.org YLT page identifies the edition as public domain and provides a dedicated USFM archive: https://ebible.org/Scriptures/engylt_usfm.zip
- The archive link is listed on the official edition page: https://ebible.org/find/show.php?id=engylt
- The exact source archive could not be downloaded by the connected container environment. No substitute or third-party modified text was used.

**Repository change:**
- Extended `.github/workflows/prepare-public-domain-english.yml` to download and checksum-report the official YLT USFM archive, validate the ZIP, extract its USFM files, run the existing parser, report book/chapter/verse counts, and retain the source/normalized files as a short-lived review artifact.
- YLT has deliberately not been added to the production importer. The workflow prepares and parses source material only; it contains no Supabase write step.
- Commit: `511d9becd30313238554a5310a5f26133f0515b1` — `ci: validate YLT source archive offline`.
- GitHub Actions preparation run `45942618006` was observed queued at the time of this entry; parsing and download outcome are not yet verified.

**Safety:** No production data, schema, version rows, rights flags, app deployment, or existing English Bible text were changed. KJV, WEB, ASV, and BSB remain untouched.

**Next exact step:** Check run `45942618006`. If the YLT download and parser succeed, inspect its archive checksum, exact edition metadata, all book/chapter/verse counts, and omission report. If parsing fails, use the parser logs to identify edition-specific USFM/versification exceptions; do not flatten or guess. Only after full offline validation should we extend the importer and prepare a dry-run. Production import still requires a separate explicit approval.


### 2026-11-27 — YLT archive downloaded and USFM parser passed

The YLT source-preparation workflow run `45942618006` completed successfully.

**Verified from the GitHub Actions job log:**
- Downloaded the official eBible.org archive `https://ebible.org/Scriptures/engylt_usfm.zip`.
- Archive size: 1,386,206 bytes.
- Archive SHA-256: `c526b4e362fef13916a14765a7e331267f6a1227db58549fc61d3288a930a12b`.
- ZIP integrity check passed.
- Extracted 66 USFM source files.
- Existing USFM parser completed successfully and produced 31,102 verse rows across 66 books and 1,189 chapters.
- This confirms the archive can be parsed by the current parser. It does not yet confirm that every verse maps to the canonical database chapter IDs.

**Follow-up repository change:**
- Extended the offline preparation workflow to pass YLT through `prepare-bible-version-import.mjs` using the observed expected counts (66 books, 1,189 chapters, 31,102 verses) and the existing canonical chapter map.
- Added the mapped YLT output to the short-lived review artifact.
- Commit: `edad505fc743f3788ce60e89c0f7ac7188e6fc72` — `ci: validate YLT canonical chapter mapping`.
- Follow-up preparation run `45942656037` was queued at the time of this log update; its mapping result is not yet verified.

**Safety:** No Supabase or production writes were included. No version catalogue row was created and YLT has not been activated. KJV, WEB, ASV, and BSB are unchanged.

**Next exact step:** Verify run `45942656037`. If canonical mapping succeeds, inspect the mapped artifact, compare verse keys and omissions, and add YLT-specific tests/import configuration only after review. If it fails, investigate the exact chapter/verse mapping differences rather than changing expected counts to force a pass.


### 2026-11-27 — YLT corpus fully mapped; importer support added (no production write)

**Source and rights**
- Official eBible.org edition page identifies Young's Literal Translation (ENGYLT) as public domain and provides the USFM download: https://ebible.org/Bible/details.php?id=engylt
- eBible.org's catalogue also lists the 1862/1898 YLT edition as public domain: https://ebible.org/Scriptures/copyright.php
- Exact source archive: `https://ebible.org/Scriptures/engylt_usfm.zip`
- Archive size: 1,386,206 bytes.
- SHA-256: `c526b4e362fef13916a14765a7e331267f6a1227db58549fc61d3288a930a12b`.
- ZIP integrity passed.

**Corpus and mapping validation**
- Workflow run `45942656037` passed: https://github.com/ejembiedwin36-oss/bible-arena/actions/runs/45942656037
- Parser output: 66 books, 1,189 chapters, 31,102 verse rows.
- Canonical chapter preparation output: 66 books, 1,189 chapters, 31,102 verses.
- Downloaded and inspected the workflow artifact `15173417784` locally in the tool environment.
- Independent check of prepared rows found 31,102 unique `(chapter_id, verse_number)` keys and zero duplicate keys. The YLT artifact did not include an omitted-verse report, consistent with no omitted empty markers.
- Spot checks: Genesis 1:1 and John 3:16. The John 3:16 text matches the eBible.org edition page sample.
- The canonical map check validates chapter IDs and row keys; it does not replace a full textual collation against a printed 1898 source.

**Repository changes**
- `scripts/import-public-domain-english.mjs`: added YLT edition metadata (1898, source URL, public-domain source URL, checksum, 66/1,189/31,102 expected counts) and filename recognition for YLT.
- `scripts/import-public-domain-english.test.ts`: added a YLT dry-run test.
- Rights review updated with source evidence and validation results.
- Importer support is code-only. The production import workflow was intentionally NOT changed to include YLT, and no Supabase request/write was made.
- Commits:
  - `da5c807eaa1238d255daa94540dc31ca3a711781` — `docs: record YLT rights and corpus validation`
  - `850473ea3757856a73e3d55ed2878ece7606b223` — `feat(import): support validated YLT corpus`
  - `6a008f67a903b5be1d9c2352ec3597e11f088bd5` — `test(import): cover YLT dry-run support`
- CI run `45942807830` was queued/in progress when this entry was written; test outcome must be checked before marking importer support verified.

**Safety and decision**
- YLT is a strong public-domain candidate and has passed archive, parser, canonical mapping, and duplicate-key validation.
- It is not in production, is not active, and no production catalogue rights flags were changed.
- KJV, WEB, ASV, and BSB remain untouched.
- Production import remains a separate action requiring explicit owner approval.

**Next exact step**
1. Check CI run `45942807830` and confirm the YLT test passes.
2. If CI passes, add a YLT-only dry-run invocation to the preparation workflow or a separate non-writing verification workflow, then review the complete import safeguards and app attribution/display behavior.
3. Only after the owner explicitly approves a production database write should the import workflow be extended to include YLT. Do not set the production approval marker or run `--apply` before that approval.


### 2026-11-27 — YLT 1898 imported and activated; Reader integration corrected

**Owner approval and production import**
- The owner explicitly approved importing and activating Young's Literal Translation (1898).
- Updated the approval-gated workflow to import only editions explicitly listed in the approval marker. For this run, only YLT was approved; ASV and BSB steps were skipped.
- Production import workflow run **45943207768** completed successfully: https://github.com/ejembiedwin36-oss/bible-arena/actions/runs/45943207768
- The workflow downloaded the validated preparation artifact from run **45942946335**, verified the prepared YLT file and required GitHub Actions secrets, then ran the YLT importer with `--apply`.
- Supabase read-back confirms the English YLT version is active and rights-verified, with exactly **31,102** verse rows. The importer activated the version only after its exact-count check.
- Production spot checks returned YLT Genesis 1:1 and John 3:16 from `bible_verses`.
- KJV, WEB, ASV, and BSB were not changed by this YLT-only import.

**Reader integration issue found and fixed**
- Post-import code inspection found that `BibleReaderPanel` required a matching `bible_translations` row and passed that translation ID to the reader service. YLT is a direct `bible_versions` / `bible_verses` corpus and intentionally has no legacy `bible_translations` row, so the version would not have loaded in the Reader even though it was active in the catalogue.
- Updated `src/services/bibleReader.ts` to query direct verses by the selected `bible_versions.id` first, then use the legacy translation ID as a fallback for older translation-backed editions.
- Updated `src/components/BibleReaderPanel.tsx` to pass the selected version ID and optional legacy translation ID separately.
- Added a regression test proving a direct version-backed corpus such as YLT loads by `bible_versions.id`.
- Commits: `b23726de4fabb1b2b1ae87fa816d6c55ea402342`, `2ccb19aed4d66c2297955a7b9f393786a8adf38c`, and `6f1a8ccf35222108c980e0444ffba0c54c5d26de`.

**Verification at time of this entry**
- Production import workflow: passed.
- YLT database count and active/rights flags: passed.
- Genesis 1:1 and John 3:16 production read-back: passed.
- Reader verification run **45943448033**: unit tests and API type-check completed successfully; TypeScript check/build still running at time of entry.
- Main CI run **45943447994**: still running at time of entry.
- Do not call the Reader integration deployed until CI and the Vercel deployment are confirmed and the production Reader smoke test succeeds.

**Next exact step**
1. Verify CI runs `45943448033` and `45943447994` complete successfully.
2. Confirm the latest main commit deploys to https://bible-arena-gamma.vercel.app/.
3. Open the Bible Reader, refresh the catalogue, select English → Young's Literal Translation (YLT), and check Genesis 1:1 and John 3:16. If the deployment is not yet ready, do not ask the owner to test until it is.
4. Then continue with the publisher permission requests for TPT, AMP/AMPC, GNT, MSG, NLT, and NIV, while keeping rights-gated editions inactive until authorization is received.


### 2026-11-27 — YLT Reader fix passed CI and deployed

- Reader verification run **45943448033** completed successfully: tests, API type-check, TypeScript check, and build all passed.
- Main CI run **45943447994** completed successfully: Python syntax check, API type-check, web/API tests, and application build passed.
- Vercel reported success for code commit `6f1a8ccf35222108c980e0444ffba0c54c5d26de`; deployment completed.
- The fix makes the Reader query direct corpora (including YLT) by the selected `bible_versions.id`, while preserving the legacy translation-ID fallback. The regression test for direct version-backed reading passed.
- The live Supabase catalogue and verse rows were verified earlier in this session: YLT is active, rights-verified, and has exactly 31,102 verses. Genesis 1:1 and John 3:16 returned YLT text.
- **Still pending:** owner-side browser smoke test on https://bible-arena-gamma.vercel.app/ after a hard refresh. Select English → YLT and verify Genesis 1:1 and John 3:16. Do not claim the UI smoke test is complete until the owner confirms it.


### 2026-11-27 — Initial YLT red-letter support

- Added a YLT-specific annotation corpus for John 3:16, with the exact public-domain YLT verse text and a reviewed speech span.
- Wired YLT to its own annotation loader and enabled the Reader red-letter toggle for YLT alongside KJV and WEB.
- Kept strict exact-text alignment: if displayed YLT wording differs from the curated annotation, the verse stays uncoloured. Unannotated verses also remain normal text.
- Added tests for the exact John 3:16 highlight, wording mismatch fallback, and unannotated verses.
- **Coverage limit:** this is an initial YLT annotation for John 3:16, not full-book or full-Bible YLT red-letter coverage. Expand only with translation-specific reviewed annotations.


### 2026-11-27 — Red-letter support extended to ASV and BSB

- Added an ASV-specific annotation corpus and exact-text John 3:16 annotation; added the corresponding WEB John 3:16 annotation.
- Added `isJesusWords` to the Reader verse model and selected the existing `bible_verses.is_jesus_words` field in direct and legacy corpus reads.
- Enabled BSB red-letter rendering from its existing verse-level database marker (1,218 BSB verses marked at time of audit). This is verse-level, not partial-word annotation, and should be reviewed before treating it as full precision.
- Enabled the red-letter control for all five English versions: KJV, WEB, ASV, BSB, and YLT.
- Added regression tests for ASV exact-text alignment and BSB marker retrieval.
- **Coverage remains partial:** ASV currently has John 3:16 annotated; WEB has its existing partial Matthew/John corpus plus John 3:16; YLT has John 3:16; KJV retains its existing partial corpus; BSB uses 1,218 verse flags. Full red-letter coverage across all 66 books and all five versions is still outstanding.


### 2026-11-27 — Red-letter precision safeguard

- Audited the Reader's BSB rendering path and found it used the database's whole-verse `is_jesus_words` flag. This cannot represent partial speech spans and may over-highlight a verse containing mixed speech and narration.
- Removed the BSB whole-verse rendering path. All five supported English versions now go through the same exact-text span alignment function.
- Added explicit version loader routing. This prevents unknown or not-yet-supported versions from accidentally receiving KJV span offsets.
- BSB annotations are currently unavailable until a translation-specific corpus has been reviewed; the UI now reports that status and leaves the Scripture text unchanged.
- The current John corpus is still incomplete in WEB, ASV, BSB, and YLT. KJV already has wider partial coverage. The next annotation work is John chapter-by-chapter for each version, with exact wording and speaker-boundary checks.
- Commits: `dc067c9c415d70e91009fb734c90d7436eafe6bc` and `70abe295668634b7304c9b4bc6a54f53ad9805ff`.


### 2026-11-27 — John chapter 1 red-letter annotations

- Added translation-specific annotations for Jesus' speech in John 1:38–39, 42–43, and 47–51 for ASV, WEB, YLT, and BSB. KJV's existing John 1 annotations were preserved.
- Added the BSB John corpus file and connected it to the explicit version loader map.
- For verses containing more than one speaker, spans cover only Jesus' words. For example, John 1:38 highlights Jesus' question but leaves the other speakers' words and narrative uncoloured.
- Added automated tests for the four new version corpora, mixed-dialogue boundaries, and unannotated passages.
- Coverage remains limited to selected verses in John chapter 1 for these four versions; this is not full chapter coverage or full Gospel coverage. Next: John chapter 2 for all five versions.


## John chapter 2 annotation checkpoint — 2026-11-28

- Preserved the existing KJV John 2 annotations and added exact translation-specific speech spans for WEB, ASV, YLT, and BSB at John 2:4, 2:7, 2:8, 2:16, and 2:19.
- In BSB John 2:4 and 2:8, the annotation uses separate spans because narrator attribution interrupts Jesus' words. Only Jesus' spoken phrases are highlighted.
- Added regression tests that verify the highlighted text for all five versions and confirm that Mary’s words in John 2:5 remain uncoloured.
- Annotation scope is selected verses, not all of John chapter 2. Unannotated verses remain normal text. Exact-text mismatch also disables highlighting.
- Next: verify CI and reader verification; then continue chapter-by-chapter through John.


## John chapters 2–3 annotation checkpoint — 2026-11-28

- John 2: preserved existing KJV annotations; added exact-text speech spans for WEB, ASV, YLT, and BSB at verses 4, 7, 8, 16, and 19. BSB verses 4 and 8 use separate spans where attribution interrupts Jesus’ speech.
- John 3: added exact-text spans for WEB, ASV, YLT, and BSB at verses 3, 5–8, and 10–21 (17 verses per version). Existing KJV annotations were retained.
- Boundary checks confirm Jesus’ speech is separated from attributions and Nicodemus’ replies. BSB John 3:10 leaves “said Jesus” uncoloured, and John 3:21 leaves the appended section heading uncoloured.
- Verification for commit `c2ee791`: Reader verification and main CI both succeeded; 29 test files / 135 tests passed, TypeScript checks passed, and the production build passed.
- Deployment to the live website has not been independently confirmed in this checkpoint.
- Next: continue John chapter 4 using exact translation text and reviewed speech boundaries.


## John chapter 4 annotation checkpoint — 2026-11-28

- Preserved the existing KJV John 4 corpus and added exact-text speech spans for WEB, ASV, YLT, and BSB at verses 7, 10, 13–14, 16–18, 21–24, 26, 32, 34–38, 48, 50, and 53 (21 reviewed verses per version).
- Mixed dialogue is separated carefully: John 4:17 highlights Jesus’ reply but not the woman’s statement; BSB 4:21 and 4:50 use multiple spans around speaker attributions; BSB 4:38 excludes its appended section heading; John 4:53 highlights only the reported spoken words.
- Verification for commit `699e0ed`: main CI and Reader verification succeeded; 29 test files / 145 tests passed, API and TypeScript checks passed, and the production build passed.
- Deployment to the live website has not been independently confirmed.
- Next: continue John chapter 5 with translation-specific spans and exact speaker boundaries.


## John chapter 5 annotation checkpoint — 2026-11-28

- Preserved the existing KJV annotations and added exact-text speech spans for WEB, ASV, YLT, and BSB at John 5:6, 5:8, 5:14, 5:17, and 5:19–47 (33 reviewed verses per version; 132 new annotations).
- BSB John 5:30 and 5:38 spans stop before appended section headings. Tests confirm the narration in John 5:9, 5:15, and 5:18 remains uncoloured.
- Verification for commit `d4c9845`: main CI and Reader verification succeeded; 29 test files / 153 tests passed, API and TypeScript checks passed, and the production build passed.
- Deployment to the live website has not been independently confirmed.
- Next: continue John chapter 6 with exact translation text and reviewed speaker boundaries.



## John chapter 6 annotation checkpoint — 2026-11-28

- Preserved the existing KJV John 6 annotations and added exact production-text spans for WEB, ASV, YLT, and BSB at the same 37 reviewed Jesus-speech verses.
- Speech spans exclude attributions in John 6:5, 6:10, 6:12, 6:20, 6:26, 6:29, 6:32, 6:35, 6:43, 6:53, 6:61, 6:65, 6:67, and 6:70. John 6:64 stops before the narrator's explanation; BSB John 6:58 stops before its appended section heading.
- Added regression tests for all reviewed verse keys in all five versions, attribution boundaries, BSB heading/narration exclusions, and verses spoken by other people.
- Verification is pending for the resulting commit; no deployment is claimed.
- Next: continue John chapter 7 using exact translation text and reviewed speaker boundaries.


## John chapter 7 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 17 reviewed verses in John 7 to WEB, ASV, YLT, and BSB; existing KJV John 7 annotations remain unchanged.
- Speaker introductions are excluded where they appear before the speech. BSB John 7:16 uses two spans because “Jesus replied” separates Jesus’ two speech portions. BSB John 7:24 stops before the appended “Is Jesus the Christ?” heading.
- Added tests for all 17 reviewed verses across all five versions, attribution boundaries, BSB section-heading exclusion, and other speakers/narration.
- Verification and deployment status must be checked on the resulting commit before this checkpoint is treated as complete.
- Next: continue John chapter 8 using exact production translation text and reviewed speaker boundaries.


## John chapter 8 annotation checkpoint — 2026-11-28

- Added exact-text red-letter spans for 12 reviewed verses (8:12, 21, 23, 24, 28, 31, 32, 34, 36, 51, 56, and 58) to WEB, ASV, YLT, and BSB. Existing KJV annotations were preserved.
- John 8:58 BSB uses two spans so the speaker attribution “Jesus declared” remains uncoloured. The remaining reviewed spans begin after speaker introductions and stop at the spoken text boundary.
- Added regression tests for the reviewed verses in all five versions, attribution exclusion, BSB John 8:58 split speech, and text mismatch fallback.
- Verification for commit `227267d`: CI and Reader verification succeeded; 29 test files / 178 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify the John 8 commit and then continue with John chapter 9.

- Boundary review correction: John 8:23 in WEB, ASV, BSB, and YLT now includes the complete final clause “I am not of this world”; a regression test checks each translation's full spoken statement.


## John chapter 9 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 8 reviewed verses (9:3–5, 9:7, 9:35, 9:37, 9:39, and 9:41) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- John 9:7 stops before the explanatory note about Siloam. BSB 9:37 and 9:41 use separate spans around “Jesus answered/replied” so the speaker attribution remains uncoloured.
- Added regression tests for all 8 reviewed verses in all five versions, the Siloam explanation boundary, BSB split speech, and text mismatch fallback. A direct exact-text audit confirmed all 32 new annotations match the production verse text and have valid spans.
- Verification for commit `edda7a4`: CI and Reader verification succeeded; 29 test files / 186 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 9, then continue with John chapter 10.


## John chapter 10 red-letter checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 29 reviewed verses (10:1–5, 10:7–18, 10:25–30, and 10:32–38) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- John 10:7 starts after translation-specific speaker introductions. BSB John 10:25 uses two spans around “Jesus replied”; the attribution is uncoloured. John 10:32 and 10:34 also start after speaker introductions.
- Added regression tests for all 29 reviewed verses in all five versions, attribution boundaries, and text mismatch fallback. A direct exact-text audit confirmed all 116 new annotations match production text and have valid spans.
- Verification for commit `f42e542`: CI and Reader verification succeeded; 29 test files / 201 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 10, then continue with John chapter 11.


## John chapter 11 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 17 reviewed verses (11:4, 7, 9–11, 14–15, 23, 25–26, and 34, 39–44) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- John 11:9 starts after Jesus’ speaker introduction. John 11:34 and 11:39 highlight only Jesus’ questions/command, not the replies from others. John 11:44 stops before the appended BSB section heading and excludes the speaker attribution.
- Added regression tests for all 17 reviewed verses in all five versions, mixed-speaker boundaries, and text mismatch fallback. A direct exact-text audit confirmed all 68 new annotations match production text and have valid spans.
- Verification for commit `a8fb9bb`: CI and Reader verification succeeded; 29 test files / 208 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 11, then continue with John chapter 12.


## John chapter 12 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 20 reviewed verses (12:7–8, 12:23–28, 12:30–32, 12:35–36, and 12:44–50) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- BSB John 12:7 uses two spans around “Jesus replied”; John 12:8 stops before the appended section heading. John 12:28 highlights Jesus’ prayer only, not the voice from heaven. John 12:36 stops before the narrator resumes.
- Added regression tests for all 20 reviewed verses in all five versions, attribution boundaries, narration/heading exclusions, and text mismatch fallback. A direct exact-text audit confirmed all 80 new annotations match production text and have valid spans.
- Verification for commit `4c9205d`: CI and Reader verification succeeded; 29 test files / 217 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 12, then continue with John chapter 13.


## John chapter 13 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 23 reviewed verses (13:7–8, 13:10–21, 13:26–27, and 13:31–38) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- Mixed dialogue is separated: John 13:8 highlights only Jesus’ answer after Peter’s words; 13:11 highlights Jesus’ “not all clean” statement, not the narrator; 13:26 stops before the dipping/giving narration; BSB 13:17 stops before its section heading; BSB 13:38 uses two spans around “Jesus replied.”
- Added regression tests for all 23 reviewed verses in all five versions, mixed-speaker boundaries, heading/narration exclusions, and text mismatch fallback. A direct exact-text audit confirmed all 92 new annotations match production text and have valid spans.
- Verification for commit `d6aa341`: CI and Reader verification succeeded; 29 test files / 226 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 13, then continue with John chapter 14.


## John chapter 14 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 28 reviewed verses (14:1–4, 14:6–7, 14:9–21, and 14:23–31) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- Speaker introductions are excluded at John 14:6, 14:9, and 14:23. BSB John 14:4, 14:14, and 14:26 stop before appended section headings.
- Added regression tests for all 28 reviewed verses in all five versions, attribution/heading boundaries, and text mismatch fallback. A direct exact-text audit confirmed all 112 new annotations match production text and have valid spans.
- Verification for commit `1324bc5`: CI and Reader verification succeeded; 29 test files / 234 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 14, then continue with John chapter 15.


## John chapter 15 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for all 27 reviewed verses in John 15 to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- BSB John 15:8 and 15:17 stop before appended section headings.
- Added regression tests for all 27 verses in all five versions, BSB heading exclusions, and text mismatch fallback. A direct exact-text audit confirmed all 108 new annotations match production text and have valid spans.
- CI and Reader verification are pending for this John 15 checkpoint; deployment is not confirmed.
- Next: verify John 15, then continue with John chapter 16.


## John chapter 16 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 29 reviewed verses (16:1–16, 16:19–28, and 16:31–33) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- BSB John 16:4, 16:16, and 16:22 stop before appended section headings. John 16:19 starts after the speaker introduction; BSB 16:31 highlights Jesus’ question but leaves “Jesus replied” uncoloured.
- Added regression tests for all 29 reviewed verses in all five versions, heading/attribution boundaries, and text mismatch fallback. A direct exact-text audit confirmed all 116 new annotations match production text and have valid spans.
- Verification for commit `b978f9c`: CI and Reader verification succeeded; 29 test files / 258 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 16, then continue with John chapter 17.


## John chapter 17 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for all 26 reviewed verses in John 17 to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- John 17:1 begins at Jesus’ prayer after the narration. BSB John 17:5 and 17:19 stop before appended section headings.
- Added regression tests for all 26 verses in all five versions, the prayer/narration boundary, BSB heading exclusions, and text mismatch fallback. A direct exact-text audit confirmed all 104 new annotations match production text and have valid spans.
- Verification for commit `b978f9c`: CI and Reader verification succeeded; 29 test files / 258 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 17, then continue with John chapter 18.


## John chapter 18 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 12 reviewed verses (18:4–8, 18:11, 18:20–21, 18:23, 18:34, and 18:36–37) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- John 18:6 highlights Jesus’ reported words only. BSB 18:8, 18:11, 18:20, 18:34, and 18:37 use multiple spans around speaker attributions; other speakers’ words remain uncoloured.
- Added regression tests for all 12 reviewed verses in all five versions, reported speech, mixed-speaker boundaries, and text mismatch fallback. A direct exact-text audit confirmed all 48 new annotations match production text and have valid spans.
- Verification for commit `6ad4ffc`: CI and Reader verification succeeded; 29 test files / 267 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 18, then continue with John chapter 19.


## John chapter 19 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for the 5 reviewed verses (19:11, 19:26–28, and 19:30) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- John 19:11 highlights Jesus’ complete answer after the attribution. John 19:26–27 highlight only His words to His mother and the disciple; BSB 19:27 and 19:30 stop before appended section headings.
- Added regression tests for all 5 reviewed verses in all five versions, mixed narration boundaries, heading exclusion, and text mismatch fallback. A direct exact-text audit confirmed all 20 new annotations match production text and have valid spans.
- CI and Reader verification are pending for this John 19 checkpoint; deployment is not confirmed.
- Next: verify John 19, then continue with John chapter 20.


## John chapter 20 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 10 reviewed verses (20:15–17, 20:19, 20:21–23, 20:26–27, and 20:29) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- John 20:15 highlights Jesus’ questions and excludes Mary’s reply. BSB 20:15 and 20:17 use separate spans around speaker attributions. BSB 20:23 and 20:29 stop before appended section headings.
- Added regression tests for all 10 reviewed verses in all five versions, mixed-speaker boundaries, heading exclusions, and text mismatch fallback. A direct exact-text audit confirmed all 40 new annotations match production text and have valid spans.
- Verification for commit `7372c06`: CI and Reader verification succeeded; 29 test files / 285 tests passed, API and TypeScript checks passed, and the production build passed. Deployment to the live website has not been independently confirmed.
- Next: verify John 20, then continue with John chapter 21.


## John chapter 21 annotation checkpoint — 2026-11-28

- Added exact-text Jesus-speech spans for 10 reviewed verses (21:5–6, 21:10, 21:12, 21:15–19, and 21:22) to WEB, ASV, YLT, and BSB; existing KJV annotations were preserved.
- John 21:5–6 highlight Jesus’ questions/command, not the fishermen’s answers. John 21:15–17 uses separate spans for Jesus’ questions and shepherding commands, leaving Peter’s replies uncoloured. John 21:19 stops at “Follow Me” before narration and the BSB heading.
- Added regression tests for all 10 reviewed verses in all five versions, mixed-speaker boundaries, and text mismatch fallback. A direct exact-text audit confirmed all 40 new annotations match production text and have valid spans.
- CI and Reader verification are pending for this John 21 checkpoint; deployment is not confirmed.
- Next: verify John 21, then audit remaining unreviewed Jesus-speech verses in John.
