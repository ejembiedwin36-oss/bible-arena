# Bible Arena — Beginner Project Guide, Build Story, Challenges & Learning Notes

> **Living document:** This file is intentionally updated while Bible Arena is being built. It is not the final documentation yet. At project completion it should explain the product, architecture, every important file, major decisions, challenges, questions/answers, confusing moments, deployment, testing, and how a beginner can understand and continue the project.

## 1. What Bible Arena Is

Bible Arena is a multilingual Bible reading, Bible study, devotional, learning, challenge, audio, and AI-assisted Scripture web application. Its central mission is to reduce language barriers so people can read, study, search, listen to, and interact with Scripture in languages they understand.

The working product name is **Bible Arena** and can be changed later without rebuilding the application.

Bible Arena is not intended to be only an English Bible reader. Local-language text and local-language voice are core product requirements. **Idoma is the first major local-language priority.** Planned language coverage includes English, Idoma, Igbo, Yoruba, Hausa, Tiv, Igala, and Efik/Calabar/Cross River coverage.

## 2. Problems Bible Arena Is Trying to Solve

1. Language barriers can make Bible reading and study harder for people who understand local languages better than English.
2. Bible reading, study tools, devotionals, audio, challenges, notes, search, and AI assistance are often separated across different products.
3. Many local languages have much less speech-recognition and digital-language support than major world languages.
4. Users should be able to ask Bible-related questions without AI-generated wording being confused with the actual biblical text.
5. Bible translations and audio are copyrighted/licensed resources, so a serious Bible product must obtain legitimate access rather than scrape copyrighted material.

## 3. Main Product Vision

Bible Arena should eventually support normal Bible reading, multiple versions and languages, Bible/topic search, related Scripture, verse study, book backgrounds, bookmarks, notes, devotionals, Scripture audio, Scripture-grounded AI assistance, challenges, progress tracking, and local-language text and speech.

A key architectural rule is that **Bible language and Bible version are different concepts**. A language such as Idoma may have one or more translations/versions. The database and user interface should not confuse those concepts.

## 4. Current Technology Direction

The project uses React, TypeScript and Vite for the web frontend, Supabase/PostgreSQL for database infrastructure, Vercel for web deployment/API functions, and GitHub for source control. The architecture is modular so features can be expanded without rebuilding the whole application.

For voice work, Bible Arena has an Idoma ASR (automatic speech recognition) track. ASR means converting spoken audio into written text.

The current external baseline is Meta OmniASR. The first model selected for deployment/testing is `omniASR_CTC_300M_v2`. Idoma's external ISO 639-3 language code is `idu`. An earlier internal application language code is `id`; these must not be confused because standard ISO `id` normally refers to Indonesian.

## 5. Idoma: Why It Matters

The requirement is not merely to display the word "Idoma" in a language menu. A strong Idoma experience should eventually allow a user to read authorized Idoma Scripture, speak naturally in Idoma, have the application recognize the speech accurately, receive useful Bible-related results, and hear appropriate Idoma audio where rights and technology permit.

Text and voice should remain together in the Bible Arena experience rather than treating voice as an unrelated side project.

## 6. Written Bible Status

**English KJV is currently the actual Scripture translation loaded in Bible Arena.** Several languages are represented in the application's language catalogue, but a language entry is not the same thing as an imported Bible translation.

Idoma is represented in the catalogue/database work, but the complete Idoma Bible text is **not** loaded.

The target written translation discovered during research is **Ubáyíbu kú Idɔma / Idoma Common Language Bible (IFBCL)**. The project has deliberately avoided scraping copyrighted Bible text. A YouVersion Platform application route was investigated, but its application required commitments around non-commercial/free/no-paywall/no-ad use that the project owner was not ready to accept. Therefore that route was paused rather than accepting terms without understanding their consequences.

**Lesson:** Technical access is not the same as legal permission. A production Bible application needs both.

## 7. Idoma Voice / Speech Recognition Journey

The project initially prepared infrastructure for collecting and reviewing its own Idoma speech data. A dedicated Hugging Face Idoma model, `mrheartng/wav2vec2-xls-r-1b-finetuned-idoma`, was discovered, but access was gated. Rather than allowing that dependency to block progress, the project selected Meta OmniASR as the initial open baseline.

