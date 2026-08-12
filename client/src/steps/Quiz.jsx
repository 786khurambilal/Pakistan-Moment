import { useState } from 'react';

export default function Quiz({ quiz, initial, onBack, onSubmit }) {
  const [answers, setAnswers] = useState(() => ({ ...initial }));

  const set = (id, val) => setAnswers((a) => ({ ...a, [id]: val }));

  const missingRequired = quiz.some(
    (q) => q.required && !String(answers[q.id] || '').trim()
  );

  return (
    <section className="card wizard-card p-6 md:p-8">
      <h2 className="step-title">A few questions for the record</h2>
      <p className="step-sub">Our correspondent needs details for your story.</p>

      <div className="mt-6 space-y-6">
        {quiz.map((q) => (
          <div key={q.id}>
            <label className="block font-display text-lg text-paper">
              {q.label}
              {q.required && <span className="text-paper/40"> *</span>}
            </label>
            {q.hint && <p className="text-sm text-paper/50 mb-2">{q.hint}</p>}

            {q.type === 'choice' ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const active = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set(q.id, opt)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? 'bg-paper text-pak-dark'
                          : 'border border-paper/25 text-paper/80 hover:border-paper/50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : q.type === 'select' ? (
              <select
                className="field-input mt-1"
                value={answers[q.id] || ''}
                onChange={(e) => set(q.id, e.target.value)}
              >
                <option value="" disabled>
                  {q.placeholder || 'Select one'}
                </option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="field-input mt-1"
                placeholder={q.placeholder || ''}
                value={answers[q.id] || ''}
                onChange={(e) => set(q.id, e.target.value)}
                maxLength={80}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-primary" onClick={() => onSubmit(answers)} disabled={missingRequired}>
          Print my front page ✦
        </button>
      </div>
    </section>
  );
}
