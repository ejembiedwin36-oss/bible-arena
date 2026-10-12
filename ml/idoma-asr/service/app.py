"""Bible Arena Idoma ASR inference service.

Uses Meta OmniASR as the default open-source speech-recognition provider.
Browser audio is decoded and normalized to mono 16 kHz before inference.
The previously discovered gated Idoma-specific model can still be benchmarked
separately if access is approved later.
"""

from __future__ import annotations

import os
import subprocess
import tempfile
from functools import lru_cache
from pathlib import Path

import soundfile as sf
from fastapi import FastAPI, File, HTTPException, UploadFile
from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline

MODEL_ID = os.getenv("IDOMA_ASR_MODEL_ID", "omniASR_CTC_300M_v2")
LANGUAGE_CODE = "idu"
TARGET_SAMPLE_RATE = 16_000
MAX_AUDIO_BYTES = 15 * 1024 * 1024
MAX_AUDIO_SECONDS = 30

app = FastAPI(title="Bible Arena Idoma ASR", version="0.3.0")


@lru_cache(maxsize=1)
def load_model() -> ASRInferencePipeline:
    """Load OmniASR once and reuse it across requests."""
    return ASRInferencePipeline(model_card=MODEL_ID)


def normalize_audio(raw: bytes) -> tuple[object, int]:
    """Decode common browser audio formats and produce mono 16 kHz samples."""
    with tempfile.TemporaryDirectory(prefix="bible-arena-asr-") as temp_dir:
        source = Path(temp_dir) / "input-audio"
        normalized = Path(temp_dir) / "normalized.wav"
        source.write_bytes(raw)

        try:
            subprocess.run(
                [
                    "ffmpeg",
                    "-nostdin",
                    "-loglevel",
                    "error",
                    "-y",
                    "-i",
                    str(source),
                    "-ac",
                    "1",
                    "-ar",
                    str(TARGET_SAMPLE_RATE),
                    "-t",
                    str(MAX_AUDIO_SECONDS + 1),
                    "-f",
                    "wav",
                    str(normalized),
                ],
                check=True,
                timeout=30,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
            )
        except (FileNotFoundError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
            raise ValueError("Unsupported or invalid audio file.") from exc

        samples, sample_rate = sf.read(normalized, dtype="float32")

    if samples.size == 0:
        raise ValueError("Audio file contains no samples.")
    if len(samples) > TARGET_SAMPLE_RATE * MAX_AUDIO_SECONDS:
        raise OverflowError(f"Audio must be {MAX_AUDIO_SECONDS} seconds or shorter.")
    return samples, sample_rate


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "languageCode": LANGUAGE_CODE,
        "model": MODEL_ID,
    }


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)) -> dict[str, str]:
    raw = await audio.read(MAX_AUDIO_BYTES + 1)
    if not raw:
        raise HTTPException(status_code=400, detail="Audio file is empty.")
    if len(raw) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file is too large.")

    try:
        samples, sample_rate = normalize_audio(raw)
    except OverflowError as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        pipeline = load_model()
        audio_input = {"waveform": samples, "sample_rate": sample_rate}
        results = pipeline.transcribe([audio_input], batch_size=1)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Idoma speech recognition is temporarily unavailable.",
        ) from exc

    transcript = str(results[0]).strip() if results else ""
    if not transcript:
        raise HTTPException(status_code=422, detail="No speech transcript was produced.")

    return {
        "transcript": transcript,
        "languageCode": LANGUAGE_CODE,
        "model": MODEL_ID,
    }
