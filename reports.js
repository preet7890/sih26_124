const express = require('express');
const db = require('../db');

const router = express.Router();

// Stage index -> label, mirrors the citizen-facing timeline:
// Reported -> Verified -> Assigned -> Repairing -> Resolved
const STAGES = ['Reported', 'Verified', 'Assigned', 'Repairing', 'Resolved'];

// GET /api/reports
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all();
  res.json(rows.map(withStageLabel));
});

// POST /api/reports — citizen submits a new report
router.post('/', (req, res) => {
  const { category, road, description, severity } = req.body;
  if (!category || !road) {
    return res.status(400).json({ error: 'category and road are required' });
  }

  const result = db.prepare(`
    INSERT INTO reports (category, road, description, severity, stage)
    VALUES (?, ?, ?, ?, 0)
  `).run(category, road, description || null, severity || 'Moderate');

  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(withStageLabel(report));
});

// PATCH /api/reports/:id/advance — move to the next workflow stage
// (represents authority-side progress: verification, assignment, repair start)
router.patch('/:id/advance', (req, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.stage >= 3) {
    return res.status(400).json({ error: 'Report is already at the Repairing stage; use /confirm to resolve it.' });
  }

  db.prepare(`UPDATE reports SET stage = stage + 1, updated_at = datetime('now') WHERE id = ?`).run(report.id);
  res.json(withStageLabel(db.prepare('SELECT * FROM reports WHERE id = ?').get(report.id)));
});

// PATCH /api/reports/:id/confirm — citizen confirms the fix, closing the loop
router.patch('/:id/confirm', (req, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.stage < 3) {
    return res.status(400).json({ error: 'Report must reach the Repairing stage before it can be confirmed fixed.' });
  }

  db.prepare(`UPDATE reports SET stage = 4, updated_at = datetime('now') WHERE id = ?`).run(report.id);
  res.json(withStageLabel(db.prepare('SELECT * FROM reports WHERE id = ?').get(report.id)));
});

function withStageLabel(report) {
  return { ...report, stageLabel: STAGES[report.stage], stages: STAGES };
}

module.exports = router;
