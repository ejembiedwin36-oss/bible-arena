"""Apply a simple, explicit acceptance gate to ASR evaluation metrics."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--metrics", required=True, type=Path)
    parser.add_argument("--max-wer", required=True, type=float)
    parser.add_argument("--max-cer", required=True, type=float)
    args = parser.parse_args()

    metrics = json.loads(args.metrics.read_text(encoding="utf-8"))
    wer = float(metrics["wer"])
    cer = float(metrics["cer"])
    passed = wer <= args.max_wer and cer <= args.max_cer

    result = {
        "passed": passed,
        "wer": wer,
        "cer": cer,
        "max_wer": args.max_wer,
        "max_cer": args.max_cer,
    }
    print(json.dumps(result, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
