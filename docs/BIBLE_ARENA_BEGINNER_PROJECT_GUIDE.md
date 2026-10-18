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

Bible Arena should eventually support normal Bible reading, multiple versions and languages, Bible/topic search, related Scripture, verse study, book backgrounds, bookmarks, notes, devotionals, Scripture audio, Scripture-grounded AI assistance, challenges, progress tracking, and local-language text and speech.

A key architectural rule is that **Bible language and Bible version are different concepts**. A language such as Idoma may have one or more translations/versions. The database and user interface should not confuse those concepts.

## 4. Current Technology Direction

The project uses React, TypeScript and Vite for the web frontend, Supabase/PostgreSQL for database infrastructure, Vercel for web deployment/API functions, and GitHub for source control. The architecture is modular so features can be expanded without rebuilding the whole application.

For voice work, Bible Arena has an Idoma ASR (automatic speech recognition) track. ASR means converting spoken audio into written text.

The current external baseline is Meta OmniASR. The first model selected for deployment/testing is `omniASR_CTC_300M_v2`. Idoma's external ISO 639-3 language code is `idu`. An earlier internal application language code is `id`; these must not be confused because standard ISO `id` normally refers to Indonesian.

## 5. Idoma: Why It Matters

The requirement is not merely to display the word "Idoma" in a language menu. A strong Idoma experience should eventually allow a user to read authorized Idoma Scripture, speak naturally in Idoma, have the application recognize the speech accurately, receive useful Bible-related results, and hear appropriate Idoma audio where rights and technology permit.

Text and voice should remain together in the Bible Arena experience rather than treating voice as an unrelated side project.

## 6. Written Idoma Bible Status

Idoma is represented in the application's language catalogue/database work, but that does **not** mean the complete Idoma Bible text is loaded.

The target written translation discovered during research is **Ubáyíbu kú Idɔma / Idoma Common Language Bible (IFBCL)**. The project has deliberately avoided scraping copyrighted Bible text. A YouVersion Platform application route was investigated, but its application required commitments around non-commercial/free/no-paywall/no-ad use that the project owner was not ready to accept. Therefore that route was paused rather than accepting terms without understanding their consequences.

**Lesson:** Technical access is not the same as legal permission. A production Bible application needs both.

## 7. Idoma Voice / Speech Recognition Journey

The project initially prepared infrastructure for collecting and reviewing its own Idoma speech data. A dedicated Hugging Face Idoma model, `mrheartng/wav2vec2-xls-r-1b-finetuned-idoma`, was discovered, but access was gated. Rather than allowing that dependency to block progress, the project selected Meta OmniASR as the initial open baseline.

Important limitation: the selected CTC model is not magically forced to understand Idoma just because the application knows the language code. Its real accuracy must be measured with genuine Idoma speech.

The current Idoma ASR service normalizes browser audio to mono 16 kHz and sends it through OmniASR. A Runpod Serverless worker is being prepared so the heavy speech model can run on GPU infrastructure separately from the normal Bible Arena web frontend.

Current high-level path:

`User microphone -> Bible Arena frontend -> Vercel secure proxy -> Runpod Idoma ASR worker -> OmniASR -> transcript -> Bible Arena`

## 8. Jesus Film Idoma Resource Lead

The JESUS film has an Idoma (`idu`) language resource. This is a useful research lead because genuine native Idoma biblical speech could help evaluate speech recognition. However, existence does **not** grant Bible Arena permission to download, redistribute, or train a machine-learning model on copyrighted film audio.

The project must verify transcript availability and obtain appropriate permission/licensing before incorporating copyrighted audio/transcripts into Bible Arena or a training dataset. OmniASR deployment continues independently so the project is not blocked by licensing discussions.

## 9. Deployment Journey — Runpod

The project owner connected Runpod to GitHub and limited repository access to Bible Arena rather than granting unnecessary access to every repository.

