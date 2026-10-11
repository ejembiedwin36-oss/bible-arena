"""Bible Arena Idoma ASR inference service.

Keeps Hugging Face credentials and model weights on the server. Browser audio
is decoded and normalized to mono 16 kHz before inference.
"""

from __future__ import annotations

import os
import subprocess
import tempfile
from functools import lru_cache
from pathlib import Path

import soundfile as sf
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from transformers import AutoModelForCTC, AutoProcessor

MODEL_ID = os.getenv(
    "IDOMA_ASR_MODEL_ID",
    "mrheartng/wav2vec2-xls-r-1b-finetuned-idoma",
)
LANGUAGE_CODE = "idu"
TARGET_SAMPLE_RATE = 16_000
MAX_AUDIO_BYTES = 15 * 1024 * 1024

app = FastAPI(title="Bible Arena Idoma ASR", version="0.2.0")


@lru_cache(maxsize=1)
def load_model():
    """Load the gated model once and reuse it across requests."""
    token = os.getenv("HF_TOKEN") or None
    processor = AutoProcessor.from_pretrained(MODEL_ID, token=token)
    model = AutoModelForCTC.from_pretrained(MODEL_ID, token=token)
    model.eval()
    return processor, model


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
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        processor, model = load_model()
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Idoma speech model is not available yet.",
        ) from exc

    inputs = processor(samples, sampling_rate=sample_rate, return_tensors="pt")
    with torch.inference_mode():
        logits = model(**inputs).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    transcript = processor.batch_decode(predicted_ids)[0].strip()
    if not transcript:
        raise HTTPException(status_code=422, detail="No speech transcript was produced.")

    return {
        "transcript": transcript,
        "languageCode": LANGUAGE_CODE,
        "model": MODEL_ID,
    }
