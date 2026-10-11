"""Evaluate an Idoma CTC checkpoint on an isolated evaluation manifest.

The manifest must use the schema emitted by export_asr_manifests.py:
  id, audio, nativeTranscript, language_code

Audio paths must point to local, readable files sampled at 16 kHz.
This script never trains a model and never reads training/validation manifests.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    try:
        import evaluate
        import soundfile as sf
        import torch
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
    except ImportError as exc:
        raise SystemExit(f"Missing evaluation dependency: {exc}") from exc

    if not args.model.is_dir():
        raise SystemExit(f"Model directory does not exist: {args.model}")
    if not args.manifest.is_file():
        raise SystemExit(f"Manifest does not exist: {args.manifest}")

    wer_metric = evaluate.load("wer")
    cer_metric = evaluate.load("cer")
    processor = Wav2Vec2Processor.from_pretrained(str(args.model))
    model = Wav2Vec2ForCTC.from_pretrained(str(args.model))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()

    predictions: list[str] = []
    references: list[str] = []
    seen_ids: set[str] = set()

    with args.manifest.open("r", encoding="utf-8") as handle:
        for line_number, raw in enumerate(handle, 1):
            if not raw.strip():
                continue
            try:
                record = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise SystemExit(f"line {line_number}: invalid JSON: {exc}") from exc

            missing = {"id", "audio", "nativeTranscript", "language_code"} - record.keys()
            if missing:
                raise SystemExit(
                    f"line {line_number}: missing fields: {', '.join(sorted(missing))}"
                )
            if record["language_code"] != "id":
                raise SystemExit(f"line {line_number}: sample is not Idoma.")
            sample_id = str(record["id"])
            if sample_id in seen_ids:
                raise SystemExit(f"line {line_number}: duplicate sample id {sample_id!r}")
            seen_ids.add(sample_id)

            reference = str(record["nativeTranscript"]).strip()
            if not reference:
                raise SystemExit(f"line {line_number}: transcript is empty.")

            audio_path = Path(record["audio"])
            if not audio_path.is_file():
                raise SystemExit(f"line {line_number}: missing local audio file: {audio_path}")
            audio, sample_rate = sf.read(audio_path, dtype="float32")
            if sample_rate != 16000:
                raise SystemExit(
                    f"line {line_number}: expected 16000 Hz audio, got {sample_rate} Hz. "
                    "Preprocess the audio before evaluation."
                )
            if audio.size == 0:
                raise SystemExit(f"line {line_number}: audio file is empty.")
            if audio.ndim == 2:
                audio = audio.mean(axis=1)
            if audio.ndim != 1:
                raise SystemExit(f"line {line_number}: unsupported audio shape {audio.shape}.")

            inputs = processor(
                audio, sampling_rate=16000, return_tensors="pt", padding=True
            )
            inputs = {key: value.to(device) for key, value in inputs.items()}
            with torch.no_grad():
                logits = model(**inputs).logits
            predicted_ids = torch.argmax(logits, dim=-1)
            predictions.append(processor.batch_decode(predicted_ids)[0].strip())
            references.append(reference)

    if not predictions:
        raise SystemExit("Evaluation manifest contains no records.")

    result = {
        "language_code": "id",
        "model": str(args.model),
        "records": len(predictions),
        "wer": wer_metric.compute(predictions=predictions, references=references),
        "cer": cer_metric.compute(predictions=predictions, references=references),
        "evaluation_split_only": True,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(result, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
