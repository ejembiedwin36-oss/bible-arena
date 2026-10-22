# Bible Arena

Bible Arena is a multilingual Bible reading, study, devotional, learning, audio, and AI-assisted Scripture web application. The project is designed to make Scripture easier to read, study, search, listen to, and interact with across English and local languages.

**Idoma is the first major local-language priority.** Written local-language Scripture and voice/audio are core product requirements rather than optional extras.

> **Current status:** Bible Arena is under active development. English KJV is the Scripture translation currently loaded. Several local languages are configured in the catalogue, but that does not mean their Bible texts have been imported. In particular, the complete licensed Idoma Bible text has not yet been imported. The Idoma speech-recognition integration is implemented through a secure server-side proxy and covered by automated tests, but paid GPU hosting has deliberately been postponed while a suitable hosting path is considered. The active application now connects Bible Reader, Verse Study, Topic Study, bookmarks, verse-linked personal notes, Daily Devotion, and the starter Bible Arena Challenge. The integrated `main` build has been successfully deployed through Vercel.

## Documentation

- [Product Requirements Document](docs/PRODUCT_REQUIREMENTS.md) — what Bible Arena is building and why.
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md) — phased development plan and current priorities.
- [Beginner Project Guide](docs/BIBLE_ARENA_BEGINNER_PROJECT_GUIDE.md) — build story, challenges, lessons, important files, errors/fixes, and beginner-friendly explanations.

## Core goals

- Read Scripture with book/chapter/verse navigation.
- Support multiple Bible languages and translations without confusing the two concepts.
- Provide study tools, topics, devotionals, notes, bookmarks, challenges, and progress tracking.
- Keep verified Scripture clearly separate from AI-generated explanation.
- Support local-language text and voice/audio, beginning with Idoma.
- Grow through a modular architecture rather than rebuilding the application for each new feature.

## Technology

- **Frontend:** React 19 + TypeScript
- **Build tool:** Vite 7
- **Routing:** React Router
- **Database/backend services:** Supabase / PostgreSQL
- **Tests:** Vitest
- **Source control:** GitHub
- **Web deployment:** Vercel
- **Idoma ASR baseline:** Meta OmniASR
- **ASR deployment integration:** Runpod Serverless code retained as a hosting option; live paid deployment is postponed
- **Audio normalization:** FFmpeg / libsndfile

## Project structure

```text
bible-arena/
├── api/
│   └── voice/idoma/
│       ├── transcribe.ts        # Secure Vercel proxy to Runpod
│       └── transcribe.test.ts   # Proxy/API tests
├── src/
│   ├── components/              # Reusable UI components
│   ├── data/                    # Verified starter challenge content
│   ├── features/                # Study, devotion, topic, and challenge features
│   └── services/                # Browser/application service logic
├── ml/
│   └── idoma-asr/
│       └── service/
│           ├── app.py           # OmniASR loading/audio/transcription logic
│           ├── handler.py       # Runpod Serverless worker entry point
│           ├── requirements.txt # Python dependencies
│           ├── Dockerfile       # Service-local container recipe
│           └── test_app.py      # ASR service tests
├── docs/                        # Product, roadmap, and learning documentation
├── Dockerfile                   # Root Runpod deployment container recipe
├── package.json                 # Frontend dependencies and commands
├── tsconfig.api.json            # Strict type-checking for server API source
├── vercel.json                  # Vercel routing configuration
└── README.md                    # Repository front door
```

The exact repository contains additional files beyond this overview. The structure above highlights the files most important to understanding the current application and Idoma voice work.

## Prerequisites

For normal frontend development, install Node.js with npm and Git. For local Idoma ASR development, also install Python 3.11, FFmpeg, and system audio support compatible with `libsndfile`.

A Supabase project is required for database-backed application features. GPU infrastructure is only needed when running the speech model in a suitable inference environment.

## Install and run the frontend

```bash
git clone https://github.com/ejembiedwin36-oss/bible-arena.git
cd bible-arena
npm install
npm run dev
```

Vite will print the local address to open in your browser.

## Available frontend commands

```bash
npm run dev            # Start development server
npm run build          # Create a production frontend build
npm run preview        # Preview the production build locally
npm test               # Run Vitest once
npm run test:watch     # Run Vitest in watch mode
npm run typecheck:api  # Strictly type-check server-side API source
```

GitHub CI also checks Python script syntax, server-side API TypeScript, the web/API tests, and the production application build.

## Environment variables

Bible Arena uses external services such as Supabase and, if the retained Runpod deployment path is activated later, a protected Runpod ASR endpoint. Keep private credentials in environment variables or deployment-platform secret storage.

**Never commit real API keys, passwords, access tokens, payment information, or service-role secrets to GitHub.**

The Idoma ASR browser service calls Bible Arena's same-origin route:

```text
/api/voice/idoma/transcribe
```

The Vercel server function at `api/voice/idoma/transcribe.ts` owns the Runpod authentication. It requires these server-side environment variables only when a real Runpod endpoint is deployed:

```text
IDOMA_ASR_RUNPOD_ENDPOINT_ID
RUNPOD_API_KEY
```

A Runpod API key must never be placed in React/browser code or in a public repository.

## Idoma speech-recognition service

The implemented speech path is designed as:

```text
User microphone
  → Bible Arena recorder
  → /api/voice/idoma/transcribe
  → protected Vercel server-side proxy
  → Runpod Serverless worker
  → OmniASR
  → transcript
  → Bible Arena
```

Important files include `src/components/IdomaVoiceInput.tsx`, `src/services/idomaRecorder.ts`, `src/services/idomaAsr.ts`, `api/voice/idoma/transcribe.ts`, `api/voice/idoma/transcribe.test.ts`, `ml/idoma-asr/service/app.py`, and `ml/idoma-asr/service/handler.py`.

