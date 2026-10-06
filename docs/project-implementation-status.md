# Bible Arena — Complete Implementation History, Current State & Roadmap

**Project:** Bible Arena  
**Repository:** `ejembiedwin36-oss/bible-arena`  
**Supabase project:** `fqsjzjduawcevqlammzm`  
**Current focus:** Multilingual Bible voice infrastructure, beginning with Idoma ASR  
**Document purpose:** A complete record of where we started, what has been designed and implemented, where the project is now, what remains, and what we should do next.

---

## 1. Where We Started

Bible Arena started as an idea for a **modern, premium, multilingual Bible reading and Bible study web application**.

The goal was deliberately larger than a simple Bible reader. The application is intended to become a modular Bible study platform that can grow over time without needing to rebuild its foundation.

The original product direction included:

- Bible reading
- Multiple Bible versions
- Multiple languages
- Scripture search
- Topic search
- Related Scripture discovery
- Verse study
- Bible book background information
- Bookmarks
- Personal notes
- Today's Devotion
- Scripture listening
- AI Bible assistant
- Bible Arena challenges
- Progress tracking
- Future multilingual expansion

The initial language vision includes:

- English
- Idoma
- Igbo
- Yoruba
- Hausa
- Tiv
- Calabar
- Igala

Idoma became the first language used to design and build a serious voice/AI pipeline because it gives the project a concrete multilingual implementation target.

---

## 2. Product Planning Before Implementation

Before implementation, we worked toward the project's core planning documents:

### PRD — Product Requirements Document

The PRD defines what Bible Arena is supposed to become, the users it serves, its major capabilities, and the product direction.

### IRM — Implementation Roadmap

The roadmap breaks the project into implementation phases instead of attempting to build the entire application at once.

### Phase 1 — Technical Architecture Design (TAD)

The first technical phase focused on establishing a scalable architecture before large amounts of application code were written.

The project was intentionally treated as a modular system rather than one large application.

---

## 3. GitHub and Supabase Foundation

We established the project's GitHub and Supabase infrastructure.

### GitHub

Repository:

```text
https://github.com/ejembiedwin36-oss/bible-arena
```

There were connection attempts during the setup period. The repository was deleted and recreated with a README, then GitHub was reconnected successfully so implementation work could continue against the actual repository.

A key project rule was established:

> Implementation work should be pushed to the user's GitHub repository rather than merely described as hypothetical code.

### Supabase

Supabase project:

```text
fqsjzjduawcevqlammzm
```

Supabase is being used for the application's backend/data/security layer, including the protected voice workflow and reviewer/validator infrastructure.

---

# 4. Voice/AI Direction We Established

A major part of the multilingual vision is voice interaction.

We broke the voice pipeline into three major AI capabilities.

## 4.1 ASR — Automatic Speech Recognition

ASR converts spoken language into text.

For Bible Arena's first Idoma voice implementation, the planned ASR model is:

```text
Fine-tuned Wav2Vec 2.0 XLS-R
```

Target base model:

```text
facebook/wav2vec2-xls-r-300m
```

Example flow:

```text
User speaks Idoma
        ↓
Audio recording
        ↓
Protected backend
        ↓
Idoma ASR model
        ↓
Idoma transcript
```

## 4.2 Translation / Understanding

The second layer is intended to support English ↔ Idoma translation and language understanding.

The planned foundation is NLLB-200-based translation/understanding.

This part is **not yet production implemented**.

## 4.3 TTS — Text-to-Speech

TTS converts text back into speech.

The planned Idoma direction uses a VITS/MMS-TTS-style approach.

This part is **not yet production implemented**.

---

# 5. Supabase Voice Backend

A protected Supabase Edge Function named:

```text
voice-inference
```

already exists and is active.

Current characteristics:

- JWT protected
- User authentication required
- Private audio authorization
- Supports three operation categories:
  - `recognize`
  - `understand`
  - `synthesize`

