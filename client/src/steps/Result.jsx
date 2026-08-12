import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import Newspaper from '../components/Newspaper.jsx';

export default function Result({ image, story, scene, answers, onRestart, onRegenerate }) {
  const paperRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function render() {
    // Make sure web fonts are loaded so the raster uses them...
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
    }
    // ...then skip html-to-image's remote-CSS font inlining (which throws a
    // cross-origin SecurityError on the Google Fonts stylesheet). The fonts are
    // already loaded in the document, so the 2x raster still renders with them.
    return toPng(paperRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: true,
      backgroundColor: '#f3e9d2',
      width: 794,
      height: paperRef.current.scrollHeight,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        width: '794px',
      },
    });
  }

  async function download() {
    setBusy(true);
    try {
      const dataUrl = await render();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `pakistan-times-${(answers?.name || 'front-page').replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
    } catch (e) {
      alert('Could not export the image. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    setBusy(true);
    try {
      const dataUrl = await render();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'pakistan-times.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Pakistan Times',
          text: 'My 14 August front page! 🇵🇰',
        });
      } else {
        await download();
      }
    } catch {
      /* user cancelled or unsupported */
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full max-w-4xl">
      <div className="text-center mb-5">
        <h2 className="step-title">Hot off the press! 🇵🇰</h2>
        <p className="step-sub">Your front page is ready. Download it, print it, share it.</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <button className="btn-primary" onClick={download} disabled={busy}>
          {busy ? 'Working…' : '⬇ Download PNG'}
        </button>
        <button className="btn-ghost" onClick={share} disabled={busy}>
          ↗ Share
        </button>
        <button className="btn-ghost" onClick={() => window.print()} disabled={busy}>
          🖨 Print
        </button>
        <button className="btn-ghost" onClick={onRegenerate} disabled={busy}>
          ♻ Regenerate
        </button>
        <button className="btn-ghost" onClick={onRestart} disabled={busy}>
          ↺ Start over
        </button>
      </div>

      <div className="paper-wrap">
        <div
          style={{
            transform: 'scale(var(--paper-scale, 1))',
            transformOrigin: 'top center',
          }}
        >
          <Newspaper ref={paperRef} image={image} story={story} scene={scene} answers={answers} />
        </div>
      </div>
    </section>
  );
}
