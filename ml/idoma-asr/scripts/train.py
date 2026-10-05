"""Prepare and validate an Idoma XLS-R training run.

The script now validates the real preprocessing contract, but deliberately does
not launch a costly training job automatically. Use --dry-run to verify inputs.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


def require_module(name: str) -> None:
    if importlib.util.find_spec(name) is None:
        raise SystemExit(f"Missing dependency: {name}. Install the ML environment before training.")


def load_config(path: Path) -> dict:
    try:
        import yaml
    except ImportError as exc:
        raise SystemExit("Missing dependency: pyyaml") from exc
    with path.open("r", encoding="utf-8") as handle:
        config = yaml.safe_load(handle)
    if not isinstance(config, dict):
        raise SystemExit("Training config must contain a YAML object")
    return config


def count_records(path: Path) -> int:
    count = 0
    with path.open("r", encoding="utf-8") as handle:
        for raw in handle:
            if raw.strip():
                json.loads(raw)
                count += 1
    return count


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--train", required=True, type=Path)
    parser.add_argument("--validation", required=True, type=Path)
    parser.add_argument("--evaluation", required=True, type=Path)
    parser.add_argument("--processed-audio", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    config = load_config(args.config)
    for module in ("torch", "transformers", "datasets", "evaluate", "soundfile"):
        require_module(module)

    for path in (args.train, args.validation, args.evaluation):
        if not path.exists():
            raise SystemExit(f"Dataset manifest does not exist: {path}")

    counts = {
        "training": count_records(args.train),
        "validation": count_records(args.validation),
        "evaluation": count_records(args.evaluation),
    }
    if any(value == 0 for value in counts.values()):
        raise SystemExit("Every dataset split must contain real records before training.")

    if args.processed_audio is not None and not args.processed_audio.exists():
        raise SystemExit(f"Processed audio directory does not exist: {args.processed_audio}")

    summary = {
        "language": config.get("language_code"),
        "base_model": config.get("base_model"),
        "objective": config.get("objective"),
        "sampling_rate": config.get("sampling_rate"),
        "counts": counts,
        "dry_run": args.dry_run,
    }
    print(json.dumps(summary, indent=2))

    if args.dry_run:
        print("Dry run complete. No model weights were changed.")
        return 0

    raise SystemExit(
        "Training execution remains gated. The next step is to configure the Hugging Face "
        "processor, data collator, CTC model, checkpointing, and Trainer only after the "
        "real dataset and compute environment are verified."
    )


if __name__ == "__main__":
    raise SystemExit(main())
