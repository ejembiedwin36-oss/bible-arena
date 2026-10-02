# Bible Arena ASR GPU Service

This service is the GPU-side inference boundary for multilingual speech recognition.

## Responsibility

- Accept a short audio file and a language code.
- Run a configured Omnilingual ASR checkpoint.
- Return a normalized transcript response.
- Keep model loading and GPU dependencies outside Supabase Edge Functions.

## API contract

`POST /v1/transcribe`

Multipart form fields:

- `audio`: audio file
- `language_code`: language code such as `idu_Latn`

Response:

```json
{
  "transcript": "...",
  "language_code": "idu_Latn",
  "model": "..."
}
```

## Production requirements

Before deployment, configure the model checkpoint and GPU runtime. Do not place provider/model credentials in the browser.

The service must add authentication before public production exposure.
