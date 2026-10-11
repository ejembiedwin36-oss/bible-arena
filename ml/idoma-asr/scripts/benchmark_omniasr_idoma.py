#!/usr/bin/env python3
"""Run one evidence-based Idoma benchmark with Meta OmniASR.

The operator supplies a real Idoma audio file and the exact reference sentence.
The script transcribes the audio, preserves Idoma Unicode/diacritics during text
normalization, and reports WER/CER in one run.

Install:
    python -m pip install -r ml/idoma-asr/omniasr-requirements.txt

Usage:
    python ml/idoma-asr/scripts/benchmark_omniasr_idoma.py \
        path/to/idoma.wav \
        --reference "exact Idoma words that were spoken"
"""

from __future__ import annotations

import argparse
import re
import unicodedata
from pathlib import Path

from jiwer import cer, wer
from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline

MODEL_CARD = "omniASR_CTC_300M_v2"


def normalize(text: str) -> str:
    """Normalize case/spacing while preserving Idoma letters and diacritics."""
    text = unicodedata.normalize("NFC", text).casefold()
    return re.sub(r"\s+", " ", text).strip()


def transcribe(audio_path: Path, model_card: str) -> str:
    pipeline = ASRInferencePipeline(model_card=model_card)
    results = pipeline.transcribe([str(audio_path)], batch_size=1)
    return str(results[0]).strip() if results else ""


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Transcribe one Idoma recording with OmniASR and calculate WER/CER."
    )
    parser.add_argument("audio", type=Path, help="Short Idoma WAV/FLAC recording")
    parser.add_argument(
        "--reference",
        required=True,
        help="Exact Idoma words spoken in the recording",
    )
    parser.add_argument(
        "--model",
        default=MODEL_CARD,
        help=f"OmniASR model card (default: {MODEL_CARD})",
    )
    args = parser.parse_args()

    if not args.audio.is_file():
        raise FileNotFoundError(f"Audio file not found: {args.audio}")

    reference = normalize(args.reference)
    if not reference:
        raise ValueError("Reference text cannot be empty.")

    print(f"Model: {args.model}")
    print(f"Audio: {args.audio}")
    print("Loading OmniASR and transcribing the Idoma recording...")

    prediction = normalize(transcribe(args.audio, args.model))
    word_error_rate = wer(reference, prediction)
    character_error_rate = cer(reference, prediction)

    print("\nBible Arena Idoma ASR benchmark")
    print(f"Reference:  {reference}")
    print(f"Prediction: {prediction or '[empty]'}")
    print(f"WER: {word_error_rate:.2%}")
    print(f"CER: {character_error_rate:.2%}")

    if word_error_rate == 0 and character_error_rate == 0:
        print("Result: exact match for this test sample.")
    else:
        print("Result: keep this measurement as one sample; do not generalize from one recording.")


if __name__ == "__main__":
    main()
