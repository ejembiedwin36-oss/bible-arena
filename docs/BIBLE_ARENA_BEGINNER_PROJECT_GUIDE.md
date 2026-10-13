# Bible Arena — Beginner Project Guide, Build Story, Challenges & Learning Notes

> **Living document:** This file is intentionally updated while Bible Arena is being built. It is not the final documentation yet. At project completion it should explain the product, architecture, every important file, major decisions, challenges, questions/answers, confusing moments, deployment, testing, and how a beginner can understand and continue the project.

## 1. What Bible Arena Is

Bible Arena is a multilingual Bible reading, Bible study, devotional, learning, challenge, audio, and AI-assisted Scripture web application. Its central mission is to reduce language barriers so people can read, study, search, listen to, and interact with Scripture in languages they understand.

The working product name is **Bible Arena** and can be changed later without rebuilding the application.

Bible Arena is not intended to be only an English Bible reader. Local-language text and local-language voice are core product requirements. **Idoma is the first major local-language priority.** Planned language coverage includes English, Idoma, Igbo, Yoruba, Hausa, Tiv, Igala, and Efik/Calabar/Cross River coverage.

## 2. Problems Bible Arena Is Trying to Solve

1. Language barriers can make Bible reading and study harder for people who understand local languages better than English.
2. Bible reading, study tools, devotionals, audio, challenges, notes, search, and AI assistance are often separated across different products.
3. Many local languages have much less speech-recognition and digital-language support than major world languages.
4. Users should be able to ask Bible-related questions without AI-generated wording being confused with the actual biblical text.
5. Bible translations and audio are copyrighted/licensed resources, so a serious Bible product must obtain legitimate access rather than scrape copyrighted material.

## 3. Main Product Vision

Bible Arena should eventually support:

- Normal Bible reading.
- Multiple Bible versions.
- Multiple languages.
- Bible search.
- Topic search and related Scripture.
- Verse study and breakdown.
- Background information for Bible books.
- Bookmarks and personal notes.
- Daily devotionals.
- Scripture audio.
- Scripture-grounded AI assistance.
- Bible Arena challenges.
- Reading/study progress.
- Local-language text and speech.

A key architectural rule is that **Bible language and Bible version are different concepts**. A language such as Idoma may have one or more translations/versions. The database and user interface should not confuse those concepts.

## 4. Current Technology Direction

The project uses a modern web frontend with React and TypeScript, with Supabase/PostgreSQL for database infrastructure. GitHub stores the source code. The architecture is modular so features can be expanded without rebuilding the whole application.

For voice work, Bible Arena has an Idoma ASR (automatic speech recognition) track. ASR means converting spoken audio into written text.

The current external baseline is Meta OmniASR. The first model selected for deployment/testing is `omniASR_CTC_300M_v2`. Idoma's external ISO 639-3 language code is `idu`. An earlier internal application language code is `id`; these must not be confused because standard ISO `id` normally refers to Indonesian.

## 5. Idoma: Why It Matters

The requirement is not merely to display the word "Idoma" in a language menu. A strong Idoma experience should eventually allow a user to:

- read authorized Idoma Scripture;
- speak naturally in Idoma;
- have the application recognize the speech accurately;
- receive useful Bible-related results;
- hear appropriate Idoma audio where rights and technology permit.

Text and voice should remain together in the Bible Arena experience rather than treating voice as an unrelated side project.

## 6. Written Idoma Bible Status

Idoma is already represented in the application's language catalogue/database work, but that does **not** mean the complete Idoma Bible text is loaded.

The target written translation discovered during research is **Ubáyíbu kú Idɔma / Idoma Common Language Bible (IFBCL)**. The project has deliberately avoided scraping copyrighted Bible text. A YouVersion Platform application route was investigated, but its application required commitments around non-commercial/free/no-paywall/no-ad use that the project owner was not ready to accept. Therefore that route was paused rather than accepting terms without understanding their consequences.

**Lesson:** Technical access is not the same as legal permission. A production Bible application needs both.

## 7. Idoma Voice / Speech Recognition Journey

### Early approach

The project initially prepared infrastructure for collecting and reviewing its own Idoma speech data. This included ideas/work around speakers, consent, review, validation, ASR eligibility, dataset export, training, evaluation, and model registry/release lifecycle.

