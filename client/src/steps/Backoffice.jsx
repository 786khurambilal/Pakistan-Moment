import { useEffect, useState } from 'react';
import { completeJob, fetchJobs, fetchSettings, updateSettings } from '../lib/api.js';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Backoffice() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({ generationMode: 'manual' });
  const [settingsError, setSettingsError] = useState(null);
  const [savingMode, setSavingMode] = useState(false);
  const [forms, setForms] = useState({});

  async function load() {
    try {
      const data = await fetchJobs();
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load jobs.');
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const data = await fetchSettings();
      setSettings(data.settings || { generationMode: 'manual' });
      setSettingsError(null);
    } catch (err) {
      setSettingsError(err.message || 'Could not load generation settings.');
    }
  }

  useEffect(() => {
    load();
    loadSettings();
    const timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, []);

  async function setGenerationMode(generationMode) {
    setSavingMode(true);
    try {
      const data = await updateSettings({ generationMode });
      setSettings(data.settings || { generationMode });
      setSettingsError(null);
    } catch (err) {
      setSettingsError(err.message || 'Could not update generation mode.');
    } finally {
      setSavingMode(false);
    }
  }

  function updateForm(id, patch) {
    setForms((current) => ({ ...current, [id]: { ...(current[id] || {}), ...patch } }));
  }

  async function copy(text) {
    await navigator.clipboard.writeText(text || '');
  }

  async function onImageFile(jobId, file) {
    if (!file) return;
    updateForm(jobId, { image: await readFileAsDataUrl(file) });
  }

  async function complete(jobId) {
    const form = forms[jobId] || {};
    if (!form.image) {
      alert('Upload the completed image first.');
      return;
    }
    await completeJob(jobId, {
      image: form.image,
      storyText: form.storyText || '',
    });
    updateForm(jobId, { image: '', storyText: '' });
    await load();
  }

  return (
    <main className="w-full max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="step-title">Backoffice Jobs</h2>
          <p className="step-sub">Copy the prompts, generate manually, then upload the finished image.</p>
        </div>
        <button className="btn-ghost" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <section className="card mb-5 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-paper">Generation Mode</h3>
            <p className="text-sm text-paper/60">
              Manual sends new users to the backoffice queue. Automatic calls Gemini immediately.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={settings.generationMode === 'manual' ? 'btn-primary' : 'btn-ghost'}
              onClick={() => setGenerationMode('manual')}
              disabled={savingMode}
            >
              Manual
            </button>
            <button
              className={settings.generationMode === 'auto' ? 'btn-primary' : 'btn-ghost'}
              onClick={() => setGenerationMode('auto')}
              disabled={savingMode}
            >
              Automatic
            </button>
          </div>
        </div>
        {settingsError && <p className="mt-3 text-sm text-red-200">{settingsError}</p>}
      </section>

      {error && <div className="card mb-4 p-4 text-red-200">{error}</div>}
      {!loading && jobs.length === 0 && <div className="card p-6 text-paper/70">No jobs yet.</div>}

      <div className="space-y-5">
        {jobs.map((job) => {
          const form = forms[job.id] || {};
          return (
            <article key={job.id} className="card p-4 md:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-display text-2xl text-paper">{job.answers?.name || 'Unnamed Guest'}</div>
                  <div className="text-sm text-paper/55">
                    {job.scene?.title} - {job.createdAt}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  job.status === 'complete' ? 'bg-emerald-200 text-emerald-950' : 'bg-amber-200 text-amber-950'
                }`}>
                  {job.status}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-paper/50">Guest Image</div>
                    <img className="w-full rounded border border-paper/20 bg-black" src={job.face} alt="Guest reference" />
                  </div>
                  {job.leaderReferences?.map((leader) => (
                    leader.image && (
                      <div key={leader.refKey}>
                        <div className="mb-1 text-xs uppercase tracking-wide text-paper/50">{leader.name}</div>
                        <img className="w-full rounded border border-paper/20 bg-black" src={leader.image} alt={leader.name} />
                      </div>
                    )
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="font-display text-lg text-paper">Final Built Prompt</label>
                      <button className="btn-ghost !px-4 !py-2 text-xs" onClick={() => copy(job.prompts?.final)}>
                        Copy
                      </button>
                    </div>
                    <textarea className="field-input h-72 font-mono text-xs" readOnly value={job.prompts?.final || ''} />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="font-display text-lg text-paper">Image Prompt</label>
                      <button className="btn-ghost !px-4 !py-2 text-xs" onClick={() => copy(job.prompts?.image)}>
                        Copy
                      </button>
                    </div>
                    <textarea className="field-input h-52 font-mono text-xs" readOnly value={job.prompts?.image || ''} />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="font-display text-lg text-paper">Story Prompt</label>
                      <button className="btn-ghost !px-4 !py-2 text-xs" onClick={() => copy(job.prompts?.story)}>
                        Copy
                      </button>
                    </div>
                    <textarea className="field-input h-44 font-mono text-xs" readOnly value={job.prompts?.story || ''} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block font-display text-lg text-paper">Completed Image</span>
                      <input
                        className="field-input file:mr-3 file:rounded-full file:border-0 file:bg-paper file:px-3 file:py-1 file:text-pak-dark"
                        type="file"
                        accept="image/*"
                        onChange={(e) => onImageFile(job.id, e.target.files?.[0])}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-display text-lg text-paper">Story JSON (optional)</span>
                      <textarea
                        className="field-input h-28 font-mono text-xs"
                        placeholder="Paste Gemini/GPT JSON here, or leave blank for fallback story."
                        value={form.storyText || ''}
                        onChange={(e) => updateForm(job.id, { storyText: e.target.value })}
                      />
                    </label>
                  </div>

                  {form.image && (
                    <img className="max-h-64 rounded border border-paper/20" src={form.image} alt="Completed preview" />
                  )}

                  <button className="btn-primary" onClick={() => complete(job.id)} disabled={job.status === 'complete'}>
                    Complete Job
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