The recognition contract is approximately:

```json
{
  "operation": "recognize",
  "languageCode": "id",
  "audioReference": "<user-id>/<path-to-audio>"
}
```

The backend verifies that the requested audio belongs to the authenticated user before retrieving private audio.

The recognition path expects a real ASR provider through server-side configuration such as:

```text
IDOMA_ASR_ENDPOINT
IDOMA_ASR_TOKEN
```

If the real provider is not configured, the function returns an explicit `provider_not_configured` failure rather than inventing a transcript.

This is an important architectural decision:

> Bible Arena must never pretend that speech recognition succeeded when there is no real model/provider behind it.

---

# 6. Reviewer and Validator Infrastructure

Because a serious language model requires trustworthy training data, we built a review/validation workflow before attempting to train an Idoma model.

Implemented/pushed pieces include:

```text
src/features/ReviewerWorkspace.tsx
src/features/VoiceReviewQueue.tsx
```

Documentation:

```text
docs/voice/reviewer-workspace.md
docs/voice/reviewer-navigation-integration.md
```

Reviewer roles are stored in:

```text
voice_language_reviewer_roles
```

The role system supports:

```text
reviewer
validator
```

Each assignment includes:

- user ID
- language code
- role
- active status

The reviewer workspace checks the signed-in user's active language assignments.

The UI only hides unauthorized languages for usability. **Supabase RLS remains the actual security boundary.**

This means we do not trust the frontend to enforce reviewer permissions.

---

# 7. ASR Eligibility System

We added explicit ASR eligibility fields to:

```text
public.voice_language_evaluation_samples
```

The added fields are:

```text
asr_eligible boolean NOT NULL DEFAULT false
asr_eligible_at timestamptz
asr_eligible_by uuid REFERENCES auth.users(id)
asr_exported_at timestamptz
asr_export_batch_id uuid
```

An index was added around:

```text
language_code
verification_status
asr_eligible
```

for eligible samples.

We also added a protected database function:

```text
public.mark_voice_sample_asr_eligible(target_sample_id uuid)
```

Its purpose is to make eligibility an explicit decision rather than automatically treating every validated sample as training data.

The function requires an active **validator** assignment and only permits samples whose verification status is:

```text
validated
```

It records:

- who approved the sample
- when it was approved

This gives us an auditable chain:

```text
Recorded
   ↓
Reviewed
   ↓
Validated
   ↓
Explicitly ASR eligible
   ↓
Exported into a training batch
```

---

# 8. ASR Dataset Rules

We documented the dataset export rules in:

```text
docs/voice/asr-dataset-export.md
```

The fundamental rule is:

> Only validated and explicitly ASR-eligible samples enter the Idoma ASR training dataset.

The dataset must preserve provenance.

For each sample we want to be able to trace:

- sample ID
- language
- audio reference
- original reviewed transcript
- normalized transcript
- dataset split
- reviewer/validator identity
- timestamps
- eligibility decision
- export batch

The first language is:

```text
Idoma = id
```

---

# 9. Transcript Normalization

We created:

```text
docs/voice/idoma-transcript-normalization.md
```

The purpose is to make training text consistent without changing what the speaker actually said.

Allowed examples include:

- trimming unnecessary surrounding whitespace
- collapsing accidental formatting whitespace
- consistent representation of harmless formatting differences

Not allowed:

- guessing missing words
- translating the transcript during normalization
- deleting meaningful repetitions
- inventing punctuation that changes meaning
- silently correcting uncertain speech into a preferred phrase

The reviewed native transcript remains the source of truth.

---

# 10. Idoma Data Quality Process

We added:

```text
docs/voice/idoma-data-quality-checklist.md
```

The purpose is to prevent poor-quality data from silently entering model training.

The quality process considers things such as:

- valid Idoma language assignment
- usable audio
- correct audio reference
- non-empty native transcript
- human review
- validation
- explicit ASR eligibility
- train/validation/evaluation separation
- auditability

