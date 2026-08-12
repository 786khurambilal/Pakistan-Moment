import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import generateRouter from './routes/generate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Base64 images ride in JSON bodies, so allow a generous limit.
app.use(express.json({ limit: '25mb' }));

app.use('/api', generateRouter);

// In production, serve the built client.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(PORT, () => {
  const ready = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'paste-your-key-here';
  const imageProvider = process.env.IMAGE_PROVIDER || 'gemini';
  const azureReady = process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY;
  console.log(`\n  Pakistan Times server → http://localhost:${PORT}`);
  console.log(`  Gemini key: ${ready ? 'loaded ✓' : 'MISSING ✗  (add GEMINI_API_KEY to .env)'}\n`);
});
