// WaveSpeed AI face-swap integration.
// Calls the Image Face Swap API to replace the center person's face
// in the generated scene with the guest's real selfie.
// The API accepts base64 data URIs directly — no file upload needed.

const API_BASE = 'https://api.wavespeed.ai/api/v3';
const FACE_SWAP_ENDPOINT = `${API_BASE}/wavespeed-ai/image-face-swap`;
const POLL_INTERVAL = 2500; // ms
const MAX_POLL_TIME = 120000; // 2 minutes max

function getApiKey() {
  const key = process.env.WAVESPEED_API_KEY;
  if (!key) throw new Error('WAVESPEED_API_KEY is not set in .env');
  return key;
}

/**
 * Poll for task completion. Returns the result data.
 */
async function pollResult(resultUrl) {
  const start = Date.now();

  while (Date.now() - start < MAX_POLL_TIME) {
    const res = await fetch(resultUrl, {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`WaveSpeed poll failed (${res.status}): ${text}`);
    }

    const json = await res.json();
    const result = json?.data || json;
    const status = result?.status;

    if (status === 'completed') {
      return result;
    }
    if (status === 'failed' || status === 'cancelled' || status === 'timeout') {
      const errMsg = result?.error || JSON.stringify(result);
      throw new Error(`WaveSpeed task ${status}: ${errMsg}`);
    }

    // Still processing — wait and retry
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  throw new Error('WaveSpeed face-swap timed out after 2 minutes.');
}

/**
 * Swap the face in a generated scene image with the guest's selfie.
 * @param {string} sceneImage - base64 data URL of the generated scene
 * @param {string} faceImage - base64 data URL of the guest selfie
 * @returns {string} base64 data URL of the face-swapped result
 */
export async function faceSwap(sceneImage, faceImage) {
  console.log('[wavespeed] Submitting face-swap task...');

  const submitRes = await fetch(FACE_SWAP_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: sceneImage,
      face_image: faceImage,
      target_index: 0, // swap the largest/most prominent face (center person)
      target_gender: 'all',
      output_format: 'png',
    }),
  });

  if (!submitRes.ok) {
    const text = await submitRes.text();
    throw new Error(`WaveSpeed face-swap submit failed (${submitRes.status}): ${text}`);
  }

  const submitData = await submitRes.json();
  const task = submitData?.data || submitData;
  const predictionId = task?.id;
  const resultUrl = task?.urls?.get || `${API_BASE}/predictions/${predictionId}/result`;

  if (!predictionId) {
    throw new Error(`WaveSpeed face-swap returned no prediction ID: ${JSON.stringify(submitData)}`);
  }

  console.log(`[wavespeed] Task submitted: ${predictionId}. Polling for result...`);
  const result = await pollResult(resultUrl);

  // Get the output image — could be a URL or base64 depending on enable_base64_output
  const outputs = result?.outputs || result?.output;
  const output = Array.isArray(outputs) ? outputs[0] : outputs;

  if (!output) {
    throw new Error(`WaveSpeed face-swap returned no output: ${JSON.stringify(result).substring(0, 200)}`);
  }

  // If it's already a full data URI, return directly
  if (typeof output === 'string' && output.startsWith('data:')) {
    console.log('[wavespeed] Face-swap complete (data URI output).');
    return output;
  }

  // If it's raw base64 (no data: prefix, no http), wrap it as a data URI
  if (typeof output === 'string' && !output.startsWith('http') && output.length > 200) {
    console.log('[wavespeed] Face-swap complete (raw base64 output).');
    return `data:image/png;base64,${output}`;
  }

  // Otherwise it's a URL — download and convert to base64
  console.log('[wavespeed] Downloading result image from URL...');
  const imageRes = await fetch(output);
  if (!imageRes.ok) {
    throw new Error(`Failed to download WaveSpeed result (${imageRes.status})`);
  }

  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
  const mime = imageRes.headers.get('content-type') || 'image/png';
  const base64 = imageBuffer.toString('base64');

  console.log('[wavespeed] Face-swap complete.');
  return `data:${mime};base64,${base64}`;
}
