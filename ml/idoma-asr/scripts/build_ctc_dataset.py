"""Build a Hugging Face Dataset from preprocessed Idoma JSONL manifests."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def load_records(path: Path) -> list[dict]:
    records: list[dict] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, raw in enumerate(handle, 1):
            if not raw.strip():
                continue
            record = json.loads(raw)
            audio = Path(record["audioReference"])
            transcript = str(record["nativeTranscript"]).strip()
            if not audio.exists():
                raise SystemExit(f"line {line_number}: missing audio: {audio}")
            if not transcript:
                raise SystemExit(f"line {line_number}: empty transcript")
            records.append({"audio": str(audio), "text": transcript, "sample_id": record["sampleId"]})
    return records


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    try:
        from datasets import Dataset
    except ImportError:
        raise SystemExit("Missing dependency: datasets")

    records = load_records(args.input)
    if not records:
        raise SystemExit("No records available for dataset construction.")

    dataset = Dataset.from_list(records)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    dataset.save_to_disk(str(args.output))
    print(f"Saved {len(dataset)} Idoma records to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
