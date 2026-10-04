import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline

MODEL_CARD = os.getenv("OMNIASR_MODEL", "omniASR_LLM_300M_v2")
MAX_AUDIO_BYTES = int(os.getenv("MAX_AUDIO_BYTES", str(20 * 1024 * 1024)))
MAX_AUDIO_SECONDS = int(os.getenv("MAX_AUDIO_SECONDS", "40"))

# Idoma is the first priority, but the service is intentionally language-agnostic.
# The application can pass any language code supported by the selected model.
app = FastAPI(title="Bible Arena Omnilingual ASR", version="0.1.0")
pipeline = ASRInferencePipeline(model_card=MODEL_CARD)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": MODEL_CARD}


@app.post("/v1/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language_code: str = Form(...),
) -> dict[str, str]:
    if not language_code or "_" not in language_code:
        raise HTTPException(status_code=400, detail="language_code must use ISO-639-3 + script format.")

    data = await audio.read(MAX_AUDIO_BYTES + 1)
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file is too large.")

    suffix = Path(audio.filename or "audio.wav").suffix or ".wav"
    temp_path: str | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(data)
            temp_path = temp.name

        # Meta's current reference pipeline accepts audio files below 40 seconds.
        # Duration validation should be enforced by the deployment before production.
        transcriptions = pipeline.transcribe(
            [temp_path],
            lang=[language_code],
            batch_size=1,
        )

        transcript = transcriptions[0].strip() if transcriptions else ""
        if not transcript:
            raise HTTPException(status_code=502, detail="ASR provider returned no transcript.")

        return {
            "transcript": transcript,
            "languageCode": language_code,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"ASR inference failed: {exc}") from exc
    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)
