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
