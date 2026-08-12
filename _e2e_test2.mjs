import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { generateScene } from './server/services/gemini.js';
import { getScene } from './server/lib/prompts.js';

const OUT = process.argv[2];
const sceneId = process.argv[3] || 'independence-1947';
const tag = process.argv[4] || 'x';
const faceBuf = fs.readFileSync(path.join(OUT, 'test-1-face.png'));
const face = `data:image/png;base64,${faceBuf.toString('base64')}`;

function save(dataUrl, file) {
  const m = /^data:(.+?);base64,(.*)$/s.exec(dataUrl);
  fs.writeFileSync(file, Buffer.from(m ? m[2] : dataUrl, 'base64'));
}

const scene = getScene(sceneId);
console.log(`generateScene(${sceneId})…`);
const img = await generateScene({ face, scene });
const out = path.join(OUT, `test-${tag}.png`);
save(img, out);
console.log('  saved', path.basename(out));
