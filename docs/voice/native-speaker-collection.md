# Native Speaker Voice Collection — Bible Arena

## Purpose

Collect real speech samples for Idoma first, then reuse the same workflow for other supported languages.

## Rules

1. Record natural speech; do not force English sentence structure into the local language.
2. Record the speaker's actual words exactly as spoken.
3. Record the intended meaning separately from the transcript.
4. Never invent or machine-generate an Idoma transcript and label it as native speech.
5. Each sample must have a language code and speaker consent.
6. A second native reviewer should verify the transcript and intended meaning before a sample becomes `validated`.
7. Keep evaluation samples separate from training samples when possible.

## Initial Idoma command categories

Collect examples for:

- Open a Bible book
- Open a book and chapter
- Open a specific verse
- Search Scripture
- Read the current verse
- Read the current chapter
- Explain the current verse
- Stop or pause reading

## Sample record

```json
{
  "id": "idoma-0001",
  "languageCode": "id",
  "audioReference": "voice-audio/...",
  "nativeTranscript": "",
  "intendedMeaning": "",
  "intent": {
    "type": "unknown"
  },
  "speakerVerified": false,
  "reviewerVerified": false,
  "verificationStatus": "unverified"
}
```

The blank transcript and intent fields are intentional until a native speaker provides and verifies the sample.

## Quality checklist

- [ ] Native Idoma speaker
- [ ] Consent recorded
- [ ] Clear audio
- [ ] Natural pronunciation
- [ ] Exact native transcript
- [ ] English meaning recorded separately if needed for annotation
- [ ] Bible intent reviewed
- [ ] Second native review completed
- [ ] Added to the appropriate evaluation/training split
