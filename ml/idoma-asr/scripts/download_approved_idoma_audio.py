"""Download only validated, ASR-eligible Idoma audio from private Supabase Storage.

This is a local operator tool. It uses a Supabase service-role key from the
environment; never put that key in source control or a browser application.
It writes audio and a minimal JSONL manifest to a local output directory.
"""
from __future__ import annotations

import argparse
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

BUCKET = "voice-audio"
LANGUAGE = "id"
PAGE_SIZE = 500
MAX_AUDIO_BYTES = 100 * 1024 * 1024
SPLITS = {"training", "validation", "evaluation"}
MIME_SUFFIXES = {
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/flac": ".flac",
    "audio/ogg": ".ogg",
    "audio/webm": ".webm",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "audio/aac": ".aac",
}


class ExportError(RuntimeError):
    """A safe, user-readable export failure."""


def request_bytes(url: str, headers: dict[str, str], timeout: int = 60) -> bytes:
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = response.read(MAX_AUDIO_BYTES + 1)
    except urllib.error.HTTPError as exc:
        # Do not print response bodies; they may contain internal details.
        raise ExportError(f"Supabase request failed with HTTP {exc.code}.") from None
    except urllib.error.URLError as exc:
        raise ExportError(f"Could not connect to Supabase: {exc.reason}.") from None
    if len(data) > MAX_AUDIO_BYTES:
        raise ExportError("An audio object exceeds the 100 MiB safety limit.")
    return data


def get_json(url: str, headers: dict[str, str]) -> list[dict]:
    data = request_bytes(url, headers)
    try:
        parsed = json.loads(data)
    except json.JSONDecodeError:
        raise ExportError("Supabase returned an invalid JSON response.") from None
    if not isinstance(parsed, list):
        raise ExportError("Supabase returned an unexpected API response.")
    return parsed


def paged_rows(base_url: str, headers: dict[str, str], params: dict[str, str]) -> list[dict]:
    rows: list[dict] = []
    offset = 0
    while True:
        query = urllib.parse.urlencode(params)
        url = f"{base_url}?{query}"
        page_headers = {**headers, "Range": f"{offset}-{offset + PAGE_SIZE - 1}"}
        page = get_json(url, page_headers)
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            return rows
        offset += PAGE_SIZE


