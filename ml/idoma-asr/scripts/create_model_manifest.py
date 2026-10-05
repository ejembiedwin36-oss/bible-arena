"""Create a reproducible provenance manifest for an accepted Idoma ASR checkpoint."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-version", required=True)
    parser.add_argument("--checkpoint", required=True, type=Path)
    parser.add_argument("--dataset-batch-id", required=True)
    parser.add_argument("--git-commit", required=True)
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--metrics", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    if not args.checkpoint.exists():
        raise SystemExit(f"Checkpoint does not exist: {args.checkpoint}")
    if not args.config.exists():
        raise SystemExit(f"Training config does not exist: {args.config}")
    if not args.metrics.exists():
        raise SystemExit(f"Metrics file does not exist: {args.metrics}")

    metrics = json.loads(args.metrics.read_text(encoding="utf-8"))
    manifest = {
        "model_version": args.model_version,
        "language_code": "id",
        "architecture": "wav2vec2-xls-r-300m",
        "checkpoint": str(args.checkpoint),
        "dataset_batch_id": args.dataset_batch_id,
        "git_commit": args.git_commit,
        "training_config": str(args.config),
        "evaluation_metrics": metrics,
        "status": "candidate",
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(json.dumps(manifest, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
