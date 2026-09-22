import { useEffect, useState } from 'react';
import { api } from '../api';

const FILTERS = ['all', 'critical', 'moderate', 'low'];
const HEALTH_SCORE = 74;

export default function ControlRoom() {
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null);

  async function load(sev) {
    try {
      const [inc, sum] = await Promise.all([
        api.getIncidents(sev),
        api.getIncidentSummary(),
      ]);
      setIncidents(inc);
      setSummary(sum);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(filter); }, [filter]);

  const circumference = 2 * Math.PI * 27;
  const offset = circumference * (1 - HEALTH_SCORE / 100);

  return (
    <div className="wrap">
      <div className="eyebrow-row"><span className="status-chip"><span className="dot dot-teal" />Authority / admin dashboard</span></div>
      <h2 className="page-title">Control Room</h2>
      <p className="page-sub">Live view across the fleet and the road network \u2014 pick an incident on the map or in the queue to inspect it.</p>

      {error && <p className="error-note">Couldn&rsquo;t reach the backend ({error}).</p>}

      <div className="kpi-row">
        <div className="kpi"><div className="num">{summary?.newIncidents ?? '\u2014'}</div><div className="lab">New incidents (24h)</div></div>
        <div className="kpi"><div className="num">{summary?.activeBuses ?? '\u2014'}</div><div className="lab">Active buses</div></div>
        <div className="kpi crit"><div className="num">{summary?.critical ?? '\u2014'}</div><div className="lab">Critical issues</div></div>
        <div className="kpi"><div className="num">{summary?.resolved ?? '\u2014'}</div><div className="lab">Resolved (30d)</div></div>
      </div>

      <div className="cr-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Live incident map \u2014 Ludhiana pilot zone</h3>
            <div className="filter-row">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`fchip ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="map-area">
            <div className="map-road" style={{ left: 0, right: 0, top: '30%', height: 2 }} />
            <div className="map-road" style={{ left: 0, right: 0, top: '68%', height: 2 }} />
            <div className="map-road" style={{ top: 0, bottom: 0, left: '22%', width: 2 }} />
            <div className="map-road" style={{ top: 0, bottom: 0, left: '64%', width: 2 }} />
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className={`pin sev-${inc.severity} ${selectedId === inc.id ? 'selected' : ''}`}
                style={{ left: `${inc.map_x}%`, top: `${inc.map_y}%` }}
                title={`${inc.issue} \u2014 ${inc.road}`}
                onClick={() => setSelectedId(inc.id)}
              />
            ))}
            <div className="map-legend">
              <span><span className="leg-dot" style={{ background: 'var(--red)' }} />Critical</span>
              <span><span className="leg-dot" style={{ background: 'var(--amber)' }} />Moderate</span>
              <span><span className="leg-dot" style={{ background: 'var(--teal)' }} />Low</span>
            </div>
          </div>

          <div className="health-strip">
            <div className="gauge">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="27" fill="none" stroke="var(--ink-700)" strokeWidth="7" />
                <circle
                  cx="32" cy="32" r="27" fill="none" stroke="var(--teal)" strokeWidth="7"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                />
              </svg>
              <div className="val">{HEALTH_SCORE}</div>
            </div>
            <div className="health-text">
              <div className="t">Urban Health Score \u2014 Ferozepur Rd corridor</div>
              <div className="s">Composite of open incidents, severity mix and time-to-resolve across the corridor.</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Incident / action queue</h3>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-lo)' }}>{incidents.length} shown</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="incident-table">
              <thead><tr><th>Issue</th><th>Severity</th><th>Dept.</th><th>Status</th></tr></thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id} className={selectedId === inc.id ? 'sel' : ''} onClick={() => setSelectedId(inc.id)}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inc.issue}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-lo)' }}>{inc.road}</div>
                    </td>
                    <td><span className={`sev-tag ${inc.severity}`}>{inc.severity}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--text-lo)' }}>{inc.department}</td>
                    <td className="status-tag">{inc.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="analytics-row">
            <div className="an-cell"><div className="k">Avg. resolution</div><div className="v">3.4 d</div><div className="d down">\u25BC 0.6d vs last month</div></div>
            <div className="an-cell"><div className="k">Fleet coverage</div><div className="v">86%</div><div className="d up">\u25B2 routes scanned daily</div></div>
            <div className="an-cell"><div className="k">High-risk area</div><div className="v" style={{ fontSize: 13 }}>Gill Rd flyover</div><div className="d">3 repeat reports, 9 days</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
