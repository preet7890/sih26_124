const express = require('express');
const db = require('../db');

const router = express.Router();

const VALID_STATES = ['open', 'contacted', 'escalated', 'false'];

// GET /api/alerts
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM alerts ORDER BY created_at DESC').all();
  res.json(rows);
});

// PATCH /api/alerts/:id — control-room operator action
// state: 'contacted' | 'escalated' | 'false'
router.patch('/:id', (req, res) => {
  const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const { state } = req.body;
  if (!VALID_STATES.includes(state)) {
    return res.status(400).json({ error: `state must be one of ${VALID_STATES.join(', ')}` });
  }
  if (alert.state !== 'open') {
    return res.status(400).json({ error: 'This alert has already been actioned.' });
  }

  db.prepare(`UPDATE alerts SET state = ?, updated_at = datetime('now') WHERE id = ?`).run(state, alert.id);
  res.json(db.prepare('SELECT * FROM alerts WHERE id = ?').get(alert.id));
});

module.exports = router;