Runpod initially could not discover the Dockerfile because it was inside `ml/idoma-asr/service/`. A root Dockerfile was added. The service originally used FastAPI/Uvicorn as a normal web service, while Runpod Serverless needs a worker handler/start mechanism, so `handler.py` and the Runpod SDK dependency were added and the container command was changed to launch the worker.

The endpoint configuration reached the GPU/worker settings. The intended conservative starting configuration was one maximum worker, zero active workers, one GPU, and queue-based scaling. Deployment was not completed because the account had no credit balance. Later, `console.runpod.io` repeatedly timed out on the owner's network even though the public Runpod website was reachable. Because the exact network cause was not proven, the project did not pretend to have diagnosed it and continued repository work instead.

**Current truth:** no paid Runpod endpoint has been deployed and no production Idoma transcription has been proven yet.

## 10. Important Challenges and Lessons

### Learning while building

The project owner is learning programming while building a substantial product. Instructions should therefore explain what a component does and why, not merely provide code or dashboard clicks.

### Deployment terminology

Terms such as Serverless, Endpoint, Queue, Dockerfile, GPU and worker caused confusion. A repository is stored source code; a Dockerfile is the recipe for the runtime environment; a GPU runs the speech model efficiently; a worker processes a job; a queue holds jobs until a worker is ready; and an endpoint is the API address used to send work.

### External dependencies

The gated Idoma model and Runpod console issue show why one outside service should not block all development. The project continued with an open ASR baseline and prepared the surrounding application architecture while deployment remained unavailable.

### Copyright and licensing

Finding Scripture or biblical audio online does not grant reuse rights. Discovery, API access, redistribution rights and ML-training rights are separate questions.

### Security boundary

The Runpod API key must never be placed in React/browser code. A Vercel server-side proxy was therefore added between the browser and Runpod. The browser knows only Bible Arena's `/api/voice/idoma/transcribe` route; the server will hold the Runpod credentials.

## 11. Questions and Decisions That Shaped the Product

**Should local-language voice be optional?** No. Idoma text and voice are core to Bible Arena.

**Should YouVersion's restrictions be accepted simply to get an API key?** No decision was forced. The route was paused because the owner was not ready to commit to the required product restrictions.

**Should a Runpod API key be put in frontend code to make integration easier?** No. Secrets belong on the server.

**Should development stop while Runpod is unreachable?** No. Work that does not require a live GPU endpoint can continue safely in GitHub.

## 12. File-by-File Learning Notes

### `/Dockerfile`

The repository-root build recipe used for the Runpod ASR worker. It starts from Python 3.11, installs FFmpeg/audio libraries, installs Python dependencies, copies the ASR application and handler, and starts the Runpod worker.

### `/ml/idoma-asr/service/app.py`

Core Idoma ASR inference logic. It validates and normalizes audio, loads OmniASR, transcribes the normalized WAV, and returns safe results/errors.

### `/ml/idoma-asr/service/handler.py`

The Runpod Serverless entry point. It receives base64 audio, decodes it, reuses the normalization/transcription functions, returns the transcript and calls `runpod.serverless.start(...)`.

### `/ml/idoma-asr/service/requirements.txt`

The Python dependency list for the speech worker, including audio, OmniASR and Runpod packages.

### `/ml/idoma-asr/service/Dockerfile`

The service-local container recipe. The root Dockerfile exists as the deployment-friendly entry point for the whole repository.

### `/ml/idoma-asr/service/test_app.py`

Automated tests for ASR service behavior. These should remain aligned with the current OmniASR/Runpod implementation.

### `/api/voice/idoma/transcribe.ts`

**What it is:** Bible Arena's secure server-side bridge between the web app and Runpod.

**What it does:**

1. accepts only POST requests;
2. reads `IDOMA_ASR_RUNPOD_ENDPOINT_ID` and `RUNPOD_API_KEY` from server environment variables;
3. rejects oversized or non-audio requests;
4. converts the recording to base64 for the Runpod worker contract;
5. submits a queue job to Runpod;
6. polls the job status;
7. returns the transcript to the browser when complete;
8. returns controlled errors for failed, cancelled or timed-out jobs.

