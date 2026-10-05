# Idoma ASR Model Contract

## Purpose

Keep the Bible Arena application independent from the implementation details of the Idoma speech-recognition model.

## Input

```json
{
  "languageCode": "id",
  "audioReference": "private/path/to/audio"
}
```

The inference service is responsible for retrieving private audio after authenticating and authorizing the request.

## Output

Successful recognition should return a shape equivalent to:

```json
{
  "languageCode": "id",
  "transcript": "<verified-model-output>",
  "confidence": 0.0
}
```

`confidence` is optional and must not be treated as proof of correctness. It is a model signal only.

## Failure states

The service should distinguish at least:

- `provider_not_configured`
- `audio_not_found`
- `unsupported_language`
- `model_error`
- `invalid_request`

The client must never display a fabricated transcript when inference fails.

## Versioning

Every production model should have a model identifier/version. The inference response and server logs should make it possible to identify which model produced a transcript.

## Security

The model endpoint must not be publicly callable with arbitrary storage paths. The Supabase Edge Function remains the authorization boundary for user recordings.
