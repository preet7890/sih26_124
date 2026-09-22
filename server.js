require('dotenv').config();
const express = require('express');
const cors = require('cors');

const seed = require('./src/seed');
const busesRouter = require('./src/routes/buses');
const incidentsRouter = require('./src/routes/incidents');
const reportsRouter = require('./src/routes/reports');
const alertsRouter = require('./src/routes/alerts');

seed();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'urbansensor-backend', time: new Date().toISOString() });
});

app.use('/api/buses', busesRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/alerts', alertsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`UrbanSensor API listening on http://localhost:${PORT}`);
});
