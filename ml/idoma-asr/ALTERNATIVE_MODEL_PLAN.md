# Idoma ASR Alternative Model Plan

Bible Arena must not depend on approval for a single gated model.

## Current primary candidate

- `mrheartng/wav2vec2-xls-r-1b-finetuned-idoma`
- Purpose: Idoma automatic speech recognition (ASR)
- Access: gated; owner approval is currently required
- Keep this candidate, but do not block development on it.

## Alternative A — Meta Omnilingual ASR

Primary fallback candidate:

- `facebook/omniASR-CTC-300M`
- Family: Meta Omnilingual ASR
- Task: automatic speech recognition
- License shown on the model card: Apache-2.0
- Training/evaluation corpus: `facebook/omnilingual-asr-corpus`

Why Bible Arena should test it first:

1. The Omnilingual ASR project is designed for more than 1,600 languages.
2. Meta provides a 300M CTC model, which is substantially smaller than the 1B gated Idoma model and the 7B Omnilingual LLM model.
3. The public Omnilingual corpus is tagged for Idoma (`idu`) on Hugging Face.
4. The architecture is intended to support low-resource languages and adaptation with paired speech/text examples.

Important: language/catalogue tags are not proof that Bible Arena will obtain good Idoma transcription. We must benchmark real Idoma audio before selecting this model for production.

## Alternative B — AfriHuBERT

- `ajesujoba/AfriHuBERT`
- African multilingual self-supervised speech encoder
- Covers more than 1,200 languages according to its model card

This is a useful fine-tuning base, but it is not our first drop-in transcription candidate. It is a speech representation model and would require downstream ASR fine-tuning/decoding work.

## Alternative C — XEUS

- `espnet/xeus`
- Cross-lingual self-supervised speech encoder
- Covers more than 4,000 languages according to its model card

XEUS explicitly requires fine-tuning for downstream speech recognition. Its model card also shows a CC BY-NC-SA 4.0 license, so it is not the preferred foundation for a potentially commercial Bible Arena product.

## Decision order

1. Test `facebook/omniASR-CTC-300M` with Idoma (`idu`) audio.
2. Compare its transcript with a known human Idoma transcript and calculate CER/WER.
3. If the original gated Idoma model is approved, benchmark it on the exact same samples.
4. Select the better model based on measured Idoma quality, runtime requirements, and license suitability.
5. If neither is accurate enough, fine-tune a suitable open model using properly licensed Idoma speech/text data and Bible Arena's existing training pipeline.

## Non-negotiable evaluation rule

Bible Arena must never claim that a model understands Idoma merely because its model or dataset page contains the `idu` language tag. Production support requires measured results on Idoma recordings.

## Language codes

- External ISO 639-3 Idoma code: `idu`
- Bible Arena currently has internal compatibility with `id` in some places.
- External model/dataset integrations must use `idu`; do not confuse `id` (standard code for Indonesian) with Idoma.
