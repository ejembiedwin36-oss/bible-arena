# Bible Arena — Idoma ASR Provider Decision

## Decision update — 2026-10-01

The original Idoma ASR research identified a Wav2Vec 2.0 XLS-R Idoma model. That remains a useful specialist benchmark, but current research has revealed a newer option that better matches Bible Arena's long-term multilingual goal: **Meta Omnilingual ASR**.

Meta announced Omnilingual ASR in November 2025 as an open-source family covering more than 1,600 languages, including low-resource languages. The project is explicitly designed to be extensible to underserved languages. The model family includes 300M, 1B, and larger variants. [Meta research](https://ai.meta.com/research/publications/omnilingual-asr-open-source-multilingual-speech-recognition-for-1600-languages/)

The current language resources list Idoma as `idu_Latn`, which means Idoma is represented in the Omnilingual ASR language inventory. This is also useful for future expansion because the same inventory includes many Nigerian languages. [AfriSpeech selector](https://github.com/AfriSpeech/afrispeech-selector)

## Important distinction

Language coverage in a model inventory is **not the same as production-quality support for Bible Arena**.

We still need to test:

- native Idoma speech
- different speakers
- natural conversational speech
- Bible vocabulary
- book names
- chapter and verse references
- noisy recordings
- latency
- transcription accuracy

## Recommended development path

For the first ASR experiment, evaluate these two paths side by side:

### Path A — Omnilingual ASR

Use Meta's open-source Omnilingual ASR as the broad multilingual baseline.

Candidate model family:

- `facebook/omniASR-W2V-1B`
- `facebook/omniASR-LLM-300M`
- larger LLM-ASR variants if required by accuracy testing

The 300M model is particularly useful for an initial lower-compute experiment; larger models can be evaluated after the baseline.

### Path B — Specialist Idoma model

Keep the previously researched fine-tuned Idoma Wav2Vec2 model as a specialist benchmark. The published Idoma project reports an Idoma STT WER of 11.43%, but this is the project's own held-out evaluation and must be independently tested for Bible Arena use.

## Why we will test both

Bible Arena's priority is language access, not loyalty to one model family.

A multilingual model may give us a scalable foundation across Idoma, Igbo, Yoruba, Hausa, Tiv, Igala, and other languages. A specialist model may outperform it for a particular language.

Therefore the provider abstraction must allow language-specific model selection without changing the application voice architecture.

## First benchmark

Use the same native-speaker recordings for both candidates where licensing and research permissions allow.

Initial commands:

1. Open Matthew.
2. Open Matthew chapter 5.
3. Go to Matthew chapter 5 verse 10.
4. Read this verse.
5. Search for faith.
6. Explain this verse.
7. Stop reading.

Record:

- transcript
- character/word error rate where appropriate
- intent accuracy
- book resolution accuracy
- chapter/verse resolution accuracy
- latency
- failure mode

## Production rule

No model becomes the production Idoma provider merely because it lists Idoma as supported.

Bible Arena promotes Idoma ASR to production only after native-speaker evaluation demonstrates that the model reliably handles the application's real Bible commands.

## Architecture consequence

The existing `VoiceInferenceGateway` and `IdomaVoiceProviderAdapter` remain the correct abstraction.

Only the provider implementation changes:

```text
VoiceSession
    ↓
VoiceInferenceGateway
    ↓
Idoma Provider Adapter
    ↓
┌─────────────────────────────┐
│ Omnilingual ASR benchmark    │
│ Specialist Idoma benchmark  │
└─────────────────────────────┘
```

This keeps the application independent of a single model vendor or model family.