A dedicated Hugging Face Idoma model, `mrheartng/wav2vec2-xls-r-1b-finetuned-idoma`, was discovered. Access was gated, so an access request was submitted. A token would not bypass model-owner approval.

### Open alternative

Rather than allowing the gated model to block progress, the project found Meta OmniASR, which supports a very large number of languages and includes Idoma (`idu_Latn`) in its supported-language work. Bible Arena selected OmniASR as the initial open baseline.

Important limitation: the selected CTC model is not magically forced to understand Idoma just because the application knows the language code. Its real accuracy must be measured with genuine Idoma speech.

### Current service architecture

The Idoma ASR service normalizes browser audio to mono 16 kHz audio and sends it through OmniASR. The service enforces limits such as maximum audio size and duration so uncontrolled uploads do not overwhelm the inference service.

A Runpod Serverless worker is being prepared so the heavy speech model can run on GPU infrastructure separately from the normal Bible Arena web frontend.

High-level path:

`User microphone -> Bible Arena frontend -> secure server/API layer -> Runpod Idoma ASR worker -> OmniASR -> transcript -> Bible Arena`

## 8. Jesus Film Idoma Resource Lead

During deployment work, the project owner remembered that the JESUS film has been interpreted/dubbed in Idoma. This became an important research lead because genuine native Idoma biblical speech could help evaluate speech recognition.

Research confirmed that an Idoma (`idu`) JESUS film resource exists through Scripture-resource catalogues linking to Jesus Film resources. However, existence does **not** grant Bible Arena permission to download, redistribute, or train a machine-learning model on the film's copyrighted audio.

Current rule:

- It can be investigated as a legitimate Idoma resource.
- Exact transcript availability must be verified.
- Appropriate permission/licensing must be obtained before incorporating copyrighted audio/transcripts into Bible Arena or a training dataset.
- The OmniASR deployment continues independently so the project is not blocked by licensing discussions.

## 9. Deployment Journey — Runpod

The project owner connected Runpod to GitHub and limited repository access to the Bible Arena repository rather than granting unnecessary access to every repository.

Runpod initially reported that it could not find a Dockerfile because the original ASR Dockerfile lived inside `ml/idoma-asr/service/` rather than at the repository root. A root Dockerfile was then prepared so Runpod's GitHub deployment flow could discover it.

The service originally used FastAPI/Uvicorn as a normal web service. Runpod Serverless requires a worker handler/start mechanism, so a Runpod handler was added and the container command was changed to launch the worker.

Runpod's repository scanner later warned that it could not find the Runpod start function even though the function existed in the subfolder and was copied by the Dockerfile. This was treated as a scanner/detection limitation rather than immediately rewriting working code again. The deployment flow continued carefully.

At the time this guide was started, the project had reached the **Start GPU** configuration stage but had not intentionally selected a paid GPU/deployed the production endpoint yet.

## 10. Important Challenges So Far

### Challenge: Learning while building

The project owner is learning programming while building a substantial product. Technical words, deployment dashboards, cloud options, and repository structures can become confusing when several new concepts appear at once.

**Response:** Instructions should be broken into one concrete action at a time. Terms should be explained in ordinary language before expecting the learner to use them.

### Challenge: Understanding deployment screens

During Runpod setup, labels such as Serverless, Endpoint, Queue, Load Balance, Dockerfile, Start GPU, worker, and repository deployment caused confusion.

**Lesson:** A beginner needs to know not only *what to click*, but *why it is being clicked* and what the option means.

### Challenge: Dockerfile discovery

Runpod first could not discover the Dockerfile because it was nested inside the ASR service folder.

**Lesson:** A file can exist in a repository and still be invisible to a platform's automatic convention-based scanner.

### Challenge: Runpod start-function detection

Runpod later warned that it could not detect a serverless start function even though `handler.py` contained the Runpod start call.

**Lesson:** Automated platform scanners are not always the final truth. Check the actual source before changing code.

### Challenge: Idoma model access

The dedicated Idoma Hugging Face model was gated and required owner approval.

**Lesson:** Do not allow one external dependency to block the whole architecture. Use a legitimate fallback/baseline and benchmark alternatives later.

### Challenge: No Bible Arena-owned Idoma corpus yet

