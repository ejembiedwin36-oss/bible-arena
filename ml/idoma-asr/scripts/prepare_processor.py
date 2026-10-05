"""Build the Hugging Face processor/tokenizer inputs for Idoma CTC training.

This script prepares vocabulary symbols from the real training transcripts. It
never invents transcripts and should be reviewed for orthographic consistency
before a processor is frozen for a production training run.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def read_transcripts(manifest: Path) -> list[str]:
    texts: list[str] = []
    with manifest.open("r", encoding="utf-8") as handle:
        for line_number, raw in enumerate(handle, start=1):
            if not raw.strip():
                continue
            record = json.loads(raw)
            if record.get("datasetSplit") != "training":
                continue
            text = str(record.get("nativeTranscript", "")).strip()
            if not text:
                raise SystemExit(f"line {line_number}: empty training transcript")
            texts.append(text)
    return texts


def normalize_for_vocab(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    texts = read_transcripts(args.manifest)
    if not texts:
        raise SystemExit("No training transcripts found")

    # CTC vocabulary is character-based. Keep letters that actually occur in
    # the reviewed Idoma training transcripts and reserve CTC special symbols.
    vocabulary = sorted(set("".join(normalize_for_vocab(text) for text in texts)))
    if " " in vocabulary:
        vocabulary.remove(" ")
    vocabulary.append("|")

    output = {"vocab": vocabulary, "num_training_transcripts": len(texts)}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(output, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
