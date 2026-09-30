# Bible Arena — Idoma Voice Integration Plan

## Purpose

This document defines the development path from the current Idoma provider adapter boundary to a real end-to-end Idoma voice experience.

The product requirement is:

**hear → understand → respond → speak**

The implementation must not claim Idoma voice support until the complete flow has been tested with real Idoma speech.

## Current state

- Voice capability registry exists.
- Voice intent contract exists.
- Voice provider interfaces exist.
- Voice session orchestration exists.
- Idoma proof-of-concept boundary exists.
- Idoma provider adapter exists, but its network/model transport is intentionally not implemented.

## Integration stages

### Stage 1 — Local provider validation

Deploy or run the selected Idoma ASR and TTS models in a controlled development environment.

Required inputs:

- Native-speaker Idoma recordings.
- Representative Bible commands.
- Representative Bible names and terminology.
- Clean and noisy recordings.
- Multiple speakers and speaking styles.

### Stage 2 — ASR adapter

Implement the adapter transport for the verified ASR endpoint.

The adapter must return:

```ts
{
  transcript: string;
  confidence?: number;
}
```

It must never silently convert an error into an empty transcript.

### Stage 3 — Bible intent understanding

Convert Idoma transcripts into the existing language-independent `VoiceIntent` contract.

Examples:

- open a book
- open a chapter
- open a verse
- search Scripture
- read the current verse/chapter
- explain Scripture
- stop playback

Book and chapter resolution should use the Bible catalogue rather than hard-coded English-only names.

### Stage 4 — Bible action execution

Send the resulting intent through the same application actions used by typed input.

Voice must be another input method, not a separate Bible navigation system.

### Stage 5 — Idoma response generation

Produce response text in the user's selected language. The response must be grounded in Bible Arena data and the requested action.

### Stage 6 — TTS adapter

Connect verified Idoma TTS and return spoken audio to the client.

### Stage 7 — End-to-end evaluation

A native speaker should be able to complete the full journey:

```text
Idoma speech
→ recognition
→ understanding
→ Bible action
→ Idoma response
→ Idoma speech
```

## Acceptance criteria

Idoma may only be promoted from `unverified` to `available` after:

1. ASR is tested on multiple native speakers.
2. Bible command intent accuracy is measured.
3. Bible book/chapter/verse resolution is measured.
4. Response text quality is reviewed by native speakers.
5. TTS intelligibility is reviewed by native speakers.
6. The full hear-understand-respond-speak flow succeeds repeatedly.
7. Failures are surfaced clearly to the user.
8. No unsupported provider capability is advertised as available.

## Security and operations

Provider credentials must remain server-side. The browser must never receive private API keys or model credentials.

For production, provider calls should be mediated through a controlled backend/edge function with:

- authentication
- rate limiting
- request validation
- structured logging without storing unnecessary voice content
- provider timeout handling
- safe error messages

## Language expansion

The same integration contract will be reused for:

1. English
2. Idoma
3. Igbo
4. Yoruba
5. Hausa
6. Tiv
7. Igala
8. Efik / Calabar
9. Additional languages as verified

Idoma is the first priority after English, but it must not become a hard-coded exception in the architecture.
