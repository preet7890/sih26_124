import { useEffect, useState } from 'react';
import { api } from '../api';

const STATE_LABEL = {
  open: 'OPEN',
  contacted: 'CONTACTED',
  escalated: 'ESCALATED',
  false: 'FALSE ALERT',
};

export default function SafetyDesk() {
  const [alerts, setAlerts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function act(id, state) {
    try {
      await api.patchAlert(id, state);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  const selected = alerts.find((a) => a.id === selectedId);
  const openCount = alerts.filter((a) => a.state === 'open').length;

  return (
    <div className="wrap">
      <div className="eyebrow-row"><span className="status-chip"><span className="dot dot-red" />Safety alert interface</span></div>
      <h2 className="page-title">Safety Desk</h2>
      <p className="page-sub">
        Control-centre panel for possible emergency events surfaced by on-bus audio/event
        classification. Every alert routes to a human before any action is taken.
      </p>
      {error && <p className="error-note">Couldn&rsquo;t reach the backend ({error}).</p>}

      <div className="safety-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Alert queue</h3>
            <span style={{ fontSize: 10.5, color: 'var(--text-lo)' }}>{openCount} open</span>
          </div>
          <div>
            {alerts.map((a) => (
              <div key={a.id} className={`alert-item ${selectedId === a.id ? 'sel' : ''}`} onClick={() => setSelectedId(a.id)}>
                <div className="alert-icn" style={{ background: a.state === 'open' ? 'var(--red-dim)' : 'var(--ink-700)', color: a.state === 'open' ? '#ff9c9c' : 'var(--text-lo)' }}>\u26A0</div>
                <div style={{ flex: 1 }}>
                  <div className="alert-title">{a.category}</div>
                  <div className="alert-sub">{a.bus_id} \u00B7 {a.road} \u00B7 {new Date(a.created_at + 'Z').toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <span
                  className="alert-badge"
                  style={{
                    background: a.state === 'open' ? 'var(--red-dim)' : 'var(--ink-700)',
                    color: a.state === 'open' ? '#ff9c9c' : 'var(--text-lo)',
                  }}
                >
                  {STATE_LABEL[a.state]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          {!selected && <div className="detail-empty">Select an alert from the queue to review AI confidence and take action.</div>}
          {selected && (
            <>
              <div className="detail-head">
                <div style={{ fontSize: 11, color: 'var(--text-lo)' }}>
                  {selected.id} \u00B7 {new Date(selected.created_at + 'Z').toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="cat">{selected.category}</div>
              </div>
              <div className="detail-grid">
                <div className="dkv"><div className="k">Bus</div><div className="v">{selected.bus_id}</div></div>
                <div className="dkv"><div className="k">Location</div><div className="v">{selected.road}</div></div>
                <div className="dkv" style={{ gridColumn: '1 / -1' }}>
                  <div className="k">AI confidence \u2014 possible event, not a determination</div>
                  <div className="v">{selected.confidence}%</div>
                  <div className="conf-bar"><div className="conf-fill" style={{ width: `${selected.confidence}%` }} /></div>
                </div>
              </div>
              <div className="action-row">
                <button className="btn" disabled={selected.state !== 'open'} onClick={() => act(selected.id, 'contacted')}>Contact driver</button>
                <button className="btn btn-primary" disabled={selected.state !== 'open'} onClick={() => act(selected.id, 'escalated')}>Escalate</button>
                <button className="btn btn-danger" disabled={selected.state !== 'open'} onClick={() => act(selected.id, 'false')}>Mark false alert</button>
              </div>
              {selected.state !== 'open' && (
                <div className="desk-log">
                  <b>Action taken:</b>{' '}
                  {selected.state === 'escalated' && 'Escalated through the authorized emergency workflow.'}
                  {selected.state === 'contacted' && 'Driver contacted for confirmation.'}
                  {selected.state === 'false' && 'Marked as false alert by control-room operator.'}
                </div>
              )}
              <div className="desk-note">
                Audio is processed on-device where possible. Ordinary passenger conversation is
                not continuously stored \u2014 only the flagged event window is available for this
                review.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
