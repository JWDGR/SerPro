import { useMemo, useState } from 'react';
import { sampleBusinesses } from './sampleReviews.js';
import { analyzeReviews } from './analyzer.js';

const businessNames = Object.keys(sampleBusinesses);

function parsePastedReviews(raw) {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([1-5])\s*[\|:\-]\s*(.+)$/);
      if (match) {
        return { rating: Number(match[1]), text: match[2].trim() };
      }
      return { rating: 3, text: line };
    });
}

function StarBar({ count, total, label }) {
  const pct = total === 0 ? 0 : (count / total) * 100;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="bar-count">{count}</span>
    </div>
  );
}

export default function App() {
  const [businessName, setBusinessName] = useState('');
  const [pasted, setPasted] = useState('');
  const [reviews, setReviews] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);

  const analysis = useMemo(() => analyzeReviews(reviews), [reviews]);

  const loadSample = (name) => {
    setBusinessName(name);
    setReviews(sampleBusinesses[name]);
    setPasted(
      sampleBusinesses[name]
        .map((r) => `${r.rating} | ${r.text}`)
        .join('\n'),
    );
    setAnalyzed(true);
  };

  const runAnalysis = () => {
    const parsed = parsePastedReviews(pasted);
    setReviews(parsed);
    setAnalyzed(true);
  };

  const reset = () => {
    setBusinessName('');
    setPasted('');
    setReviews([]);
    setAnalyzed(false);
  };

  return (
    <div className="app">
      <header>
        <h1>Business Review Analyzer</h1>
        <p className="subtitle">
          Turn Google Maps reviews into concrete recommendations for improving your business.
        </p>
      </header>

      <section className="card">
        <h2>1. Add a business</h2>
        <label>
          Business name
          <input
            type="text"
            placeholder="e.g. Joe's Coffee Shop"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </label>

        <p className="note">
          Google Maps reviews can&apos;t be fetched directly from the browser without an API key.
          Paste the reviews below (one per line, optional <code>rating | review text</code>), or
          try a sample business:
        </p>
        <div className="sample-buttons">
          {businessNames.map((name) => (
            <button key={name} type="button" onClick={() => loadSample(name)}>
              Load: {name}
            </button>
          ))}
        </div>

        <label>
          Reviews
          <textarea
            rows={10}
            placeholder={'5 | Great coffee and friendly staff\n2 | Waited 30 minutes for a latte'}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
          />
        </label>

        <div className="actions">
          <button type="button" className="primary" onClick={runAnalysis} disabled={!pasted.trim()}>
            Analyze reviews
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </div>
      </section>

      {analyzed && analysis && (
        <section className="card">
          <h2>2. Summary{businessName ? ` for ${businessName}` : ''}</h2>
          <div className="summary-grid">
            <div>
              <div className="stat-number">{analysis.avgRating.toFixed(2)}</div>
              <div className="stat-label">Average rating</div>
            </div>
            <div>
              <div className="stat-number">{analysis.total}</div>
              <div className="stat-label">Reviews analyzed</div>
            </div>
          </div>
          <div className="bars">
            {[5, 4, 3, 2, 1].map((stars) => (
              <StarBar
                key={stars}
                label={`${stars} star`}
                count={analysis.distribution[stars - 1]}
                total={analysis.total}
              />
            ))}
          </div>
        </section>
      )}

      {analyzed && analysis && analysis.strengths.length > 0 && (
        <section className="card">
          <h2>3. What customers love</h2>
          <ul className="strengths">
            {analysis.strengths.map((s) => (
              <li key={s.id}>
                <strong>{s.label}</strong> — mentioned positively {s.positive} time
                {s.positive === 1 ? '' : 's'}.
              </li>
            ))}
          </ul>
        </section>
      )}

      {analyzed && analysis && (
        <section className="card">
          <h2>4. Recommendations</h2>
          {analysis.recommendations.length === 0 ? (
            <p>No significant complaint themes detected. Keep doing what you&apos;re doing!</p>
          ) : (
            <ol className="recommendations">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx}>
                  <div className="rec-header">
                    <span className="rec-theme">{rec.theme}</span>
                    {rec.negativeMentions > 0 && (
                      <span className="rec-tag">
                        {rec.negativeMentions} negative mention
                        {rec.negativeMentions === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <p>{rec.text}</p>
                  {rec.examples.length > 0 && (
                    <details>
                      <summary>Example reviews</summary>
                      <ul>
                        {rec.examples.map((ex, i) => (
                          <li key={i}>&ldquo;{ex}&rdquo;</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <footer>
        <p>
          Heuristic analysis only &mdash; not a replacement for reading reviews yourself. Connect a
          Google Places API key on a backend to fetch reviews automatically.
        </p>
      </footer>
    </div>
  );
}
