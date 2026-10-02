import os
import time

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

app = FastAPI(title="Bible Arena ASR GPU Service")
MODEL_NAME = os.getenv("ASR_MODEL_ID", "omniASR_LLM_300M_v2")
DEVICE = os.getenv("ASR_DEVICE", "cuda")

_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline
        _pipeline = ASRInferencePipeline(model_card=MODEL_NAME, device=DEVICE)
    return _pipeline


@app.get("/health")
def health():
    try:
        get_pipeline()
        return {"status": "ok", "model": MODEL_NAME, "device": DEVICE, "ready": True}
    except Exception as exc:
        return {
            "status": "degraded",
            "model": MODEL_NAME,
            "device": DEVICE,
            "ready": False,
            "error": str(exc),
        }


@app.post("/v1/transcribe")
async def transcribe(audio: UploadFile = File(...), language_code: str = Form(...)):
    if not language_code:
        raise HTTPException(status_code=400, detail="language_code is required")

    if language_code != "idu_Latn":
        raise HTTPException(status_code=400, detail="This initial deployment is configured for Idoma (idu_Latn).")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="audio file is empty")

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
