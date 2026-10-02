# GPU ASR Deployment Checklist

## Before deployment

- [ ] GPU host has NVIDIA drivers and container runtime support.
- [ ] GPU has enough VRAM for the selected Omnilingual checkpoint.
- [ ] Docker image builds successfully.
- [ ] `ASR_MODEL_ID=omniASR_LLM_300M_v2` is configured.
- [ ] `ASR_LANGUAGE_CODE=idu_Latn` is configured for the first Idoma test.
- [ ] `ASR_API_TOKEN` is stored as a deployment secret, never committed to Git.
- [ ] Public HTTPS is enabled on the inference endpoint.

## Health verification

Run:

```bash
curl -H "Authorization: Bearer $ASR_API_TOKEN" \
  https://YOUR_GPU_HOST/health
```

Expected fields:

```json
{
  "status": "ok",
  "ready": true,
  "model": "omniASR_LLM_300M_v2",
  "device": "cuda"
}
```

## Transcription verification

Send a short genuine Idoma recording:

```bash
curl -X POST \
  -H "Authorization: Bearer $ASR_API_TOKEN" \
  -F "audio=@idoma-test.wav" \
  -F "language_code=idu_Latn" \
  https://YOUR_GPU_HOST/v1/transcribe
```

Do not mark the integration complete until the response contains a non-empty transcript.

## Supabase gateway

Configure the Edge Function secrets:

- `IDOMA_ASR_ENDPOINT=https://YOUR_GPU_HOST/v1/transcribe`
- `IDOMA_ASR_TOKEN=<deployment secret>`

The browser must never receive the GPU provider token.

## Acceptance test

At minimum test:

1. Native Idoma speaker.
2. "Open Matthew chapter five."
3. "Go to Matthew chapter five verse ten."
4. "Read this verse."
5. "Search for faith."
6. Background/noise condition.
7. A second native speaker.

Record transcript, WER where reference transcripts exist, latency, and whether the intended Bible action was correctly understood.
