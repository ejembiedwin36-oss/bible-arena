# Export approved Idoma audio from Supabase

This operator-only workflow downloads reviewed recordings from the private
`voice-audio` Storage bucket to a local machine. It does not change Supabase
records, upload anything, or train a model.

## Safety requirements

- Use a trusted, access-controlled machine with encrypted storage.
- Use the Supabase **service-role key only in a local shell**. Never paste it
  into ChatGPT, commit it to Git, put it in a frontend `.env` variable, or
  store it in this repository.
- The script selects only Idoma samples that are validated, explicitly marked
  `asr_eligible=true`, have verified speaker and reviewer flags, a non-empty
  native transcript, and a valid split.
- It downloads audio from the private `voice-audio` bucket. The output
  contains sample IDs and transcripts needed by the pipeline, but excludes
  user IDs, signed URLs, and authentication tokens.
- Do not upload this export to GitHub. Keep it private and delete local copies
  when they are no longer needed under the project's data-retention rules.
- The script refuses to overwrite existing files and limits each downloaded
  audio object to 100 MiB.

## 1. Configure a local shell

From the repository root, set the project URL and service-role key in your
terminal session. Retrieve the key directly from the Supabase dashboard; do
not share it in chat or add it to any tracked file.

```sh
export SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

## 2. Count approved samples without downloading

```sh
python ml/idoma-asr/scripts/download_approved_idoma_audio.py \
  --output /private/path/idoma-asr-export \
  --dry-run
```

If no approved samples exist, the script reports that and writes nothing.

## 3. Download the approved samples

Use a fresh, private output directory:

```sh
python ml/idoma-asr/scripts/download_approved_idoma_audio.py \
  --output /private/path/idoma-asr-export
```

The output directory contains:

- `audio/`: local copies of the approved audio files.
- `eligible_samples.jsonl`: source manifest with local relative audio paths.

## 4. Build split manifests

```sh
python ml/idoma-asr/scripts/export_asr_manifests.py \
  --input /private/path/idoma-asr-export/eligible_samples.jsonl \
  --output /private/path/idoma-asr-export/manifests
```

The existing manifest exporter requires non-empty training, validation, and
evaluation splits. If any split is empty, stop and collect/review more samples;
do not move samples between splits just to make the command pass.

## 5. Prepare datasets

Run the existing CTC dataset builder separately for each split, with the export
directory as the audio root. For example:

```sh
python ml/idoma-asr/scripts/build_ctc_dataset.py \
  --manifest /private/path/idoma-asr-export/manifests/training.jsonl \
  --audio-root /private/path/idoma-asr-export \
  --output /private/path/idoma-asr-export/datasets/training
```

Repeat for `validation.jsonl` and `evaluation.jsonl`. Never use the evaluation
split for training or checkpoint selection. Before feature preparation, verify
that the audio formats are supported by the installed audio stack; recordings
that need transcoding must be converted with an approved preprocessing step,
not silently renamed.

## Current verified project state

At the last database check, there were zero Idoma audio uploads, zero Idoma
review samples, and zero ASR-eligible Idoma samples. The dry run is therefore
expected to report no samples until the collection and review workflow is used.
No model or benchmark result should be claimed before real data is available.
