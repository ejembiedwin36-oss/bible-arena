# AGENTS.md — Bible Arena Agent Instructions

These instructions apply to AI agents and automated coding assistants working anywhere in this repository.

## 1. Mission and product context

Bible Arena is a multilingual Bible reading, study, devotion, learning/challenge, audio, and AI-assisted Scripture application. Idoma is the first major local-language priority. Read these documents before substantial work:

1. `README.md`
2. `docs/PRODUCT_REQUIREMENTS.md`
3. `docs/IMPLEMENTATION_ROADMAP.md`
4. `docs/PROJECT_LOG.md`
5. `docs/BIBLE_ARENA_BEGINNER_PROJECT_GUIDE.md`

The product must distinguish verified Scripture from commentary, study notes, and AI-generated text. Never invent Scripture text, translation coverage, licensing permissions, or language capabilities.

## 2. Owner collaboration and teaching style

The project owner is learning software development while building Bible Arena. Work as a patient technical coach:
- Explain unfamiliar terms and why a step is necessary.
- Prefer one manageable step or command at a time when the owner is operating a local terminal or dashboard.
- Do not overwhelm the owner with large unexplained code dumps.
- When practical, explain the concept first, outline the approach, then make a small change and verify it.
- Do not claim the owner ran a command or completed a test unless the evidence shows that.
- Be clear about what the owner must do locally versus what the agent can do through repository tools.

## 3. Safety and approval boundaries

**Never perform any of the following without first explaining the impact and receiving the owner's explicit approval:**
- Production database schema or data changes.
- Supabase migrations, migration repair, reset, push, pull, or destructive database operations.
- Deleting/merging database tables, indexes, policies, functions, or storage objects.
- Changes to authentication/security settings, RLS policies, grants, or SECURITY DEFINER functions.
- Paid hosting, GPU deployment, provider upgrades, purchases, or other billable actions.
- Production deployments or changes to production environment variables/secrets.
- Irreversible Git operations, force pushes, history rewrites, or deleting branches/tags.

Read-only inspection is preferred when auditing production. Clearly identify when a command is read-only and when it can write state.

## 4. Security and secrets

- Never place credentials in source code, documentation, issues, logs, test fixtures, screenshots, or chat responses.
- Never ask the owner to paste passwords, API keys, access tokens, service-role keys, database connection strings, or one-time codes.
- If terminal output includes a secret, tell the owner not to share it; do not repeat or preserve it. Ask only for sanitized error messages and non-sensitive status information.
- Keep Supabase service-role/secret keys and Runpod credentials server-side only. Never expose them through browser bundles or `VITE_*` variables.
- Do not commit `supabase/.temp/`, local environment files, build outputs, dependency caches, or personal machine paths unless explicitly required and reviewed.
- Check `git status` and ignore rules before staging or committing.

## 5. Engineering workflow

Before editing:
1. Inspect the current branch, working tree, recent commits, and relevant files.
2. Read the related project docs and tests.
3. Confirm the actual implementation path; do not assume a similarly named file is active.
4. Identify risks, dependencies, and expected behavior.
5. Keep changes focused and avoid unrelated refactors.

While editing:
- Follow existing project conventions and TypeScript/Python patterns.
- Preserve backward compatibility unless a change is explicitly planned.
- Prefer small, reviewable changes.
- Add or update tests for changed behavior.
- Do not add a dependency without explaining why and checking the existing stack.
- Keep licensed Bible content and user-private data out of source control.

After editing:
1. Run the narrowest relevant tests first, then broader checks where practical.
2. Run the production build/type checks when relevant.
3. Inspect the final diff and repository status.
4. Report exact results, including failures and tests not run.
5. Record commit SHA/message when committed. Never claim a deployment succeeded without checking its status and public URL.

## 6. Supabase and migration rules

