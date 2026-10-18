# Bible Arena — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Living product definition  
**Product:** Bible Arena  
**Type:** Multilingual Bible reading, study, devotional, audio, learning, and AI-assisted Scripture platform

## 1. Product vision

Bible Arena is a multilingual Bible application designed to help people read, understand, study, listen to, search, and engage with Scripture. Local-language access is a core requirement, not an optional add-on. Idoma is the first major local-language priority.

The intended journey is:

`READ → UNDERSTAND → STUDY → LISTEN → SEARCH → ASK → REFLECT → GROW`

## 2. Problems to solve

Bible Arena addresses several problems:

- difficult passages can be hard for new readers to understand;
- Bible reading, study tools, devotionals, notes, audio, search, challenges, and AI assistance are often split across products;
- many users need Scripture experiences in languages they understand best;
- local languages such as Idoma have less digital speech support than major world languages;
- AI explanation must never be confused with actual Scripture;
- Bible text and audio require legitimate licensing and content rights.

## 3. Target users

Bible Arena is intended for beginner Bible readers, Bible students, church members, multilingual users, and people who want a structured Bible-learning experience.

Planned language coverage includes English, Idoma, Igbo, Yoruba, Hausa, Tiv, Igala, Efik/Calabar/Cross River coverage, and future languages.

## 4. Core product principles

### Scripture first

Bible text must remain clearly separated from AI explanations, study notes, commentary, and generated content.

### Accuracy first

The system must not invent Bible verses or references or present uncertain information as certain.

### Language accessibility

Local-language written Scripture and local-language voice/audio are core parts of the product. Showing a language name in a selector is not enough; actual authorized content and tested language support are required.

### Simple experience

The interface should be calm, clear, mobile-friendly, and approachable for both experienced and beginner users.

### Scalable architecture

Bible data, languages, users, AI, audio, devotionals, notes, bookmarks, challenges, and progress should remain modular so the product can grow without a full rebuild.

## 5. Main features

### Home dashboard

Welcome content, today's Scripture, devotion, continue-reading state, progress, quick actions, bookmarks, notes, streaks, and recommendations.

### Bible reader

Book/chapter/verse navigation, Bible version and language selection, readable verse display, font controls, dark mode, highlighting, bookmarks, notes, sharing, and Scripture audio where authorized.

### Bible version and language system

A Bible language and a Bible translation/version are different concepts. One language can have multiple translations. The data model and UI must preserve that distinction.

### Bible book guide

Book background, authorship/traditional authorship, historical context, audience, purpose, themes, summary, key chapters/verses, and related books.

### Verse study

Verified Scripture text plus clearly separated explanation, context, key words, speaker/audience information, historical setting, main message, application, related Scripture, topics, and AI assistance.

### Topic explorer

Allow users to search by themes and meaning and discover relevant topics, verified Scriptures, and studies.

### Daily devotion

Title, Scripture, message, explanation, reflection, prayer, related verses, audio where appropriate, completion tracking, saving, and history.

### Personal notes, bookmarks, and highlights

Private notes connected to Scripture/study content, saved verses/chapters/topics/devotions, and user-controlled highlight categories.

### Audio Bible and local-language voice

Support authorized human audio and appropriate text-to-speech, with playback controls. Local-language voice interaction is part of the Bible Arena mission. Idoma speech recognition is the first deployment target.

### AI Bible assistant

Support text and voice questions, Scripture explanation, topic discovery, and study assistance. AI-generated explanation must be visually and logically separated from verified Scripture text.

### Bible Arena challenges

Quizzes, challenges, scores, achievements, levels, and future leaderboards/multiplayer experiences.

### Progress and reading plans

Reading/study/devotion/challenge history, streaks, chapters/books completed, study time, scores, and structured reading plans.

### Prayer journal, profile, and settings

Private prayer tracking, user preferences, language/version choices, progress, privacy, theme, font, audio, and notification settings.

## 6. Technical requirements

- Responsive React/TypeScript frontend.
- Supabase/PostgreSQL-backed application data.
- Secure authentication and user-data access controls.
- Modular service architecture for Bible data, AI, audio, and future integrations.
- Environment variables for secrets; no private API keys in browser source.
- Server-side proxying for protected third-party services.
- GPU-backed speech inference can run separately from the normal web frontend.

## 7. Idoma requirements

The target Idoma experience should eventually allow a user to:

- read legitimately licensed Idoma Scripture;
- speak naturally in Idoma;
- receive an accurately measured transcription;
- use that transcription in Bible-related interactions;
- listen to authorized Idoma Scripture audio where rights permit.

The current external ASR baseline is Meta OmniASR. Its real Bible Arena Idoma accuracy must be benchmarked with genuine Idoma speech before production-quality claims are made.

## 8. Content and licensing requirements

Bible Arena must not scrape copyrighted Bible translations or audio merely because they are publicly viewable. API access, redistribution rights, audio rights, and ML-training rights are separate questions and must be handled explicitly.

## 9. Security requirements

- Protect user data and private notes.
- Protect API keys and cloud credentials.
- Use database access controls such as Supabase RLS where appropriate.
- Never expose Runpod or other private service keys in frontend code.
- Give third-party integrations only the permissions they require.

## 10. Product truth rule

Documentation and UI must distinguish implemented infrastructure from real available content. For example, listing Idoma in the catalogue does not mean Idoma Scripture has been licensed/imported, and deploying an ASR model does not prove production accuracy until it has been tested.
