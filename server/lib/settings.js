import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  generationMode: process.env.GENERATION_MODE === 'auto' ? 'auto' : 'manual',
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function normalizeSettings(settings = {}) {
  return {
    generationMode: settings.generationMode === 'auto' ? 'auto' : 'manual',
  };
}

export function getSettings() {
  ensureStore();
  if (!fs.existsSync(SETTINGS_FILE)) return DEFAULT_SETTINGS;

  try {
    return normalizeSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) });
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(patch = {}) {
  ensureStore();
  const next = normalizeSettings({ ...getSettings(), ...patch });
  fs.writeFileSync(SETTINGS_FILE, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}
