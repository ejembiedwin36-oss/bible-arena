# Bible Arena — ASR Deployment Runbook

## Decision

Use Meta's Omnilingual ASR as the first multilingual ASR benchmark/deployment candidate, while retaining the specialist Idoma adapter as a fallback/benchmark candidate.

Current research confirms that the Omnilingual project provides open-source CTC and LLM ASR checkpoints, including 300M/1B/3B/7B variants and unlimited-length LLM variants. The official inference pipeline accepts local audio and supports language conditioning for LLM models.

Idoma uses the language/script code `idu_Latn` in the current Omnilingual language catalogue.

## Recommended first deployment

Start with `omniASR_LLM_300M_v2` or `omniASR_CTC_300M_v2` for a development benchmark where GPU resources are limited. Compare against a larger model if the first model's Idoma accuracy is insufficient.

For language-conditioned inference, pass:

```text
idu_Latn
```

Keep voice commands short during the initial benchmark. The official inference documentation currently limits the standard inference path to audio shorter than 40 seconds and recommends roughly 30 seconds or less.

## Hosting boundary

Do not run the model inside the Supabase Edge Function.

Use this architecture:

```text
Browser
  ↓
Supabase Edge Function
  ↓
Authenticated model-inference service
  ↓
Omnilingual ASR
  ↓
Transcript
```

The Edge Function remains responsible for authentication, validation, authorization and provider routing. The GPU inference service owns the model runtime.

## Required service interface

The inference service should expose a private endpoint accepting:

```json
{
  "languageCode": "idu_Latn",
  "audioReference": "user-id/upload-id.wav"
}
```

and return:

```json
{
  "transcript": "...",
  "confidence": null,
  "model": "omniASR_LLM_300M_v2"
}
```

The model service must fetch audio only through an authenticated mechanism. Do not make the voice bucket public.

## Environment variables

Configure these only on the server:

```text
IDOMA_ASR_ENDPOINT
IDOMA_ASR_TOKEN
IDOMA_ASR_MODEL
```

For the multilingual route, prefer names that are not Idoma-specific once the provider is shared:

```text
OMNI_ASR_ENDPOINT
OMNI_ASR_TOKEN
OMNI_ASR_MODEL
```

## First benchmark sequence

1. Record 10–20 short native-speaker Idoma commands.
2. Store them in the private `voice-audio` bucket.
3. Register each recording as a benchmark case.
4. Send each case through Omnilingual ASR using `idu_Latn`.
5. Record transcript and latency.
6. Calculate WER when a verified reference transcript exists.
7. Convert transcript into Bible intent.
8. Verify whether the intended Bible action was executed.
9. Compare against the specialist Idoma model when available.
10. Do not promote the language to production until native-speaker evaluation passes.

## Important limitation

Model support for a language does not guarantee production-quality recognition for that language. `idu_Latn` being present means the model can be evaluated for Idoma; it does not establish an acceptable accuracy level for Bible Arena.

## Expansion

After Idoma, reuse the same pipeline for other languages supported by the model. Language-specific tuning should be introduced only when benchmark results show that the shared model is insufficient.
