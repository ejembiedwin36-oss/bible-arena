# Bible Arena — Idoma App Completion Checklist

## Goal

Prepare the actual Bible Arena app for an Idoma-first local-language experience so the owner can finish the product in a clear order. This checklist separates interface translation, Bible text, search, voice, and AI capabilities; they are different deliverables and must not be shown as available until implemented and tested.

## Confirmed current code

- `src/data/languageRegistry.ts` lists Idoma (`id`) as priority, but all capability flags are currently false.
- `src/components/LanguageSettingsPanel.tsx` already has separate settings for Bible text, interface, voice input, and response/audio language.
- `src/services/languagePreferences.ts` persists those separate preferences on the signed-in user's profile.
- The settings UI disables a language option when its capability flag is false.
- The language registry has no completed Idoma interface translation catalogue yet.
- Idoma voice adapter and ASR-related code exists, but the documented integration is not yet a fully verified end-to-end voice service.
- The production database has an Idoma language catalogue row, but no verified Idoma Bible text has been imported.

## Idoma app work to complete

### A. Interface language (UI translation)
- [ ] Add a real Idoma translation resource for visible app labels, navigation, settings, actions, validation, loading, and error messages.
- [ ] Add a language-resource loader/fallback so missing Idoma strings fall back safely to English.
- [ ] Translate the primary navigation and Bible Reader first; then study, devotion, notes, bookmarks, profile, and challenge screens.
- [ ] Review every translation with a fluent/native Idoma speaker; do not use unreviewed machine output as final UI language.
- [ ] Add tests for resource completeness and fallback behavior.
- [ ] Only then set Idoma `interface: true` in the language registry.

### B. Idoma Bible text
- [ ] Identify the exact Idoma Bible edition and its source.
- [ ] Confirm digital display, storage, and redistribution rights.
- [ ] Normalize and validate book/chapter/verse references against the canonical catalogue.
- [ ] Import to staging, verify samples with an Idoma Bible reviewer, then prepare a reviewed production import.
- [ ] Only then set `bibleText: true`.

### C. Search and study
- [ ] Add Idoma text search after authorized Idoma text is available.
- [ ] Make book/chapter aliases resolve in Idoma, including local book names reviewed by a native speaker.
- [ ] Ensure topic/study explanations are clearly separated from Scripture text and reviewed for language quality.

### D. Voice and response
- [ ] Verify the protected ASR endpoint with genuine Idoma speech and native-speaker evaluation.
- [ ] Map Idoma transcripts to the existing language-independent Bible intent/actions.
- [ ] Review Idoma response text and connect a verified Idoma TTS provider if available.
- [ ] Run full end-to-end tests: speak → recognize → understand → Bible action → response → speak.
- [ ] Enable each capability flag independently only after its acceptance tests pass.

## Safe implementation order

1. Build the UI localization resource and fallback without changing capability flags.
2. Translate and review the most-used app screens.
3. Confirm and stage an authorized Idoma Bible source.
4. Add Idoma catalogue/search support for the imported edition.
5. Finish and evaluate the protected voice flow.
6. Promote capabilities one by one, with tests and reviewer sign-off.

## Truth rule

A language preference setting, language catalogue row, or voice adapter is not proof that the app is fully available in Idoma. Keep unsupported choices disabled and show a clear "not yet available" state until each capability is complete.
