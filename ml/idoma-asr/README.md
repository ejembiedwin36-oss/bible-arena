# Idoma ASR ML Workspace

This directory defines the first reproducible machine-learning workspace for Bible Arena's Idoma ASR model.

## Scope

The workspace consumes an exported JSONL manifest produced from validated, ASR-eligible Bible Arena samples. It does not access the production Supabase database directly.

## Planned commands

```bash
python scripts/prepare_dataset.py --input data/idoma.jsonl --output data/processed
python scripts/train.py --config configs/idoma_xlsr.yaml
python scripts/evaluate.py --model outputs/checkpoints/best --manifest data/evaluation.jsonl
```

The initial implementation should fail clearly when required dependencies, audio files, transcripts, or configuration are missing. It must not silently substitute fake data.

## Data policy

- Only explicitly ASR-eligible validated samples may enter training.
- Evaluation data is kept separate.
- No authentication tokens or signed storage URLs are committed to this workspace.
- Audio should be referenced through controlled local/ML storage at training time.
