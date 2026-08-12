// Gemini integration for Pakistan Times.
// - generateScene(): puts the user's face among the founders (identity-locked)
// - refineFace():   second edit pass that snaps the central face back to the selfie
// - generateStory(): writes the front-page article as structured JSON
import { GoogleGenAI } from '@google/genai';
import { buildScenePrompt, buildRefinePrompt, buildStoryPrompt } from '../lib/prompts.js';
import { loadLeaderReferences } from './leaderReferences.js';

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

let _client = null;
function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'paste-your-key-here') {
    throw new Error('GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.');
  }
  if (!_client) _client = new GoogleGenAI({ apiKey });
  return _client;
}

// Strip a data-URL prefix, returning { mimeType, data }.
function parseImage(input, fallbackMime = 'image/jpeg') {
  if (!input) throw new Error('No image data provided.');
  const m = /^data:(.+?);base64,(.*)$/s.exec(input);
  if (m) return { mimeType: m[1], data: m[2] };
  return { mimeType: fallbackMime, data: input };
}

function leaderNames(scene) {
  return scene.leaders.map((leader) => leader.name);
}

// Pull the first image part out of a generateContent response.
function extractImage(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    if (p.inlineData?.data) {
      const mime = p.inlineData.mimeType || 'image/png';
      return `data:${mime};base64,${p.inlineData.data}`;
    }
  }
  return null;
}

async function withRetry(fn, label, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw new Error(`${label} failed: ${lastErr?.message || lastErr}`);
}

/** Generate the group photo: user centered among the founders. */
export async function generateScene({ face, scene }) {
  const { mimeType, data } = parseImage(face);
  const leaders = loadLeaderReferences(scene);
  const attached = leaders.map((leader) => ({ name: leader.name, refKey: leader.refKey }));

  // Only send leader references — NOT the guest selfie.
  // WaveSpeed will swap the guest's face onto the center placeholder person afterwards.
  // This avoids Gemini blending the guest face with leaders, and ensures WaveSpeed
  // targets the correct (non-leader) face for swapping.
  const contents = [
    { text: buildScenePrompt(scene, attached, []) },
    ...leaders.map((leader) => leader.part),
  ];
  const response = await withRetry(
    () =>
      client().models.generateContent({
        model: IMAGE_MODEL,
        contents,
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    'Scene generation'
  );
  const image = extractImage(response);
  if (!image) throw new Error('Scene generation returned no image.');
  return image;
}

/** Second pass: face-swap the central person to exactly match the selfie. */
export async function refineFace({ sceneImage, face }) {
  const scenePart = parseImage(sceneImage, 'image/png');
  const facePart = parseImage(face);
  const contents = [
    { inlineData: { mimeType: facePart.mimeType, data: facePart.data } },
    { text: 'Above is the REAL face. Below is a generated group photo. SWAP the face of the center-front person in the group photo with the REAL face above. Keep everything else unchanged — same pose, body, clothing, background, other people, lighting, grain. Only replace the center person\'s face with an exact copy of the face shown above.' },
    { inlineData: { mimeType: scenePart.mimeType, data: scenePart.data } },
    { inlineData: { mimeType: facePart.mimeType, data: facePart.data } },
    { text: buildRefinePrompt() },
  ];
  const response = await withRetry(
    () =>
      client().models.generateContent({
        model: IMAGE_MODEL,
        contents,
        config: { responseModalities: ['IMAGE', 'TEXT'], temperature: 0.1 },
      }),
    'Face refine'
  );
  return extractImage(response) || sceneImage;
}

/** Write the front-page article. Returns a validated story object. */
export async function generateStory({ answers, scene }) {
  const response = await withRetry(
    () =>
      client().models.generateContent({
        model: TEXT_MODEL,
        contents: buildStoryPrompt(answers, scene),
        config: { responseMimeType: 'application/json', temperature: 0.9 },
      }),
    'Story generation'
  );
  const text = response?.text ?? '';
  return normalizeStory(parseJsonLoose(text), answers, scene);
}

function parseJsonLoose(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    return {};
  }
}

// Guarantee a fully-formed story so the newspaper always renders.
function normalizeStory(raw, answers, scene) {
  const name = (answers?.name || 'A Visionary Soul').toString().trim();
  const body = Array.isArray(raw.body) && raw.body.length ? raw.body : [
    `In the crowded hours of ${scene.era}, one name has begun to echo through the bazaars and the broadsheets alike: ${name}.`,
    `Colleagues recall a spirit of ${(answers?.starForm || 'unshakeable resolve').toString().toLowerCase()}, forever championing ${answers?.cause || 'freedom and dignity'} with a tireless heart.`,
    `Should the nation rise as its founders dream, historians may yet record that ${name} stood among them — not by chance, but by conviction.`,
  ];
  return {
    kicker: (raw.kicker || 'EXCLUSIVE').toString().slice(0, 24),
    headline: (raw.headline || `${name}: A Hero For The New Dawn`).toString(),
    subhead: (raw.subhead || `The nation discovers a champion of ${answers?.cause || 'freedom'}.`).toString(),
    byline: (raw.byline || 'By Pakistan Times Correspondent').toString(),
    dateline: (raw.dateline || scene.era).toString(),
    body: body.map((p) => p.toString()),
    pullQuote: (raw.pullQuote || 'Freedom is not given; it is earned by those who refuse to kneel.').toString(),
    prediction: (raw.prediction || `Remembered as the ${(answers?.role || 'patriot').toString().toLowerCase()} who gave the nation its courage.`).toString(),
  };
}
