import os
import time

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile

app = FastAPI(title="Bible Arena ASR GPU Service")
MODEL_NAME = os.getenv("ASR_MODEL_ID", "omniASR_LLM_300M_v2")
DEVICE = os.getenv("ASR_DEVICE", "cuda")
SERVICE_TOKEN = os.getenv("ASR_API_TOKEN", "")
MAX_AUDIO_BYTES = int(os.getenv("ASR_MAX_AUDIO_BYTES", str(10 * 1024 * 1024)))

_pipeline = None


def require_service_token(authorization: str | None) -> None:
    if not SERVICE_TOKEN:
        raise HTTPException(status_code=503, detail="ASR service token is not configured")
    if authorization != f"Bearer {SERVICE_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline
        _pipeline = ASRInferencePipeline(model_card=MODEL_NAME, device=DEVICE)
    return _pipeline


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME, "device": DEVICE, "ready": _pipeline is not None}


@app.post("/v1/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language_code: str = Form(...),
    authorization: str | None = Header(default=None),
):
    require_service_token(authorization)

    if language_code != "idu_Latn":
        raise HTTPException(status_code=400, detail="This initial deployment is configured for Idoma (idu_Latn).")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="audio file is empty")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="audio file is too large")

    started = time.perf_counter()
    try:
        pipeline = get_pipeline()
        transcriptions = pipeline.transcribe([audio_bytes], lang=[language_code], batch_size=1)
        transcript = transcriptions[0].strip() if transcriptions else ""
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"ASR inference failed: {exc}") from exc

    if not transcript:
        raise HTTPException(status_code=502, detail="ASR provider returned no transcript")

    return {
        "transcript": transcript,
        "language_code": language_code,
        "model": MODEL_NAME,
        "latency_ms": round((time.perf_counter() - started) * 1000, 2),
    }
