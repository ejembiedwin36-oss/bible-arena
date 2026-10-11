"""Wav2Vec2 XLS-R CTC training entry point.

Training is opt-in: the command requires --execute so inspecting the pipeline
never accidentally launches a GPU job. Training also refuses to start if an
opaque speaker_id appears in both the training and validation datasets.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def load_config(path: Path) -> dict:
    try:
        import yaml
    except ImportError as exc:
        raise SystemExit("Missing ML dependency: pyyaml") from exc
    with path.open("r", encoding="utf-8") as handle:
        config = yaml.safe_load(handle)
    if not isinstance(config, dict):
        raise SystemExit("Training config must contain a YAML object.")
    return config


def require_training_value(training: dict, name: str):
    value = training.get(name)
    if value is None:
        raise SystemExit(f"Training config is missing required value: training.{name}")
    return value


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--validation-dataset", required=True, type=Path)
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

    for label, path in (("Training config", args.config), ("Dataset", args.dataset), ("Validation dataset", args.validation_dataset), ("Processor directory", args.processor)):
        if not path.exists():
            raise SystemExit(f"{label} does not exist: {path}")

    config = load_config(args.config)
    training = config.get("training")
    if not isinstance(training, dict):
        raise SystemExit("Training config must contain a 'training' mapping.")

    dataset = load_from_disk(str(args.dataset))
    validation_dataset = load_from_disk(str(args.validation_dataset))
    if len(dataset) == 0:
        raise SystemExit("Training dataset is empty.")
    if len(validation_dataset) == 0:
        raise SystemExit("Validation dataset is empty.")

    required_columns = {"sample_id", "speaker_id", "language_code", "input_values", "labels"}
    for name, split in (("training", dataset), ("validation", validation_dataset)):
        missing_columns = required_columns.difference(split.column_names)
        if missing_columns:
            raise SystemExit(
                f"Prepared {name} dataset is missing columns: "
                + ", ".join(sorted(missing_columns))
                + ". Run scripts/prepare_ctc_features.py first."
            )
        if any(code != "id" for code in split["language_code"]):
            raise SystemExit(f"Prepared {name} dataset contains a non-Idoma record.")
        sample_ids = [str(value) for value in split["sample_id"]]
        if len(sample_ids) != len(set(sample_ids)):
            raise SystemExit(f"Prepared {name} dataset contains duplicate sample IDs.")

    training_speakers = {str(value) for value in dataset["speaker_id"]}
    validation_speakers = {str(value) for value in validation_dataset["speaker_id"]}
    leaked_speakers = training_speakers.intersection(validation_speakers)
    if leaked_speakers:
        preview = ", ".join(sorted(leaked_speakers)[:5])
        raise SystemExit(
            "Speaker leakage detected between training and validation datasets. "
            f"Overlapping speaker IDs include: {preview}"
        )

    processor = Wav2Vec2Processor.from_pretrained(str(args.processor))
    batch_size = int(require_training_value(training, "batch_size"))
    eval_batch_size = int(require_training_value(training, "eval_batch_size"))
    gradient_accumulation_steps = int(require_training_value(training, "gradient_accumulation_steps"))
    learning_rate = float(require_training_value(training, "learning_rate"))
    num_train_epochs = float(require_training_value(training, "num_train_epochs"))
    logging_steps = int(require_training_value(training, "logging_steps"))

    summary = {
        "records": len(dataset),
        "training_speakers": len(training_speakers),
        "validation_records": len(validation_dataset),
        "validation_speakers": len(validation_speakers),
        "speaker_overlap": 0,
        "columns": dataset.column_names,
        "vocab_size": len(processor.tokenizer),
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "cuda_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "training": training,
        "execute": args.execute,
    }
    print(json.dumps(summary, indent=2))

    if not args.execute:
        print("Training preparation complete. Add --execute only when the real ML environment is ready.")
        return 0

    model = Wav2Vec2ForCTC.from_pretrained(
        config.get("base_model", "facebook/wav2vec2-xls-r-300m"),
        vocab_size=len(processor.tokenizer),
        pad_token_id=processor.tokenizer.pad_token_id,
    )
    training_args = TrainingArguments(
        output_dir=str(args.output),
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=eval_batch_size,
        gradient_accumulation_steps=gradient_accumulation_steps,
        learning_rate=learning_rate,
        num_train_epochs=num_train_epochs,
        max_steps=int(training["max_steps"]) if training.get("max_steps") is not None else -1,
        eval_strategy=str(training.get("evaluation_strategy", "epoch")),
        save_strategy=str(training.get("save_strategy", "epoch")),
        save_total_limit=int(training.get("save_total_limit", 2)),
        logging_strategy="steps",
        logging_steps=logging_steps,
        weight_decay=float(training.get("weight_decay", 0.0)),
        fp16=bool(training.get("fp16", False)) and torch.cuda.is_available(),
        gradient_checkpointing=bool(training.get("gradient_checkpointing", False)),
        seed=int(training.get("seed", 42)),
        report_to=[],
    )

    def collate(batch):
        input_values = [item["input_values"] for item in batch]
        labels = [item["labels"] for item in batch]
        inputs = processor.pad(input_values, padding=True, return_tensors="pt")
        with processor.as_target_processor():
            label_batch = processor.pad(labels, padding=True, return_tensors="pt")
        inputs["labels"] = label_batch["input_ids"].masked_fill(label_batch.attention_mask.ne(1), -100)
        return inputs

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        eval_dataset=validation_dataset,
        data_collator=collate,
        processing_class=processor,
    )
    trainer.train()
    trainer.save_model(str(args.output / "final"))
    processor.save_pretrained(str(args.output / "final"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
