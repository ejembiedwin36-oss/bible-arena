# Bible Arena — Product Requirements Document (PRD)

**Version:** 1.1  
**Status:** Active / Implementation Source of Truth

## 1. Product Vision

Bible Arena is a modern, premium, multilingual Bible reading and Bible-study platform designed to remove language barriers between people and Scripture.

The product must support both people who are comfortable reading and people who prefer listening or speaking. Language support is a first-class product capability, not a secondary translation feature.

## 2. Core Product Principle

**Text + Voice + Choice.**

A user must never be forced into one way of experiencing Scripture. Where a language capability is supported, Bible Arena should progressively support:

- Bible text in that language.
- Interface/UI in that language.
- Text search in that language.
- Voice input/speech recognition in that language.
- Natural-language understanding/intent in that language.
- Spoken responses/audio in that language.
- Bible audio/read-aloud in that language.
- User-controlled switching between text, voice, and audio.

Text remains a first-class experience. Voice and audio complement text; they do not replace it.

## 3. Primary Differentiator: Language Accessibility

Bible Arena is not intended to be merely another Bible app with a language dropdown. Its long-term differentiation is the ability for users to interact with Scripture and the application in languages they naturally understand.

For supported languages, the target experience is:

**User speaks → Bible Arena hears → understands intent → performs Bible action → displays text → can speak/read the result aloud.**

Example target experience for an Idoma user:

> User speaks an Idoma request equivalent to “Give me the book of Matthew.”
>
> Bible Arena recognizes the Idoma speech, understands the intent to open Matthew, opens Matthew in the selected Bible language, and can read/respond in Idoma.

The implementation must not require users to know English before they can use core Bible Arena functionality.

## 4. Language Rollout Priority

The initial language priority is:

1. **English** — reference/baseline implementation.
2. **Idoma** — first deep native-language implementation.
3. **Igbo**.
4. **Yoruba**.
5. **Hausa**.
6. **Tiv**.
7. **Igala**.
8. **Calabar / Cross River language coverage**, with the exact language(s) defined as reliable source and language support are established.

The architecture must allow additional languages to be added without rebuilding the Reader, search system, voice system, or study system.

## 5. Independent Language Preferences

Bible Arena must not assume that a user's Bible text, interface, voice input, and audio language are always the same.

Users should eventually be able to choose independently:

- **Bible text language/version**
- **Interface language**
- **Voice input language**
- **Response/audio language**

Example:

- Bible text: Idoma
- Interface: English
- Voice commands: Idoma
- Spoken response: Idoma

Another user may choose English Bible text while speaking commands in Idoma.

## 6. Idoma First-Class Requirement

Idoma is a priority language and must be treated as a complete product capability rather than only a translated text option.

The Idoma roadmap must cover:

- Idoma Bible text.
- Idoma UI/localization.
- Idoma text search.
- Idoma voice input.
- Idoma speech-to-text where reliable technology is available.
- Idoma natural-language intent understanding.
- Idoma Bible navigation by voice.
- Idoma spoken responses where reliable speech synthesis is available.
- Idoma Bible read-aloud/audio.

The architecture must explicitly separate these capabilities so partial support can be delivered honestly without pretending that a language is fully voice-enabled before its speech technology is validated.

## 7. Bible Reading

Users must be able to:

- Select a Bible language/version.
- Browse all supported books.
- Browse chapters and verses.
- Read complete chapters.
- Move quickly between chapters.
- Navigate between books.
- Search Scripture.
- Bookmark passages.
- Add personal notes/highlights where supported.
- Listen to supported Bible audio.
- Use voice navigation in supported languages.

The Reader must remain responsive under high concurrent usage through caching, request deduplication, prefetching, efficient PostgreSQL queries, and appropriate indexing.

## 8. Bible Study

Bible Arena is a Bible-study platform, not only a reader. Planned study capabilities include:

- Verse study.
- Related Scripture.
- Topic search.
- Book background/context.
- Cross references.
- Personal notes and highlights.
- Today's Devotion.
- Scripture listening.
- AI Bible assistant grounded in the Bible data and product rules.
- Bible Arena challenges and progress tracking.

Language-aware versions of these features should be supported as the relevant language capabilities mature.

## 9. Voice Interaction Architecture

Voice is a core architecture concern.

The system must separate:

1. **Speech recognition** — convert supported-language speech into usable text/intent input.
2. **Language understanding** — understand the user's request without requiring an exact command phrase.
3. **Intent/action routing** — map requests such as opening a book, chapter, verse, searching, reading, or studying to application actions.
4. **Response generation** — produce a Bible-grounded response in the selected response language.
5. **Speech synthesis/audio** — speak supported responses and Bible passages in the selected language.

The provider layer must be replaceable so Bible Arena is not permanently tied to one speech provider.

## 10. Natural Language Commands

Supported voice interaction should use intent understanding rather than rigid command matching.

Examples include requests equivalent to:

- “Open Matthew.”
- “Read Matthew chapter five.”
- “Take me to John 3:16.”
- “Find verses about forgiveness.”
- “Explain this verse.”
- “Read this chapter.”
- “Play this passage.”

These examples must eventually be localized naturally for each supported language.

## 11. Multilingual Data Model

Bible content must be modeled so multiple translations/languages can reference the same canonical Bible structure without being treated as duplicates.

Canonical structure:

**Book → Chapter → Verse**

Translation/version-specific data must include its own version/language identity while preserving canonical verse references.

The import pipeline must validate:

- 66 books.
- Correct book order.
- Expected chapter structure.
- Expected verse structure where authoritative counts are available.
- Missing records.
- Duplicate records.
- Orphan records.
- Empty verse text.
- Translation/version identity.
- Source and license metadata.

## 12. Bible Content Licensing

Every Bible translation imported into Bible Arena must have a documented source and redistribution/use basis appropriate to the intended product use.

No copyrighted Bible text may be added to the repository or production database without appropriate rights.

Red-letter/Jesus-word metadata must come from a trusted, documented source. AI must not be used to guess and permanently assign this metadata.

## 13. Scalability and Reliability

Bible Arena must be designed for thousands of simultaneous users.

The architecture should use:

- Efficient PostgreSQL indexes.
- Appropriate Row Level Security policies.
- Query optimization.
- Chapter caching.
- Request deduplication.
- Background chapter prefetching.
- Pagination where appropriate.
- Avoidance of unnecessary third-party requests on every Bible read.
- Stateless application services where practical.
- Observable errors and performance metrics.
- Safe, repeatable data imports.

Performance claims must be validated with realistic load tests before launch.

## 14. Ownership and Product Identity

Bible Arena is the product being built and owned through its own project infrastructure:

- GitHub repository: `ejembiedwin36-oss/bible-arena`
- Supabase project/database.
- Future production deployment.
- Future personal product domain.

External Bible sources or service providers are dependencies/content sources where applicable; they are not the identity of Bible Arena.

## 15. Product Success Criteria

Bible Arena should ultimately enable a person to use the Bible in a language they understand without requiring English knowledge for core interactions.

A major language milestone is achieved when a supported language can provide, at the appropriate maturity level:

**Read text + search + listen + speak to Bible Arena + understand natural requests + receive a response.**

Idoma is the first language after English for this deep implementation, while the underlying architecture must remain reusable for the remaining languages.
