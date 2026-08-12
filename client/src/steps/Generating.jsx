import { useEffect, useState } from 'react';

const MESSAGES = [
  'Developing your photograph in the darkroom...',
  'Gathering the founders for the portrait...',
  'Making sure your face stays exactly yours...',
  "Setting the type for tomorrow's headline...",
  'Interviewing witnesses to your greatness...',
  'Pressing the front page...',
];

export default function Generating({ error, jobId, mode, onRetry, onBack }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (error) return;
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 2600);
    return () => clearInterval(t);
  }, [error]);

  if (error) {
    return (
      <section className="card wizard-card p-8 text-center">
        <h2 className="step-title mt-3">The press jammed</h2>
        <p className="step-sub">{error}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="btn-ghost" onClick={onBack}>
            Back
          </button>
          <button className="btn-primary" onClick={onRetry}>
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card wizard-card p-10 text-center">
      <div className="mx-auto h-16 w-16 rounded-full border-4 border-paper/20 border-t-paper spin-slow" />
      <h2 className="step-title mt-6">Printing your front page...</h2>
      <p className="step-sub min-h-[3rem]">{MESSAGES[i]}</p>
      <p className="mt-4 text-xs text-paper/40">
        {mode === 'auto'
          ? 'Gemini is creating the image and story now. Please keep this page open.'
          : 'Your request is in the manual press queue. Please keep this page open.'}
      </p>
      {jobId && <p className="mt-2 font-mono text-[11px] text-paper/35">Job {jobId}</p>}
    </section>
  );
}