def storage_suffix(storage_path: str, mime_type: str | None) -> str:
    suffix = Path(storage_path).suffix.lower()
    if suffix and len(suffix) <= 10 and suffix[1:].isalnum():
        return suffix
    mime = (mime_type or "").split(";", 1)[0].strip().lower()
    return MIME_SUFFIXES.get(mime) or mimetypes.guess_extension(mime) or ".audio"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Download approved Idoma recordings from the private voice-audio bucket."
    )
    parser.add_argument("--output", type=Path, required=True, help="Local export directory.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Count eligible rows without downloading audio or writing files.",
    )
    args = parser.parse_args()

    base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not base_url or not service_key:
        raise SystemExit(
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your local shell first."
        )
    if not base_url.startswith("https://"):
        raise SystemExit("SUPABASE_URL must use HTTPS.")
    if any(char in service_key for char in "\r\n"):
        raise SystemExit("SUPABASE_SERVICE_ROLE_KEY contains invalid newline characters.")

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Accept": "application/json",
    }
    rest_url = f"{base_url}/rest/v1/voice_language_evaluation_samples"
    params = {
        "select": "id,voice_audio_upload_id,language_code,native_transcript,dataset_split,verification_status,asr_eligible,speaker_verified,reviewer_verified",
        "language_code": "eq.id",
        "verification_status": "eq.validated",
        "asr_eligible": "eq.true",
        "speaker_verified": "eq.true",
        "reviewer_verified": "eq.true",
        "dataset_split": "not.is.null",
        "order": "id.asc",
    }
    samples = paged_rows(rest_url, headers, params)

    approved: list[dict] = []
    seen: set[str] = set()
    for row in samples:
        try:
            sample_id = str(uuid.UUID(str(row["id"])))
            upload_id = str(uuid.UUID(str(row["voice_audio_upload_id"])))
        except (KeyError, ValueError, TypeError, AttributeError):
            raise ExportError("An approved sample has an invalid ID or audio reference.")
        if sample_id in seen:
            raise ExportError(f"Duplicate approved sample ID: {sample_id}")
        seen.add(sample_id)
        transcript = str(row.get("native_transcript") or "").strip()
        split = row.get("dataset_split")
        if row.get("language_code") != LANGUAGE:
            raise ExportError(f"Sample {sample_id} is not marked as Idoma.")
        if row.get("verification_status") != "validated" or row.get("asr_eligible") is not True:
            raise ExportError(f"Sample {sample_id} failed the approval checks.")
        if row.get("speaker_verified") is not True or row.get("reviewer_verified") is not True:
            raise ExportError(f"Sample {sample_id} lacks required speaker/reviewer verification.")
        if not transcript:
            raise ExportError(f"Sample {sample_id} has an empty native transcript.")
        if split not in SPLITS:
            raise ExportError(f"Sample {sample_id} has an invalid dataset split.")
        approved.append({**row, "_sample_id": sample_id, "_upload_id": upload_id,
                         "_transcript": transcript})

    if not approved:
        print("No approved Idoma samples found. No files were written.")
        return 0
    if args.dry_run:
        counts = {split: sum(row["dataset_split"] == split for row in approved) for split in sorted(SPLITS)}
        print(json.dumps({"eligible_samples": len(approved), "by_split": counts, "downloaded": False}, indent=2))
        return 0

    upload_ids = sorted({row["_upload_id"] for row in approved})
    uploads: dict[str, dict] = {}
    for start in range(0, len(upload_ids), 100):
        chunk = upload_ids[start:start + 100]
        in_value = "(" + ",".join(chunk) + ")"
        upload_params = {
            "select": "id,language_code,storage_path,mime_type",
            "id": f"in.{in_value}",
            "language_code": "eq.id",
        }
        query = urllib.parse.urlencode(upload_params)
        for upload in get_json(f"{base_url}/rest/v1/voice_audio_uploads?{query}", headers):
            uploads[str(upload["id"])] = upload

    output_dir = args.output.resolve()
    audio_dir = output_dir / "audio"
    manifest_path = output_dir / "eligible_samples.jsonl"
    if manifest_path.exists():
        raise ExportError("eligible_samples.jsonl already exists; choose a fresh output directory.")

    # Validate every storage reference and local destination before writing any audio.
    planned: list[dict] = []
    for sample in approved:
        upload = uploads.get(sample["_upload_id"])
        if not upload or upload.get("language_code") != LANGUAGE:
            raise ExportError(f"Sample {sample['_sample_id']} has no matching Idoma audio upload.")
        storage_path = str(upload.get("storage_path") or "").lstrip("/")
        if not storage_path or any(part in {"", ".", ".."} for part in storage_path.split("/")):
            raise ExportError(f"Sample {sample['_sample_id']} has an unsafe storage path.")
        suffix = storage_suffix(storage_path, upload.get("mime_type"))
        local_name = f"{sample['_sample_id']}{suffix}"
        local_path = audio_dir / local_name
        if local_path.exists():
            raise ExportError(f"Output file already exists; choose a fresh output directory: {local_name}")
        encoded_path = urllib.parse.quote(storage_path, safe="/")
        planned.append({
            "sample": sample,
            "local_name": local_name,
            "local_path": local_path,
            "object_url": f"{base_url}/storage/v1/object/{BUCKET}/{encoded_path}",
        })

    audio_dir.mkdir(parents=True, exist_ok=True)
    manifest_rows: list[dict] = []
    counts = {split: 0 for split in sorted(SPLITS)}
    audio_headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Accept": "*/*",
    }
    for item in planned:
        sample = item["sample"]
        audio_data = request_bytes(item["object_url"], audio_headers)
        if not audio_data:
            raise ExportError(f"Audio object for sample {sample['_sample_id']} is empty.")
        local_path = item["local_path"]
        temp_path = local_path.with_suffix(local_path.suffix + ".part")
        temp_path.write_bytes(audio_data)
        temp_path.replace(local_path)

        manifest_rows.append({
            "id": sample["_sample_id"],
            "storage_path": f"audio/{item['local_name']}",
            "language_code": LANGUAGE,
            "native_transcript": sample["_transcript"],
            "dataset_split": sample["dataset_split"],
            "asr_eligible": True,
        })
        counts[sample["dataset_split"]] += 1
    temporary_manifest = manifest_path.with_suffix(".jsonl.part")
    with temporary_manifest.open("w", encoding="utf-8", newline="\n") as handle:
        for row in manifest_rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    temporary_manifest.replace(manifest_path)

    print(json.dumps({
        "eligible_samples_downloaded": len(manifest_rows),
        "by_split": counts,
        "audio_directory": str(audio_dir),
        "source_manifest": str(manifest_path),
        "note": "Keep this export private. Do not commit recordings or manifests to Git.",
    }, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ExportError as exc:
        print(f"Export stopped safely: {exc}", file=sys.stderr)
        raise SystemExit(1)
