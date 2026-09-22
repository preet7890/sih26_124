import { useEffect, useState } from 'react';
import { api } from '../api';

const CATEGORIES = [
  { key: 'Pothole', icon: '\uD83D\uDD73\uFE0F' },
  { key: 'Waterlogging', icon: '\uD83D\uDCA7' },
  { key: 'Streetlight', icon: '\uD83D\uDCA1' },
  { key: 'Obstruction', icon: '\uD83D\uDEA7' },
  { key: 'Garbage', icon: '\uD83D\uDDD1\uFE0F' },
  { key: 'Other', icon: '\u22EF' },
];

export default function CitizenApp() {
  const [pane, setPane] = useState('home'); // home | report | done | reports
  const [category, setCategory] = useState('Pothole');
  const [severity, setSeverity] = useState('Moderate');
  const [description, setDescription] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  async function loadReports() {
    try {
      const data = await api.getReports();
      setReports(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    if (pane === 'reports') loadReports();
  }, [pane]);

  function openReport(cat) {
    setCategory(cat || category);
    setPhotoTaken(false);
    setDescription('');
    setSeverity('Moderate');
    setPane('report');
  }

  async function submit() {
    try {
      await api.createReport({
        category,
        road: 'Pakhowal Rd, near Shivaji Park',
        description,
        severity,
      });
      setPane('done');
    } catch (e) {
      setError(e.message);
    }
  }

  async function advance(id) {
    await api.advanceReport(id);
    loadReports();
  }

  async function confirmFixed(id) {
    await api.confirmReport(id);
    loadReports();
  }

  return (
    <div className="wrap">
      <div className="eyebrow-row"><span className="status-chip"><span className="dot dot-teal" />Citizen mobile app</span></div>
      <h2 className="page-title">Citizen interface</h2>
      <p className="page-sub">
        Mobile-first reporting, tracked to resolution. Try it \u2014 tap a category, submit a
        report, then track it through the workflow (the &ldquo;Move to next stage&rdquo; button
        stands in for authority-side progress in this demo).
      </p>
      {error && <p className="error-note">Couldn&rsquo;t reach the backend ({error}).</p>}

      <div className="phone-wrap">
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-screen">
            {pane === 'home' && (
              <>
                <div className="ph-head"><div className="greet">Good afternoon</div><h2>Report a street issue</h2></div>
                <div className="ph-body">
                  <button className="report-cta" onClick={() => openReport()}>\uFF0B Report an issue</button>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--paper-sub)', textTransform: 'uppercase', letterSpacing: '.03em', margin: '18px 0 4px' }}>
                    Quick categories
                  </div>
                  <div className="quickgrid">
                    {CATEGORIES.map((c) => (
                      <div className="qcat" key={c.key} onClick={() => openReport(c.key)}>
                        <span className="ic">{c.icon}</span>
                        <span className="lab">{c.key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {pane === 'report' && (
              <>
                <div className="ph-head"><div className="greet">New report</div><h2>{category}</h2></div>
                <div className="ph-body">
                  <div className="field">
                    <label>Photo</label>
                    <div className={`photo-box ${photoTaken ? 'taken' : ''}`} onClick={() => setPhotoTaken(true)}>
                      {photoTaken ? '\uD83D\uDCF7 Photo attached' : 'Tap to attach a photo'}
                    </div>
                  </div>
                  <div className="field">
                    <label>Location</label>
                    <div className="photo-box" style={{ height: 40, color: 'var(--paper-ink)', fontWeight: 600 }}>
                      \uD83D\uDCCD GPS captured \u2014 Pakhowal Rd, near Shivaji Park
                    </div>
                  </div>
                  <div className="field">
                    <label>Description</label>
                    <textarea
                      className="in-text" rows={3} placeholder="Anything responders should know?"
                      value={description} onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Severity</label>
                    <div className="seg-row">
                      {['Low', 'Moderate', 'Critical'].map((s) => (
                        <button key={s} className={`seg-btn ${severity === s ? 'active' : ''}`} onClick={() => setSeverity(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <button className="report-cta" onClick={submit}>Submit report</button>
                </div>
              </>
            )}

            {pane === 'done' && (
              <div className="ph-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', paddingTop: 60 }}>
                <div style={{ fontSize: 38 }}>\u2705</div>
                <div style={{ fontFamily: 'var(--disp)', fontWeight: 700, fontSize: 17, marginTop: 12 }}>Report submitted</div>
                <p style={{ fontSize: 12, color: 'var(--paper-sub)', maxWidth: '24ch' }}>You&rsquo;ll be notified as it moves through verification and repair.</p>
                <button className="btn" style={{ marginTop: 16, background: 'var(--paper-ink)', color: '#fff', borderColor: 'var(--paper-ink)' }} onClick={() => setPane('reports')}>
                  View My Reports
                </button>
              </div>
            )}

            {pane === 'reports' && (
              <>
                <div className="ph-head"><div className="greet">Tracking</div><h2>My reports</h2></div>
                <div className="ph-body">
                  {reports.length === 0 && <p style={{ fontSize: 12, color: 'var(--paper-sub)' }}>No reports yet.</p>}
                  {reports.map((r) => (
                    <div className="report-card" key={r.id}>
                      <div className="rtitle">{r.category}</div>
                      <div className="rmeta">{r.road}</div>
                      <div className="stepper">
                        {r.stages.map((s, i) => (
                          <div key={s} className={`step ${i < r.stage ? 'done' : ''} ${i === r.stage ? 'cur' : ''}`}>
                            <div className="sdot" />
                            <div className="slab">{s}</div>
                          </div>
                        ))}
                      </div>
                      {r.stage < 3 && (
                        <button className="advance-btn" onClick={() => advance(r.id)}>
                          Simulate: move to next stage
                        </button>
                      )}
                      {r.stage === 3 && (
                        <button className="confirm-btn" onClick={() => confirmFixed(r.id)}>Confirm issue was fixed</button>
                      )}
                      {r.stage >= 4 && (
                        <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--paper-sub)', marginTop: 8 }}>\u2713 Confirmed by you</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="ph-nav">
            <button className={pane === 'home' ? 'active' : ''} onClick={() => setPane('home')}><span className="ic">\u2302</span>Home</button>
            <button className={pane === 'reports' ? 'active' : ''} onClick={() => setPane('reports')}><span className="ic">\uD83D\uDCCB</span>My Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
}
