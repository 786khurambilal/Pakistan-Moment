# Project Structure

```
/
├── package.json              # Root: workspaces config, dev/build/start scripts
├── .env / .env.example       # Environment variables (API keys, provider config)
├── server/
│   ├── index.js              # Express app entry point (cors, json parsing, static serving)
│   ├── routes/
│   │   └── generate.js       # All API routes: /api/config, /api/scene, /api/story, /api/jobs, /api/settings
│   ├── services/
│   │   ├── imageProvider.js  # Provider router — delegates to gemini/azure/openai based on env
│   │   ├── gemini.js         # Gemini image + text generation (generateScene, refineFace, generateStory)
│   │   ├── azureImage.js     # Azure OpenAI image generation
│   │   ├── openaiImage.js    # Direct OpenAI API image generation
│   │   └── leaderReferences.js  # Loads leader portrait images from assets/
│   ├── lib/
│   │   ├── prompts.js        # SCENES, QUIZ definitions, and all prompt builders (single source of truth)
│   │   ├── manualJobs.js     # Manual job queue CRUD (file or Supabase backend)
│   │   └── settings.js       # Runtime settings (generationMode) — reads/writes server/data/settings.json
│   ├── data/
│   │   ├── settings.json     # Persisted runtime settings
│   │   └── jobs.json         # File-based job storage (auto-created)
│   ├── assets/leaders/       # Reference portrait images for historical figures
│   └── sql/
│       └── manual_jobs.sql   # Supabase table schema for optional remote storage
├── client/
│   ├── package.json          # Client workspace: react, vite, tailwind, html-to-image
│   ├── vite.config.js        # Vite config (React plugin, proxy /api → :3000)
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── index.html            # HTML entry point
│   └── src/
│       ├── main.jsx          # React DOM render entry
│       ├── App.jsx           # Root component — step-based wizard state machine
│       ├── components/
│       │   └── Newspaper.jsx # A4 vintage newspaper layout component
│       ├── steps/
│       │   ├── Landing.jsx   # Welcome screen
│       │   ├── Capture.jsx   # Webcam/upload selfie capture
│       │   ├── ChooseScene.jsx # Scene selection
│       │   ├── Quiz.jsx      # Personality quiz form
│       │   ├── Generating.jsx # Loading/polling state
│       │   ├── Result.jsx    # Final newspaper display + actions
│       │   └── Backoffice.jsx # Admin job management UI
│       ├── lib/
│       │   ├── api.js        # fetch wrappers for all /api endpoints
│       │   ├── camera.js     # getUserMedia helpers
│       │   └── demo.js       # Sample data for #demo mode
│       └── styles/
│           └── newspaper.css # Newspaper-specific CSS (non-Tailwind)
```

## Key Architectural Patterns

- **Single source of truth for content**: Scenes, quiz questions, and prompts all live in `server/lib/prompts.js`. The client fetches them via `/api/config`.
- **Pluggable image providers**: `server/services/imageProvider.js` delegates to the active provider. Each provider exports `generateScene()` and `refineFace()` with identical interfaces.
- **Step-based wizard UI**: `App.jsx` uses a `step` state variable to render the current wizard screen. No router library — navigation is state-driven.
- **Hash-based feature flags**: `#demo` for layout preview, `#backoffice` for admin UI.
- **Two generation modes**: "auto" calls AI directly and returns results inline; "manual" creates a job for operator processing via the backoffice.
- **JSON body limit**: Express is configured with a 25 MB JSON limit to accommodate base64 image payloads.
