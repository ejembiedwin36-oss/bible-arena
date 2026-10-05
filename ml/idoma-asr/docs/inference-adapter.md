# Idoma ASR Inference Adapter

## Purpose

Define the stable boundary between Bible Arena's protected `voice-inference` function and the versioned Idoma ASR model service.

## Request

```json
{
  "languageCode": "id",
  "audioReference": "authorized/private/audio/path",
  "modelVersion": "idoma-asr-v1"
}
```

The adapter receives an audio reference only after the Supabase function has authenticated the user and authorized access to that recording.

## Successful response

```json
{
  "languageCode": "id",
  "modelVersion": "idoma-asr-v1",
  "transcript": "verified model output",
  "confidence": 0.0
}
```

Confidence is a model signal, not proof that the transcript is correct.

## Failure handling

The adapter must distinguish invalid request, unsupported language, model not configured, model unavailable, timeout, audio retrieval failure, inference failure, and invalid model response.

It must never convert an error into an empty or fabricated transcript.

## Versioning and rollback

The active model version must be explicit in backend configuration or the model registry. Switching from version A to B, or rolling back to A, must not require a frontend release.

## Security

Provider tokens, internal model URLs, storage credentials, and signed audio URLs must never be exposed to the browser. Keep them inside the protected backend/inference environment.