---

# 11. ML Workspace

We created a dedicated machine-learning workspace inside the repository:

```text
ml/idoma-asr/
```

The purpose is to keep model training infrastructure separate from the web application's runtime.

Current structure includes:

```text
ml/idoma-asr/
├── README.md
├── requirements.txt
├── model-registry.json
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
└── docs/
    ├── evaluation-gate.md
    ├── model-release.md
    └── inference-adapter.md
```

---

# 12. ML Dependencies

Current `requirements.txt` includes:

```text
torch
transformers
datasets
evaluate
soundfile
pyyaml
jiwer
accelerate
```

These support:

- PyTorch model execution/training
- Hugging Face Transformers
- Hugging Face datasets
- WER/CER evaluation
- audio loading
- YAML configuration
- JiWER metrics
- training acceleration

---

# 13. Idoma XLS-R Configuration

Configuration file:

```text
ml/idoma-asr/configs/idoma_xlsr.yaml
```

Current architecture target:

```text
facebook/wav2vec2-xls-r-300m
```

Objective:

```text
CTC
```

Sampling rate:

```text
16000 Hz
```

Text target:

```text
nativeTranscript
```

Dataset split model:

```text
training
validation
evaluation
```

Metrics:

```text
WER
CER
```

The evaluation split must remain untouched during training and checkpoint selection.

---

# 14. Dataset Manifest Validation

We created:

```text
scripts/prepare_dataset.py
```

It validates JSONL records and requires fields including:

```text
sampleId
languageCode
audioReference
nativeTranscript
datasetSplit
```

It validates that:

- language is Idoma (`id`)
- transcript is not empty
- split is valid
- audio reference exists as a reference
- invalid records stop the pipeline

It also produces a manifest summary.

---

# 15. Real Audio Preprocessing

We created:

```text
scripts/preprocess_audio.py
```

It is designed to work with real audio only.

Processing includes:

```text
audio
 ↓
load
 ↓
mono
 ↓
16 kHz
 ↓
PCM-16 WAV
```

The script refuses missing or empty audio.

It does not fabricate audio data.

---

# 16. Processor/Vocabulary Preparation

We created:

```text
scripts/prepare_processor.py
```

The purpose is to derive the CTC processor/vocabulary from the real reviewed Idoma training transcripts rather than inventing a vocabulary based on assumptions.

This is important because CTC tokenization must match the model's actual output space.

---

# 17. Dataset Construction

We created:

```text
scripts/build_ctc_dataset.py
```

It builds a Hugging Face dataset from real records.

Each record currently contains the core information needed for feature preparation:

```text
audio
text
sample_id
```

The script refuses missing audio and empty transcripts.

---

# 18. CTC Feature Preparation — Most Recent Implementation

The latest implementation added:

```text
ml/idoma-asr/scripts/prepare_ctc_features.py
```

Git commit:

```text
0e80cabb3fe7e03438d03e78f43fabf6578f8c2c
```

Its job is to convert the raw dataset into the actual model-ready representation:

```text
audio
  ↓
16 kHz validation
  ↓
Wav2Vec2Processor
  ↓
input_values

native transcript
  ↓
Wav2Vec2Processor
  ↓
labels
```

It explicitly rejects audio that is not 16 kHz at this stage.

This was necessary because the CTC training entry point expects `input_values` and `labels`.

---

# 19. Training Bootstrap

We created:

```text
scripts/train.py
```

It is intentionally conservative.

It checks:

- configuration
- training manifest
- validation manifest
- evaluation manifest
- record counts

It supports a dry-run/preparation mode.

It does not silently launch an expensive training job.

This is important because model training may require a GPU environment and carefully selected compute-dependent settings.

---

# 20. Wav2Vec2 CTC Training Entry Point

We created:

```text
scripts/train_ctc.py
```

The script is protected by:

