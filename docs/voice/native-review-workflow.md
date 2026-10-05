# Native Language Review Workflow

## Purpose

Turn a real speech recording into trustworthy multilingual Bible Arena evaluation data without inventing language content.

## Review states

`unverified` → `native_reviewed` → `validated`

A reviewer may also mark a sample `rejected` when the audio, transcript, meaning, or intent is unreliable.

## Reviewer checklist

1. Confirm the speaker is a native or highly proficient speaker of the recorded language.
2. Listen to the complete recording.
3. Write the exact words spoken in the language of the recording.
4. Record the intended meaning separately; do not replace the native transcript with a translation.
5. Assign the Bible intent only after understanding the speaker's meaning.
6. Confirm any book/chapter/verse/query parameters.
7. A second qualified native reviewer validates the result before the sample is trusted for evaluation or training.

## Idoma first

Idoma is the first non-English language in this workflow. No Idoma phrases should be fabricated by developers or generated from an English sentence and labelled as native speech.

## Dataset separation

Keep training, validation, and evaluation samples separated. Evaluation samples should not be used to tune the model after they are finalized.

## Example review record

```json
{
  "verificationStatus": "native_reviewed",
  "nativeTranscript": "",
  "intendedMeaning": "",
  "intent": {
    "type": "unknown"
  },
  "reviewerNotes": "",
  "reviewerVerified": false
}
```

Blank language-specific fields are intentional until a real speaker and reviewer supply them.
