# External Idoma Speech Baseline

Bible Arena should evaluate existing Idoma speech models before training a new model from scratch.

## Candidate ASR model

- Model: `mrheartng/wav2vec2-xls-r-1b-finetuned-idoma`
- Task: Idoma automatic speech recognition (speech to text)
- Architecture: Wav2Vec2 XLS-R, approximately 1B parameters
- Reported held-out performance from the model card: WER 11.43%, CER 3.5%
- Access: gated Hugging Face repository; a Hugging Face user must accept its access conditions before model files can be downloaded.
- Hosted inference: the model card currently says it is not deployed by a Hugging Face Inference Provider.

## Candidate TTS model

- Model: `mrheartng/idoma-mms-tts-eng`
- Task: Idoma text to speech
- Architecture: VITS/MMS-TTS, approximately 36.3M parameters
- Reported intelligibility MOS from the model card: 4.36/5
- License shown on the model card: CC BY-NC 4.0. This is a material product-use constraint: do not ship this model in a commercial Bible Arena product without confirming that the intended use complies with the license or obtaining suitable permission.
- Access: gated Hugging Face repository.
- Hosted inference: the model card currently says it is not deployed by a Hugging Face Inference Provider.

## Existing datasets

The same research project publishes Idoma speech datasets including:

- `mrheartng/adah-idoma`
- `mrheartng/idoma-tts-speaker1`
- `mrheartng/idoma-tts-multiple-speakers`

Dataset licensing and consent/provenance must be verified before Bible Arena uses dataset audio for additional training or redistribution.

## Implementation decision

1. Keep Bible Arena's existing consent/review/training pipeline as the long-term improvement path.
2. Do not require a new community recording campaign for the first technical prototype.
3. First benchmark the published ASR model on a small set of Idoma speech that Bible Arena is legally permitted to process.
4. Keep external-model inference behind a provider interface so the model can be replaced without changing the Bible UI.
5. Treat ASR and TTS separately: the ASR candidate and TTS candidate have different model sizes, licenses, deployment requirements, and risks.
6. Do not represent the published WER/CER/MOS as Bible Arena's own metrics until Bible Arena runs an independent evaluation.

## Access requirement

The model repositories require accepting Hugging Face access conditions. Credentials/tokens must be supplied through deployment secrets and must never be committed to Git.
