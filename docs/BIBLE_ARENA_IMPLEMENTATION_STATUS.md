# Bible Arena — Implementation Status & Roadmap

> **Project status:** Active implementation
>
> **Repository:** `ejembiedwin36-oss/bible-arena`
>
> **Default branch:** `main`
>
> **Current technical focus:** Protected multilingual voice pipeline, beginning with Idoma ASR.
>
---

## 1. Where We Started

Bible Arena started as a product idea for a **modern, premium, multilingual Bible reading and Bible study platform** rather than a simple Bible reader.

The original vision included:

- Bible reading
- Multiple Bible versions
- Multiple languages
- Bible search
- Topic search
- Related Scripture discovery
- Verse study
- Bible book background and context
- Bookmarks
- Personal notes
- Today's Devotion
- Scripture listening
- AI Bible assistant
- Bible Arena challenges
- Progress tracking
- A scalable architecture that can support additional languages and features later

The multilingual vision includes English and Nigerian languages such as:

- Idoma
- Igbo
- Yoruba
- Hausa
- Tiv
- Calabar
- Igala

The project was then organized into a structured product and engineering process:

1. Product Requirements Document (PRD)
2. Implementation Roadmap (IRM)
3. Phase 1 — Technical Architecture Design (TAD)
4. Incremental implementation
5. Real data and real model integrations instead of fabricated/demo AI results

---

## 2. Repository & Infrastructure

The GitHub repository is:

`ejembiedwin36-oss/bible-arena`

The repository is now connected and actively receiving implementation commits.

The repository is a TypeScript project and currently uses `main` as the default branch.

The deployed project currently has a Vercel homepage configured in the repository metadata.

Supabase project used for the backend:

`fqsjzjduawcevqlammzm`

Supabase is being used for protected backend functionality, database policies, storage access, and Edge Functions.

---

# 3. Product Architecture We Have Established

Bible Arena is being built as a modular system instead of putting everything into one large application component.

The important architectural idea is:

```text
Bible Arena Web App
        |
        +---------------- Bible reading/study features
        |
        +---------------- Search/discovery
        |
        +---------------- Notes/bookmarks/progress
        |
        +---------------- Voice interface
                              |
                              v
                       Supabase backend
                              |
              +---------------+---------------+
              |                               |
              v                               v
        Protected storage             Voice inference
                                              |
                            +-----------------+-----------------
                            |                 |                 |
                            v                 v                 v
                           ASR          Translation          TTS
                         (Idoma)       (future NLLB)      (future MMS/VITS)
```

The important boundary is that the browser should **not directly control or access private model infrastructure**.

---

# 4. Voice Pipeline — What We Have Done

A major part of the current implementation is the multilingual voice architecture.

The pipeline is intentionally separated into three major AI capabilities:

## 4.1 ASR — Automatic Speech Recognition

ASR converts spoken language into text.

For the first Nigerian-language implementation, we selected:

**Fine-tuned Wav2Vec 2.0 XLS-R for Idoma.**

The intended flow is:

```text
User speaks Idoma
      ↓
Audio recording
      ↓
Private storage
      ↓
Authenticated voice-inference backend
      ↓
Idoma XLS-R ASR model
      ↓
Idoma transcript
```

The system must use a real trained model when production recognition is enabled. It must never pretend to recognize speech when the model is not configured.

## 4.2 Translation / Understanding

The planned second layer uses an NLLB-200-based approach for language translation and understanding.

The goal is to support workflows such as:

```text
Idoma speech
   ↓
Idoma transcript
   ↓
Idoma → English understanding/translation
   ↓
Bible Arena intent/query
```

This part is planned but is not yet the active production implementation.

## 4.3 TTS — Text-to-Speech

The planned third layer uses an Idoma-capable TTS model, with VITS/MMS-TTS as the model family direction.

The intended flow is:

```text
Bible Arena response
      ↓
Idoma text
      ↓
Idoma TTS model
      ↓
Generated speech
      ↓
User hears response
```

This is planned and has not yet been promoted to production.

---

# 5. Protected Supabase Voice Backend

A Supabase Edge Function named:

`voice-inference`

has been established.

It is JWT-protected.

The supported operation structure includes:

- `recognize`
- `understand`
- `synthesize`

The recognition request is approximately:

