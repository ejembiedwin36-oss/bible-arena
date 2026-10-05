# Idoma Wav2Vec 2.0 XLS-R Training Specification

## Goal

Train the first production Idoma automatic speech recognition model from validated Bible Arena speech data.

## Input contract

Only samples that are all of the following are eligible:

- `language_code = id`
- `verification_status = validated`
- `asr_eligible = true`
- non-empty native transcript
- private audio reference available

## Dataset splits

Respect the `dataset_split` assigned during collection. Never move evaluation samples into training or tuning.

Recommended first benchmark:

- training: majority of eligible samples
- validation: held-out development samples
- evaluation: untouched final benchmark

Exact ratios should be chosen only after inspecting the real dataset size and speaker distribution.

## Speaker separation

Where enough speakers exist, keep speakers separated across splits so the model is tested on voices it did not train on. Do not allow recordings from the same speaker to leak across evaluation boundaries when the dataset is large enough to support speaker-disjoint splits.

## Audio preprocessing

Normalize the input pipeline consistently. Record and version the sampling rate, channel handling, duration filtering, silence handling, and any resampling. Do not silently modify source recordings in the database.

## Text normalization

Define a versioned Idoma transcript normalization policy before training. Preserve the original native transcript; normalization should create a training representation rather than overwrite the reviewed source text.

## Evaluation

Track at minimum:

- Word Error Rate (WER)
- Character Error Rate (CER)
- performance by speaker
- performance by recording condition
- common error patterns

The final evaluation set must remain untouched until model comparison.

## Deployment gate

Do not connect the trained model to the production `voice-inference` recognition path until it passes the agreed evaluation threshold and the model/version is recorded.
