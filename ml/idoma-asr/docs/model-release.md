# Idoma ASR Model Release Process

A checkpoint becomes a production candidate only after it passes the evaluation gate.

## Release identity

Every candidate receives:

- a model version;
- the exact training Git commit;
- the ASR dataset export batch ID;
- the training configuration;
- WER and CER results;
- the checkpoint/artifact identifier.

## Release states

`candidate` → evaluation passed → `approved` → deployed → `active`

A failed evaluation remains rejected and must not be deployed.

## Deployment boundary

The Bible Arena web application must never load model weights directly.

Instead:

```
Bible Arena
    ↓
Supabase voice-inference
    ↓
authorized inference endpoint
    ↓
versioned Idoma ASR model
```

This keeps model infrastructure replaceable and keeps storage authorization inside the application backend.

## Rollback

The active model version must be explicit so that a bad release can be replaced by the previous approved version without changing the web application.

## No fake readiness

A release manifest must never mark a model `approved` unless the checkpoint has actually passed the configured WER/CER gate on the untouched evaluation set.
