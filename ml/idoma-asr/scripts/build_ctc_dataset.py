"""Build a Hugging Face audio dataset from an approved Idoma ASR manifest.

The manifest must contain the fields produced by export_asr_manifests.py:
id, audio, nativeTranscript, language_code.

Audio paths must resolve to local files before this step. This script does not
download from Supabase and never invents audio or transcripts.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def resolve_audio(audio_value: str, audio_root: Path | None) -> Path:
    path = Path(audio_value)
    if path.is_absolute():
        return path
    if audio_root is None:
        return path
    return audio_root / path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--audio-root", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    try:
        from datasets import Audio, Dataset
    except ImportError as exc:
        raise SystemExit(f"Missing ML dependency: {exc}")

    if not args.manifest.exists():
        raise SystemExit(f"Manifest does not exist: {args.manifest}")

    records = []
    seen_ids: set[str] = set()

    with args.manifest.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue

            row = json.loads(line)
            required = {"id", "audio", "nativeTranscript", "language_code"}
            missing = required.difference(row)
            if missing:
                raise SystemExit(
                    f"Line {line_number} is missing fields: "
                    + ", ".join(sorted(missing))
                )

            if row["language_code"] != "id":
                raise SystemExit(
                    f"Line {line_number} is not Idoma: {row['language_code']!r}"
                )

            sample_id = str(row["id"])
            if sample_id in seen_ids:
                raise SystemExit(
                    f"Duplicate sample id at line {line_number}: {sample_id}"
                )
            seen_ids.add(sample_id)

            transcript = str(row["nativeTranscript"]).strip()
            if not transcript:
                raise SystemExit(
                    f"Line {line_number} has an empty nativeTranscript."
                )

            audio_path = resolve_audio(str(row["audio"]), args.audio_root)
            if not audio_path.is_file():
                raise SystemExit(
                    f"Audio file does not exist at line {line_number}: {audio_path}"
                )

            records.append(
                {
                    "sample_id": sample_id,
                    "audio": str(audio_path.resolve()),
                    "text": transcript,
                    "language_code": "id",
                }
            )

    if not records:
        raise SystemExit("Manifest contains no records.")

    dataset = Dataset.from_list(records).cast_column(
        "audio", Audio(sampling_rate=16_000)
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    dataset.save_to_disk(str(args.output))

    print(f"Built {len(dataset)} records at {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
