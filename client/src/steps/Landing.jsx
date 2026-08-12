export default function Landing({ onStart }) {
  return (
    <section className="card wizard-card p-8 md:p-12 text-center">
      <p className="font-display text-lg text-paper/80 italic">14 August · Independence Day</p>
      <h2 className="step-title mt-2 text-4xl md:text-5xl leading-tight">
        Travel back to 1947 and stand beside the founders of Pakistan.
      </h2>
      <p className="step-sub mx-auto max-w-xl">
        Take a photo, choose your moment in history, answer a few playful questions — and we’ll
        print you onto the front page of a vintage newspaper, right in the middle of the leaders
        who built a nation. Your face stays <em>exactly</em> yours.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button className="btn-primary" onClick={onStart}>
          Begin your journey →
        </button>
      </div>

      <ol className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
        {[
          ['1', 'Snap a selfie', 'Use your webcam'],
          ['2', 'Pick the moment', 'Choose a historic scene'],
          ['3', 'Answer a few', 'Fun personality questions'],
          ['4', 'Get your headline', 'A shareable A4 front page'],
        ].map(([n, t, s]) => (
          <li key={n} className="rounded-xl border border-paper/10 bg-black/20 p-4">
            <div className="font-display text-2xl text-paper/50">{n}</div>
            <div className="font-semibold text-paper mt-1">{t}</div>
            <div className="text-paper/60 text-sm">{s}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
