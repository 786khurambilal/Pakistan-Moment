# Tech Stack & Build

## Runtime

- Node.js (ES modules throughout — `"type": "module"` in both root and client package.json)

## Backend

- Express 4 — REST API server
- `@google/genai` — Google Gemini SDK for image generation (`gemini-2.5-flash-image`) and text generation (`gemini-2.5-flash`)
- `dotenv` — environment variable loading
- `cors` — cross-origin support

## Frontend

- React 18 (JSX, functional components with hooks)
- Vite 6 — dev server and bundler
- Tailwind CSS 3 — utility-first styling
- PostCSS + Autoprefixer
- `html-to-image` — client-side A4 newspaper PNG export
- Webcam access via native `getUserMedia` API

## Monorepo Structure

- npm workspaces (root + `client` workspace)
- No test framework is configured
- No TypeScript — plain JavaScript/JSX only

## Image Providers (pluggable via `IMAGE_PROVIDER` env var)

- `gemini` (default) — Google Gemini image model
- `azure` — Azure OpenAI (AI Foundry)
- `openai` — Direct OpenAI API

## Storage

- File-based JSON (`server/data/jobs.json`) for manual job queue by default
- Optional Supabase integration for persistent job storage

## Common Commands

```bash
# Install all dependencies (root + client workspace)
npm install

# Run dev (Express on :3000 + Vite on :5173 concurrently)
npm run dev

# Run only the server (with --watch)
npm run dev:server

# Run only the client dev server
npm run dev:client

# Production build (client → client/dist)
npm run build

# Production start (Express serves API + built client on :3000)
npm start
```

## Environment

Configuration lives in `.env` (see `.env.example`). Key variables:
- `GEMINI_API_KEY` — required for AI features
- `IMAGE_PROVIDER` — selects image backend (gemini/azure/openai)
- `FACE_REFINE` — enables optional second-pass face correction (0 or 1)
- `GENERATION_MODE` — startup mode: "auto" or "manual"
- `MANUAL_JOB_STORE` — "file" or "supabase"

## Conventions

- ES module imports with explicit `.js` extensions on server
- No semicolons omitted — standard JS with semicolons
- Single quotes for strings
- Functional React components only (no class components)
- Vite proxies `/api` to Express in development