```text
--execute
```

Without `--execute`, it only prepares and reports the environment.

With execution enabled, it is intended to:

1. load the dataset
2. load the processor
3. load Wav2Vec2 XLS-R
4. configure CTC training
5. train
6. save the model
7. save the processor

Important current limitation:

The training path now has the feature-preparation script needed to produce `input_values` and `labels`, but the full training pipeline has not yet been run against a real Idoma dataset and trained checkpoint.

Therefore we do **not** yet claim that an Idoma model has been successfully trained.

---

# 21. Evaluation

We created:

```text
scripts/evaluate.py
scripts/evaluate_ctc.py
```

The CTC evaluator:

- loads a real checkpoint
- loads the isolated evaluation manifest
- loads actual audio
- runs inference
- decodes predictions
- compares predictions against native transcripts
- calculates WER
- calculates CER
- writes a machine-readable evaluation result

The evaluation script refuses to evaluate records that are not marked as part of the evaluation split.

This protects the separation between training data and held-out evaluation data.

---

# 22. Checkpoint Acceptance Gate

We created:

```text
scripts/checkpoint_gate.py
```

A checkpoint is not accepted simply because training completed.

The checkpoint must meet configured WER/CER limits.

The gate reads evaluation metrics and exits successfully only when the configured thresholds are satisfied.

Conceptually:

```text
trained checkpoint
      ↓
evaluation set
      ↓
WER + CER
      ↓
acceptance gate
   ↙       ↘
PASS       FAIL
 ↓           ↓
approve     reject
```

---

# 23. Model Provenance

We created:

```text
scripts/create_model_manifest.py
```

Git commit:

```text
26f69067ef060b34cd939b3038e389d10abbeef6
```

The model manifest records provenance such as:

- model version
- language code
- architecture
- checkpoint path
- dataset batch ID
- Git commit
- training configuration
- evaluation metrics
- model status

The default initial status is:

```text
candidate
```

This makes the trained model traceable to the exact data/configuration/code used to produce it.

---

# 24. Model Release Lifecycle

We created:

```text
docs/model-release.md
```

Git commit:

```text
ff208980550dd4c03bfad4410e8159186ea0f960
```

The intended lifecycle is:

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

A failed model is not deployable.

The web application does not load model weights directly.

Instead:

```text
Bible Arena frontend
       ↓
Supabase voice-inference
       ↓
versioned inference service
       ↓
Idoma ASR model
```

Rollback is achieved by switching the active model version rather than rebuilding the frontend.

---

# 25. Model Registry

We created:

```text
ml/idoma-asr/model-registry.json
```

Git commit:

```text
0af99d24d09926af0e9303ed7321616ee33760e9
```

Current registry:

```json
{
  "language_code": "id",
  "active_model_version": null,
  "models": []
}
```

The `null` value is intentional.

There is currently **no real trained Idoma model** that has passed the evaluation and release gates.

We must not invent an active model version.

---

# 26. Inference Adapter Contract

We also added:

```text
ml/idoma-asr/docs/inference-adapter.md
```

The adapter defines the boundary between Bible Arena's protected Supabase function and the eventual Idoma model service.

The contract covers:

- language code
- audio reference
- model version
- transcript
- confidence
- provider errors
- timeouts
- unavailable models
- invalid responses
- rollback
- security

The key principle is:

> The frontend should know that it wants Idoma recognition; it should not know where or how the Idoma model is hosted.

---

# 27. Current Architecture

The system now looks conceptually like this:

```text
                         BIBLE ARENA
                              │
                              ▼
                     Multilingual Frontend
                              │
                              ▼
                    Protected Supabase API
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
             recognize    understand   synthesize
                 │            │            │
                 ▼            │            │
          Idoma ASR adapter  │            │
                 │            │            │
                 ▼            ▼            ▼
          Idoma XLS-R     NLLB plan     MMS/VITS plan
                 │
                 ▼
          Idoma transcript
```

