// Azure OpenAI image integration for Pakistan Times.
// Uses the image edits endpoint so the user's selfie can be supplied as reference input.
import { buildScenePrompt, buildRefinePrompt } from '../lib/prompts.js';
import { loadLeaderReferences } from './leaderReferences.js';

const DEFAULT_API_VERSION = '2025-04-01-preview';
const DEFAULT_DEPLOYMENT = 'gpt-image-1-mini';
const DEFAULT_SIZE = '1024x1024';
const DEFAULT_QUALITY = 'low';

function config() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT || DEFAULT_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || DEFAULT_API_VERSION;
  const size = process.env.AZURE_OPENAI_IMAGE_SIZE || DEFAULT_SIZE;
  const quality = process.env.AZURE_OPENAI_IMAGE_QUALITY || DEFAULT_QUALITY;

  if (!endpoint) throw new Error('AZURE_OPENAI_ENDPOINT is not set.');
  if (!apiKey) throw new Error('AZURE_OPENAI_API_KEY is not set.');

  return {
    endpoint: endpoint.replace(/\/+$/, ''),
    apiKey,
    deployment,
    apiVersion,
    size,
    quality,
  };
}

function editUrl(c) {
  const deployment = encodeURIComponent(c.deployment);
  const apiVersion = encodeURIComponent(c.apiVersion);
  return `${c.endpoint}/openai/deployments/${deployment}/images/edits?api-version=${apiVersion}`;
}

function parseImage(input, fallbackMime = 'image/jpeg') {
  if (!input) throw new Error('No image data provided.');
  const m = /^data:(.+?);base64,(.*)$/s.exec(input);
  if (m) return { mimeType: m[1], data: m[2] };
  return { mimeType: fallbackMime, data: input };
}

function appendImage(form, fieldName, image, filename) {
  const blob = new Blob([Buffer.from(image.data, 'base64')], { type: image.mimeType });
  form.append(fieldName, blob, filename);
}

function leaderNames(scene) {
  return scene.leaders.map((leader) => leader.name);
}

async function callAzureImageEdit({ prompt, images, label }) {
  const c = config();
  const form = new FormData();

  form.append('prompt', prompt);
  form.append('model', c.deployment);
  form.append('n', '1');
  form.append('size', c.size);
  form.append('quality', c.quality);

  images.forEach((img, i) => {
    appendImage(form, 'image[]', img.image, img.filename || `input-${i + 1}.png`);
  });

  const res = await fetch(editUrl(c), {
    method: 'POST',
    headers: { 'api-key': c.apiKey },
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
    const message = err?.message || data?.message || res.statusText || 'Azure image request failed.';
    const code = err?.code || data?.code || res.status;
    throw new Error(`${label} failed (${code}): ${message}`);
  }

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${label} returned no image.`);
  return `data:image/png;base64,${b64}`;
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

  return withRetry(() => callAzureImageEdit({ prompt, images, label: 'Azure scene generation' }), 'Azure scene generation');
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
      () => callAzureImageEdit({ prompt: buildRefinePrompt(), images, label: 'Azure face refine' }),
      'Azure face refine'
    );
  } catch {
    return sceneImage;
  }
}