Infrastructure can exist even when real data does not. Earlier database checks showed no real Bible Arena Idoma speaker/sample corpus ready for training.

**Lesson:** Never confuse an implemented data pipeline with actual collected data.

### Challenge: Copyright and Bible licensing

Finding Idoma Scripture or Idoma biblical audio online does not automatically mean Bible Arena can copy it.

**Lesson:** Discovery, API access, redistribution rights, and ML-training rights are separate questions.

### Challenge: YouVersion application terms

The YouVersion Platform application path required non-commercial/free/no-paywall/no-ad confirmations. The project owner did not want to agree without understanding the product consequences, so the process was paused.

**Lesson:** Never accept legal/product restrictions simply to get an API key.

## 11. Questions Asked During the Build and What They Revealed

This section will keep growing. The purpose is not to judge wrong answers. It records what the learner understood, what caused confusion, and what needs to be taught again.

### Product questions

**Question/theme:** Should local-language voice be treated as optional or later work?

**Owner's direction:** No. Idoma text and voice are core to Bible Arena and should remain together.

**What this revealed:** The project's mission is language accessibility, not simply adding a translation dropdown to an English-first product.

### Licensing questions

**Question/theme:** Should Bible Arena accept YouVersion's non-commercial/free/no-paywall/no-ad conditions to obtain access?

**Owner's response:** The owner was not ready to make that commitment.

**What this revealed:** Business/product flexibility matters and licensing decisions need plain-language explanation before acceptance.

### Deployment questions

**Question/theme:** Which Runpod deployment path should be selected?

The owner encountered multiple choices such as public APIs, production API, custom code, GitHub repository, Docker image, Queue, and Load Balance.

**Confusion observed:** Similar technical choices made it difficult to know what applied to Bible Arena.

**What needs teaching:**

- A **repository** is the project's stored source code.
- A **Dockerfile** is a recipe for building the environment that runs part of the application.
- A **Docker image** is the packaged result of that recipe.
- **Serverless** means infrastructure can start workers when jobs arrive and reduce workers when idle.
- A **GPU** is specialized hardware used here to run the speech model efficiently.
- A **worker** is a running process that receives a speech-recognition job and returns a result.
- A **queue** holds jobs until a worker can process them.
- An **endpoint** is an address/API through which another part of the application sends work.

## 12. File-by-File Learning Notes

This section will eventually cover every important project file. The entries below cover the files central to the current Idoma deployment work.

### `/Dockerfile`

**What it is:** A build recipe placed at the repository root so Runpod can find it easily.

**What it does:**

1. Starts from Python 3.11.
2. configures Python/container environment behavior;
3. installs system packages needed for audio handling, including FFmpeg and `libsndfile`;
4. copies the Idoma ASR Python requirements;
5. installs Python packages;
6. copies the ASR application and Runpod handler into the container;
7. starts the Runpod worker handler.

**Beginner picture:** Think of the Dockerfile as instructions for preparing a brand-new computer exactly the way Bible Arena's Idoma voice worker needs it.

### `/ml/idoma-asr/service/app.py`

**What it is:** Core Idoma ASR inference logic.

**Main responsibilities:**

- choose/load the OmniASR model;
- validate audio size;
- use FFmpeg to decode browser audio;
- convert audio to mono 16 kHz;
- enforce the audio-duration limit;
- write normalized audio to a temporary WAV file;
- ask OmniASR to transcribe it;
- return a transcript or safe error.

**Beginner picture:** This is the part that prepares the recording and asks the speech-recognition brain, "What did this person say?"

### `/ml/idoma-asr/service/handler.py`

**What it is:** The Runpod Serverless entry point.

**Main responsibilities:**

- receive a Runpod job;
- read base64-encoded audio from the job input;
- decode it back into audio bytes;
- reuse the normalization/transcription functions from `app.py`;
- return the transcript and Idoma language code;
- call `runpod.serverless.start(...)` so Runpod knows which handler processes jobs.

**Beginner picture:** If `app.py` contains the speech-recognition work, `handler.py` is the receptionist that receives a Runpod job, hands the audio to the right functions, and sends the answer back.

### `/ml/idoma-asr/service/requirements.txt`

**What it is:** A list of Python packages the Idoma ASR service needs.

