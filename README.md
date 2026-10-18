# Bible Arena

Bible Arena is a multilingual Bible reading, study, devotional, learning, audio, and AI-assisted Scripture web application. The project is designed to make Scripture easier to read, study, search, listen to, and interact with across English and local languages.

**Idoma is the first major local-language priority.** Written local-language Scripture and voice/audio are core product requirements rather than optional extras.

> **Current status:** Bible Arena is under active development. Some interfaces and infrastructure are implemented, but not every planned feature or language resource is production-ready. In particular, Idoma appears in the language catalogue, but the complete licensed Idoma Bible text has not yet been imported. The Idoma speech-recognition path is also still being deployed and tested.

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
npm run dev       # Start development server
npm run build     # Create a production frontend build
npm run preview   # Preview the production build locally
npm test          # Run Vitest once
npm run test:watch
```

## Environment variables

Bible Arena uses external services such as Supabase and, once deployment is complete, a protected Runpod ASR endpoint. Keep private credentials in environment variables or deployment-platform secret storage.

**Never commit real API keys, passwords, access tokens, payment information, or service-role secrets to GitHub.**

The Idoma ASR browser service currently calls Bible Arena's same-origin route:

```text
/api/voice/idoma/transcribe
```

The intended production design is for that route to be implemented server-side. It will call Runpod using protected server-side credentials. A Runpod API key must never be placed in React/browser code.

## Idoma speech-recognition service

The current speech path is designed as:

```text
User microphone
  → Bible Arena recorder
  → /api/voice/idoma/transcribe
  → protected server-side proxy (still to be completed)
  → Runpod Serverless worker
  → OmniASR
  → transcript
  → Bible Arena
```

Important files:

- `src/components/IdomaVoiceInput.tsx` — visible microphone/transcription UI.
- `src/services/idomaRecorder.ts` — browser recording logic.
- `src/services/idomaAsr.ts` — sends recorded audio to the Bible Arena backend path.
- `ml/idoma-asr/service/app.py` — normalizes audio and runs OmniASR.
- `ml/idoma-asr/service/handler.py` — accepts Runpod jobs and returns transcripts.
- `Dockerfile` — builds the worker from the repository root for Runpod.

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

The Runpod endpoint is **not currently live**. Deployment reached the Serverless GPU configuration stage, but the project owner's current network later began timing out when connecting to `console.runpod.io`. No production endpoint should be documented as available until deployment and end-to-end testing succeed.

## Bible content and licensing

Bible Arena does not treat publicly viewable Bible text/audio as automatically reusable content. Translation/API access, redistribution rights, audio rights, and machine-learning training rights may differ.

The Idoma Common Language Bible (`Ubáyíbu kú Idɔma / IFBCL`) has been identified as a target written resource, but the complete authorized text has not yet been loaded into Bible Arena. Do not add scraped copyrighted verses as placeholders.

## Testing

Run the frontend test suite with:

```bash
npm test
```

ASR tests live under `ml/idoma-asr/service/`. Speech-recognition quality must ultimately be evaluated using genuine Idoma recordings. Infrastructure or model support alone is not proof of acceptable accuracy.

## Security rules

- Never put private cloud/API credentials in browser source.
- Never commit `.env` secrets.
- Keep Runpod credentials on the server side.
- Apply Supabase access controls/RLS where appropriate.
- Keep private notes and user data protected.
- Give third-party integrations only the permissions they need.
- Do not copy or train on copyrighted Bible/audio resources without the required rights.

## Current development priorities

1. Complete the Runpod Serverless Idoma ASR endpoint when console access is available.
2. Implement the secure `/api/voice/idoma/transcribe` server-side proxy.
3. Test the full microphone → ASR → transcript path with genuine Idoma speech.
4. Measure and document real Idoma transcription quality rather than assuming it.
5. Continue the legitimate licensing/content-access path for written Idoma Scripture and audio.
6. Keep the beginner project guide and technical documentation updated as milestones are completed.

## Contributing / development discipline

Keep changes small and understandable. Before merging important work:

- run relevant tests;
- avoid committing secrets;
- document new environment requirements;
- update the beginner guide when a meaningful challenge, decision, error, or lesson occurs;
- update this README when setup/run/deployment instructions change.

## Project status disclaimer

Bible Arena is an active development project. Features described as goals are not automatically implemented or production-ready. Repository documentation should always distinguish planned work, implemented infrastructure, deployed services, licensed content, and tested functionality.
