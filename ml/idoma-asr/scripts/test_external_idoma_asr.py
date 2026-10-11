#!/usr/bin/env python3
"""Test the published Idoma ASR model against a local audio file.

The model is gated on Hugging Face. Before running this script, the operator
must personally accept the model access conditions and authenticate with a
Hugging Face token outside the repository. Never commit that token.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import soundfile as sf
import torch
from transformers import AutoModelForCTC, AutoProcessor

MODEL_ID = "mrheartng/wav2vec2-xls-r-1b-finetuned-idoma"
TARGET_SAMPLE_RATE = 16_000


def load_mono_audio(path: Path) -> tuple[torch.Tensor, int]:
    audio, sample_rate = sf.read(path, dtype="float32", always_2d=True)
    if sample_rate != TARGET_SAMPLE_RATE:
        raise ValueError(
            f"Expected {TARGET_SAMPLE_RATE} Hz audio, got {sample_rate} Hz. "
            "Convert the file to 16 kHz before testing."
        )

    mono = audio.mean(axis=1)
    if mono.size == 0:
        raise ValueError("Audio file is empty.")

    return torch.from_numpy(mono), sample_rate


def transcribe(audio_path: Path, model_id: str) -> str:
    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForCTC.from_pretrained(model_id)
    model.eval()

    audio, sample_rate = load_mono_audio(audio_path)
    inputs = processor(audio.numpy(), sampling_rate=sample_rate, return_tensors="pt")

    with torch.inference_mode():
        logits = model(**inputs).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    return processor.batch_decode(predicted_ids)[0].strip()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run the published Idoma ASR model on one local 16 kHz audio file."
    )
    parser.add_argument("audio", type=Path, help="Path to a local 16 kHz WAV/audio file")
    parser.add_argument("--model", default=MODEL_ID, help="Hugging Face model ID")
    args = parser.parse_args()

    if not args.audio.is_file():
        raise FileNotFoundError(f"Audio file not found: {args.audio}")

    print(f"Model: {args.model}")
    print(f"Audio: {args.audio}")
    print("Loading model. The first run may download several GB...")
    transcript = transcribe(args.audio, args.model)
    print("\nIdoma transcript:")
    print(transcript or "[model returned an empty transcript]")


if __name__ == "__main__":
    main()
