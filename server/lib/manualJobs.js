import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildScenePrompt, buildStoryPrompt } from './prompts.js';
import { loadLeaderReferences } from '../services/leaderReferences.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const JOBS_TABLE = 'manual_jobs';

function useSupabase() {
  return process.env.MANUAL_JOB_STORE === 'supabase';
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_KEY are required for Supabase job storage.');
  return { url, key };
}

async function supabaseRequest(pathname, options = {}) {
  const { url, key } = supabaseConfig();
  const res = await fetch(`${url}/rest/v1/${pathname}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase request failed (${res.status}): ${text || res.statusText}`);
  }
  const text = await res.text();
  if (!text.trim()) return null;
  return JSON.parse(text);
}

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(JOBS_FILE)) fs.writeFileSync(JOBS_FILE, '[]\n');
}

function readFileJobs() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFileJobs(jobs) {
  ensureStore();
  fs.writeFileSync(JOBS_FILE, `${JSON.stringify(jobs, null, 2)}\n`);
}

async function readJobs() {
  if (!useSupabase()) return readFileJobs();
  const rows = await supabaseRequest(`${JOBS_TABLE}?select=payload&order=created_at.desc`);
  return rows.map((row) => row.payload).filter(Boolean);
}

async function getStoredJob(id) {
  if (!useSupabase()) return readFileJobs().find((job) => job.id === id) || null;
  const rows = await supabaseRequest(`${JOBS_TABLE}?id=eq.${encodeURIComponent(id)}&select=payload&limit=1`);
  return rows[0]?.payload || null;
}

async function insertJob(job) {
  if (!useSupabase()) {
    const jobs = readFileJobs();
    jobs.unshift(job);
    writeFileJobs(jobs);
    return job;
  }

  await supabaseRequest(JOBS_TABLE, {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      id: job.id,
      status: job.status,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
      payload: job,
    }),
  });
  return job;
}

async function updateJob(job) {
  if (!useSupabase()) {
    const jobs = readFileJobs();
    const index = jobs.findIndex((stored) => stored.id === job.id);
    if (index === -1) return null;
    jobs[index] = job;
    writeFileJobs(jobs);
    return job;
  }

  await supabaseRequest(`${JOBS_TABLE}?id=eq.${encodeURIComponent(job.id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      status: job.status,
      updated_at: job.updatedAt,
      payload: job,
    }),
  });
  return job;
}

function parseJsonLoose(text) {
  if (!text) return null;
  if (typeof text === 'object') return text;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeStory(raw, answers, scene) {
  const name = (answers?.name || 'A Visionary Soul').toString().trim();
  const body = Array.isArray(raw?.body) && raw.body.length ? raw.body : [
    `In the crowded hours of ${scene.era}, one name has begun to echo through the bazaars and the broadsheets alike: ${name}.`,
    `Colleagues recall a spirit of ${(answers?.starForm || 'unshakeable resolve').toString().toLowerCase()}, forever championing ${answers?.cause || 'freedom and dignity'} with a tireless heart.`,
    `Should the nation rise as its founders dream, historians may yet record that ${name} stood among them by conviction, courage, and uncommon purpose.`,
  ];
  return {
    kicker: (raw?.kicker || 'EXCLUSIVE').toString().slice(0, 24),
    headline: (raw?.headline || `${name}: A Hero For The New Dawn`).toString(),
    subhead: (raw?.subhead || `The nation discovers a champion of ${answers?.cause || 'freedom'}.`).toString(),
    byline: (raw?.byline || 'By Pakistan Times Correspondent').toString(),
    dateline: (raw?.dateline || scene.era).toString(),
    body: body.map((p) => p.toString()),
    pullQuote: (raw?.pullQuote || 'Freedom is not given; it is earned by those who refuse to kneel.').toString(),
    prediction: (raw?.prediction || `Remembered as the ${(answers?.role || 'patriot').toString().toLowerCase()} who gave the nation its courage.`).toString(),
  };
}

function leaderReferenceImages(scene) {
  const references = loadLeaderReferences(scene);
  return scene.leaders.map((leader) => {
    const reference = references.find((ref) => ref.refKey === leader.refKey);
    return {
      name: leader.name,
      refKey: leader.refKey,
      image: reference ? `data:${reference.image.mimeType};base64,${reference.image.data}` : null,
    };
  });
}

function buildFinalPrompt({ imagePrompt, storyPrompt, scene, answers, leaders }) {
  const leaderLines = leaders
    .map((leader) => `- ${leader.name}`)
    .join('\n');

  return [
    'PAKISTAN TIMES MANUAL GENERATION',
    '',
    'Goal: create the final vintage founder-group photograph and optional newspaper story JSON for this guest.',
    '',
    'Reference image order:',
    'Image 1: Guest selfie/reference image below. Preserve this person exactly.',
    'Image 2..N: leader reference images below, in the listed order. Use each leader image only for that leader, never for the guest.',
    '',
    'Historical figure to include:',
    leaderLines || '- None',
    '',
    'Guest details:',
    `Name: ${answers?.name || 'Unnamed Guest'}`,
    `Pronouns: ${answers?.gender || 'Neutral (they/them)'}`,
    `Role: ${answers?.role || 'a devoted patriot'}`,
    `Alter ego: ${answers?.alterEgo || 'a person of many talents'}`,
    `Star form: ${answers?.starForm || 'unshakeable resolve'}`,
    `Cause: ${answers?.cause || 'freedom and dignity'}`,
    `Scene: ${scene.title} (${scene.era})`,
    '',
    'IMAGE PROMPT',
    imagePrompt,
    '',
    'STORY PROMPT',
    storyPrompt,
    '',
    'Backoffice output:',
    '1. Upload the completed image in the Completed Image field.',
    '2. Paste the story JSON into Story JSON if you generated it; otherwise leave it blank and the app will use a fallback story.',
  ].join('\n');
}

export async function createManualJob({ face, scene, answers }) {
  if (!face) throw new Error('Missing face image.');

  const now = new Date().toISOString();
  const leaders = leaderReferenceImages(scene);
  const attached = leaders.filter((l) => l.image).map((l) => ({ name: l.name, refKey: l.refKey }));
  const unattached = leaders.filter((l) => !l.image).map((l) => l.name);
  const imagePrompt = buildScenePrompt(scene, attached, unattached);
  const storyPrompt = buildStoryPrompt(answers || {}, scene);
  const job = {
    id: randomUUID(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    face,
    answers: answers || {},
    scene: {
      id: scene.id,
      title: scene.title,
      era: scene.era,
      blurb: scene.blurb,
      leaders: scene.leaders,
    },
    prompts: {
      final: buildFinalPrompt({ imagePrompt, storyPrompt, scene, answers: answers || {}, leaders }),
      image: imagePrompt,
      story: storyPrompt,
    },
    leaderReferences: leaders,
    result: null,
  };
  return insertJob(job);
}

export async function listManualJobs() {
  return readJobs();
}

export async function getManualJob(id) {
  return getStoredJob(id);
}

export async function completeManualJob(id, { image, story, storyText }) {
  if (!image) throw new Error('Missing completed image.');

  const job = await getStoredJob(id);
  if (!job) return null;
  const rawStory = parseJsonLoose(story || storyText) || {};
  const completed = {
    ...job,
    status: 'complete',
    updatedAt: new Date().toISOString(),
    result: {
      image,
      story: normalizeStory(rawStory, job.answers, job.scene),
      scene: job.scene,
      answers: job.answers,
    },
  };
  return updateJob(completed);
}
