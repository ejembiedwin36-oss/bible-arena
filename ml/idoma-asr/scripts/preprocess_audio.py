"""Prepare real Idoma audio for XLS-R preprocessing.

This script converts manifest-referenced local audio to mono 16 kHz WAV files.
It does not download from Supabase or create placeholder audio.
"""

from __future__ import annotations

import argparse
import json
import wave
from pathlib import Path


def convert_one(source: Path, destination: Path) -> None:
    try:
        import soundfile as sf
    except ImportError as exc:
        raise SystemExit("Missing dependency: soundfile") from exc

    audio, sample_rate = sf.read(source, always_2d=True)
    if audio.size == 0:
        raise ValueError(f"Empty audio: {source}")

    # Average channels to mono without changing the transcript.
    mono = audio.mean(axis=1)

    if sample_rate != 16000:
        try:
            import librosa
        except ImportError as exc:
            raise SystemExit("Install librosa to resample non-16kHz audio") from exc
        mono = librosa.resample(mono, orig_sr=sample_rate, target_sr=16000)

    destination.parent.mkdir(parents=True, exist_ok=True)
    sf.write(destination, mono, 16000, subtype="PCM_16")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--audio-root", required=True, type=Path)
    parser.add_argument("--output-root", required=True, type=Path)
    args = parser.parse_args()

    if not args.manifest.exists():
        raise SystemExit(f"Manifest does not exist: {args.manifest}")

    processed = 0
    with args.manifest.open("r", encoding="utf-8") as handle:
        for line_number, raw in enumerate(handle, start=1):
            if not raw.strip():
                continue
            record = json.loads(raw)
            source = args.audio_root / record["audioReference"]
            destination = args.output_root / f"{record['sampleId']}.wav"
            if not source.exists():
                raise SystemExit(f"line {line_number}: audio not found: {source}")
            convert_one(source, destination)
            processed += 1

    print(json.dumps({"processed": processed, "sampling_rate": 16000, "channels": 1}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