**Security lesson:** the React application never receives the Runpod API key.

### `/api/voice/idoma/transcribe.test.ts`

Tests basic safety behavior of the proxy, including rejecting non-POST requests and returning a controlled 503 response when Runpod has not been configured.

### `/src/services/idomaAsr.ts`

Browser-side service that sends the recorded audio body to Bible Arena's own `/api/voice/idoma/transcribe` endpoint. It validates the returned transcript and `idu` language code. It contains no Runpod secret.

### `/src/services/idomaRecorder.ts`

Browser microphone wrapper. It requests microphone access, selects a supported recording format, collects audio chunks and stops microphone tracks when recording finishes or is cancelled.

### `/src/components/IdomaVoiceInput.tsx`

Visible Idoma microphone interface. It now shows elapsed/remaining recording time, limits recordings to 30 seconds, automatically sends the recording when the limit is reached, explains that a cold speech worker can take longer to start, and stops microphone resources when the component is left.

### `/src/services/bibleCatalogue.ts`

Loads available languages, Bible versions/translations and Bible books from Supabase. Seeing Idoma in the catalogue does not prove that licensed Idoma verses have been loaded.

### `/vercel.json`

Controls Vercel routing. The SPA rewrite was changed so `/api/...` requests are preserved for server functions rather than being incorrectly rewritten to React's `index.html`.

## 13. Important Security Rules

- Never put private API tokens in frontend/browser source code.
- Never paste passwords, card details, or secret tokens into chat or source code.
- Give third-party services only the repository permissions they actually need.
- Use Supabase RLS where appropriate.
- Keep copyrighted Scripture/audio rights separate from technical capability.
- Keep Runpod credentials only in server-side environment variables.

## 14. Follow One User Action Through the System

Example: **Speak Idoma**

1. The user presses the microphone button.
2. `IdomaVoiceInput.tsx` controls recording status and the 30-second limit.
3. `idomaRecorder.ts` captures microphone audio.
4. `idomaAsr.ts` sends raw audio to Bible Arena's own API route.
5. `/api/voice/idoma/transcribe.ts` checks the request and securely authenticates to Runpod.
6. Runpod queues the job and starts/uses an ASR worker.
7. `handler.py` receives and decodes the audio job.
8. `app.py` normalizes the recording and runs OmniASR.
9. Runpod returns the job result to the secure proxy.
10. The proxy returns only the safe transcript result to the browser.
11. Bible Arena displays/uses the recognized Idoma text.

## 15. What Is Still Unfinished

- Runpod GPU/serverless deployment is not yet completed.
- `RUNPOD_API_KEY` and `IDOMA_ASR_RUNPOD_ENDPOINT_ID` cannot be configured until the real endpoint/account setup is available.
- End-to-end production Idoma voice transcription has not yet been proven.
- Real Idoma accuracy has not yet been benchmarked by Bible Arena with a representative test set.
- The complete authorized Idoma Bible text is not yet loaded.
- Jesus Film Idoma reuse/training permission has not been obtained.
- The gated dedicated Idoma Hugging Face model is not a production dependency.
- The new Vercel proxy still needs deployment-level verification against a real Runpod endpoint.

These are explicit milestones, not hidden failures.

## 16. Documentation Rule From Now On

As Bible Arena continues, this guide should record what we were trying to accomplish, why an approach was chosen, important owner decisions, confusing points, challenges and fixes, files changed, warnings/errors, security/licensing decisions, tests actually performed, and unfinished work.

The final version should be understandable to a beginner who did not participate in the build and detailed enough for the project owner to explain Bible Arena confidently and continue working on it.

---

**Next documentation update:** record the successful Runpod endpoint deployment (or any real deployment error), server environment configuration, and the first genuine Idoma transcription test. Do not record these as successful until they have actually happened.