Important limitation: the selected CTC model is not magically forced to understand Idoma just because the application knows the language code. Its real accuracy must be measured with genuine Idoma speech.

The current Idoma ASR service normalizes browser audio to mono 16 kHz and sends it through OmniASR. The integration code remains prepared for a GPU-hosted worker, but live hosting is deliberately postponed while a suitable affordable/free deployment route is found.

Prepared high-level path:

`User microphone -> Bible Arena frontend -> Vercel secure proxy -> GPU Idoma ASR worker -> OmniASR -> transcript -> Bible Arena`

Voice remains a core Bible Arena requirement. **Only the hosting/deployment step is postponed; the feature itself has not been dropped.**

## 8. Jesus Film Idoma Resource Lead

The JESUS film has an Idoma (`idu`) language resource. This is a useful research lead because genuine native Idoma biblical speech could help evaluate speech recognition. However, existence does **not** grant Bible Arena permission to download, redistribute, or train a machine-learning model on copyrighted film audio.

The project must verify transcript availability and obtain appropriate permission/licensing before incorporating copyrighted audio/transcripts into Bible Arena or a training dataset.

## 9. Voice Hosting Journey — Runpod and Hugging Face

The project owner connected Runpod to GitHub and limited repository access to Bible Arena rather than granting unnecessary access to every repository.

Runpod initially could not discover the Dockerfile because it was inside `ml/idoma-asr/service/`. A root Dockerfile was added. The service originally used FastAPI/Uvicorn as a normal web service, while Runpod Serverless needs a worker handler/start mechanism, so `handler.py` and the Runpod SDK dependency were added and the container command was changed to launch the worker.

The Runpod endpoint configuration was completed through the worker/GPU settings, including a conservative zero-active/one-maximum-worker configuration. Deployment was deliberately not activated because the account had no credits, no payment method, and the required compute was paid. **No Runpod endpoint is live and no Runpod charge was incurred.**

A Hugging Face Spaces route was also investigated as a possible free alternative. The required Gradio/Docker compute path shown for the account required a paid plan, so no paid Space was created.

**Decision:** postpone ASR hosting rather than pay simply to keep moving. Keep the tested integration code ready in GitHub and continue building the rest of Bible Arena. This is a hosting pause, not removal of Idoma voice from the product.

## 10. Bible Reading and Study Flow

Bible Arena now has a connected study path rather than isolated pages.

`Bible Reader -> Verse Study <-> Topic Study / Related Scripture -> Chapter context`

Saved Scripture is also connected back into study:

`Bookmarks / verse-linked Notes -> exact Verse Study -> context/topics/related Scripture -> chapter`

The active Bible Reader can select a verse and open its exact Verse Study page. Topic Study references can open exact Verse Study. Verse Study can work with bookmarks and personal verse notes. A verse note can be created, updated, loaded again, or deleted. Bookmarks and verse-linked notes provide both **Study verse** and **Read chapter** navigation so the user does not lose the wider Scripture context.

General personal notes that are not attached to a verse remain general notes and are not given a fake Scripture link.

The application also now has active routes for Daily Devotion and the starter Bible Arena Challenge. `/devotion` renders `DailyDevotion`, and `/arena` renders `BibleArenaChallenge`; these are no longer placeholder routes.

## 11. Important Challenges and Lessons

### Learning while building

The project owner is learning programming while building a substantial product. Instructions should therefore explain what a component does and why, not merely provide code or dashboard clicks.

### Deployment terminology

Terms such as Serverless, Endpoint, Queue, Dockerfile, GPU and worker caused confusion. A repository is stored source code; a Dockerfile is the recipe for the runtime environment; a GPU runs the speech model efficiently; a worker processes a job; a queue holds jobs until a worker is ready; and an endpoint is the API address used to send work.

### External dependencies

The gated Idoma model and paid hosting options show why one outside service should not block all development. The project kept the open ASR baseline/integration ready while continuing Scripture-study development.

### Copyright and licensing

Finding Scripture or biblical audio online does not grant reuse rights. Discovery, API access, redistribution rights and ML-training rights are separate questions.

### Security boundary

