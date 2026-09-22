import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

const SEV_COLOR = { critical: 'var(--red)', moderate: 'var(--amber)', low: 'var(--teal)' };
const DEFAULT_BUS_ID = 'PB-10 GJ 4471';

export default function BusEdge() {
  const [bus, setBus] = useState(null);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  async function poll() {
    try {
      const data = await api.getDetections(DEFAULT_BUS_ID);
      setBus(data.bus);
      setDetections(data.detections);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    poll();
    timerRef.current = setInterval(poll, 3400);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="wrap">
      <div className="eyebrow-row"><span className="status-chip"><span className="dot dot-teal" />In-vehicle edge terminal</span></div>
      <h2 className="page-title">Bus / Edge interface</h2>
      <p className="page-sub">
        Runs on the on-board compute unit. Most processing happens locally \u2014 the bus sends
        event metadata, not continuous raw video or audio.
      </p>

      {error && (
        <p className="error-note">
          Couldn&rsquo;t reach the backend ({error}). Is <code>npm run dev</code> running in
          <code> backend/</code>?
        </p>
      )}

      <div className="device-frame">
        <div className="device-top">
          <div>
            <div className="bus-id">{bus?.id || DEFAULT_BUS_ID}</div>
            <div className="bus-sub">{bus?.route || 'Loading route\u2026'}</div>
          </div>
          <span className="status-chip"><span className="dot dot-teal" />Online</span>
        </div>

        <div className="sensor-row">
          <div className="sensor-pill"><div className="lab">Camera</div><div className="val">\u25CF {bus?.camera_status || 'active'}</div></div>
          <div className="sensor-pill"><div className="lab">GPS</div><div className="val">\u25CF {bus?.gps_status || 'locked'}</div></div>
          <div className="sensor-pill"><div className="lab">Edge Compute</div><div className="val">\u25CF {bus ? `${bus.edge_temp_c}\u00B0C` : '\u2014'}</div></div>
        </div>

        <div className="telemetry">
          <span>Speed <b>{bus ? `${bus.speed_kmh} km/h` : '\u2014'}</b></span>
          <span>Lat <b>{bus?.lat ?? '\u2014'}</b></span>
          <span>Lng <b>{bus?.lng ?? '\u2014'}</b></span>
        </div>

        <div className="feed-label">
          <span>Live AI detections</span>
          <span className="live"><span className="feed-live-dot" />LIVE</span>
        </div>

        <div className="feed-list">
          {detections.length === 0 && <p className="loading-note">Waiting for the first detection\u2026</p>}
          {detections.map((d) => (
            <div className="feed-item" key={d.id}>
              <span className="feed-sev" style={{ background: SEV_COLOR[d.severity] }} />
              <div className="feed-body">
                <div className="feed-title">{d.type}</div>
                <div className="feed-meta">
                  {d.road} \u00B7 conf {d.confidence}% \u00B7 {new Date(d.created_at + 'Z').toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="edge-note">
          Processing on-device where possible \u00B7 only detection metadata (type, severity,
          confidence, location, timestamp) is transmitted to the platform.
        </div>
      </div>
    </div>
  );
}
