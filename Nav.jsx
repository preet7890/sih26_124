const SCREENS = [
  { id: 'overview', label: 'Overview' },
  { id: 'bus', label: 'Bus / Edge Unit' },
  { id: 'control', label: 'Control Room' },
  { id: 'citizen', label: 'Citizen App' },
  { id: 'safety', label: 'Safety Desk' },
];

export default function Nav({ active, onChange }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">U</div>
        <div>
          <div className="brand-name">UrbanSensor</div>
          <div className="brand-sub">Urban Intelligence Platform · SIH26124</div>
        </div>
      </div>
      <div className="tabs">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            className={`tab-btn ${active === s.id ? 'active' : ''}`}
            onClick={() => onChange(s.id)}
          >
            <span className="dot" />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
