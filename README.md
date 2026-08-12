# Pakistan Times — 14 August AI Photobooth

Take a webcam selfie, pick a moment from Pakistan's founding, answer a few playful
questions — and get a **vintage A4 newspaper front page** with *you standing among the
founders* and an AI-written personality story predicting your place in history.

Your face stays **exactly yours**: the image is generated with Gemini
`gemini-2.5-flash-image` under a strict identity-lock prompt, then a second edit pass snaps
the central face back to your original selfie.

## Stack

- **Backend:** Node + Express, `@google/genai` (Gemini text; Gemini image by default)
- **Optional image providers:** direct OpenAI API or Azure OpenAI in Azure AI Foundry
- **Frontend:** Vite + React + Tailwind; webcam via `getUserMedia`; A4 export via `html-to-image`

## Setup

1. **Add your Gemini API key.** Copy the example env and paste your key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and set `GEMINI_API_KEY=...`
   (get one at https://aistudio.google.com/app/apikey).

   To use Azure AI Foundry for image generation instead of Gemini, set:
   ```bash
   IMAGE_PROVIDER=azure
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
   AZURE_OPENAI_API_KEY=...
   AZURE_OPENAI_IMAGE_DEPLOYMENT=gpt-image-1-mini
   ```
   To use the direct OpenAI API for image generation instead, set:
   ```bash
   IMAGE_PROVIDER=openai
   OPENAI_API_KEY=...
   OPENAI_IMAGE_MODEL=gpt-image-1-mini
   OPENAI_IMAGE_QUALITY=low
   ```
   The Gemini key is still used for the newspaper story text unless you replace the text provider too.

2. **Install** (once):
   ```bash
   npm install
   ```

3. **Only Quaid-e-Azam is attached by default.**
   The image prompt sends the guest selfie as Image 1 and Quaid-e-Azam as Image 2. Keep
   `MAX_LEADER_REFERENCES=1` for stable guest identity. Increasing it can make the model paste
   leader references or drop the guest.

4. **Run:**
   ```bash
   npm run dev
   ```
   - App (Vite): http://localhost:5173
   - API (Express): http://localhost:3000  (Vite proxies `/api` to it)

## Production

```bash
npm run build      # builds client into client/dist
npm start          # Express serves the API + the built client on :3000
```

## The flow

Landing → **Capture** (webcam / upload) → **Choose scene** (5 historic moments) →
**Quiz** (name, your role, alter-ego, "star form", your cause) → **Generating** →
**Result** (download PNG / share / print / regenerate / start over).

## Preview without a key

Open **http://localhost:5173/#demo** to see the finished newspaper rendered with sample
data — useful for tuning the layout without calling the AI.

## Where things live

- `server/lib/prompts.js` — the 5 **scenes**, the **quiz**, and every prompt (edit these to
  change the creative). Identity-lock text is in `IDENTITY_LOCK`.
- `server/services/gemini.js` — `generateScene()`, `refineFace()`, `generateStory()`.
- `client/src/components/Newspaper.jsx` + `client/src/styles/newspaper.css` — the A4 design.
- `client/src/steps/*` — the wizard screens.

## Notes

- Each result = 1 image call + 1 text call by default. Set `FACE_REFINE=1` only if you want
  the extra face-correction pass and accept the extra image call.
- Selfies are compressed to a 640px portrait JPEG before upload to keep requests lighter.
- Best face fidelity: front-facing selfie, even lighting, face centered in the oval guide.
