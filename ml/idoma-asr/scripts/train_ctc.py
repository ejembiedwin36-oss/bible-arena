"""Wav2Vec2 XLS-R CTC training entry point.

Training is opt-in: the command requires --execute so that inspecting the
pipeline never accidentally launches a GPU job.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--processor", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()

    try:
        import torch
        from datasets import load_from_disk
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor, TrainingArguments, Trainer
    except ImportError as exc:
        raise SystemExit(f"Missing ML dependency: {exc}")

    if not args.dataset.exists():
        raise SystemExit(f"Dataset does not exist: {args.dataset}")
    if not args.processor.exists():
        raise SystemExit(f"Processor directory does not exist: {args.processor}")

    dataset = load_from_disk(str(args.dataset))
    if len(dataset) == 0:
        raise SystemExit("Dataset is empty.")

    required_columns = {"input_values", "labels"}
    missing_columns = required_columns.difference(dataset.column_names)
    if missing_columns:
        raise SystemExit(
            "Prepared CTC dataset is missing columns: "
            + ", ".join(sorted(missing_columns))
            + ". Run scripts/prepare_ctc_features.py first."
        )

    processor = Wav2Vec2Processor.from_pretrained(str(args.processor))

    summary = {
        "records": len(dataset),
        "columns": dataset.column_names,
        "vocab_size": len(processor.tokenizer),
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "cuda_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "execute": args.execute,
    }
    print(json.dumps(summary, indent=2))

    if not args.execute:
        print("Training preparation complete. Add --execute only when the real ML environment is ready.")
        return 0

    model = Wav2Vec2ForCTC.from_pretrained(
        "facebook/wav2vec2-xls-r-300m",
        vocab_size=len(processor.tokenizer),
        pad_token_id=processor.tokenizer.pad_token_id,
    )

    training_args = TrainingArguments(
        output_dir=str(args.output),
        per_device_train_batch_size=2,
        gradient_accumulation_steps=8,
        learning_rate=1e-4,
        num_train_epochs=10,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        logging_strategy="steps",
        logging_steps=25,
        fp16=torch.cuda.is_available(),
        report_to=[],
    )

    def collate(batch):
        input_values = [item["input_values"] for item in batch]
        labels = [item["labels"] for item in batch]
        inputs = processor.pad(input_values, padding=True, return_tensors="pt")
        with processor.as_target_processor():
            label_batch = processor.pad(labels, padding=True, return_tensors="pt")
        label_ids = label_batch["input_ids"].masked_fill(label_batch.attention_mask.ne(1), -100)
        inputs["labels"] = label_ids
        return inputs

    trainer = Trainer(model=model, args=training_args, train_dataset=dataset, data_collator=collate)
    trainer.train()
    trainer.save_model(str(args.output / "final"))
    processor.save_pretrained(str(args.output / "final"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
