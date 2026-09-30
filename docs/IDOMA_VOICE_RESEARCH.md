# Idoma Voice Research — Bible Arena

## Current evidence

- AfriSpeech reports 1,860 Idoma clips from 72 speakers in Nigeria, with train/test/dev splits.
- AfriSpeech-200 reports 1,877 Idoma clips and 20,463.6 seconds of speech across 72 speakers.
- AfriSpeech Selector currently exposes Idoma as `idu_Latn` in its multilingual catalogue and can stream speech datasets for ASR/TTS workflows.
- Hypa-Speech/Hypa-Voices includes Idoma among its low-resource Nigerian language coverage and provides audio-text pairs intended for ASR, TTS, speech translation, and related modeling.
- Public African-language text corpora are available through AfriSpeech's Africa Corpus Builder, which can provide monolingual and parallel text resources for language work.

## What this proves

There is enough public evidence to justify a real Idoma voice proof-of-concept and dataset investigation. It does **not** prove production-grade accuracy or natural conversational speech for Bible Arena.

## Bible Arena validation plan

1. Build a native-speaker Idoma command set covering Bible navigation, search, playback, and common conversational variants.
2. Collect/prepare consented evaluation recordings from native speakers.
3. Benchmark ASR word/character error and intent accuracy separately.
4. Benchmark Bible entity recognition: book names, chapter numbers, verse references, and common alternate pronunciations.
5. Benchmark response generation/translation for theological and navigation terminology.
6. Benchmark TTS intelligibility and naturalness with native speakers.
7. Test the complete hear → understand → respond → speak loop.
8. Only then change the capability registry from `unverified` to `available` for the measured capability.

## Product principle

Bible Arena should never claim that a language is voice-ready simply because a provider accepts its language code or a research model exists. Capability status must be based on measured Bible Arena tests.

## Sources

- AfriSpeech Dataset Paper: https://github.com/tejuafonja/AfriSpeech-Dataset-Paper
- AfriSpeech Selector: https://github.com/AfriSpeech/afrispeech-selector
- AfriSpeech-200: https://github.com/intron-innovation/AfriSpeech-200
- Hypa-Speech-10k: https://huggingface.co/datasets/hypaai/Hypa-Speech-10k
- Hypa-Voices: https://huggingface.co/datasets/hypaai/Hypa-Voices
- Africa Corpus Builder: https://github.com/AfriSpeech/africa-corpus-builder
