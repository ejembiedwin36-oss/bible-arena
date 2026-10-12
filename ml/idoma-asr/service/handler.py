"""Runpod Serverless handler for Bible Arena Idoma ASR."""

from __future__ import annotations

import base64

import runpod

from app import normalize_audio, transcribe_samples


def handler(job: dict) -> dict[str, str]:
    """Transcribe base64-encoded browser audio supplied in job input."""
    payload = job.get("input") or {}
    encoded_audio = payload.get("audio")

    if not isinstance(encoded_audio, str) or not encoded_audio:
        raise ValueError("input.audio must contain base64-encoded audio.")

    try:
        raw = base64.b64decode(encoded_audio, validate=True)
    except (ValueError, TypeError) as exc:
        raise ValueError("input.audio is not valid base64 audio.") from exc

    samples, sample_rate = normalize_audio(raw)
    transcript = transcribe_samples(samples, sample_rate)

    if not transcript:
        raise ValueError("No speech transcript was produced.")

    return {
        "transcript": transcript,
        "languageCode": "idu",
    }


if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
