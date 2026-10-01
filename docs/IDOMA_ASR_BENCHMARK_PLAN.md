# Bible Arena — Idoma ASR Benchmark Plan

## Goal

Measure real Idoma speech recognition before selecting an ASR model for production.

## Candidates

1. Meta Omnilingual ASR
2. Specialist Idoma ASR model based on Wav2Vec 2.0 XLS-R

Meta's Omnilingual ASR is designed for 1,600+ languages and supports extensibility for low-resource languages. Bible Arena will treat this as a benchmark candidate, not an automatic production choice.

## Test language

- Idoma: `idu_Latn`

## Test command families

### Bible navigation

- Open Matthew.
- Open Matthew chapter 5.
- Go to Matthew chapter 5 verse 10.
- Read Matthew chapter 5.
- Read verse 10.

### Bible search

- Search for faith.
- Find where the Bible talks about forgiveness.
- Show me verses about prayer.

### Reading controls

- Read this.
- Continue reading.
- Stop reading.
- Repeat that.

### Study commands

- Explain this verse.
- Give me the meaning of this passage.
- Show me related Scriptures.

## Recording requirements

Each command should be recorded by multiple native Idoma speakers, with natural phrasing rather than reading only one fixed sentence.

Include:

- male and female speakers
- different age groups where practical
- different accents/regions where practical
- quiet recordings
- ordinary background noise
- short and conversational speech

Keep individual utterances short. The current Omnilingual ASR reference pipeline documents limits on audio duration for inference. citeturn0search7

## Metrics

Record at minimum:

- transcription error rate
- Bible-name recognition accuracy
- chapter/verse number accuracy
- command intent accuracy
- latency
- failure rate
- human/native-speaker acceptability

For ASR transcription, use WER/CER as appropriate. Do not compare a metric across models unless the test set and normalization are identical.

## Test record

Each sample should contain:

```json
{
  "id": "idu-001",
  "speaker": "speaker-01",
  "language": "idu_Latn",
  "audio": "...",
  "referenceTranscript": "...",
  "expectedIntent": {
    "type": "open_book_chapter",
    "bookName": "Matthew",
    "chapterNumber": 5
  }
}
```

## Decision rule

Do not select a production model from published benchmark numbers alone.

A candidate must be tested on the same Bible Arena evaluation set. The result must consider both raw transcription and whether the resulting transcript enables the correct Bible action.

## Important product requirement

ASR is only one stage of the language mission. A successful transcript does not mean the language experience is complete.

Bible Arena must ultimately support:

**hear → understand → respond → speak**

The same benchmark philosophy will later be applied to other priority languages after English and Idoma.
