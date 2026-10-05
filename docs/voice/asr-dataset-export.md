# ASR Dataset Export Contract

## Purpose

Define the safe boundary between validated Bible Arena voice samples and the future Idoma ASR training pipeline.

## Eligibility

A sample is eligible only when:

- `verification_status = validated`
- `asr_eligible = true`
- the language is the intended ASR language (`id` for the first model)
- the sample has a private audio reference
- the native transcript is present

The `mark_voice_sample_asr_eligible` database function can only be called by an active validator.

## Export record

Each exported item should contain metadata such as:

```json
{
  "sample_id": "uuid",
  "language_code": "id",
  "audio_reference": "private-storage-path",
  "native_transcript": "verified native transcript",
  "dataset_split": "training"
}
```

Do not put authentication tokens, signed URLs, user passwords, or unrelated personal profile information into a training manifest.

## Split policy

Training, validation, and evaluation samples must remain separated. Evaluation samples must never be silently added to training because that would invalidate benchmark results.

## Model boundary

The exporter produces a clean manifest/data contract. Model training remains a separate process and should use only validated samples that have explicitly been marked ASR-eligible.
