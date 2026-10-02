# Bible Arena — Implementation Roadmap (IRM)

**Version:** 1.2  
**Status:** Active implementation source of truth

## Rule: do not jump phases

Each phase must be verified before the next phase becomes implementation priority. A visible UI placeholder does not count as a completed feature.

## Phase 1 — Foundation and Bible Reader Core

### Objective
Establish the application foundation and a trustworthy Bible Reader before adding advanced study, AI, or voice capabilities.

### Current work
- [x] GitHub repository established.
- [x] React/Vite application structure established.
- [x] Initial responsive application shell.
- [x] Language registry with English first and Idoma second.
- [x] Bible Reader UI foundation.
- [x] Initial Scripture seed data for development.
- [x] Language capability model.
- [x] Supabase voice-inference gateway foundation.

### Remaining Phase 1 work
1. Establish canonical Bible data model.
2. Establish Bible version/translation model.
3. Establish book/chapter/verse catalogue.
4. Establish licensed/public-domain Bible import pipeline.
5. Connect Reader data to Supabase rather than hard-coded sample Scripture.
6. Implement complete book → chapter → verse navigation.
7. Implement version/language availability states from the language registry.
8. Add Reader persistence for the user's current location.
9. Add tests for navigation, data integrity, and language ordering.
10. Verify responsive Reader behaviour.

### Phase 1 acceptance criteria
- A user can open the Reader and select a Bible version.
- A user can select any available book and chapter from the connected dataset.
- Verses render from the database/imported source rather than a hard-coded demo chapter.
- English is first in the language selector and Idoma is second.
- Unsupported language capabilities are explicitly shown as unavailable/planned; no language is falsely represented as complete.
- Bible text is kept separate from AI/study content.
- Scripture source and licensing metadata are stored.
- Reader navigation has automated tests.

## Phase 2 — Personal Bible Workspace

Only after Phase 1 acceptance:
- Authentication.
- Notes.
- Bookmarks.
- Highlights.
- Reading position/history.
- User preferences.

## Phase 3 — Bible Study Core

Only after the Reader and personal workspace are stable:
- Book Guide.
- Verse Study.
- Related Scripture.
- Topic Explorer.
- Study metadata.

## Phase 4 — Language Content Expansion

Idoma is the first deep implementation after English.
- Idoma Bible text, subject to verified/licensed source.
- Idoma search.
- Idoma UI/localization.
- Capability maturity tracking.

Then reuse the same architecture for Igbo, Yoruba, Hausa, Tiv, Igala, Efik/Cross River coverage, and additional supported languages.

## Phase 5 — Voice: Hear and Understand

Only after the language data foundation is ready:
- Speech recognition provider abstraction.
- Idoma ASR benchmark.
- Idoma natural-language intent parsing.
- Voice Bible navigation.
- Search and study commands by voice.
- Reusable multilingual voice architecture.

## Phase 6 — Voice: Respond and Speak

- Response-language selection.
- Idoma TTS where reliable technology is validated.
- Bible read-aloud/audio.
- Reusable multilingual TTS/audio architecture.

## Phase 7 — AI Bible Assistant

- Bible-grounded retrieval.
- Explanation separated from Scripture.
- Source/reference enforcement.
- Multilingual understanding and response generation.

## Phase 8 — Bible Arena and Progress

- Challenges.
- Questions.
- Scoring.
- Achievements.
- Reading/study progress.

## Phase 9 — Production Hardening

- Security review.
- RLS review.
- Performance/load testing.
- Observability.
- Caching.
- Offline/PWA work.
- Domain and production deployment.

## Non-negotiable product requirement

For every language that Bible Arena supports, the long-term target is:

**text → search → hear → understand → respond → speak**

The exact capabilities available at launch may differ by language, but the architecture must never make English a hidden prerequisite for a supported language's core experience.