- Read the installed/current Supabase guidance and command help before using unfamiliar CLI commands.
- Treat the live production migration history as authoritative for what has been applied to production; GitHub may not contain the original historical SQL files.
- Never fabricate historical migration files or version identifiers.
- Preserve the live schema before proposing migration-history recovery or consolidation.
- Do not run `supabase db pull`, `db push`, `migration repair`, reset, or any schema-changing command merely to make local files look complete.
- Use read-only SQL for audits. Do not turn a read-only investigation into a write.
- Inspect RLS, grants, views, triggers, and SECURITY DEFINER functions before changing database access.
- Do not revoke intended authenticated RPC access without understanding the function body and callers.
- A schema dump is not a replacement for the original sequence of historical migrations.
- Keep secrets and database contents out of the project log; log only safe metadata and verified findings.

## 7. Bible content, licensing, and AI truthfulness

- Publicly viewable content is not automatically licensed for redistribution, audio playback, or machine-learning training.
- Verify rights for each translation, audio source, dataset, and intended use.
- A language catalogue entry does not mean Bible text exists in that language.
- An integrated speech model does not prove it understands Idoma; measure performance with consented, representative native-speaker data.
- Label AI-generated explanations clearly and keep them separate from Bible text.
- Do not invent verse references, devotional content, quiz answers, or sources.

## 8. Documentation duties — required every session

At the end of every meaningful work session:
- Update `docs/PROJECT_LOG.md` with date, goal, actions, commands (secrets removed), evidence, challenges, decisions, changes, and the next exact step.
- Update `docs/BIBLE_ARENA_BEGINNER_PROJECT_GUIDE.md` when a new concept, challenge, error, solution, or important file needs a beginner-friendly explanation.
- Update `docs/IMPLEMENTATION_ROADMAP.md` when phase status or priorities materially change.
- Keep README links and project status accurate.
- Do not mark a task complete until it is verified.
- Keep the log chronological and append new entries; do not erase previous challenges or failed attempts.

If documentation cannot be updated in the same change, state why and make it the next explicit task.

## 9. Git and review conventions

- Use descriptive commit messages such as `docs: record Supabase recovery progress` or `fix(reader): handle unavailable translation`.
- Do not commit local caches, credentials, or generated dumps unless the owner explicitly approves and the file is safe and appropriate to store.
- Prefer a feature branch and reviewable pull request for substantial or risky changes. Small documentation changes may follow the repository's established workflow.
- Never force-push or rewrite shared history without explicit approval.
- Before a commit, inspect staged files and diff. After a commit, verify the resulting commit and branch state.

## 10. Current handover (2026-11-19)

- Repository: `ejembiedwin36-oss/bible-arena`; default branch `main`.
- Local Windows checkout: `C:\\Users\\DELL\\Desktop\\bible-arena`.
- Supabase project ref: `fqsjzjduawcevqlammzm`.
- Supabase CLI is being run through `npx --yes supabase@latest` (observed version 3.2.0); a global `supabase` command is not installed.
- The project has been linked to the Supabase project.
- Docker Desktop is running; `docker info` shows a healthy Linux Server section (Docker Engine 29.9.2).
- The read-only schema-only `public` export succeeded to `C:\\Users\\DELL\\Desktop\\bible-arena-schema-audit\\public-schema.sql`; PowerShell verified it exists and is 93,729 bytes. The dump remains outside Git.
- First dump inventory: 34 tables, 64 RLS policies, 15 functions, 65 indexes. Count functions using both `CREATE FUNCTION` and `CREATE OR REPLACE FUNCTION`.
- GitHub `supabase/migrations` currently lists its README and one SQL file, `20261025223416_maintenance_users.sql`; that file comments on a preceding version `20261025223408` whose SQL is not present in the current listing. Live production migration history was previously observed to contain 38 records.
- Verified `supabase/migrations/20261025223416_maintenance_users.sql` against the production dump: columns/default, primary key, auth.users foreign key with cascade, RLS enabled, and service_role SELECT-only grant match. This verifies only that table, not all production migration history.
- The exact 38 production migration version/name pairs were retrieved read-only and appended to `docs/PROJECT_LOG.md` and `docs/BIBLE_ARENA_BEGINNER_PROJECT_GUIDE.md` (2026-11-19 entry). The live history spans `20260914130719` to `20261025223416`.
- GitHub migration directory previously showed only one SQL file plus README; do not invent the missing 37 SQL files.
- Next step: compare the 38 production version/name pairs with tracked migration filenames and inspect the migration README. Then discuss safe baseline/forward-only options. Do not execute the dump or run `db pull`, `db push`, migration repair, reset, or schema-changing SQL.
- No production schema/data changes or migration-history changes were made during this recovery work. The dump is an external audit artifact and must not be committed.
- The local `supabase/.temp/` directory is untracked and must not be committed.

