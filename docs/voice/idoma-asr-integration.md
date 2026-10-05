# Idoma ASR Integration

## Current backend

Bible Arena already has a protected Supabase Edge Function named `voice-inference`.

It supports these operation names:

- `recognize`
- `understand`
- `synthesize`

The first production recognition path is intentionally scoped to Idoma (`id`).

## Current recognition contract

The authenticated client sends a POST request with:

```json
{
  "operation": "recognize",
  "languageCode": "id",
  "audioReference": "<user-id>/<path-to-audio>"
}
```

The function verifies the caller and ensures the audio reference belongs to the authenticated user before retrieving the private recording.

## Provider boundary

The Edge Function does not fabricate an ASR result. It expects a real provider endpoint through the `IDOMA_ASR_ENDPOINT` environment variable and optional `IDOMA_ASR_TOKEN`.

When no provider is configured, it returns `provider_not_configured` with HTTP 501. This is deliberate: a missing model must never be presented to users as if speech recognition succeeded.

When configured, the provider is expected to return either `transcript` or `text`.

## Model plan

The target first model is a fine-tuned Wav2Vec 2.0 XLS-R Idoma ASR model, trained only from validated native-speaker data. Until that model exists and passes an evaluation set, production recognition should remain explicitly marked as unavailable rather than guessing.

## Data boundary

Only validated language samples should be used to train or tune the ASR model. Evaluation samples must remain isolated from training and tuning.