The browser/server proxy currently limits an audio request to **4 MB**. The recording UI targets short speech clips with a 30-second recording limit. The external Idoma code used by standards/integrations is `idu`; do not confuse it with the project's earlier internal `id` code, because ISO `id` normally refers to Indonesian.

## Run the ASR service locally

```bash
cd ml/idoma-asr/service
python -m pip install -r requirements.txt
```

The deployment handler is intended for Runpod Serverless. Model downloads can be large, and local inference requirements depend on the machine. Do not assume a normal laptop will provide the same performance as a GPU worker.

## Docker / Runpod deployment

The root `Dockerfile` exists because Runpod's GitHub deployment flow expects an easily discoverable container recipe. It installs the required audio libraries and Python packages, copies `app.py` and `handler.py`, and starts the Runpod worker handler.

The Runpod endpoint is **not currently live**. Deployment was stopped before adding credit or a payment method because GPU execution is paid. No production Runpod endpoint was activated and the project did not incur Runpod charges. A Hugging Face Spaces compute route was also investigated, but the required Gradio/Docker path shown during setup required a paid plan. Voice/audio remains a core Bible Arena requirement; only hosting is postponed.

## Bible study integration

Bible Arena now has a connected study journey built around exact verse IDs:

- Bible Reader → exact Verse Study.
- Verse Study → surrounding chapter context.
- Verse Study ↔ verified Topic Study mappings and related Scriptures.
- Verse Study ↔ bookmarks.
- Verse Study ↔ verse-linked personal notes, including loading, updating, and deleting a saved reflection.
- Bookmarks and verse-linked Notes → exact Verse Study or wider chapter context.

This establishes a coherent navigation/data foundation while the project continues to verify and consolidate its Bible data model.

## Daily Devotion

The active `/devotion` route now renders the Daily Devotion feature rather than a placeholder. It is designed to load the devotion for the user's local date, display its linked Scripture, reflection question and prayer, and let a signed-in user mark the devotion complete.

The feature deliberately does **not** invent a devotion or placeholder Scripture when verified content is unavailable. Database/provider details are not exposed as raw user-facing errors.

Important limitation: the live Supabase schema for `daily_devotions` and `devotion_completions` has not yet been verified because the database connector timed out during the schema audit. No speculative schema change was made. Until the required tables and verified content are confirmed, the page may correctly show its safe unavailable/not-published fallback.

## Bible Arena Challenge

The active `/arena` route now renders the starter Bible Arena Challenge rather than a placeholder. The starter challenge uses separated question data, multiple-choice answers, score/feedback, Scripture references, chapter navigation, result display, and restart behavior.

Automated checks protect basic challenge-data integrity, including ensuring that a correct answer is present among the choices and that Scripture navigation targets are defined.

## Bible content and licensing

Bible Arena does not treat publicly viewable Bible text/audio as automatically reusable content. Translation/API access, redistribution rights, audio rights, and machine-learning training rights may differ.

**Current Scripture content:** English KJV is the actual Bible translation currently loaded. Language catalogue entries are not proof that a corresponding translation has been imported.

The Idoma Common Language Bible (`Ubáyíbu kú Idɔma / IFBCL`) has been identified as a target written resource, but the complete authorized text has not yet been loaded into Bible Arena. Do not add scraped copyrighted verses as placeholders.

## Testing and deployment

Run the web/API test suite with `npm test` and strict server-side API type-checking with `npm run typecheck:api`.

The Idoma proxy tests cover request/configuration guards and mocked provider success/failure behavior. Passing mocked integration tests does **not** prove real Idoma transcription accuracy; genuine Idoma recordings are required for that measurement.

The integrated application containing the active Daily Devotion and Bible Arena Challenge routes was promoted to `main` after its preview deployment succeeded. Vercel then reported the exact `main` integration build as successfully deployed.

## Security rules

- Never put private cloud/API credentials in browser source.
- Never commit `.env` secrets.
- Keep Runpod credentials server-side if that deployment path is activated.
- Reject unsuitable/oversized requests before spending GPU resources where possible.
- Apply Supabase access controls/RLS where appropriate.
- Keep private notes and user data protected.
- Give third-party integrations only the permissions they need.
- Do not copy or train on copyrighted Bible/audio resources without the required rights.

## Current development priorities

1. Verify the live Supabase Bible/devotion schema and resolve the remaining duplicate Bible data-model assumptions without breaking the working reader.
2. Confirm the Daily Devotion tables/content path and test the feature against real verified devotion records.
3. Continue the legitimate licensing/content-access path for written Idoma Scripture and audio.
4. Add additional Bible translations only when their content and usage rights are properly established.
5. Keep the Idoma voice/OmniASR integration ready while evaluating a suitable hosting path; do not activate paid GPU infrastructure without explicit approval.
6. When voice hosting becomes available, test microphone → secure proxy → ASR → transcript with genuine Idoma speech and measure real transcription quality.
7. Continue expanding Bible Arena learning/challenge content with verified Scripture references.
8. Keep this README and the beginner project guide synchronized with completed milestones.

## Contributing / development discipline

Keep changes small and understandable. Before merging important work, run relevant tests, avoid committing secrets, document new environment requirements, update the beginner guide after meaningful decisions/errors/lessons, and update this README when setup/run/deployment instructions change.

## Project status disclaimer

Bible Arena is an active development project. Features described as goals are not automatically implemented or production-ready. Repository documentation should always distinguish planned work, implemented infrastructure, deployed services, licensed content, and tested functionality.
