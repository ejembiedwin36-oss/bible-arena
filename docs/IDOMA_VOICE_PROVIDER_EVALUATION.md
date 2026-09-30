# Bible Arena — Idoma Voice Provider Evaluation

## Purpose

This document turns the Idoma voice goal into a measurable provider evaluation instead of assuming that a model or API is production-ready.

## Current evidence

A public Hugging Face Idoma speech project reports an Idoma ASR model based on Wav2Vec 2.0 XLS-R, an NLLB-200 translation model, and an Idoma VITS/MMS-TTS model. Its published evaluation reports 11.43% WER for Idoma ASR and 4.36/5 MOS for Idoma TTS. These are claims from the dataset/model author and must be independently validated for Bible Arena. See: https://huggingface.co/datasets/mrheartng/idoma-tts-speaker1

The multi-speaker dataset documents 14,712 training examples, 1,839 validation examples, and 1,840 test examples at 16 kHz, with Idoma transcriptions and speaker IDs. See: https://huggingface.co/datasets/mrheartng/idoma-tts-multiple-speakers

The Idoma ASR model is publicly listed as a 1B-parameter Wav2Vec2 XLS-R fine-tuned model, but it is not currently deployed by a Hugging Face Inference Provider. See: https://huggingface.co/mrheartng/wav2vec2-xls-r-1b-finetuned-idoma

## First proof-of-concept command set

1. Open Matthew.
2. Open Matthew chapter 5.
3. Read Matthew chapter 5.
4. Go to Matthew chapter 5 verse 10.
5. Search for faith.
6. Read this verse.
7. Explain this verse.
8. Stop reading.

Each command should be recorded by native Idoma speakers using natural phrasing, not only translated English sentences.

## Evaluation layers

### A. Speech recognition

Measure:

- Word Error Rate (WER)
- Character Error Rate (CER)
- Bible proper-name accuracy
- Book-name accuracy
- Chapter-number accuracy
- Verse-number accuracy
- Performance across speakers
- Performance with background noise

### B. Intent understanding

Measure:

- Correct intent classification
- Correct Bible book resolution
- Correct chapter resolution
- Correct verse resolution
- Search-query preservation
- Ambiguous-command handling
- Clarification behavior

### C. Bible action

Measure:

- Correct chapter opened
- Correct verse selected
- Correct search executed
- No destructive or unintended navigation

### D. Response generation

Measure:

- Correct language
- Correct Bible terminology
- Faithful meaning
- Clear and culturally natural phrasing

### E. Speech synthesis

Measure:

- Intelligibility
- Naturalness
- Pronunciation
- Tone/prosody
- Speaker consistency
- Native-speaker preference

## Production gate

Idoma must remain `unverified` in Bible Arena's capability registry until the complete flow passes the evaluation above.

A provider may be technically connected while the language remains unverified.

## Architecture target

```text
Idoma audio
    -> speech recognition
    -> Idoma transcript
    -> language understanding
    -> VoiceIntent
    -> Bible action
    -> response text
    -> Idoma speech synthesis
    -> spoken response
```

The same provider interfaces must be reusable for Igbo, Yoruba, Hausa, Tiv, Igala, Efik/Calabar, and future languages.

## Important implementation rule

Do not hard-code one provider into the Bible Reader. Provider adapters must remain behind the voice-provider interfaces so a model can be replaced, self-hosted, fine-tuned, or combined with another provider without changing Bible navigation logic.
