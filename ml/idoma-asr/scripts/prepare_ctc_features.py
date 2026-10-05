"""Prepare Wav2Vec2 CTC features from real Idoma audio/transcript records."""
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--processor", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    try:
        import soundfile as sf
        from datasets import load_from_disk
        from transformers import Wav2Vec2Processor
    except ImportError as exc:
        raise SystemExit(f"Missing ML dependency: {exc}")

    if not args.dataset.exists():
        raise SystemExit(f"Dataset does not exist: {args.dataset}")
    if not args.processor.exists():
        raise SystemExit(f"Processor directory does not exist: {args.processor}")

    dataset = load_from_disk(str(args.dataset))
    if len(dataset) == 0:
        raise SystemExit("Dataset is empty.")

    processor = Wav2Vec2Processor.from_pretrained(str(args.processor))

    def transform(record: dict) -> dict:
        audio, sample_rate = sf.read(record["audio"], dtype="float32")
        if sample_rate != 16000:
            raise ValueError(
                f"Expected 16000 Hz audio, got {sample_rate} Hz for {record['sample_id']}"
            )
        if getattr(audio, "ndim", 1) > 1:
            audio = audio.mean(axis=1)
        inputs = processor(audio, sampling_rate=16000)
        with processor.as_target_processor():
            labels = processor(record["text"]).input_ids
        return {"input_values": inputs.input_values[0], "labels": labels}

    prepared = dataset.map(transform, remove_columns=dataset.column_names)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    prepared.save_to_disk(str(args.output))
    print(f"Prepared {len(prepared)} CTC records at {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