The Runpod API key must never be placed in React/browser code. A Vercel server-side proxy was therefore added between the browser and Runpod. The browser knows only Bible Arena's `/api/voice/idoma/transcribe` route; the server holds provider credentials.

### Provider limits affect application design

The browser and proxy use a **4 MB audio limit** below the hosting request-body ceiling. This is an example of infrastructure limits becoming part of application validation rather than being treated as an afterthought.

### Avoiding unsafe database guesses

A later audit found two Bible-data patterns in the repository. The active `App.tsx` reader expects verse text/version data directly through `bible_verses`, while a newer service architecture uses structural verses plus `bible_translation_verses`. The repository's `supabase/migrations` directory currently contains documentation but no committed SQL schema migrations, and live Supabase schema inspection was temporarily unavailable because the connection repeatedly timed out.

**Decision:** protect the working active reader and do not perform a speculative schema rewrite. Verify the real Supabase schema before consolidating the two models.

### Safe fallback content

Daily Devotion must not invent Scripture or pretend that unpublished devotional content is verified. The feature therefore has explicit not-published/unavailable states. This lets development continue without filling database gaps with made-up content.

## 12. Questions and Decisions That Shaped the Product

**Should local-language voice be optional?** No. Idoma text and voice are core to Bible Arena.

**Should YouVersion's restrictions be accepted simply to get an API key?** No decision was forced. The route was paused because the owner was not ready to commit to the required product restrictions.

**Should a Runpod API key be put in frontend code to make integration easier?** No. Secrets belong on the server.

**Should development stop because paid ASR hosting is postponed?** No. Work that does not require a live GPU endpoint continues safely in GitHub.

**Can mocked tests prove that OmniASR understands real Idoma speech well?** No. They can prove Bible Arena handles the provider contract correctly, but real Idoma recordings are required to measure speech-recognition quality.

**Should the newer Bible data model automatically replace the active reader?** No. The active route must be protected until the real Supabase schema proves which model is authoritative.

**Should Daily Devotion invent content when no verified devotion exists?** No. It should show a clear fallback and keep verified Scripture/content separate from placeholders.

## 13. File-by-File Learning Notes

### `/src/App.tsx`

This is currently the main application shell and active router. The production `/bible/:bookKey/:chapterNumber` route uses the `BibleReader` function defined inside this file. The file also routes `/devotion` to `DailyDevotion` and `/arena` to `BibleArenaChallenge`. Bookmarks and verse-linked notes navigate to exact Verse Study while preserving a separate Read chapter action.

### `/src/features/VerseStudy.tsx`

The focused verse-study experience. It loads the selected verse and study context, connects to related/topic study, supports bookmarking, and manages a user's verse-linked note. Existing notes are loaded and updated instead of blindly creating duplicates; the user can also delete the verse note and open the full notes list.

### `/src/features/TopicSearch.tsx`

Contains topic discovery/study behavior. Scripture references in Topic Study can open the exact Verse Study route, while chapter navigation remains available for context.

### `/src/features/DailyDevotion.tsx`

The active Daily Devotion page. It uses the user's local calendar date, attempts to load verified devotion content and linked Scripture, supports completion state, and keeps raw database errors away from the user. If no verified devotion is published, it gives a safe fallback instead of inventing Scripture.

### `/src/features/BibleArenaChallenge.tsx`

The active starter challenge experience. It displays multiple-choice questions, checks answers, tracks score, shows feedback, links the user back to the relevant Bible chapter, displays a result, and supports restarting.

### `/src/data/starterChallenge.ts`

Keeps the starter challenge question data separate from the challenge UI. This makes the content easier to review and test independently from presentation logic.

### `/src/features/BibleReader.tsx`, `/src/features/BibleReaderData.ts`, `/src/lib/bibleData.ts`

These form another reader-related layer in the repository. They are **not currently the component used by the active `/bible/:bookKey/:chapterNumber` route**. They should not be deleted or promoted blindly until the Bible data-model consolidation is resolved.

### `/src/services/bibleReader.ts`

Represents the newer translation-oriented Bible data model, using `bible_translation_verses` for translated verse text. This differs from the active `App.tsx` reader's assumptions and is one reason the real Supabase schema must be verified before refactoring.

### `/Dockerfile`

The repository-root build recipe prepared for the ASR worker.

### `/ml/idoma-asr/service/app.py`

