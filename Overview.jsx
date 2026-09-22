import { useEffect, useState } from 'react';

const FLOW_STAGES = ['Detect', 'Prioritize', 'Assign', 'Resolve', 'Verify'];

const INNOVATIONS = [
  { title: 'Multi-bus verification', body: 'Independent detections of the same problem from several buses merge into one incident, raising confidence instead of creating duplicates.' },
  { title: 'Predictive maintenance', body: 'Historical detection trends flag road segments likely to deteriorate, so crews can act before a crack becomes a crater.' },
  { title: 'Urban Health Score', body: 'Many small incident signals compress into one legible score per road, zone or city area — easy for both officials and citizens to read.' },
  { title: 'Closed-loop resolution', body: 'Every issue is tracked end to end: Detect \u2192 Prioritize \u2192 Assign \u2192 Resolve \u2192 Verify \u2014 nothing is marked done without confirmation.' },
  { title: 'Edge AI + privacy', body: 'Camera and audio streams are processed on-device wherever practical; only necessary event metadata leaves the bus.' },
  { title: 'AI safety alerts', body: 'Unusual sounds or supported safety signals surface as flagged possibilities for authorized human review \u2014 never framed as certainty.' },
];

const STACK = [
  { k: 'Frontend', v: 'React + Vite \u2014 responsive citizen & authority interfaces' },
  { k: 'Backend', v: 'Node.js / Express API layer' },
  { k: 'Database', v: 'SQLite for local dev, MySQL-ready schema for production' },
  { k: 'AI / ML', v: 'CV for road & urban-object detection; scoped audio classification' },
  { k: 'GIS / Maps', v: 'Map API for coordinates, incident layers, zone views' },
];

export default function Overview({ onNavigate }) {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveStage((i) => (i + 1) % FLOW_STAGES.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="wrap">
      <div className="hero">
        <div>
          <div className="eyebrow-row">
            <span className="status-chip"><span className="dot dot-teal" />Prototype walkthrough</span>
            <span className="status-chip">AI-powered mobile urban intelligence, built on the public transport fleet</span>
          </div>
          <h1>Every bus already drives past the problem. Now it reports it.</h1>
          <p className="lede">
            Cameras, GPS and an edge-computing unit on ordinary city buses turn every route into a
            sensing pass over the road network. Detections merge with citizen reports and flow
            through authority workflows \u2014 from first sighting to verified repair.
          </p>
          <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => onNavigate('bus')}>See the bus unit \u2192</button>
            <button className="btn" onClick={() => onNavigate('control')}>Open control room \u2192</button>
          </div>
        </div>
        <div className="hero-flow">
          {FLOW_STAGES.map((s, i) => (
            <div key={s} className={`flow-step ${i === activeStage ? 'on' : ''}`}>
              <div className="flow-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="flow-label">{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-head"><h2>Key innovations</h2><span className="n">06 differentiators</span></div>
      <div className="innov-grid">
        {INNOVATIONS.map((it) => (
          <div className="innov-card" key={it.title}>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </div>
        ))}
      </div>

      <div className="section-head"><h2>Suggested technical modules</h2><span className="n">stack</span></div>
      <div className="stack-strip">
        {STACK.map((s) => (
          <div className="stack-cell" key={s.k}>
            <span className="k">{s.k}</span>
            <span className="v">{s.v}</span>
          </div>
        ))}
      </div>

      <div className="usp-bar">
        Core USP \u2014 <span>&ldquo;Every bus becomes a moving sensor for a safer, smarter and more responsive city.&rdquo;</span>
      </div>
    </div>
  );
}