```json
{
  "operation": "recognize",
  "languageCode": "id",
  "audioReference": "<user-id>/<path-to-audio>"
}
```

The backend authenticates the caller and verifies that the requested audio belongs to that user before retrieving private audio.

The recognition path expects a real ASR provider through server-side configuration such as:

- `IDOMA_ASR_ENDPOINT`
- optional `IDOMA_ASR_TOKEN`

If the provider is not configured, the function returns an explicit configuration error instead of fabricating a transcript.

This is an important production safety rule.

---

# 6. Reviewer Workspace

A reviewer/validator workflow was added for language data quality.

Files include:

- `src/features/ReviewerWorkspace.tsx`
- `src/features/VoiceReviewQueue.tsx`
- `docs/voice/reviewer-workspace.md`
- `docs/voice/reviewer-navigation-integration.md`

The system distinguishes language reviewers and validators.

Reviewer assignments are stored in:

`voice_language_reviewer_roles`

Important fields include:

- `user_id`
- `language_code`
- `role`
- `active`

Supported reviewer roles currently include:

- `reviewer`
- `validator`

The workspace only shows active language assignments for the signed-in user.

The UI is not considered the security boundary. Database RLS remains the real authorization boundary.

---

# 7. Voice Evaluation Sample / ASR Eligibility System

The database table:

`public.voice_language_evaluation_samples`

was extended with ASR eligibility/provenance fields:

```text
asr_eligible
asr_eligible_at
asr_eligible_by
asr_exported_at
asr_export_batch_id
```

An index was added for eligible Idoma/validated samples so dataset selection can remain efficient.

A security-definer database function was also added:

`public.mark_voice_sample_asr_eligible(target_sample_id uuid)`

The function requires an active validator role.

A sample can only become ASR-eligible when its verification status is already:

`validated`

The function records:

- validator identity
- eligibility timestamp

This prevents the ASR training dataset from being built from unreviewed material.

---

# 8. ASR Dataset Rules

The ASR dataset process is documented in:

`docs/voice/asr-dataset-export.md`

The fundamental rule is:

```text
validated + explicitly ASR-eligible
                    ↓
             ASR dataset
```

Not every collected recording automatically becomes training data.

The system preserves audit information such as:

- original reviewed transcript
- normalized transcript
- reviewer identity
- validator identity
- timestamps
- eligibility decision
- dataset split

The initial ASR language is:

`id` = Idoma

---

# 9. Idoma Transcript Normalization

Documentation was added for transcript normalization.

Normalization may perform safe formatting operations such as:

- trimming surrounding whitespace
- collapsing accidental formatting whitespace
- normalizing formatting where explicitly defined

Normalization must **not**:

- guess missing words
- translate the transcript
- invent words
- remove meaningful repetitions
- silently change the meaning
- fabricate punctuation

The native reviewed transcript remains the source of truth.

---

# 10. Idoma Data Quality Checklist

A dedicated checklist was added:

`docs/voice/idoma-data-quality-checklist.md`

The purpose is to make sure data entering the model-training pipeline is real, reviewed, usable, and traceable.

This includes checks around:

- language identity
- transcript quality
- audio availability
- audio quality
- validation status
- ASR eligibility
- split assignment
- auditability

---

# 11. ASR Training Environment Documentation

The project contains:

`docs/voice/idoma-asr-training-environment.md`

This documents the expected environment for the actual model-training phase.

The web application itself is not expected to train the model.

The ML workspace is separated from the web application so that:

```text
Web application
      ≠
Model training environment
```

Training should happen in an appropriate compute environment, especially because XLS-R 300M training can require significant GPU resources.

---

# 12. Idoma ASR Training Specification

Added documentation:

`docs/voice/idoma-asr-training-spec.md`

The selected base model is:

`facebook/wav2vec2-xls-r-300m`

The objective is:

**CTC speech recognition**

Target sampling rate:

`16,000 Hz`

Target text:

`nativeTranscript`

Dataset split structure:

```text
training
validation
evaluation
```

The evaluation split must remain isolated from training and checkpoint selection.

---

# 13. ML Workspace

The Idoma ASR ML workspace now lives under:

`ml/idoma-asr/`

It includes:

