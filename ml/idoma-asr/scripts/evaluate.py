"""Validate the evaluation inputs for an Idoma ASR candidate model."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


def require_module(name: str) -> None:
    if importlib.util.find_spec(name) is None:
        raise SystemExit(f"Missing dependency: {name}. Install the ML environment first.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    args = parser.parse_args()

    require_module("evaluate")

    if not args.model.exists():
        raise SystemExit(f"Model path does not exist: {args.model}")
    if not args.manifest.exists():
        raise SystemExit(f"Evaluation manifest does not exist: {args.manifest}")

    records = 0
    with args.manifest.open("r", encoding="utf-8") as handle:
        for line_number, raw in enumerate(handle, start=1):
            if not raw.strip():
                continue
            record = json.loads(raw)
            if record.get("datasetSplit") != "evaluation":
                raise SystemExit(
                    f"line {line_number}: evaluation manifest contains a non-evaluation sample"
                )
            records += 1

    if records == 0:
        raise SystemExit("Evaluation manifest contains no records.")

    print(json.dumps({"evaluation_records": records, "model": str(args.model)}, indent=2))
    print("Evaluation bootstrap validated. The WER/CER inference loop should be enabled only with a real trained checkpoint.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
