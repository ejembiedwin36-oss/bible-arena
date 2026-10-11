"""Bible Arena Idoma ASR inference service.

This service keeps Hugging Face credentials and model weights on the server.
The web application sends audio here and receives only a transcript.
"""

from __future__ import annotations

import io
import os
from functools import lru_cache

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

app = FastAPI(title="Bible Arena Idoma ASR", version="0.1.0")


@lru_cache(maxsize=1)
def load_model():
    """Load the gated model once and reuse it across requests."""
    token = os.getenv("HF_TOKEN") or None
    processor = AutoProcessor.from_pretrained(MODEL_ID, token=token)
    model = AutoModelForCTC.from_pretrained(MODEL_ID, token=token)
    model.eval()
    return processor, model


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
        samples, sample_rate = sf.read(io.BytesIO(raw), dtype="float32", always_2d=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unsupported or invalid audio file.") from exc

    if samples.size == 0:
        raise HTTPException(status_code=400, detail="Audio file contains no samples.")
    if sample_rate != TARGET_SAMPLE_RATE:
        raise HTTPException(
            status_code=400,
            detail=f"Audio must be {TARGET_SAMPLE_RATE} Hz; received {sample_rate} Hz.",
        )

    mono = samples.mean(axis=1)

    try:
        processor, model = load_model()
    except Exception as exc:
        # Do not expose Hugging Face credentials or internal error details.
        raise HTTPException(
            status_code=503,
            detail="Idoma speech model is not available yet.",
        ) from exc

    inputs = processor(mono, sampling_rate=sample_rate, return_tensors="pt")
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