```text
ml/idoma-asr/
├── README.md
├── requirements.txt
├── configs/
│   └── idoma_xlsr.yaml
├── scripts/
│   ├── prepare_dataset.py
│   ├── preprocess_audio.py
│   ├── prepare_processor.py
│   ├── build_ctc_dataset.py
│   ├── prepare_ctc_features.py
│   ├── train.py
│   ├── train_ctc.py
│   ├── evaluate.py
│   ├── evaluate_ctc.py
│   ├── checkpoint_gate.py
│   └── create_model_manifest.py
├── docs/
│   ├── evaluation-gate.md
│   ├── model-release.md
│   └── inference-adapter.md
└── model-registry.json
```

---

# 14. Dataset Manifest Validation

`prepare_dataset.py` validates the dataset manifest.

Required information includes:

- `sampleId`
- `languageCode`
- `audioReference`
- `nativeTranscript`
- `datasetSplit`

The script rejects:

- wrong language
- missing transcript
- empty transcript
- invalid split
- missing audio reference
- invalid records

It also produces a manifest summary.

---

# 15. Real Audio Preprocessing

`preprocess_audio.py` prepares real recordings for training.

It:

- loads real audio
- converts audio to mono
- resamples to 16 kHz
- writes PCM-16 WAV output
- stops if audio is missing or empty

It does **not** fabricate audio.

---

# 16. Processor / Vocabulary Preparation

`prepare_processor.py` prepares the CTC processor from real reviewed Idoma transcripts.

The important design decision is that the vocabulary comes from actual project data rather than being guessed in advance.

---

# 17. CTC Dataset Builder

`build_ctc_dataset.py` converts validated records into a Hugging Face Dataset containing the basic training information:

```text
audio
text
sample_id
```

It refuses to build an empty dataset and checks that every referenced audio file exists.

---

# 18. CTC Feature Preparation — Just Completed

We just added:

`ml/idoma-asr/scripts/prepare_ctc_features.py`

This is the latest implementation step.

It converts the basic dataset into model-ready CTC features using the real Wav2Vec2 processor.

It creates:

- `input_values`
- `labels`

It explicitly requires:

`16,000 Hz`

It also handles stereo audio by converting it to mono.

The new Git commit is:

`0e80cabb3fe7e03438d03e78f43fabf6578f8c2c`

This step closes an important gap that existed between the dataset builder and the CTC training script.

---

# 19. Training Bootstrap

`train.py` was created as a safe training bootstrap.

It checks:

- configuration
- dataset manifests
- split availability
- record counts

It supports a dry-run style workflow and refuses to silently start a training job when required data is missing.

---

# 20. CTC Training Entry Point

`train_ctc.py` was created for the real Wav2Vec2 XLS-R CTC training path.

It is deliberately protected by:

`--execute`

Without `--execute`, it only prepares/checks the training environment.

This prevents an accidental expensive GPU training run.

The intended model is:

`facebook/wav2vec2-xls-r-300m`

The training script uses separate training and validation datasets and does not use the held-out evaluation split for normal checkpoint selection.

Now that `prepare_ctc_features.py` exists, the next work is to wire the prepared dataset cleanly into this training command and verify the collator/trainer path.

---

# 21. Evaluation Pipeline

`evaluate_ctc.py` evaluates a real checkpoint against the isolated evaluation split.

It calculates:

- WER — Word Error Rate
- CER — Character Error Rate

The evaluation script refuses to accept non-evaluation samples in the evaluation manifest.

The output is written as JSON so the result can become part of model provenance.

---

# 22. Checkpoint Acceptance Gate

`checkpoint_gate.py` was added to prevent a model from being accepted simply because training completed.

The checkpoint must satisfy configured limits for:

- WER
- CER

The model should only proceed to release when the metrics pass the defined gate.

---

# 23. Model Provenance

`create_model_manifest.py` was added.

The model manifest records important provenance such as:

- model version
- language code
- architecture
- checkpoint path
- dataset batch ID
- Git commit
- training configuration
- evaluation metrics
- model status

The latest known model manifest implementation commit was:

`26f69067ef060b34cd939b3038e389d10abbeef6`

---

# 24. Model Release Lifecycle

`ml/idoma-asr/docs/model-release.md` defines the release lifecycle:

```text
candidate
   ↓
evaluation passed
   ↓
approved
   ↓
deployed
   ↓
active
```

A model must not become approved unless it passes evaluation on the untouched evaluation set.

Rollback is based on the explicit active model version.

