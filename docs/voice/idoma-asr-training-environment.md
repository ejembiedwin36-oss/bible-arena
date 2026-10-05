# Idoma ASR Training Environment

## Objective

Define a reproducible environment for fine-tuning Wav2Vec 2.0 XLS-R on validated Idoma speech without coupling model training to the Bible Arena web application.

## Repository boundary

The web application remains responsible for:

- collecting and reviewing language data;
- marking samples ASR-eligible;
- exporting a clean manifest.

Model training should run in a separate ML workspace or repository and consume the exported manifest/audio through a controlled pipeline.

## Dataset layout

Recommended structure:

```text
idoma-asr/
  data/
    train.jsonl
    validation.jsonl
    evaluation.jsonl
  scripts/
    prepare_dataset.py
    train.py
    evaluate.py
  configs/
    idoma_xlsr.yaml
  outputs/
    checkpoints/
    metrics/
```

Each manifest record should resolve to audio plus the verified native transcript. The training job must reject missing files, empty transcripts, unsupported language codes, and malformed records before training begins.

## Preprocessing

1. Load audio at the processor's expected sampling rate.
2. Convert to a consistent mono representation.
3. Preserve the reviewed transcript as the target text.
4. Do not translate the transcript during preprocessing.
5. Log duration and rejected-example counts.

## Training

Use a Wav2Vec 2.0 XLS-R checkpoint as the starting point and fine-tune with a CTC objective appropriate for speech recognition. The exact checkpoint, batch size, learning rate, gradient accumulation, freeze strategy, and training steps should be selected from the available compute and validated experimentally rather than hard-coded into the product.

Use checkpointing and early stopping based on the validation metric. Never select a model using the held-out evaluation set.

## Evaluation gate

Every candidate checkpoint must be evaluated on an untouched evaluation split. Record at minimum:

- Word Error Rate (WER)
- Character Error Rate (CER)
- number of evaluated utterances
- total audio duration
- failure/rejection counts

Where possible, report results by speaker and recording condition so poor generalization is visible.

## Reproducibility

Record:

- base model identifier;
- dataset export batch ID;
- dataset counts and split hashes;
- code commit SHA;
- training configuration;
- library/runtime versions;
- random seed;
- checkpoint identifier;
- evaluation metrics.

A production model is not accepted merely because training completed. It must pass the agreed evaluation threshold and be traceable to the exact dataset and configuration used.

## Deployment handoff

Only an accepted checkpoint is packaged for the ASR inference service. The deployed model must expose a stable inference contract to the Supabase `voice-inference` function; the web app should not need to know the underlying model implementation.
