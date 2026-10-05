"""Evaluate an Idoma CTC checkpoint on an isolated evaluation manifest."""
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
        import torch
        import soundfile as sf
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
    except ImportError as exc:
        raise SystemExit(f"Missing evaluation dependency: {exc}")

    if not args.model.exists():
        raise SystemExit(f"Model does not exist: {args.model}")
    if not args.manifest.exists():
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
    count = 0

    with args.manifest.open("r", encoding="utf-8") as handle:
        for line_number, raw in enumerate(handle, 1):
            if not raw.strip():
                continue
            record = json.loads(raw)
            if record.get("datasetSplit") != "evaluation":
                raise SystemExit(f"line {line_number}: non-evaluation sample found")
            audio_path = Path(record["audioReference"])
            if not audio_path.exists():
                raise SystemExit(f"line {line_number}: missing audio: {audio_path}")
            audio, sample_rate = sf.read(audio_path)
            inputs = processor(audio, sampling_rate=sample_rate, return_tensors="pt", padding=True)
            inputs = {key: value.to(device) for key, value in inputs.items()}
            with torch.no_grad():
                logits = model(**inputs).logits
            predicted_ids = torch.argmax(logits, dim=-1)
            prediction = processor.batch_decode(predicted_ids)[0]
            predictions.append(prediction.strip())
            references.append(str(record["nativeTranscript"]).strip())
            count += 1

    if not count:
        raise SystemExit("Evaluation manifest contains no records.")

    result = {
        "model": str(args.model),
        "records": count,
        "wer": wer_metric.compute(predictions=predictions, references=references),
        "cer": cer_metric.compute(predictions=predictions, references=references),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
