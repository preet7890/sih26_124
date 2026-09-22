const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATABASE_FILE = process.env.DATABASE_FILE || './data/urbansensor.sqlite';
const resolvedPath = path.isAbsolute(DATABASE_FILE)
  ? DATABASE_FILE
  : path.join(__dirname, '..', DATABASE_FILE);

// Make sure the directory for the sqlite file exists
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS buses (
    id TEXT PRIMARY KEY,
    route TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'online',
    speed_kmh INTEGER NOT NULL DEFAULT 0,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    camera_status TEXT NOT NULL DEFAULT 'active',
    gps_status TEXT NOT NULL DEFAULT 'locked',
    edge_temp_c INTEGER NOT NULL DEFAULT 35,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS detections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_id TEXT NOT NULL REFERENCES buses(id),
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical','moderate','low')),
    confidence INTEGER NOT NULL,
    road TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    issue TEXT NOT NULL,
    road TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical','moderate','low')),
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Reported',
    source TEXT NOT NULL DEFAULT 'bus-detection',
    map_x INTEGER NOT NULL,
    map_y INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    road TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL DEFAULT 'Moderate',
    stage INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    bus_id TEXT NOT NULL REFERENCES buses(id),
    category TEXT NOT NULL,
    road TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    state TEXT NOT NULL DEFAULT 'open' CHECK (state IN ('open','contacted','escalated','false')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
