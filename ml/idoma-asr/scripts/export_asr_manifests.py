"""Export approved Idoma ASR rows into speaker-safe split JSONL manifests.

A separate trusted export step produces the input JSONL from validated,
ASR-eligible rows. This script never connects to Supabase or copies audio bytes.
It preserves the opaque ML-facing speaker_id and refuses speaker leakage across
training, validation, and evaluation splits.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from uuid import UUID

SPLITS = ("training", "validation", "evaluation")
REQUIRED = {
    "id",
    "speaker_id",
    "storage_path",
    "language_code",
    "native_transcript",
    "dataset_split",
    "asr_eligible",
}


def valid_uuid(value: object) -> str:
    text = str(value).strip()
    if not text:
        raise ValueError("empty UUID")
    UUID(text)
    return text


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    if not args.input.exists():
        raise SystemExit(f"Input JSONL does not exist: {args.input}")

    args.output.mkdir(parents=True, exist_ok=True)
    handles = {
        split: (args.output / f"{split}.jsonl").open("w", encoding="utf-8")
        for split in SPLITS
    }
    counts = {split: 0 for split in SPLITS}
    seen_ids: set[str] = set()
    speaker_splits: dict[str, str] = {}

    try:
        with args.input.open("r", encoding="utf-8") as source:
            for line_number, line in enumerate(source, start=1):
                if not line.strip():
                    continue
                row = json.loads(line)
                missing = REQUIRED.difference(row)
                if missing:
                    raise SystemExit(f"Line {line_number} is missing fields: " + ", ".join(sorted(missing)))
                if row["language_code"] != "id":
                    raise SystemExit(f"Line {line_number} is not Idoma: {row['language_code']!r}")
                if row["asr_eligible"] is not True:
                    raise SystemExit(f"Line {line_number} is not marked asr_eligible=true.")

                split = row["dataset_split"]
                if split not in SPLITS:
                    raise SystemExit(f"Line {line_number} has invalid dataset_split: {split!r}")

                sample_id = str(row["id"]).strip()
                if not sample_id:
                    raise SystemExit(f"Line {line_number} has an empty sample id.")
                if sample_id in seen_ids:
                    raise SystemExit(f"Duplicate sample id at line {line_number}: {sample_id}")
                seen_ids.add(sample_id)

                try:
                    speaker_id = valid_uuid(row["speaker_id"])
                except (ValueError, AttributeError) as exc:
                    raise SystemExit(f"Line {line_number} has invalid speaker_id: {row['speaker_id']!r}") from exc

                previous_split = speaker_splits.get(speaker_id)
                if previous_split is not None and previous_split != split:
                    raise SystemExit(
                        f"Speaker leakage detected at line {line_number}: speaker {speaker_id} "
                        f"appears in both {previous_split!r} and {split!r}."
                    )
                speaker_splits[speaker_id] = split

                transcript = str(row["native_transcript"]).strip()
                if not transcript:
                    raise SystemExit(f"Line {line_number} has an empty native_transcript.")

                storage_path = str(row["storage_path"]).strip()
                if not storage_path:
                    raise SystemExit(f"Line {line_number} has an empty storage_path.")

                manifest_row = {
                    "id": sample_id,
                    "speaker_id": speaker_id,
                    "audio": storage_path,
                    "nativeTranscript": transcript,
                    "language_code": row["language_code"],
                }
                handles[split].write(json.dumps(manifest_row, ensure_ascii=False) + "\n")
                counts[split] += 1
    finally:
        for handle in handles.values():
            handle.close()

    for split in SPLITS:
        if counts[split] == 0:
            raise SystemExit(f"{split.capitalize()} split is empty.")

    print(json.dumps({"samples": counts, "speakers": len(speaker_splits)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
