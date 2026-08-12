// Direct OpenAI image integration.
// Uses /v1/images/edits so the guest selfie and leader references can be supplied.
import { buildScenePrompt, buildRefinePrompt } from '../lib/prompts.js';
import { loadLeaderReferences } from './leaderReferences.js';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-image-1-mini';
const DEFAULT_SIZE = '1024x1024';
const DEFAULT_QUALITY = 'low';
const DEFAULT_OUTPUT_FORMAT = 'png';

function config() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
  const size = process.env.OPENAI_IMAGE_SIZE || DEFAULT_SIZE;
  const quality = process.env.OPENAI_IMAGE_QUALITY || DEFAULT_QUALITY;
  const outputFormat = process.env.OPENAI_IMAGE_OUTPUT_FORMAT || DEFAULT_OUTPUT_FORMAT;
  const inputFidelity = process.env.OPENAI_IMAGE_INPUT_FIDELITY || '';

  if (!apiKey) throw new Error('OPENAI_API_KEY is not set.');

  return { apiKey, baseUrl, model, size, quality, outputFormat, inputFidelity };
}

function parseImage(input, fallbackMime = 'image/jpeg') {
  if (!input) throw new Error('No image data provided.');
  const m = /^data:(.+?);base64,(.*)$/s.exec(input);
  if (m) return { mimeType: m[1], data: m[2] };
  return { mimeType: fallbackMime, data: input };
}

function appendImage(form, image, filename) {
  const blob = new Blob([Buffer.from(image.data, 'base64')], { type: image.mimeType });
  form.append('image[]', blob, filename);
}

async function callOpenAIImageEdit({ prompt, images, label }) {
  const c = config();
  const form = new FormData();

  form.append('model', c.model);
  form.append('prompt', prompt);
  form.append('n', '1');
  form.append('size', c.size);
  form.append('quality', c.quality);
  form.append('output_format', c.outputFormat);

  // input_fidelity is useful for faces on gpt-image-1, but is not supported by gpt-image-1-mini.
  if (c.inputFidelity && c.model !== 'gpt-image-1-mini') {
    form.append('input_fidelity', c.inputFidelity);
  }

  images.forEach((img, i) => {
    appendImage(form, img.image, img.filename || `input-${i + 1}.jpg`);
  });

  const res = await fetch(`${c.baseUrl}/images/edits`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.apiKey}` },
    body: form,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const err = data?.error;
    const message = err?.message || data?.message || res.statusText || 'OpenAI image request failed.';
    const code = err?.code || data?.code || res.status;
    throw new Error(`${label} failed (${code}): ${message}`);
  }

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${label} returned no image.`);
  return `data:image/${c.outputFormat};base64,${b64}`;
}

async function withRetry(fn, label, tries = 2) {
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

export async function generateScene({ face, scene }) {
  const faceImage = parseImage(face);
  const leaders = loadLeaderReferences(scene);
  const attached = leaders.map((leader) => ({ name: leader.name, refKey: leader.refKey }));
  const prompt = buildScenePrompt(scene, attached, []);
  const images = [
    { image: faceImage, filename: 'guest-of-honour.jpg' },
    ...leaders.map((leader) => ({ image: leader.image, filename: leader.filename })),
  ];

  return withRetry(
    () => callOpenAIImageEdit({ prompt, images, label: 'OpenAI scene generation' }),
    'OpenAI scene generation'
  );
}

export async function refineFace({ sceneImage, face }) {
  const generated = parseImage(sceneImage, 'image/png');
  const faceImage = parseImage(face);
  const images = [
    { image: generated, filename: 'generated-scene.png' },
    { image: faceImage, filename: 'guest-reference.jpg' },
  ];

  try {
    return await withRetry(
      () => callOpenAIImageEdit({ prompt: buildRefinePrompt(), images, label: 'OpenAI face refine' }),
      'OpenAI face refine'
    );
  } catch {
    return sceneImage;
  }
}
