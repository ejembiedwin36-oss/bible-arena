# Idoma Transcript Normalization and Data Quality

## Goal

Prepare validated Idoma transcripts for ASR training without changing what the speaker actually said.

## Golden rule

Normalization may remove recording artifacts and enforce a consistent machine-readable format, but it must never rewrite an Idoma word into an invented or guessed form.

## Allowed normalization

- Trim leading and trailing whitespace.
- Collapse accidental repeated whitespace.
- Normalize line endings.
- Store the original reviewed transcript separately from any normalized training transcript.
- Record review notes when spelling or segmentation is uncertain.

## Do not automatically

- Translate Idoma into English and use the translation as the transcript.
- Replace an unfamiliar Idoma word with a guessed spelling.
- Remove meaningful repetitions or speech patterns.
- Invent punctuation or words that were not spoken.
- Normalize away code-switching without recording it.

## Quality gates

Before ASR eligibility/export, require:

1. A validated native transcript.
2. Audio reference exists and is readable by the authorized pipeline.
3. No empty transcript after normalization.
4. Language code matches the intended dataset (`id` for the first model).
5. Sample is explicitly ASR-eligible.
6. Dataset split is known and preserved.
7. No evaluation sample is exported into training.

## Metadata for difficult samples

Where audio is unclear, retain the sample but do not mark it ASR-eligible until a qualified reviewer resolves the uncertainty. Use reviewer notes rather than guessing.

## Auditability

Keep the original reviewed transcript, normalized transcript, reviewer/validator identity, timestamps, and eligibility decision so every training item can be traced back to its source recording.
