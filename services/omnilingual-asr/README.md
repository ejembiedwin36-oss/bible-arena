# Bible Arena — Omnilingual ASR Service

This service is the planned self-hosted ASR runtime for Bible Arena's multilingual voice layer.

## Why self-hosting

The official Meta Omnilingual ASR checkpoints are open-source, but the current Hugging Face model pages do not provide an inference-provider deployment for the model. Bible Arena therefore keeps the ASR behind its own authenticated backend boundary rather than assuming a hosted API exists.

## Initial target

The first benchmark target is Idoma using the language identifier:

```text
idu_Latn
```

The service should eventually expose a small HTTP API:

```text
POST /v1/transcribe
```

Input:

- audio file
- language code

Output:

```json
{
  "transcript": "...",
  "languageCode": "idu_Latn"
}
```

## Model strategy

Start benchmarking the smaller Omnilingual checkpoint before moving to larger models. Meta documents 300M and 1B variants as well as larger models, with the 300M model listed at about 1.2 GiB FP32 model size. Actual production VRAM and latency must be measured on the selected inference hardware.

Do not mark Idoma voice support as production-ready until native-speaker evaluation passes.

## Next implementation task

Add the Python runtime, model loading, `/v1/transcribe` endpoint, health endpoint, Docker configuration, and benchmark fixture runner. The service must remain provider-independent from the React application.
