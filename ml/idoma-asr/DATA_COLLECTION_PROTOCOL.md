# Bible Arena — Idoma ASR Data Collection Protocol

Status: Phase 1 collection preparation
Language: Idoma (`id`)

## Purpose

This protocol defines how Bible Arena will collect the first real Idoma speech samples for automatic speech recognition (ASR). It does not claim that a trained Idoma model or production dataset already exists.

## 1. Collection stages

Use a staged rollout rather than collecting a large dataset before the workflow has been tested.

### Pilot — workflow validation
- 5–10 consenting adult Idoma speakers.
- Aim for 20–30 accepted utterances per speaker.
- Goal: validate recording, consent, transcription, native review, validation, export, and speaker-separated dataset handling.
- Do not treat the pilot as a production-quality ASR corpus.

### Expansion — model-development corpus
Proceed only after the pilot passes quality review. Increase speaker diversity and total recorded hours gradually. Dataset size targets should be revised from measured model performance, rejection rate, speaker coverage, and recording conditions rather than from an unsupported fixed number.

## 2. Speaker requirements

For the first-party contribution workflow, the signed-in contributor must be the person speaking in the recording.

- Obtain explicit consent before recording.
- Use the opaque `speaker_id` for ML manifests; do not export account/user IDs.
- Do not ask contributors to speak names, phone numbers, addresses, passwords, account numbers, or other unnecessary personal information.
- Do not collect a third party's voice through the current first-party speaker flow.

## 3. What to record

The first corpus should contain natural, short Idoma utterances instead of one repeated phrase set.

Useful categories include:
- everyday natural sentences;
- questions and answers;
- short commands and requests;
- numbers and common quantities where naturally spoken;
- names of Bible books and common Bible-reading navigation phrases;
- naturally spoken Scripture-related search requests;
- conversational variations in wording.

Do not invent Idoma translations in the software. Native Idoma speakers/reviewers must supply or verify Idoma wording.

## 4. Recording quality

A sample should normally be rejected or re-recorded when:
- the speaker cannot be understood because of strong background noise;
- another person is speaking over the contributor;
- the recording is clipped or severely distorted;
- most of the utterance is missing;
- the submitted transcript does not match the recording;
- the recording contains unnecessary personally identifying information.

Natural differences in accent, speaking speed, pitch, and ordinary environment should not automatically be treated as errors. We want realistic speaker diversity while still keeping speech intelligible.

## 5. Native transcript rules

The transcript must represent what was actually spoken, not what the reviewer thinks the speaker intended to say.

Reviewers should:
1. listen to the complete recording;
2. write/verify the spoken Idoma faithfully;
3. separately record the intended meaning where the workflow requests it;
4. avoid silently rewriting a speaker's utterance into a preferred sentence;
5. reject a sample when the speech cannot be transcribed confidently.

A project-wide Idoma spelling/transcription convention must be agreed with qualified native-language reviewers before large-scale collection. Until then, disputed spellings should be flagged rather than normalized automatically.

## 6. Review and validation

A recording is not training data merely because it was uploaded.

Required progression:
`uploaded → unverified → native review → validated → ASR eligible`

ASR eligibility requires the existing database safeguards, including speaker verification, reviewer verification, dataset split, transcript, validator authorization, and active consent.

## 7. Speaker-separated datasets

A speaker must belong to only one dataset split. All accepted samples from the same `speaker_id` stay together in training, validation, or evaluation.

Never place recordings from the same speaker in multiple splits. The exporter must stop if speaker leakage is detected.

For the pilot, assign speakers to splits only after enough speakers have contributed. Do not try to create statistically meaningful evaluation claims from a tiny number of speakers.

## 8. Consent withdrawal

A contributor can withdraw active Idoma voice consent through the supported application workflow. Withdrawal blocks future ASR eligibility/export for that speaker's affected samples.

Operational documentation presented to contributors must clearly distinguish blocking future use from any limitations around reversing models that may already have been trained from an earlier approved export.

## 9. Pilot acceptance checklist

Before beginning model training, confirm:
- consent is stored and active for every exported speaker;
- every exported sample has a `speaker_id`;
- no user/account IDs appear in ML manifests;
- native transcripts have been reviewed;
- validators, not ordinary contributors, approve ASR eligibility;
- no speaker occurs in multiple dataset splits;
- private audio and manifests are not committed to Git;
- training/validation/evaluation counts are documented;
- rejected samples and rejection reasons are reviewed for collection problems.

## 10. First collection milestone

The immediate milestone is not model accuracy. It is a clean pilot corpus from multiple consenting Idoma speakers that can pass the full secure pipeline without consent, transcription, privacy, or speaker-split failures.

Only after that milestone should Bible Arena run the first baseline Idoma ASR training/evaluation experiment and record WER/CER results.