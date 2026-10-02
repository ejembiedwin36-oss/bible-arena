# Bible Arena — Technical Architecture Design (TAD)

**Version:** 1.2  
**Status:** Active design

## 1. Architecture goals

Bible Arena is designed as a modular multilingual Bible platform. The architecture must allow Bible content, language capabilities, voice providers, AI services, and user features to evolve independently.

Primary goals:

- Scripture-first data integrity.
- English baseline with Idoma immediately after English.
- Language capabilities tracked independently.
- Provider-neutral voice architecture.
- Secure user data and private notes.
- Supabase/Postgres as the core application data layer.
- Replaceable external AI/audio providers.
- No hard-coded claim that a language is supported when its capability has not been validated.

## 2. High-level system

```text
Browser / PWA
    |
    v
Application API / Supabase Edge Functions
    |
    +---- PostgreSQL / Supabase
    |       +-- languages
    |       +-- language_capabilities
    |       +-- bible_versions
    |       +-- bible_books
    |       +-- bible_chapters
    |       +-- bible_verses
    |       +-- users/preferences
    |       +-- notes/bookmarks/highlights
    |       +-- progress
    |
    +---- Voice provider gateway
    |       +-- ASR
    |       +-- language understanding
    |       +-- TTS/audio
    |
    +---- AI Bible service
    |
    +---- Storage
            +-- private user audio
            +-- approved Bible/audio assets
```

## 3. Scripture data model

Canonical structure:

```text
Bible Version
   |
   +-- Language
   |
   +-- Book
        |
        +-- Chapter
             |
             +-- Verse
```

A verse must have stable canonical identity independent of its translation text. Translation/version records must contain source and licensing metadata.

## 4. Language architecture

Each language is represented independently from Bible translations.

Capabilities:

- bible_text
- interface
- text_search
- speech_recognition
- language_understanding
- intent_routing
- response_generation
- speech_synthesis
- bible_audio

Initial priority:

```text
1. English
2. Idoma
3. Igbo
4. Yoruba
5. Hausa
6. Tiv
7. Igala
8. Efik / Cross River coverage
9. Additional validated languages
```

A language may have some capabilities available and others unavailable. The UI must read capability state rather than infer it from the language name.

## 5. Reader architecture

The Reader should be data-driven:

```text
Language + Version
        |
        v
Book selector
        |
        v
Chapter selector
        |
        v
Verse query
        |
        v
Reader renderer
```

The Reader must not embed a complete Bible translation directly in React components. Development seed data is allowed only for tests/prototyping and must be clearly separated from production content.

## 6. Voice architecture

Voice is provider-neutral:

```text
Audio input
   |
   v
Voice Gateway
   |
   +--> ASR provider
   |
   v
Normalized transcript
   |
   v
Language understanding
   |
   v
Intent/action router
   |
   +--> Reader
   +--> Search
   +--> Study
   |
   v
Response text
   |
   v
TTS/audio provider
```

The first deep voice language is Idoma. The implementation must remain reusable for other languages.

## 7. Security

- Browser clients must not receive provider secrets.
- Edge Functions validate authenticated users.
- Private voice recordings are scoped to the owning user.
- RLS protects user-owned data.
- Service-role credentials remain server-side.
- External provider tokens are stored as secrets.

## 8. Data import

Bible imports must be repeatable and validated before production use.

Validation includes:

- book count/order
- chapter structure
- verse structure
- duplicates
- missing records
- empty text
- translation/version identity
- source/license metadata

## 9. Deployment

Frontend:
- Vite/React application.
- Production deployment independent of Supabase database.

Backend:
- Supabase PostgreSQL.
- Supabase Edge Functions.

GPU voice services:
- External GPU inference host.
- Containerized ASR/TTS services.
- Private HTTPS endpoints.

## 10. Phase boundary

The implementation must not proceed to advanced AI/voice features simply because their UI exists.

The current priority is to finish the Bible Reader foundation and canonical Scripture data path first.