When resuming, continue from the exact next step in `docs/PROJECT_LOG.md`: perform the read-only comparison of production tables, constraints, indexes, policies, functions, triggers, views, and grants with tracked repository artifacts. Docker, schema export, the 38-record migration history, and the one-file GitHub migration directory are already verified.


## Latest read-only schema audit progress — 2026-11-19

- Inspected `bible_books` columns, check constraints, primary/unique constraints, indexes, public-read policy, RLS setting, and table grants from the external schema-only export.
- Verified `bible_chapters.book_id` references `bible_books.id` with `ON DELETE CASCADE`; `(book_id, chapter_number)` is unique.
- `bible_books` has RLS enabled and `books_public_read` for SELECT by `anon` and `authenticated`. The dump shows table-level GRANT ALL to anon/authenticated/service_role; interpret grants together with RLS and do not infer ordinary-user write access from the GRANT alone.
- Flag only for later investigation: unique index `bible_books_canonical_key_uidx` may overlap with the unique constraint on `canonical_key`. Do not remove or change it during this audit.
- No production writes or schema changes were made.
- **Next exact step:** Continue the same read-only inspection with the `languages` table, beginning with its CREATE TABLE definition.


## Current audit checkpoint — 2026-11-22 (read-only)

Connected GitHub and Supabase access were used to resume without requiring the owner to open VS Code. Supabase project `fqsjzjduawcevqlammzm` is `ACTIVE_HEALTHY`; production lists 38 migration records.

The live `bible_versions` table was inspected: PK `id`; unique `(language_id, abbreviation)`; FK `language_id` → `languages.id` ON DELETE RESTRICT; indexes on PK, language/abbreviation, and language; RLS enabled; SELECT policy requires `is_active = true` AND `rights_verified = true`. KJV and WEB are currently listed as English, active, and rights-verified.

A read-only effective privilege audit found broad INSERT/UPDATE/DELETE/TRUNCATE privileges for `anon` and `authenticated` on 27 public tables. RLS does not protect TRUNCATE. Treat this as a priority least-privilege review item; do not revoke grants until table policies, application calls, RPCs, and admin/service-role paths are mapped.

Supabase security advisor findings: no-policy RLS on `maintenance_users` and `voice_speaker_dataset_assignments`; six authenticated-executable SECURITY DEFINER RPCs (their definitions were inspected and contain empty search_path plus auth/ownership or language-role checks); leaked-password protection disabled. No production changes were made.

**Next exact step:** Build a table-by-table least-privilege matrix for those 27 tables and correlate each privilege with RLS policy and app/RPC use. Then prepare a reviewed remediation proposal; no grant, policy, migration, or Auth configuration changes without owner approval.


## 2026-11-22 — Expanded privilege review checkpoint

Live read-only PostgreSQL metadata mapped 27 public tables with TRUNCATE granted to both `anon` and `authenticated`, all with RLS enabled. Policy groups:
- SELECT-only public content/catalogue: `arena_question_options`, `arena_questions`, `bible_books`, `bible_chapters`, `bible_translation_verses`, `bible_translations`, `bible_verses`, `bible_versions`, `devotion_scriptures`, `devotions`, `languages`, `reading_plan_days`, `reading_plan_readings`, `reading_plans`, `topic_scriptures`, `topics`.
- Own-row user data: `bookmarks`, `devotion_completions`, `highlights`, `prayer_entries`, `profiles`, `reading_history`, `user_notes`, `user_reading_plan_days`, `user_reading_plans`.
- Special: `arena_attempts` has INSERT/SELECT policies; `bible_import_batches` has an authenticated ALL policy.

Next: snapshot ACLs, map frontend table and RPC usage, design least-privilege role grants (including removing client TRUNCATE), test in staging with positive/negative tests, and only then seek approval for production changes. Do not perform blanket revokes. Production remains read-only.

## English USFM import checkpoint — 2026-11-27

