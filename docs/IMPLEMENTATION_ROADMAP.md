# Bible Arena — Implementation Roadmap (IRM)

**Version:** 1.0  
**Status:** Living implementation plan

Bible Arena is built in phases so the foundation remains understandable and maintainable as features are added.

## Development order

`Foundation → User Experience → Bible Core → Study → Personal Features → AI → Audio/Voice → Multilingual Expansion → Advanced Features`

## Phase 1 — Project foundation

Set up the React/TypeScript frontend, Supabase connection, database foundation, project structure, environment configuration, security boundaries, and deployment structure.

**Deliverable:** working application shell and reliable development foundation.

## Phase 2 — UI system and navigation

Create typography, layout, reusable components, responsive navigation, and main page structure for Home, Bible, Explore, Devotion, Bible Arena, Notes, Bookmarks, AI, Progress, Profile, and Settings.

**Deliverable:** coherent desktop/mobile application experience.

## Phase 3 — Bible reader foundation

Build the book/chapter/verse experience, language selector, Bible-version selector, and Supabase catalogue integration. Keep language and Bible version as separate concepts.

**Deliverable:** working Bible-reading architecture using only content Bible Arena is permitted to distribute.

## Phase 4 — Bible study features

Build book guides, verse study, related Scripture, topic exploration, and verified-content boundaries.

**Deliverable:** Bible learning and study experience.

## Phase 5 — Personal user features

Build authentication, notes, bookmarks, highlights, profile, privacy controls, and user preferences.

**Deliverable:** personal Bible workspace.

## Phase 6 — Devotion and progress

Build daily devotion, history, completion tracking, reflection, reading/study progress, streaks, statistics, and reading plans.

**Deliverable:** structured daily engagement and progress experience.

## Phase 7 — Bible Arena learning

Build questions, categories, difficulty levels, scoring, achievements, and later leaderboard/multiplayer foundations.

**Deliverable:** interactive Bible-learning experience.

## Phase 8 — AI Bible assistant

Add Scripture-grounded explanation, question answering, topic discovery, and study assistance. Verified Scripture must remain separate from generated explanation.

**Deliverable:** useful AI assistance without presenting generated wording as Scripture.

## Phase 9 — Audio and local-language voice

Build Scripture audio architecture and local-language voice interaction. Idoma is the first ASR priority.

Current Idoma ASR path:

`Browser microphone → Bible Arena frontend → secure server-side proxy → Runpod Serverless → OmniASR → transcript → Bible Arena`

Current implementation work includes microphone recording, frontend ASR service code, OmniASR inference code, a Runpod handler, and Docker deployment files.

Remaining work includes completing the Runpod endpoint, implementing the protected web-app proxy, end-to-end testing, and measuring real Idoma accuracy.

## Phase 10 — Multilingual content expansion

Expand legitimately licensed Scripture/content support across Idoma, Igbo, Yoruba, Hausa, Tiv, Igala, Efik/Calabar/Cross River coverage, and future languages.

**Important:** a language catalogue entry is not equivalent to licensed Bible content.

## Phase 11 — Production hardening

Add stronger automated tests, monitoring, error handling, accessibility checks, performance work, deployment documentation, secret management, database policy review, and recovery procedures.

## Phase 12 — Advanced features

Potential future work includes offline experiences, community/sharing, multiplayer Bible Arena, richer audio, additional language technology, and sustainable product/business features compatible with content licences.

## Current priority

**Owner-directed priority (2026-11-22): English Bible edition expansion comes before further Idoma language work.**

1. Preserve the working KJV and WEB Reader experience.
2. Obtain and validate the official public-domain ASV 1901 and Berean Standard Bible source packages.
3. Normalize both editions into the reusable import format and verify the complete reference sets against the canonical 66-book / 1,189-chapter catalogue, accounting for edition-specific verse differences.
4. Prepare a production import plan that writes each edition under its own `bible_versions.id` in `bible_verses`, matching the active Reader path.
5. Pursue written app-distribution permissions for TPT, Amplified, and Good News Translation. Do not import their full texts until those rights are secured.
6. Add further English editions only after source, edition, canon, and redistribution rights are verified.

Idoma Bible text/interface expansion is deliberately paused during this English-version phase, as requested by the owner. Existing Idoma voice code remains in the repository; no paid GPU endpoint should be deployed without explicit approval.