Core Idoma ASR inference logic. It validates and normalizes audio, loads OmniASR, transcribes the normalized WAV, and returns safe results/errors.

### `/ml/idoma-asr/service/handler.py`

The prepared Runpod Serverless entry point. It receives base64 audio, decodes it, reuses the normalization/transcription functions, and returns the transcript.

### `/api/voice/idoma/transcribe.ts`

Bible Arena's secure server-side bridge prepared between the web app and Runpod. It validates requests, keeps provider credentials server-side, submits/polls a provider job, and returns controlled results/errors.

### `/api/voice/idoma/transcribe.test.ts`

Tests the proxy contract without requiring paid GPU hosting. It covers request validation, provider submission/polling, successful transcript handling, provider failures, cancelled jobs, blank transcripts and timeout behavior.

### `/src/services/idomaAsr.ts`

Browser-side service that sends recorded audio to Bible Arena's own `/api/voice/idoma/transcribe` endpoint. It contains no Runpod secret.

### `/src/services/idomaRecorder.ts`

Browser microphone wrapper that captures supported audio and releases microphone resources safely.

### `/src/components/IdomaVoiceInput.tsx`

Visible Idoma microphone interface with recording status, a 30-second recording limit, processing feedback and safe microphone cleanup.

### `/src/services/bibleCatalogue.ts`

Loads available languages, Bible versions/translations and Bible books from Supabase. Seeing Idoma in the catalogue does not prove that licensed Idoma verses have been loaded. English KJV is currently the actual loaded Scripture translation.

### `/supabase/migrations/`

The repository currently does not contain the actual SQL migration history needed to reconstruct the live Bible schema. This is an important project-maintenance gap to address after the live schema can be inspected safely.

### `/tsconfig.api.json`

Strict TypeScript configuration for production server/API source. Test files are excluded from this particular Node/Vercel type-check because Vitest handles them separately.

### `/.github/workflows/ci.yml`

GitHub's automated quality gate. It checks Python script syntax, installs Node dependencies, type-checks the server-side API, runs tests, and builds the production application.

### `/vercel.json`

Controls Vercel routing. The SPA rewrite preserves `/api/...` requests for server functions rather than incorrectly rewriting them to React's `index.html`.

## 14. Important Security Rules

- Never put private API tokens in frontend/browser source code.
- Never paste passwords, card details, or secret tokens into chat or source code.
- Give third-party services only the repository permissions they actually need.
- Use Supabase RLS where appropriate.
- Keep copyrighted Scripture/audio rights separate from technical capability.
- Keep provider credentials only in server-side environment variables.
- Reject bad requests before they can unnecessarily consume paid GPU resources.

## 15. Follow User Actions Through the System

### Study a saved verse

1. The user reads a chapter in the active Bible Reader.
2. The user selects or bookmarks a verse.
3. Selecting **Study verse** opens `/explore/verse/:verseId` for that exact verse.
4. Verse Study provides focused study/context and related/topic Scripture connections.
5. The user can save a bookmark or create/update/delete a verse-linked personal note.
6. Bookmarks and My Notes can return to the same exact Verse Study page later.
7. **Read chapter** returns the user to the wider chapter context.

### Open Daily Devotion

1. The user opens `/devotion`.
2. `App.tsx` renders `DailyDevotion`.
3. The feature calculates the user's local date and attempts to load that day's verified devotion.
4. If linked Scripture exists, the user can study the exact verse or read its chapter.
5. A signed-in user can mark the devotion complete when the database path is available.
6. If verified content is missing or the database path is unavailable, the page shows a safe fallback rather than fabricating content.

### Play the starter Bible Arena Challenge

1. The user opens `/arena`.
2. `App.tsx` renders `BibleArenaChallenge`.
3. Questions come from the separated starter challenge data.
4. The user chooses one answer, receives correct/wrong feedback and can open the referenced Bible chapter.
5. The challenge advances through its questions, shows the final score and can be restarted.

### Speak Idoma (prepared flow; live hosting postponed)

