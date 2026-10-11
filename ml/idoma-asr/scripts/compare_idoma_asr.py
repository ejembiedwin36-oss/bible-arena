#!/usr/bin/env python3
"""Compare an Idoma ASR transcript with the known reference text.

This keeps Bible Arena's model choice evidence-based: we score what a speaker
actually said instead of assuming a model is good because it lists Idoma.

Example:
    python ml/idoma-asr/scripts/compare_idoma_asr.py \
        --reference "known Idoma sentence" \
        --prediction "model transcript"
"""

from __future__ import annotations

import argparse
import re
import unicodedata

from jiwer import cer, wer


def normalize(text: str) -> str:
    """Normalize spacing/case while preserving Idoma letters and diacritics."""
    text = unicodedata.normalize("NFC", text).casefold()
    text = re.sub(r"\s+", " ", text).strip()
    return text


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calculate WER and CER for one Idoma ASR prediction."
    )
    parser.add_argument("--reference", required=True, help="What was actually spoken in Idoma")
    parser.add_argument("--prediction", required=True, help="Transcript produced by the ASR model")
    parser.add_argument("--model", default="unknown", help="Model name for the report")
    args = parser.parse_args()

    reference = normalize(args.reference)
    prediction = normalize(args.prediction)

    if not reference:
        raise ValueError("Reference text cannot be empty.")

    word_error_rate = wer(reference, prediction)
    character_error_rate = cer(reference, prediction)

    print(f"Model: {args.model}")
    print(f"Reference:  {reference}")
    print(f"Prediction: {prediction or '[empty]'}")
    print(f"WER: {word_error_rate:.2%}")
    print(f"CER: {character_error_rate:.2%}")


if __name__ == "__main__":
    main()
