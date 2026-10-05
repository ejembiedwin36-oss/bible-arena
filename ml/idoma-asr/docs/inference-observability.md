# Idoma ASR Inference Observability

Every production recognition request should be traceable without logging sensitive audio or unnecessary personal data.

Record safe operational metadata such as:

- request ID;
- model version;
- language code;
- success/failure category;
- latency in milliseconds;
- retry count;
- timestamp;
- application release version.

Do not log raw audio, authentication tokens, private storage credentials, or signed URLs.

Monitor at least:

- recognition success rate;
- timeout rate;
- model error rate;
- median and p95 latency;
- failures by model version.

These metrics allow Bible Arena to detect a bad model release and roll back without exposing user recordings.