The web application should call the inference backend rather than loading model weights directly in the browser.

---

# 25. Model Registry

`ml/idoma-asr/model-registry.json` was added.

Current registry state:

```json
{
  "language_code": "id",
  "active_model_version": null,
  "models": []
}
```

This is intentional.

There is currently **no real trained Idoma model** that should be marked active.

We must not invent a model version just to make the registry look complete.

---

# 26. Inference Adapter Contract — Just Added

We just added:

`ml/idoma-asr/docs/inference-adapter.md`

This defines the stable contract between the protected Supabase `voice-inference` function and the eventual Idoma ASR model service.

The adapter defines:

- request shape
- successful response shape
- error categories
- timeout behavior
- model versioning
- rollback expectations
- security requirements

The goal is that the frontend does not need to know which model provider is being used.

---

# 27. Current State

The project currently looks like this:

| Area | Status |
|---|---|
| Product vision | Done |
| PRD / product direction | Done |
| Implementation roadmap | Done |
| Phase 1 architecture direction | Done |
| GitHub repository | Connected |
| Supabase backend | Connected |
| Protected voice Edge Function | Done |
| Reviewer workspace | Done |
| Reviewer roles | Done |
| ASR eligibility workflow | Done |
| ASR dataset rules | Done |
| Idoma transcript normalization | Done |
| Idoma data-quality checklist | Done |
| Training environment documentation | Done |
| XLS-R training specification | Done |
| ML workspace | Done |
| Dataset manifest validation | Done |
| Audio preprocessing | Done |
| Processor preparation | Done |
| Basic CTC dataset builder | Done |
| CTC feature preparation | **Done — latest step** |
| Training bootstrap | Done |
| CTC training entry point | In progress / needs wiring verification |
| WER/CER evaluation | Done |
| Checkpoint gate | Done |
| Model provenance | Done |
| Model release lifecycle | Done |
| Model registry | Done |
| Inference adapter contract | Done |
| Real trained Idoma checkpoint | **Not yet available** |
| Production Idoma inference | Not yet active |
| NLLB translation | Not yet implemented |
| Idoma TTS | Not yet implemented |

---

# 28. Where We Are Now

We are no longer at the stage of merely discussing the Idoma ASR idea.

We have built the surrounding engineering system needed to safely train, evaluate, release, and eventually serve the model.

The current position is:

```text
REAL REVIEWED DATA
        ↓
VALIDATED SAMPLES
        ↓
ASR ELIGIBILITY
        ↓
DATASET MANIFEST
        ↓
AUDIO PREPROCESSING
        ↓
PROCESSOR / VOCABULARY
        ↓
CTC DATASET
        ↓
CTC FEATURES              ← WE JUST REACHED HERE
        ↓
TRAIN XLS-R
        ↓
EVALUATE WER/CER
        ↓
CHECKPOINT GATE
        ↓
MODEL MANIFEST
        ↓
APPROVE
        ↓
DEPLOY
        ↓
ACTIVE MODEL
        ↓
PROTECTED voice-inference
        ↓
BIBLE ARENA
```

---

# 29. What Is Still Ahead

## Phase A — Finish the Idoma ASR training pipeline

1. Verify `prepare_ctc_features.py` against a real prepared dataset.
2. Verify the CTC data collator.
3. Update `train_ctc.py` to consume prepared `input_values` and `labels`.
4. Add proper evaluation during training using the validation split.
5. Confirm checkpoint saving and resumption.
6. Run a small smoke test before a full GPU run.
7. Run real Idoma training when enough eligible data and compute are available.

## Phase B — Evaluate the trained model

1. Run the untouched evaluation set.
2. Calculate WER.
3. Calculate CER.
4. Inspect representative errors.
5. Apply the checkpoint gate.
6. Reject models that fail the gate.
7. Produce the model provenance manifest.

## Phase C — Model release

1. Create a real model version.
2. Add it to the registry as `candidate`.
3. Mark `approved` only after passing evaluation.
4. Deploy the model service.
5. Test the inference adapter.
6. Mark it `deployed`.
7. Promote it to `active` only after production verification.

## Phase D — Connect production Idoma ASR

1. Configure the real `IDOMA_ASR_ENDPOINT`.
2. Configure the server-side token if required.
3. Connect `voice-inference` to the adapter.
4. Test authenticated audio retrieval.
5. Test timeout handling.
6. Test provider failure handling.
7. Test model-version selection.
8. Test rollback.