The current production-ready boundary is the protected Supabase function.

The actual Idoma model is still a separate ML workload.

---

# 28. Current Status — Where We Are Now

## Completed

```text
Product concept                         ✅
PRD direction                           ✅
Implementation roadmap                  ✅
Phase 1 architecture direction          ✅
GitHub repository                       ✅
Supabase project                        ✅
Protected voice-inference function      ✅
Reviewer workspace                      ✅
Reviewer/validator roles               ✅
Voice review queue                      ✅
ASR eligibility schema                  ✅
Validator-only eligibility function     ✅
ASR dataset rules                       ✅
Transcript normalization rules          ✅
Idoma data quality checklist            ✅
ASR manifest validation                 ✅
Audio preprocessing                     ✅
Processor/vocabulary preparation        ✅
CTC dataset construction                ✅
CTC feature preparation                 ✅
Training bootstrap                      ✅
CTC training entry point                ⚠️
WER/CER evaluation                      ✅
Checkpoint gate                         ✅
Model provenance manifest               ✅
Model release lifecycle                 ✅
Model registry                          ✅
Inference adapter contract              ✅
```

## Not yet completed

```text
Real Idoma training dataset export     ⏳
Actual GPU training                    ⏳
Real Idoma XLS-R checkpoint             ⏳
WER/CER results from real model         ⏳
Approved Idoma model                   ⏳
Deployed Idoma inference endpoint      ⏳
Supabase production adapter wiring     ⏳
NLLB English ↔ Idoma                   ⏳
Idoma TTS                               ⏳
Full Bible Arena application            ⏳
```

---

# 29. What We Have Ahead of Us

The remaining work should be approached in controlled stages.

## Stage A — Finish the Idoma ASR training pipeline

Tasks:

1. Export real ASR-eligible Idoma samples.
2. Create training/validation/evaluation manifests.
3. Preprocess the real audio.
4. Prepare the processor from real training transcripts.
5. Build the Hugging Face dataset.
6. Run CTC feature preparation.
7. Run a dry-run of the training pipeline.
8. Configure compute-dependent training parameters.
9. Run real training in a suitable GPU environment.
10. Save checkpoints.

## Stage B — Evaluate the model

Tasks:

1. Select candidates using validation data only.
2. Run the final candidate against the untouched evaluation split.
3. Calculate WER.
4. Calculate CER.
5. Run the checkpoint gate.
6. Reject models that fail the gate.
7. Create the model provenance manifest for the passing model.

## Stage C — Release the model

Tasks:

1. Assign a real model version.
2. Change model registry from empty to the real candidate.
3. Mark it approved after the evaluation gate passes.
4. Deploy the model service.
5. Configure the Supabase inference adapter.
6. Test authentication and private-audio authorization.
7. Test timeout/error handling.
8. Test model-version selection.
9. Test rollback.
10. Only then mark the model active.

## Stage D — Connect the frontend

The frontend should call the protected backend instead of talking directly to the model.

Expected flow:

```text
User presses microphone
        ↓
Browser records audio
        ↓
Private storage
        ↓
voice-inference
        ↓
Idoma ASR adapter
        ↓
Idoma model
        ↓
transcript
        ↓
Bible Arena UI
```

## Stage E — Translation and Understanding

After ASR is reliable, implement the NLLB-based layer.

Potential flow:

```text
Idoma speech
    ↓
Idoma ASR
    ↓
Idoma text
    ↓
NLLB translation/understanding
    ↓
English / structured intent
    ↓
Bible search or AI Bible assistant
```

This should come after reliable transcription rather than being built on unverified speech recognition.

## Stage F — Idoma TTS

Then implement:

```text
Bible response
     ↓
Idoma text
     ↓
Idoma TTS
     ↓
spoken Idoma
```

TTS also needs its own evaluation and release process.

## Stage G — Expand to additional languages

