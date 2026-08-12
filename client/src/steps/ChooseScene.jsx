export default function ChooseScene({ scenes, selected, onSelect, onBack, onNext }) {
  return (
    <section className="card wizard-card p-6 md:p-8">
      <h2 className="step-title">Choose your moment in history</h2>
      <p className="step-sub">Pick the scene you'll appear in, surrounded by the founders.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {scenes.map((s) => {
          const active = s.id === selected;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`text-left rounded-2xl border p-5 transition ${
                active
                  ? 'border-paper bg-paper/10 ring-2 ring-paper/60'
                  : 'border-paper/15 bg-black/20 hover:border-paper/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-paper">{s.title}</h3>
                <span
                  className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
                    active ? 'border-paper bg-paper' : 'border-paper/40'
                  }`}
                />
              </div>
              <p className="mt-1 text-sm uppercase tracking-wide text-paper/55 font-display">
                {s.era}
              </p>
              <p className="mt-2 text-paper/75">{s.blurb}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-primary" onClick={onNext} disabled={!selected}>
          Continue →
        </button>
      </div>
    </section>
  );
}