## Phase E — NLLB translation/understanding

After ASR is reliable:

```text
Idoma speech
 ↓
Idoma transcript
 ↓
NLLB translation / language understanding
 ↓
Bible query / intent
```

This should be implemented only after the ASR boundary is stable.

## Phase F — Idoma TTS

Build the response path:

```text
Bible answer
 ↓
Idoma response text
 ↓
Idoma TTS
 ↓
audio response
 ↓
user
```

The TTS service must also have explicit versioning, health checks, timeouts, and rollback behavior.

## Phase G — Full Bible Arena voice experience

Eventually:

```text
User speaks
   ↓
ASR
   ↓
Language understanding
   ↓
Bible search / Bible assistant
   ↓
Answer
   ↓
Optional translation
   ↓
Optional Idoma TTS
   ↓
User hears response
```

---

# 30. What We Should Do Next

The immediate next task is **not** to train a fake/demo model and it is **not** to jump straight into TTS.

The next engineering task is:

### Step 1 — Finish the CTC training wiring

Connect:

```text
prepare_ctc_features.py
          ↓
train_ctc.py
```

The training script must consume the generated `input_values` and `labels` correctly.

### Step 2 — Add/verify the proper CTC data collator

The collator should:

- pad input audio sequences
- pad labels
- convert padded label positions to `-100`
- return tensors suitable for Wav2Vec2ForCTC

### Step 3 — Run a safe smoke test

Before spending GPU time:

```text
manifest
 ↓
audio preprocessing
 ↓
processor
 ↓
CTC features
 ↓
small dataset load
 ↓
one training batch
```

### Step 4 — Only then run real training

Real training requires:

- sufficient validated Idoma data
- correct training/validation/evaluation splits
- suitable GPU compute
- reproducible configuration

### Step 5 — Evaluate before production

No model becomes active until:

```text
WER/CER evaluation
       ↓
checkpoint gate
       ↓
provenance manifest
       ↓
approval
```

### Step 6 — Connect the approved model to Supabase

Only after a real checkpoint exists should we configure:

`IDOMA_ASR_ENDPOINT`

and complete production inference.

---

# 31. The Big Picture

The project is deliberately being built in this order:

```text
PRODUCT
  ↓
ARCHITECTURE
  ↓
SECURITY
  ↓
DATA COLLECTION
  ↓
REVIEW
  ↓
VALIDATION
  ↓
DATASET GOVERNANCE
  ↓
ML PIPELINE
  ↓
TRAINING
  ↓
EVALUATION
  ↓
MODEL GOVERNANCE
  ↓
INFERENCE
  ↓
TRANSLATION
  ↓
TTS
  ↓
FULL MULTILINGUAL BIBLE EXPERIENCE
```

That order is intentional.

We are building the foundation first so that Bible Arena can eventually support additional languages without rebuilding the whole system.

---

# 32. Important Rules We Must Keep

1. Never fabricate Bible data, audio, transcripts, or model results.
2. Never treat UI hiding as a security boundary.
3. Keep Supabase RLS as the database authorization boundary.
4. Keep model infrastructure behind protected backend services.
5. Never expose provider tokens to the browser.
6. Keep evaluation data isolated from training.
7. Never approve a model without real WER/CER evaluation.
8. Keep model versions traceable to their dataset and Git commit.
9. Keep rollback possible.
10. Do not mark a model active until a real model exists and passes the release gate.
11. Preserve reviewed transcripts for auditability.
12. Do not let normalization silently change the meaning of Idoma speech.
13. Build language support as modular infrastructure so more Nigerian languages can be added later.

---

# 33. Current Latest Implementation Commit

The most recent implementation step added CTC feature preparation:

`0e80cabb3fe7e03438d03e78f43fabf6578f8c2c`

The project is therefore currently positioned immediately before final CTC training wiring and the first real training smoke test.

---

## Final Status

**Bible Arena is in active Phase 1/ML infrastructure implementation.**

The surrounding architecture, governance, review workflow, dataset preparation, evaluation, model release, and inference boundary are substantially defined.

The next concrete engineering milestone is:

> **Finish the Wav2Vec2 XLS-R CTC training pipeline, run a safe smoke test, then train and evaluate the first real Idoma checkpoint.**
