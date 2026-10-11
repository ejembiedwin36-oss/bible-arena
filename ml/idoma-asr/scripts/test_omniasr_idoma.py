#!/usr/bin/env python3
"""Test Meta Omnilingual ASR as an Idoma fallback for Bible Arena.

This script does not assume that language tagging guarantees good Idoma ASR.
It runs a local audio sample through OmniASR so we can measure the actual
transcription quality before using the model in production.

Install first:
    python -m pip install omnilingual-asr

Usage:
    python ml/idoma-asr/scripts/test_omniasr_idoma.py path/to/idoma.wav
"""

from __future__ import annotations

import argparse
from pathlib import Path

from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline

MODEL_CARD = "omniASR_CTC_300M_v2"
MAX_AUDIO_SECONDS = 39


def transcribe(audio_path: Path, model_card: str) -> str:
    pipeline = ASRInferencePipeline(model_card=model_card)
    results = pipeline.transcribe([str(audio_path)], batch_size=1)
    if not results:
        return ""
    return str(results[0]).strip()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Test Meta OmniASR CTC 300M v2 with one short Idoma audio file."
    )
    parser.add_argument("audio", type=Path, help="Path to a local Idoma WAV/FLAC audio file")
    parser.add_argument(
        "--model",
        default=MODEL_CARD,
        help=f"OmniASR model card (default: {MODEL_CARD})",
    )
    args = parser.parse_args()

    if not args.audio.is_file():
        raise FileNotFoundError(f"Audio file not found: {args.audio}")

    print(f"Model: {args.model}")
    print(f"Audio: {args.audio}")
    print(
        "Important: CTC inference is not language-conditioned. "
        "This is a quality test, not proof that Idoma is supported well."
    )
    print(f"Keep the test recording shorter than {MAX_AUDIO_SECONDS} seconds.")
    print("Loading OmniASR. The first run downloads model assets...")

    transcript = transcribe(args.audio, args.model)

    print("\nPredicted transcript:")
    print(transcript or "[model returned an empty transcript]")


if __name__ == "__main__":
    main()
