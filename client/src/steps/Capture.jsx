import { useEffect, useRef, useState } from 'react';
import { startCamera, stopCamera, capturePortrait, fileToDataURL } from '../lib/camera.js';

export default function Capture({ initial, onBack, onDone }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const [mode, setMode] = useState(initial ? 'preview' : null); // null = choose, 'camera', 'upload', 'preview'
  const [shot, setShot] = useState(initial || null);
  const [camError, setCamError] = useState(null);
  const [ready, setReady] = useState(false);

  // Start camera when mode is 'camera'
  useEffect(() => {
    if (mode !== 'camera') return;
    let active = true;
    startCamera(videoRef.current)
      .then((stream) => {
        if (!active) {
          stopCamera(stream);
          return;
        }
        streamRef.current = stream;
        setReady(true);
      })
      .catch((err) => {
        setCamError(err?.message || 'Camera unavailable');
      });
    return () => {
      active = false;
      stopCamera(streamRef.current);
      streamRef.current = null;
      setReady(false);
    };
  }, [mode]);

  function snap() {
    const img = capturePortrait(videoRef.current);
    if (img) {
      setShot(img);
      stopCamera(streamRef.current);
      streamRef.current = null;
      setMode('preview');
    }
  }

  function retake() {
    setShot(null);
    setMode(null);
    setCamError(null);
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (file) {
      const img = await fileToDataURL(file);
      setShot(img);
      setMode('preview');
    }
  }

  function chooseUpload() {
    fileRef.current?.click();
  }

  // --- Choice screen: Camera or Upload ---
  if (!mode) {
    return (
      <section className="card wizard-card p-6 md:p-8">
        <h2 className="step-title">Add your photo</h2>
        <p className="step-sub">Choose how you'd like to provide your photo for the front page.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-lg mx-auto">
          <button
            onClick={() => setMode('camera')}
            className="flex flex-col items-center gap-3 rounded-2xl border border-paper/20 bg-black/20 p-8 hover:border-paper/50 hover:bg-paper/5 transition"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-paper/70">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="font-semibold text-paper text-lg">Use Camera</span>
            <span className="text-paper/50 text-sm">Take a selfie now</span>
          </button>

          <button
            onClick={chooseUpload}
            className="flex flex-col items-center gap-3 rounded-2xl border border-paper/20 bg-black/20 p-8 hover:border-paper/50 hover:bg-paper/5 transition"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-paper/70">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="font-semibold text-paper text-lg">Upload Photo</span>
            <span className="text-paper/50 text-sm">Choose from your device</span>
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

        <div className="mt-6 flex items-center justify-between">
          <button className="btn-ghost" onClick={onBack}>← Back</button>
          <div />
        </div>
      </section>
    );
  }

  // --- Camera mode ---
  if (mode === 'camera') {
    return (
      <section className="card wizard-card p-6 md:p-8">
        <h2 className="step-title">Take your selfie</h2>
        <p className="step-sub">Look straight at the camera, good light, face centered in the oval.</p>

        <div className="mt-6 mx-auto w-full max-w-sm">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-2 border-paper/25 bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed border-white/40" />
            {camError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-black/80">
                <p className="text-paper/80">{camError}</p>
                <button className="btn-ghost" onClick={() => { setMode(null); setCamError(null); }}>
                  Go back
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button className="btn-ghost" onClick={() => setMode(null)}>← Back</button>
          <button className="btn-primary" onClick={snap} disabled={!ready || !!camError}>
            {ready ? 'Capture' : 'Starting camera…'}
          </button>
        </div>
      </section>
    );
  }

  // --- Preview mode (after capture or upload) ---
  return (
    <section className="card wizard-card p-6 md:p-8">
      <h2 className="step-title">Looking good?</h2>
      <p className="step-sub">Make sure your face is clearly visible and well-lit.</p>

      <div className="mt-6 mx-auto w-full max-w-sm">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-2 border-paper/25 bg-black">
          <img src={shot} alt="Your photo" className="h-full w-full object-cover" />
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button className="btn-ghost" onClick={retake}>← Choose again</button>
        <button className="btn-primary" onClick={() => onDone(shot)}>
          Use this photo →
        </button>
      </div>
    </section>
  );
}
