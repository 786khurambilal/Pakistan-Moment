import { forwardRef } from 'react';
import '../styles/newspaper.css';

// The A4 vintage front page. `ref` points at the .newspaper node for PNG export.
const Newspaper = forwardRef(function Newspaper({ image, story, scene, answers }, ref) {
  const s = story || {};
  const name = (answers?.name || 'Our Hero').trim();
  const caption = scene
    ? `${name}, pictured among the founders — ${scene.title}, ${scene.era}.`
    : `${name}, pictured among the founders of the nation.`;

  return (
    <div className="newspaper" ref={ref}>
      <header className="mast">
        <div className="mast-urdu">پاکستان ٹائمز</div>
        <h1 className="mast-title">Pakistan Times</h1>
        <div className="mast-rule">
          <span>Vol. I · No. 1947</span>
          <span className="dot">✶ Independence Edition ✶</span>
          <span>14 August 1947</span>
        </div>
      </header>

      <div className="band">Breaking News</div>

      <div className="kicker">{s.kicker || 'EXCLUSIVE'}</div>
      <h2 className="headline">{s.headline || `${name}: A Hero For The New Dawn`}</h2>
      <p className="subhead">{s.subhead || `The nation discovers a new champion.`}</p>

      <div className="content">
        <div className="article">
          <div className="byline">
            <b>{s.byline || 'By Pakistan Times Correspondent'}</b>
            {s.dateline ? ` · ${s.dateline}` : ''}
          </div>
          {(s.body || []).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.pullQuote && <blockquote className="pull">“{s.pullQuote}”</blockquote>}
        </div>

        <div>
          <figure className="hero">
            {image ? (
              <img src={image} alt={caption} crossOrigin="anonymous" />
            ) : (
              <div style={{ aspectRatio: '4 / 5', background: '#d9cba8' }} />
            )}
            <figcaption className="hero-cap">{caption}</figcaption>
          </figure>

          <div className="prediction">
            <div className="lbl">What History Records About You</div>
            <div className="txt">{s.prediction || 'A patriot the nation will never forget.'}</div>
          </div>
        </div>
      </div>

      <footer className="paper-foot">
        <span>Printed at Karachi</span>
        <span>“Unity · Faith · Discipline”</span>
        <span>One Anna</span>
      </footer>
    </div>
  );
});

export default Newspaper;