1. The user presses the microphone button.
2. `IdomaVoiceInput.tsx` controls recording status and the 30-second limit.
3. `idomaRecorder.ts` captures microphone audio.
4. `idomaAsr.ts` validates the recording and sends raw audio to Bible Arena's own API route.
5. `/api/voice/idoma/transcribe.ts` validates the request and would securely authenticate to the GPU provider.
6. The prepared worker would run OmniASR and return a transcript.

The browser/proxy/provider contract has test coverage. A real deployed worker and genuine Idoma audio still require end-to-end verification.

## 16. What Has Been Verified So Far

GitHub CI has successfully completed after the study-flow changes. The active application routes connect Bible reading, exact Verse Study, Topic Study, Bookmarks and verse-linked Notes.

Daily Devotion and the starter Bible Arena Challenge have now also been wired into the active application routes. The integrated build was verified through Vercel before promotion, and Vercel subsequently reported the exact integration build on `main` as successfully deployed.

The Daily Devotion fallback behavior and starter challenge data have automated test coverage. This does not prove the unverified Supabase devotion tables exist; it proves the application behavior and content contracts covered by those tests.

The secure ASR provider integration has mocked automated coverage, but this does **not** prove a real GPU endpoint, model startup, network path or Idoma recognition accuracy.

The repository audit established that the active Bible route uses the `BibleReader` inside `App.tsx`, while separate reader/service files represent additional/partly newer architecture. This distinction is documented so future refactoring does not accidentally replace the working route without evidence.

## 17. What Is Still Unfinished

- A read-only schema-only snapshot of the live Supabase `public` schema has now been exported and its first object counts inspected; the deeper schema/dependency audit and reconciliation remain in progress.
- The `daily_devotions` and `devotion_completions` schema/content path still needs live verification; Daily Devotion may show its safe fallback until that is confirmed.
- The duplicate/competing Bible reader data models should be consolidated only after the schema audit.
- SQL migrations/schema history should eventually be committed so the database structure is reproducible.
- Live GPU/serverless Idoma ASR hosting is postponed; no Runpod endpoint is live.
- End-to-end production Idoma voice transcription has not yet been proven.
- Real Idoma accuracy has not yet been benchmarked by Bible Arena with a representative test set.
- The complete authorized Idoma Bible text is not yet loaded.
- Jesus Film Idoma reuse/training permission has not been obtained.
- The gated dedicated Idoma Hugging Face model is not a production dependency.
- The Vercel voice proxy still needs deployment-level verification against a real GPU endpoint when hosting becomes available.
- Ask AI and parts of Profile/progress remain future work.
- Daily Devotion and Arena are now active modules; they should no longer be described as placeholder/future routes.

These are explicit milestones, not hidden failures.

## 18. Documentation Rule From Now On

As Bible Arena continues, this guide should record what we were trying to accomplish, why an approach was chosen, important owner decisions, confusing points, challenges and fixes, files changed, warnings/errors, security/licensing decisions, tests actually performed, and unfinished work.

The final version should be understandable to a beginner who did not participate in the build and detailed enough for the project owner to explain Bible Arena confidently and continue working on it.

---

**Next documentation update:** record the successful live Supabase schema audit and any resulting safe Bible-data consolidation. Also record live Daily Devotion database verification when it occurs. Voice-hosting documentation should be updated when a suitable deployment route is actually activated and the first genuine Idoma transcription is tested; do not record either as successful before it happens.


## 19. November 19, 2026 — Docker and the safe Supabase schema snapshot

### What Docker does in this task

The Supabase CLI can ask PostgreSQL tools packaged in a Docker image to create a database schema dump. There are two separate pieces:

- **Docker CLI:** the `docker` command installed on Windows. It lets PowerShell send instructions to Docker.
- **Docker Engine:** the background service that actually runs containers. The CLI can be installed while the Engine is stopped.
- **Docker Desktop:** the Windows application that starts and manages the Engine. In this session, opening Docker Desktop made the Linux/WSL2 Engine available.

The useful health check is `docker info`. A working result includes both **Client** and **Server** sections. Earlier, the Client section existed but the Server connection failed because the Docker Desktop Linux Engine pipe was missing. After Docker Desktop was opened, the Server section appeared and showed Docker Desktop running Linux.

### What a schema-only dump means

A database has both **structure** and **data**:

- Structure describes tables, columns, functions, indexes, policies, and other database objects.
- Data is the actual stored rows, such as Bible verses, user records, and other content.