It includes packages for the web/API service, file uploads, audio handling, OmniASR, and Runpod's worker SDK.

**Beginner picture:** It is the shopping list of software libraries that must be installed before the worker can run.

### `/ml/idoma-asr/service/Dockerfile`

This is the service-local container recipe. It is useful when working directly inside the ASR service folder. The repository-root Dockerfile exists mainly to make deployment from the whole GitHub repository straightforward for platforms such as Runpod.

### `/ml/idoma-asr/service/test_app.py`

**What it is:** Automated tests for important ASR service behavior.

**Why it matters:** Tests help detect accidental breakage when the service is changed. This file should be kept aligned with the current OmniASR/Runpod implementation as the service evolves.

### `/src/services/idomaAsr.ts`

**What it is:** Frontend-side service code used by Bible Arena to send recorded Idoma audio toward the backend speech-recognition path and validate the response.

**Security lesson:** Browser code must not contain private cloud/model secrets.

### `/src/services/idomaRecorder.ts`

**What it is:** Browser microphone-recording logic.

**What it does:** Uses browser recording capabilities to capture the user's speech in supported audio formats and produce an audio blob that can be sent for transcription.

### `/src/components/IdomaVoiceInput.tsx`

**What it is:** The visible user-interface component for speaking Idoma.

**What it does:** Gives the user the microphone interaction, controls recording/transcription states, and displays transcript/error feedback.

### `/src/services/bibleCatalogue.ts`

**What it is:** Bible catalogue/data-access logic.

**What it does:** Loads available languages, Bible versions/translations, and Bible books from Supabase.

**Important lesson:** Seeing Idoma in the language table does not prove that Idoma verses have been licensed and loaded.

## 13. Important Security Rules

- Never put private API tokens in frontend/browser source code.
- Never paste passwords, card details, or secret tokens into chat or source code.
- Give third-party services only the repository permissions they actually need.
- Use database access rules such as Supabase RLS where appropriate.
- Keep copyrighted Scripture/audio rights separate from technical capability.

## 14. How a Beginner Should Understand the Whole System

Do not try to understand the entire repository at once. Follow one user action through the system.

Example: **Speak Idoma**

1. The user presses the microphone button.
2. `IdomaVoiceInput.tsx` controls what the user sees.
3. `idomaRecorder.ts` records microphone audio.
4. `idomaAsr.ts` sends the audio toward the server-side ASR path.
5. The protected backend/proxy will send the job to the deployed Runpod endpoint.
6. Runpod starts/uses an ASR worker.
7. `handler.py` receives the job.
8. `app.py` normalizes the recording and runs OmniASR.
9. The transcript travels back through the API.
10. Bible Arena shows/uses the recognized Idoma text.

When this path is understood, individual files stop looking like unrelated code.

## 15. What Is Still Unfinished

At the time this living guide was created:

- Runpod GPU/serverless deployment is not yet completed.
- End-to-end production Idoma voice transcription has not yet been proven.
- Real Idoma accuracy has not yet been benchmarked by Bible Arena with a representative test set.
- The complete authorized Idoma Bible text is not yet loaded.
- Jesus Film Idoma reuse/training permission has not been obtained.
- The gated dedicated Idoma Hugging Face model is not a production dependency.
- The frontend-to-production-ASR secure proxy/deployment path still needs final end-to-end verification.

These are not hidden failures; they are explicit project milestones.

## 16. Documentation Rule From Now On

As Bible Arena continues, this guide should record:

1. What we were trying to accomplish.
2. Why we chose a particular approach.
3. What question was asked of the project owner.
4. The owner's answer/decision when relevant.
5. What was confusing.
6. The challenge revealed by that confusion.
7. The simple explanation that resolved it.
8. Files created or changed and why.
9. Errors/warnings encountered and their causes.
10. How the issue was fixed.
11. Security/licensing decisions.
12. Tests performed and their real results.
13. What remains unfinished.

The final version should be understandable to a beginner who did not participate in the build and should be detailed enough for the project owner to explain Bible Arena confidently and continue working on it.

---

**Next documentation update:** Continue from Runpod GPU configuration and record the selected GPU, worker configuration, deployment result, errors, endpoint integration, and first genuine Idoma transcription test.
