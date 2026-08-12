import { Router } from 'express';
import { generateStory } from '../services/gemini.js';
import { generateScene, refineFace, imageProvider } from '../services/imageProvider.js';
import { faceSwap } from '../services/wavespeed.js';
import { getScene, SCENES, QUIZ } from '../lib/prompts.js';
import { completeManualJob, createManualJob, getManualJob, listManualJobs } from '../lib/manualJobs.js';
import { getSettings, updateSettings } from '../lib/settings.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    imageProvider,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'paste-your-key-here'),
    hasAzureOpenAIKey: Boolean(process.env.AZURE_OPENAI_API_KEY),
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
  });
});

// Expose scene + quiz config to the client so both stay in one source of truth.
router.get('/config', (_req, res) => {
  const scenes = SCENES.map((s) => ({
    id: s.id,
    title: s.title,
    era: s.era,
    blurb: s.blurb,
    leaders: s.leaders.map((l) => l.name),
  }));
  res.json({ scenes, quiz: QUIZ, ...getSettings() });
});

router.get('/settings', (_req, res) => {
  res.json({ settings: getSettings() });
});

router.put('/settings', (req, res) => {
  try {
    res.json({ settings: updateSettings(req.body || {}) });
  } catch (err) {
    console.error('[settings:update]', err);
    res.status(500).json({ error: err.message || 'Settings update failed.' });
  }
});

// POST /api/jobs { face, sceneId, answers } -> manual backoffice job
router.post('/jobs', async (req, res) => {
  try {
    const { face, sceneId, answers } = req.body || {};
    const scene = getScene(sceneId);
    const job = await createManualJob({ face, scene, answers: answers || {} });
    res.status(201).json({ job });
  } catch (err) {
    console.error('[jobs:create]', err);
    res.status(500).json({ error: err.message || 'Job creation failed.' });
  }
});

router.get('/jobs', async (_req, res) => {
  try {
    res.json({ jobs: await listManualJobs() });
  } catch (err) {
    console.error('[jobs:list]', err);
    res.status(500).json({ error: err.message || 'Job listing failed.' });
  }
});

router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await getManualJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json({ job });
  } catch (err) {
    console.error('[jobs:get]', err);
    res.status(500).json({ error: err.message || 'Job lookup failed.' });
  }
});

router.post('/jobs/:id/complete', async (req, res) => {
  try {
    const job = await completeManualJob(req.params.id, req.body || {});
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json({ job });
  } catch (err) {
    console.error('[jobs:complete]', err);
    res.status(500).json({ error: err.message || 'Job completion failed.' });
  }
});

// POST /api/scene  { face: dataURL, sceneId }  -> { image: dataURL }
router.post('/scene', async (req, res) => {
  try {
    const { face, sceneId } = req.body || {};
    if (!face) return res.status(400).json({ error: 'Missing face image.' });
    const scene = getScene(sceneId);

    // Step 1: Generate the vintage scene with Gemini (face may not be accurate)
    console.log('[scene] Generating scene with Gemini...');
    const raw = await generateScene({ face, scene });

    // Step 2: Use WaveSpeed to swap the guest's real face onto the center person
    let image = raw;
    if (process.env.WAVESPEED_API_KEY) {
      console.log('[scene] Running WaveSpeed face-swap...');
      try {
        image = await faceSwap(raw, face);
      } catch (swapErr) {
        console.error('[scene] WaveSpeed face-swap failed, using Gemini output:', swapErr.message);
        // Fall back to Gemini refine if WaveSpeed fails
        if (process.env.FACE_REFINE !== '0') {
          image = await refineFace({ sceneImage: raw, face });
        }
      }
    } else if (process.env.FACE_REFINE !== '0') {
      // No WaveSpeed key — fall back to Gemini refine
      image = await refineFace({ sceneImage: raw, face });
    }

    res.json({ image });
  } catch (err) {
    console.error('[scene]', err);
    res.status(500).json({ error: err.message || 'Scene generation failed.' });
  }
});

// POST /api/story  { answers, sceneId }  -> { story }
router.post('/story', async (req, res) => {
  try {
    const { answers, sceneId } = req.body || {};
    const scene = getScene(sceneId);
    const story = await generateStory({ answers: answers || {}, scene });
    res.json({ story });
  } catch (err) {
    console.error('[story]', err);
    res.status(500).json({ error: err.message || 'Story generation failed.' });
  }
});

export default router;
