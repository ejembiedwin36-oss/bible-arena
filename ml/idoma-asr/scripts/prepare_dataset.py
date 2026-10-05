"""Validate an exported Idoma ASR JSONL manifest before training.

This first version intentionally performs validation only. Audio conversion and
model-specific preprocessing belong in later stages once the ML environment is
available.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

REQUIRED_FIELDS = {
    "sampleId",
    "languageCode",
    "audioReference",
    "nativeTranscript",
    "datasetSplit",
}
VALID_SPLITS = {"training", "validation", "evaluation"}


def validate_record(record: dict, line_number: int) -> list[str]:
    errors: list[str] = []
    missing = REQUIRED_FIELDS - record.keys()
    if missing:
        errors.append(f"line {line_number}: missing {sorted(missing)}")
    if record.get("languageCode") != "id":
        errors.append(f"line {line_number}: languageCode must be 'id'")
    if not str(record.get("nativeTranscript", "")).strip():
        errors.append(f"line {line_number}: nativeTranscript is empty")
    if record.get("datasetSplit") not in VALID_SPLITS:
        errors.append(f"line {line_number}: invalid datasetSplit")
    if not str(record.get("audioReference", "")).strip():
        errors.append(f"line {line_number}: audioReference is empty")
    return errors


def validate_manifest(path: Path) -> tuple[int, list[str]]:
    count = 0
    errors: list[str] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, raw in enumerate(handle, start=1):
            if not raw.strip():
                continue
            try:
                record = json.loads(raw)
            except json.JSONDecodeError as exc:
                errors.append(f"line {line_number}: invalid JSON: {exc}")
                continue
            if not isinstance(record, dict):
                errors.append(f"line {line_number}: record must be an object")
                continue
            count += 1
            errors.extend(validate_record(record, line_number))
    return count, errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    if not args.input.exists():
        raise SystemExit(f"Input manifest does not exist: {args.input}")

    count, errors = validate_manifest(args.input)
    if errors:
        for error in errors:
            print(error)
        return 1

    args.output.mkdir(parents=True, exist_ok=True)
    summary = {"language": "id", "records": count, "status": "validated"}
    (args.output / "manifest_summary.json").write_text(
        json.dumps(summary, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
