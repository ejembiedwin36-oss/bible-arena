# Bible Arena

Bible Arena is a multilingual Bible reading, study, devotional, learning, audio, and AI-assisted Scripture web application. The project is designed to make Scripture easier to read, study, search, listen to, and interact with across English and local languages.

**Idoma is the first major local-language priority.** Written local-language Scripture and voice/audio are core product requirements rather than optional extras.

> **Current status:** Bible Arena is under active development. English KJV is the Scripture translation currently loaded. Several local languages are configured in the catalogue, but that does not mean their Bible texts have been imported. In particular, the complete licensed Idoma Bible text has not yet been imported. The Idoma speech-recognition integration is implemented through a secure server-side proxy and covered by automated tests, but the real Runpod endpoint has not yet been deployed and tested end to end.

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
- **Web deployment:** Vercel configuration is present in the repository
- **Idoma ASR baseline:** Meta OmniASR
- **ASR compute target:** Runpod Serverless GPU worker
- **Audio normalization:** FFmpeg / libsndfile

## Project structure

```text
bible-arena/
├── api/
│   └── voice/idoma/
│       ├── transcribe.ts        # Secure Vercel proxy to Runpod
│       └── transcribe.test.ts   # Proxy/API tests
├── src/                         # React/TypeScript application
│   ├── components/              # Reusable UI components
│   └── services/                # Browser/application service logic
├── ml/
│   └── idoma-asr/               # Idoma speech-recognition work
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

For normal frontend development, install:

- Node.js with npm
- Git

For local Idoma ASR development, also install:

- Python 3.11 (the deployment container currently uses Python 3.11)
- FFmpeg
- system audio support compatible with `libsndfile`

A Supabase project is required for database-backed application features. GPU infrastructure is only needed when running the speech model in a suitable inference environment.

## Install and run the frontend

Clone the repository and enter the project folder:

```bash
git clone https://github.com/ejembiedwin36-oss/bible-arena.git
cd bible-arena
```

Install JavaScript dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
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

Bible Arena uses external services such as Supabase and, once deployment is complete, a protected Runpod ASR endpoint. Keep private credentials in environment variables or deployment-platform secret storage.

**Never commit real API keys, passwords, access tokens, payment information, or service-role secrets to GitHub.**

The Idoma ASR browser service calls Bible Arena's same-origin route:

```text
/api/voice/idoma/transcribe
```

The Vercel server function at `api/voice/idoma/transcribe.ts` owns the Runpod authentication. It requires these server-side environment variables when the real endpoint is deployed:

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

Important files:

- `src/components/IdomaVoiceInput.tsx` — visible microphone/transcription UI and recording feedback.
- `src/services/idomaRecorder.ts` — browser recording logic.
- `src/services/idomaAsr.ts` — validates and sends recorded audio to Bible Arena's server route.
- `api/voice/idoma/transcribe.ts` — validates the request, protects Runpod credentials, submits the job, polls its status, and returns a safe response.
- `api/voice/idoma/transcribe.test.ts` — tests input validation and mocked Runpod success/failure flows without requiring paid GPU execution.
- `ml/idoma-asr/service/app.py` — normalizes audio and runs OmniASR.
- `ml/idoma-asr/service/handler.py` — accepts Runpod jobs and returns transcripts.
- `Dockerfile` — builds the worker from the repository root for Runpod.

The browser/server proxy currently limits an audio request to **4 MB**, keeping it below Vercel Functions' request-body ceiling. The recording UI also targets short speech clips, with a 30-second recording limit. The Runpod worker performs its own duration/audio validation as an additional boundary.

The external Idoma code used by standards/integrations is `idu`. Do not confuse it with the project's earlier internal `id` code; ISO `id` normally refers to Indonesian.

## Run the ASR service locally

From the ASR service directory, create and activate a Python virtual environment using the normal commands for your operating system, then install the requirements:

```bash
cd ml/idoma-asr/service
python -m pip install -r requirements.txt
```

The deployment handler is intended for Runpod Serverless. The core inference functions live in `app.py` and should be tested independently as development continues.

Model downloads can be large, and local inference requirements depend on the machine. Do not assume a normal laptop will provide the same performance as a GPU worker.

## Docker / Runpod deployment

The root `Dockerfile` exists because Runpod's GitHub deployment flow expects an easily discoverable container recipe. It installs the required audio libraries and Python packages, copies `app.py` and `handler.py`, and starts the Runpod worker handler.

The Runpod endpoint is **not currently live**. Deployment reached the Serverless GPU configuration stage, but the project owner's current network later began timing out when connecting to `console.runpod.io`. No production endpoint should be documented as available until deployment and genuine end-to-end Idoma testing succeed.

## Bible content and licensing

Bible Arena does not treat publicly viewable Bible text/audio as automatically reusable content. Translation/API access, redistribution rights, audio rights, and machine-learning training rights may differ.

**Current Scripture content:** English KJV is the actual Bible translation currently loaded. Language catalogue entries are not proof that a corresponding translation has been imported.

The Idoma Common Language Bible (`Ubáyíbu kú Idɔma / IFBCL`) has been identified as a target written resource, but the complete authorized text has not yet been loaded into Bible Arena. Do not add scraped copyrighted verses as placeholders.

## Testing

Run the web/API test suite with:

```bash
npm test
```

Run strict server-side API type-checking with:

```bash
npm run typecheck:api
```

The Idoma proxy tests cover method/configuration guards, invalid content types, empty audio, oversized audio, mocked Runpod submission, successful transcript return, failed jobs, and completed jobs that contain no usable transcript.

ASR tests also live under `ml/idoma-asr/service/`. Speech-recognition quality must ultimately be evaluated using genuine Idoma recordings. Passing mocked integration tests proves application behavior around the provider; it does **not** prove real Idoma transcription accuracy.

## Security rules

- Never put private cloud/API credentials in browser source.
- Never commit `.env` secrets.
- Keep Runpod credentials on the server side.
- Reject unsuitable/oversized requests before spending GPU resources where possible.
- Apply Supabase access controls/RLS where appropriate.
- Keep private notes and user data protected.
- Give third-party integrations only the permissions they need.
- Do not copy or train on copyrighted Bible/audio resources without the required rights.

## Current development priorities

1. Complete the Runpod Serverless Idoma ASR endpoint when console access is available.
2. Configure the deployed web environment with the protected Runpod endpoint ID and API key.
3. Test the full microphone → Vercel proxy → Runpod → OmniASR → transcript path with genuine Idoma speech.
4. Measure and document real Idoma transcription quality rather than assuming it.
5. Continue the legitimate licensing/content-access path for written Idoma Scripture and audio.
6. Add additional Bible translations only when their content and usage rights are properly established.
7. Keep the beginner project guide and technical documentation updated as milestones are completed.

## Contributing / development discipline

Keep changes small and understandable. Before merging important work:

- run relevant tests;
- avoid committing secrets;
- document new environment requirements;
- update the beginner guide when a meaningful challenge, decision, error, or lesson occurs;
- update this README when setup/run/deployment instructions change.

## Project status disclaimer

Bible Arena is an active development project. Features described as goals are not automatically implemented or production-ready. Repository documentation should always distinguish planned work, implemented infrastructure, deployed services, licensed content, and tested functionality.
