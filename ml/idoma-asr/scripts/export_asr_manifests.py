"""Export approved Idoma ASR rows into split JSONL manifests.

This script deliberately does not connect to Supabase. A separate trusted export
step should produce JSONL rows from the validated voice-language samples table.
Only rows marked ASR-eligible should be exported.

Expected input fields:
- id
- storage_path
- language_code
- native_transcript
- dataset_split
- asr_eligible

Output:
  <output>/<split>.jsonl

The audio path is kept as a path reference. Audio bytes are never copied into
the manifest.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

SPLITS = ("training", "validation", "evaluation")
REQUIRED = {
    "id",
    "storage_path",
    "language_code",
    "native_transcript",
    "dataset_split",
    "asr_eligible",
}


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

    try:
        with args.input.open("r", encoding="utf-8") as source:
            for line_number, line in enumerate(source, start=1):
                if not line.strip():
                    continue

                row = json.loads(line)
                missing = REQUIRED.difference(row)
                if missing:
                    raise SystemExit(
                        f"Line {line_number} is missing fields: "
                        + ", ".join(sorted(missing))
                    )

                if row["language_code"] != "id":
                    raise SystemExit(
                        f"Line {line_number} is not Idoma: "
                        f"{row['language_code']!r}"
                    )

                if row["asr_eligible"] is not True:
                    raise SystemExit(
                        f"Line {line_number} is not marked asr_eligible=true."
                    )

                split = row["dataset_split"]
                if split not in SPLITS:
                    raise SystemExit(
                        f"Line {line_number} has invalid dataset_split: {split!r}"
                    )

                if row["id"] in seen_ids:
                    raise SystemExit(
                        f"Duplicate sample id at line {line_number}: {row['id']}"
                    )
                seen_ids.add(row["id"])

                transcript = str(row["native_transcript"]).strip()
                if not transcript:
                    raise SystemExit(
                        f"Line {line_number} has an empty native_transcript."
                    )

                manifest_row = {
                    "id": row["id"],
                    "audio": row["storage_path"],
                    "nativeTranscript": transcript,
                    "language_code": row["language_code"],
                }
                handles[split].write(
                    json.dumps(manifest_row, ensure_ascii=False) + "\n"
                )
                counts[split] += 1
    finally:
        for handle in handles.values():
            handle.close()

    if counts["training"] == 0:
        raise SystemExit("Training split is empty.")
    if counts["validation"] == 0:
        raise SystemExit("Validation split is empty.")
    if counts["evaluation"] == 0:
        raise SystemExit("Evaluation split is empty.")

    print(json.dumps(counts, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
