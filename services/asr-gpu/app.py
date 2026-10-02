import os
from fastapi import FastAPI, File, Form, HTTPException, UploadFile

app = FastAPI(title="Bible Arena ASR GPU Service")
MODEL_NAME = os.getenv("ASR_MODEL", "omniASR_CTC_300M_v2")

# Model loading is intentionally isolated behind this boundary. The actual
# Omnilingual runtime should be initialized when the GPU deployment is chosen.

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME, "ready": False}

@app.post("/v1/transcribe")
async def transcribe(audio: UploadFile = File(...), language_code: str = Form(...)):
    if not language_code:
        raise HTTPException(status_code=400, detail="language_code is required")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="audio file is empty")

    # Deliberately fail closed until the real Omnilingual runtime is installed
    # and loaded. This prevents the API from returning fabricated transcripts.
    raise HTTPException(
        status_code=503,
        detail="ASR model runtime is not configured on this GPU service yet.",
    )
