# Bible Arena — Product Requirements Document (PRD)

**Version:** 1.2  
**Status:** Active / Implementation Source of Truth

## 1. Product Vision

Bible Arena is a modern, premium, multilingual Bible reading and Bible-study platform designed to remove language barriers between people and Scripture.

The product must support both people who are comfortable reading and people who prefer listening or speaking. Language support is a first-class product capability, not a secondary translation feature.

## 2. Core Product Principle

**Text + Voice + Choice.**

A user must never be forced into one way of experiencing Scripture. For every supported language where the required technology and content are available, Bible Arena should progressively support:

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

The language goal applies to **all languages that Bible Arena supports**, not only Idoma. Idoma is the first deep implementation priority after English, but every language added to the platform should use the same language-first architecture and should progress toward the same complete interaction model whenever reliable content and technology are available.

For a supported language, the target experience is:

**User speaks → Bible Arena hears → understands intent → performs Bible action → displays text → can speak/read the result aloud.**

The implementation must not require users to know English before they can use core Bible Arena functionality in a language that Bible Arena supports.

## 4. Language Capability Model

Each supported language is a language capability package. A language should be modeled independently across these capabilities:

1. **Bible text** — Scripture can be displayed in the language.
2. **Interface/localization** — application controls and UI can be presented in the language.
3. **Text search** — users can search Scripture using the language.
4. **Speech recognition** — Bible Arena can hear spoken input in the language where reliable speech-to-text technology is available.
5. **Language understanding** — Bible Arena can understand natural requests in the language.
6. **Intent/action routing** — requests can control Reader and study features.
7. **Response generation** — Bible-grounded responses can be produced in the language.
8. **Speech synthesis** — Bible Arena can speak responses in the language where reliable text-to-speech technology is available.
9. **Bible audio/read-aloud** — Scripture can be listened to in the language where suitable audio exists or can be produced lawfully and reliably.

A language does **not** need to have every capability on day one. The database and application must record capability maturity explicitly so the UI never claims a capability that has not been validated.

## 5. Language Rollout Priority

The initial language priority is:

1. **English** — reference/baseline implementation.
2. **Idoma** — first deep native-language implementation.
3. **Igbo**.
4. **Yoruba**.
5. **Hausa**.
6. **Tiv**.
7. **Igala**.
8. **Calabar / Cross River language coverage**, with exact languages defined as reliable content and language technology are established.
9. **Additional supported languages** — the architecture must allow any additional language for which suitable Bible content, localization, speech recognition, language understanding, and/or speech synthesis can be responsibly provided.

The list is a rollout priority, not a permanent limit. Bible Arena should support as many languages as can be supported reliably, legally, and sustainably.

The architecture must allow additional languages to be added without rebuilding the Reader, search system, voice system, or study system.

## 6. Idoma First Deep Implementation

Idoma is the first language after English for deep native-language implementation, but the underlying requirement is **not Idoma-only**.

The Idoma implementation is the first proving ground for a reusable multilingual system covering:

- Idoma Bible text.
- Idoma UI/localization.
- Idoma text search.
- Idoma voice input.
- Idoma speech-to-text where reliable technology is available.
- Idoma natural-language intent understanding.
- Idoma Bible navigation by voice.
- Idoma spoken responses where reliable speech synthesis is available.
- Idoma Bible read-aloud/audio.

Successful Idoma architecture must be reusable for Igbo, Yoruba, Hausa, Tiv, Igala, Calabar/Cross River languages, and other supported languages.

## 7. Independent Language Preferences

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

The same independent preference model must work for every supported language.

## 8. Bible Reading

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

## 9. Bible Study

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

## 10. Voice Interaction Architecture

Voice is a core architecture concern for **every supported language**, subject to validated technology availability.

The system must separate:

1. **Speech recognition** — convert supported-language speech into usable text/intent input.
2. **Language understanding** — understand the user's request without requiring an exact command phrase.
3. **Intent/action routing** — map requests such as opening a book, chapter, verse, searching, reading, or studying to application actions.
4. **Response generation** — produce a Bible-grounded response in the selected response language.
5. **Speech synthesis/audio** — speak supported responses and Bible passages in the selected language.

The provider layer must be replaceable so Bible Arena is not permanently tied to one speech provider.

## 11. Natural Language Commands

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

## 12. Multilingual Data Model

Bible content must be modeled so multiple translations/languages can reference the same canonical Bible structure without being treated as duplicates.

Canonical structure:

**Book → Chapter → Verse**

Translation/version-specific data must include its own version/language identity while preserving canonical verse references.

Language capability records should also be independent from Bible translation records so a language can have text support before voice support, or voice input before a complete Bible translation is available.

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

## 13. Bible Content Licensing

Every Bible translation imported into Bible Arena must have a documented source and redistribution/use basis appropriate to the intended product use.

No copyrighted Bible text may be added to the repository or production database without appropriate rights.

Red-letter/Jesus-word metadata must come from a trusted, documented source. AI must not be used to guess and permanently assign this metadata.

## 14. Scalability and Reliability

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

## 15. Ownership and Product Identity

Bible Arena is the product being built and owned through its own project infrastructure:

- GitHub repository: `ejembiedwin36-oss/bible-arena`
- Supabase project/database.
- Future production deployment.
- Future personal product domain.

External Bible sources or service providers are dependencies/content sources where applicable; they are not the identity of Bible Arena.

## 16. Product Success Criteria

Bible Arena should ultimately enable a person to use the Bible in a language they understand without requiring English knowledge for core interactions.

A major language milestone is achieved when a supported language can provide, at the appropriate maturity level:

**Read text + search + listen + speak to Bible Arena + understand natural requests + receive a response + optionally hear that response.**

The target interaction model applies to **every supported language**, not only Idoma. Idoma is the first language after English for deep implementation and validation, while the architecture must scale the same model to as many additional languages as can be supported reliably, legally, and sustainably.