The command used was:

```powershell
npx --yes supabase@latest db dump --remote --schema public --file "$HOME\\Desktop\\bible-arena-schema-audit\\public-schema.sql"
```

This created a **schema-only** SQL snapshot of the remote `public` schema. It did not export Bible verse rows, and it did not apply SQL changes to the live database. The output file was saved outside the repository so it would not be accidentally committed.

PowerShell verification:
- `Test-Path` returned `True`.
- File size was **93,729 bytes**.

### First inventory from the exported snapshot

The first inspection counted:

| Object | Count |
|---|---:|
| Tables | 34 |
| RLS policies | 64 |
| Functions | 15 |
| Indexes | 65 |

The first function search looked only for `CREATE FUNCTION` and returned zero. That was a search-pattern mistake: the dump declares these as `CREATE OR REPLACE FUNCTION`. Including that form found 15 functions. **A zero from a narrow text search is not proof that the database has zero functions.**

### What we found in GitHub migration history

The current `supabase/migrations` directory listing contains:
- `README.md`
- `20261025223416_maintenance_users.sql`

The SQL file documents the `maintenance_users` table, enables RLS, revokes direct access from public/anon/authenticated, and grants SELECT to `service_role`. Its comments mention an earlier production migration version `20261025223408`, but that earlier SQL file is not in the current directory listing.

The live production migration history was previously inspected as containing 38 records. One checked-in SQL file plus a schema snapshot does **not** reconstruct the original 38 migration steps. Never invent missing migration files from the final schema.

### Safe next step

Continue by comparing the exported `maintenance_users` definition and related grants/RLS with the tracked SQL file, then build a broader object/dependency inventory. Keep the dump local and read-only. Do not run it, `db pull`, `db push`, migration repair, reset, or schema-changing SQL during this recovery investigation.


## 20. November 19, 2026 — Comparing a tracked migration with production

We compared the checked-in migration `supabase/migrations/20261025223416_maintenance_users.sql` with the matching object in the schema-only production dump.

### What matched

The production table has:
- `user_id` as a UUID and the primary key.
- `created_at` as a timestamp with time zone, required and defaulting to `now()`.
- A foreign key from `user_id` to `auth.users(id)`, with `ON DELETE CASCADE`.
- Row Level Security (RLS) enabled.
- A `SELECT` grant for `service_role`, with no grants shown for `anon` or `authenticated`.

These findings match the resulting table structure and access configuration described by the tracked migration. The SQL dump represents the final permissions as a grant to `service_role`; it does not have to repeat the migration's original `REVOKE` statements word for word to show the resulting permissions.

### What this proves — and what it does not

This verifies one tracked migration against one production table. It does **not** reconstruct or reconcile all 38 production migration-history entries, and it does not prove every other table, function, policy, trigger, or dependency matches the repository.

The inspection was read-only. No production schema, data, or migration history was changed. Keep the dump outside Git.

### Next safe step

Continue collecting the exact 38 production migration version identifiers from verified history output and perform a wider read-only object/dependency comparison. Do not run migration repair, reset, `db pull`, `db push`, or schema-changing SQL as part of this audit.


## 21. November 19, 2026 — Reading the production migration history

We asked Supabase to list the migrations already recorded by the live `bible-arena` project. This is a read-only history lookup; it does not run any migration SQL.

**Verified count: 38 migration records.**

The exact version and name pairs returned by production are:

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

### Why this list matters

A migration record tells us that a migration version/name is recorded in the database's migration history. It is not the same thing as having that migration's original SQL file in GitHub.

The repository's `supabase/migrations` directory was previously inspected and showed only the README and `20261025223416_maintenance_users.sql`. So we must not pretend that all 38 original SQL files are present. We must also not invent the missing SQL by guessing what each migration might have done from its name or from the final schema.

### What we did not do

- We did not apply or repair a migration.
- We did not reset the database.
- We did not run `db pull` or `db push`.
- We did not change production schema, data, or migration history.

### Next safe step

Compare these 38 returned version/name pairs against the migration filenames actually tracked in GitHub, and inspect the migration README. Only after that evidence is collected should we discuss a safe baseline or forward-only plan. Any production migration-history changes require a separate explanation and explicit approval.