Once Idoma becomes the reference architecture, reuse the same pattern for:

- Igbo
- Yoruba
- Hausa
- Tiv
- Calabar
- Igala
- English

The architecture should make language-specific models replaceable without changing the overall application design.

---

# 30. What We Should NOT Do Yet

We should not:

- claim that an Idoma model is trained when it is not;
- put a fake model version in the registry;
- fabricate transcripts for testing production behavior;
- expose model-provider credentials to the browser;
- bypass reviewer/validator controls;
- mix evaluation data into training;
- select the final model using the held-out evaluation set;
- connect the frontend directly to private model infrastructure;
- mark a model active before it passes the evaluation gate;
- build translation quality on top of unreliable ASR;
- assume an inexpensive CPU environment is sufficient for large-model training.

---

# 31. The Immediate Next Task

The immediate technical next step is:

## Run and verify the complete Idoma CTC preparation pipeline with real data.

The order is:

```text
ASR-eligible samples
        ↓
training / validation / evaluation manifests
        ↓
audio preprocessing
        ↓
processor preparation
        ↓
CTC dataset construction
        ↓
CTC feature preparation
        ↓
training dry-run
        ↓
GPU training
```

We should first prove that every preparation stage works with real records before starting an expensive training run.

After that, the next major implementation is the **production inference adapter wiring** inside the protected `voice-inference` Edge Function.

---

# 32. Simple Project Timeline

```text
IDEA
 │
 ▼
Bible Arena product vision
 │
 ▼
PRD + implementation roadmap
 │
 ▼
Technical architecture
 │
 ▼
GitHub + Supabase foundation
 │
 ▼
Voice architecture
 │
 ▼
Reviewer / validator system
 │
 ▼
ASR eligibility + audit trail
 │
 ▼
Idoma dataset rules
 │
 ▼
Audio + transcript preparation
 │
 ▼
Wav2Vec2 XLS-R ML workspace
 │
 ▼
CTC feature pipeline              ← CURRENT IMPLEMENTATION STAGE
 │
 ▼
Real training
 │
 ▼
WER/CER evaluation
 │
 ▼
Checkpoint gate
 │
 ▼
Model release
 │
 ▼
Production inference adapter
 │
 ▼
Bible Arena voice experience
 │
 ▼
NLLB translation / understanding
 │
 ▼
Idoma TTS
 │
 ▼
Additional languages
 │
 ▼
Full multilingual Bible Arena
```

---

# 33. Key Git Commits from the Current ML Work

Important implementation commits recorded during this phase include:

| Commit | Purpose |
|---|---|
| `26f69067ef060b34cd939b3038e389d10abbeef6` | Add model provenance manifest tooling |
| `ff208980550dd4c03bfad4410e8159186ea0f960` | Add model release lifecycle documentation |
| `0af99d24d09926af0e9303ed7321616ee33760e9` | Add model registry |
| `0e80cabb3fe7e03438d03e78f43fabf6578f8c2c` | Add real Idoma CTC feature preparation |

Earlier repository commits also contain the reviewer workspace, ASR eligibility schema, data-quality documentation, ML bootstrap, processor preparation, dataset construction, evaluation, and checkpoint-gate work.

---

# 34. Final Position

Bible Arena has moved beyond the idea stage.

We now have the beginnings of a real multilingual Bible platform architecture and a controlled Idoma voice-data/model pipeline.

The most important thing we have accomplished is not simply creating scripts. We have created **boundaries and quality controls** around the future AI system:

```text
Human review
   ↓
Human validation
   ↓
Explicit ASR eligibility
   ↓
Auditable dataset
   ↓
Controlled preprocessing
   ↓
Reproducible training
   ↓
Independent evaluation
   ↓
WER/CER gate
   ↓
Versioned model release
   ↓
Protected inference API
   ↓
Bible Arena
```

That is the foundation we will use to build the rest of the multilingual Bible Arena system safely and systematically.
