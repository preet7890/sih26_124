const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/incidents?severity=critical|moderate|low
router.get('/', (req, res) => {
  const { severity } = req.query;
  let rows;
  if (severity && severity !== 'all') {
    rows = db.prepare('SELECT * FROM incidents WHERE severity = ? ORDER BY created_at DESC').all(severity);
  } else {
    rows = db.prepare('SELECT * FROM incidents ORDER BY created_at DESC').all();
  }
  res.json(rows);
});

// GET /api/incidents/summary — counts used by the Control Room KPI cards
router.get('/summary', (req, res) => {
  const newIncidents = db.prepare(`
    SELECT COUNT(*) AS n FROM incidents WHERE datetime(created_at) >= datetime('now', '-1 day')
  `).get().n;
  const critical = db.prepare(`SELECT COUNT(*) AS n FROM incidents WHERE severity = 'critical' AND status != 'Resolved'`).get().n;
  const resolved = db.prepare(`
    SELECT COUNT(*) AS n FROM incidents WHERE status = 'Resolved' AND datetime(updated_at) >= datetime('now', '-30 day')
  `).get().n;
  const activeBuses = db.prepare(`SELECT COUNT(*) AS n FROM buses WHERE status = 'online'`).get().n;

  res.json({ newIncidents, critical, resolved, activeBuses });
});

// PATCH /api/incidents/:id — update status and/or department
router.patch('/:id', (req, res) => {
  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const status = req.body.status ?? incident.status;
  const department = req.body.department ?? incident.department;

  db.prepare(`
    UPDATE incidents SET status = ?, department = ?, updated_at = datetime('now') WHERE id = ?
  `).run(status, department, incident.id);

  res.json(db.prepare('SELECT * FROM incidents WHERE id = ?').get(incident.id));
});

module.exports = router;
