"""Tests for Bible Arena's Idoma ASR HTTP service.

These tests deliberately do not download the gated Idoma model. They verify
request validation and audio normalization independently of model approval.
"""

from __future__ import annotations

import io
import subprocess

import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

import app as asr_app

client = TestClient(asr_app.app)


def make_wav(sample_rate: int = 48_000, seconds: float = 0.1) -> bytes:
    samples = np.zeros(int(sample_rate * seconds), dtype=np.float32)
    buffer = io.BytesIO()
    sf.write(buffer, samples, sample_rate, format="WAV")
    return buffer.getvalue()


def test_health_reports_idoma() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["languageCode"] == "idu"


def test_empty_audio_is_rejected() -> None:
    response = client.post(
        "/transcribe",
        files={"audio": ("empty.webm", b"", "audio/webm")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Audio file is empty."


def test_invalid_audio_is_rejected() -> None:
    response = client.post(
        "/transcribe",
        files={"audio": ("bad.webm", b"not real audio", "audio/webm")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported or invalid audio file."


def test_normalize_audio_converts_to_mono_16khz() -> None:
    try:
        samples, sample_rate = asr_app.normalize_audio(make_wav())
    except ValueError as exc:
        # A missing FFmpeg binary is an environment/setup failure, not a model failure.
        raise AssertionError("FFmpeg is required to run the ASR audio tests.") from exc

    assert sample_rate == asr_app.TARGET_SAMPLE_RATE
    assert samples.ndim == 1
    assert samples.size > 0


def test_model_unavailable_returns_safe_503(monkeypatch) -> None:
    def fail_model_load():
        raise RuntimeError("private provider detail")

    monkeypatch.setattr(asr_app, "load_model", fail_model_load)
    response = client.post(
        "/transcribe",
        files={"audio": ("recording.wav", make_wav(), "audio/wav")},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "Idoma speech model is not available yet."
    assert "private provider detail" not in response.text
