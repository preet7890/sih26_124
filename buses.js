const express = require('express');
const db = require('../db');

const router = express.Router();

const DETECTION_TYPES = [
  { type: 'Pothole detected', severity: 'critical', confMin: 88, confMax: 97 },
  { type: 'Waterlogging detected', severity: 'moderate', confMin: 74, confMax: 89 },
  { type: 'Road obstruction', severity: 'moderate', confMin: 70, confMax: 88 },
  { type: 'Surface crack — minor', severity: 'low', confMin: 65, confMax: 80 },
  { type: 'Faded lane marking', severity: 'low', confMin: 60, confMax: 80 },
];

const ROADS = [
  'Ferozepur Rd, KM 4.2',
  'Pakhowal Rd near Shivaji Park',
  'Gill Rd flyover approach',
  'Malhar Rd junction',
  'Sherpur Chowk underpass',
  'Chandigarh Rd service lane',
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// GET /api/buses — list all buses with latest telemetry
router.get('/', (req, res) => {
  const buses = db.prepare('SELECT * FROM buses ORDER BY id').all();
  res.json(buses);
});

// GET /api/buses/:id — a single bus
router.get('/:id', (req, res) => {
  const bus = db.prepare('SELECT * FROM buses WHERE id = ?').get(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json(bus);
});

// GET /api/buses/:id/detections — recent detections for a bus.
// For demo purposes, each call has a chance to simulate a fresh detection
// being reported by the on-board edge unit, then returns the most recent ones.
// In production, replace the simulation block with your real detection
// pipeline calling POST /api/buses/:id/detections instead.
router.get('/:id/detections', (req, res) => {
  const bus = db.prepare('SELECT * FROM buses WHERE id = ?').get(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  const shouldSimulate = req.query.simulate !== 'false';
  if (shouldSimulate) {
    const d = randomFrom(DETECTION_TYPES);
    const confidence = d.confMin + Math.floor(Math.random() * (d.confMax - d.confMin + 1));
    db.prepare(`
      INSERT INTO detections (bus_id, type, severity, confidence, road)
      VALUES (?, ?, ?, ?, ?)
    `).run(bus.id, d.type, d.severity, confidence, randomFrom(ROADS));

    // jitter telemetry slightly so the "live" feel is consistent with detections
    db.prepare(`
      UPDATE buses SET speed_kmh = ?, lat = ?, lng = ?, updated_at = datetime('now') WHERE id = ?
    `).run(
      18 + Math.floor(Math.random() * 22),
      Number((30.900 + Math.random() * 0.01).toFixed(4)),
      Number((75.855 + Math.random() * 0.01).toFixed(4)),
      bus.id
    );
  }

  const limit = Math.min(Number(req.query.limit) || 8, 50);
  const detections = db.prepare(`
    SELECT * FROM detections WHERE bus_id = ? ORDER BY id DESC LIMIT ?
  `).all(bus.id, limit);

  const freshBus = db.prepare('SELECT * FROM buses WHERE id = ?').get(bus.id);
  res.json({ bus: freshBus, detections });
});

// POST /api/buses/:id/detections — record a real detection from an edge device
router.post('/:id/detections', (req, res) => {
  const bus = db.prepare('SELECT * FROM buses WHERE id = ?').get(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  const { type, severity, confidence, road } = req.body;
  if (!type || !severity || confidence == null || !road) {
    return res.status(400).json({ error: 'type, severity, confidence and road are required' });
  }
  if (!['critical', 'moderate', 'low'].includes(severity)) {
    return res.status(400).json({ error: 'severity must be critical, moderate or low' });
  }

  const result = db.prepare(`
    INSERT INTO detections (bus_id, type, severity, confidence, road)
    VALUES (?, ?, ?, ?, ?)
  `).run(bus.id, type, severity, confidence, road);

  const detection = db.prepare('SELECT * FROM detections WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(detection);
});

module.exports = router;
