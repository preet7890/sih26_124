import { useState } from 'react';
import Nav from './components/Nav.jsx';
import Overview from './components/Overview.jsx';
import BusEdge from './components/BusEdge.jsx';
import ControlRoom from './components/ControlRoom.jsx';
import CitizenApp from './components/CitizenApp.jsx';
import SafetyDesk from './components/SafetyDesk.jsx';

export default function App() {
  const [screen, setScreen] = useState('overview');

  return (
    <div className="app-shell">
      <Nav active={screen} onChange={setScreen} />

      {screen === 'overview' && <Overview onNavigate={setScreen} />}
      {screen === 'bus' && <BusEdge />}
      {screen === 'control' && <ControlRoom />}
      {screen === 'citizen' && <CitizenApp />}
      {screen === 'safety' && <SafetyDesk />}

      <div className="foot">UrbanSensor \u2014 runnable reference build \u00B7 SIH26124 team project</div>
    </div>
  );
}