- Added an offline USFM parser, tests, and standard 66-book USFM code map on GitHub main: scripts/parse-usfm-corpus.mjs, scripts/parse-usfm-corpus.test.ts, scripts/usfm-book-code-map.json.
- Parser rejects verse bridges/suffixes rather than guessing; source-specific versification exceptions require explicit review.
- Direct official ASV/BSB archive downloads failed in the connected execution environment. No Bible text has been staged or imported; no new production version rows were created.
- Read-only production recheck: only KJV and WEB are active/rights-verified English versions; public roles retain SELECT and lack INSERT/UPDATE/DELETE/TRUNCATE on the five reviewed Bible read tables.
- Next step: obtain official archives locally, run parser and validator with a read-only canonical chapter map, review exact counts/exceptions, run full tests, and prepare a dry-run import. Do not write production data or activate a new edition without explicit owner approval.

## CI result update — 2026-11-27

- GitHub Actions run 45930762789 for commit a7c72d598333bee820dff375e549978bf11a0190 completed successfully: API type-check, web/API tests (including USFM parser tests), and app build passed.
- This verifies the parser's automated test cases, not parsing of the full ASV/BSB corpus.
- Official BSB v5.24 standard USFM release metadata is verified; archive bytes remain unavailable in this execution environment.
- Next remains: obtain and validate the actual source archive, then prepare a dry-run import only.

## Public-domain English import state — 2026-11-27

- Official ASV 1901 and BSB v5.24 archives have been acquired in CI, checksum-verified, parsed, and mapped to live canonical chapter IDs.
- Both prepared corpora: 66 books, 1,189 chapters, 31,086 verse rows; unique keys and non-empty text verified.
- ASV source has 16 empty verse markers recorded separately; BSB whole-verse red-letter flags are preserved where explicit.
- Import script and approval-gated workflow are in the repo. Marker approved=false; production has not been changed.
- Prepared artifact run 45931638883 expires 2026-12-04.
- Next: wait for explicit owner approval to set marker approved=true; then run the guarded workflow and verify version rows, verse counts, active state, and Reader smoke tests.


## Current production English Bible state — 2026-11-27

The live Supabase English catalogue now has five active, rights-verified versions:

- KJV — 31,102 verses
- WEB — 31,098 verses
- ASV — 31,086 verses
- BSB — 31,086 verses
- YLT (Young's Literal Translation, revised 1898) — 31,102 verses

YLT was imported only after explicit owner approval. Production workflow run 45943207768 completed successfully. Its exact verse count was verified before activation. Genesis 1:1 and John 3:16 were read back from production and checked.

The YLT corpus is stored directly in `bible_verses` against its `bible_versions.id`; it has no matching `bible_translations` row. The Reader service must therefore query `bible_verses.version_id` using the selected version ID first, then fall back to `bible_translation_verses.translation_id` for legacy translation-backed versions. A regression test for this path was added in commit 6f1a8ccf35222108c980e0444ffba0c54c5d26de. Verify CI and the production Reader smoke test before considering this integration complete.

The earlier dated audit checkpoints in this file describe the state at the time they were written; this section is the current production snapshot. Keep all existing Bible versions unchanged when adding future editions. Copyrighted editions (TPT, AMP/AMPC, GNT, MSG, NLT, NIV) still require the appropriate written permissions or authorized provider agreements before full-text distribution.


## YLT Reader integration verification — 2026-11-27

- Reader fix commits: `b23726de4fabb1b2b1ae87fa816d6c55ea402342`, `2ccb19aed4d66c2297955a7b9f393786a8adf38c`, and `6f1a8ccf35222108c980e0444ffba0c54c5d26de`.
- Reader verification run 45943448033 passed; main CI run 45943447994 passed.
- Vercel status for code commit 6f1a8ccf35222108c980e0444ffba0c54c5d26de is success (deployment completed).
- Reader uses the selected version row ID for direct `bible_verses.version_id` reads, and keeps the optional legacy `bible_translations.id` as fallback for translation-backed corpora.
- Final manual browser smoke test remains: open the live Reader, refresh, select English → YLT, and verify Genesis 1:1 and John 3:16. Do not mark the user-facing smoke test complete until confirmed.
