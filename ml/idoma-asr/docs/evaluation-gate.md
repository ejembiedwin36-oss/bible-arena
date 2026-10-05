# Idoma ASR Evaluation Gate

A trained checkpoint is not considered production-ready merely because training completes.

## Required measurements

- Word Error Rate (WER)
- Character Error Rate (CER)
- evaluation record count
- model version/checkpoint identifier

## Acceptance policy

The thresholds are configuration decisions, not universal constants. They must be chosen after reviewing the baseline, dataset difficulty, speaker diversity, and intended user experience.

The `checkpoint_gate.py` utility accepts explicit maximum WER and CER values and exits non-zero when either limit is exceeded.

## Production rule

Only a checkpoint that passes the agreed gate should be handed to the inference service. The held-out evaluation set must not be used to tune the model after results are inspected.
