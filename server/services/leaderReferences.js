import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEADERS_DIR = path.join(__dirname, '..', 'assets', 'leaders');
const EXTS = ['jpg', 'jpeg', 'png', 'webp'];

export const QUAID_NAME = 'Muhammad Ali Jinnah (Quaid-e-Azam)';
const MAX_LEADER_REFERENCES = Number(process.env.MAX_LEADER_REFERENCES || 1);

function loadReference(leader) {
  for (const ext of EXTS) {
    const file = path.join(LEADERS_DIR, `${leader.refKey}.${ext}`);
    if (fs.existsSync(file)) {
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const data = fs.readFileSync(file).toString('base64');
      return {
        name: leader.name,
        refKey: leader.refKey,
        filename: `${leader.refKey}.${ext}`,
        image: { mimeType, data },
        part: { inlineData: { mimeType, data } },
      };
    }
  }
  return null;
}

export function loadLeaderReferences(scene) {
  const leaders = [...scene.leaders].sort((a, b) => {
    if (a.refKey === 'jinnah') return -1;
    if (b.refKey === 'jinnah') return 1;
    return 0;
  });
  return leaders.map(loadReference).filter(Boolean).slice(0, MAX_LEADER_REFERENCES);
}
