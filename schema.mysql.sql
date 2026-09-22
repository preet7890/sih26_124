-- UrbanSensor reference schema for MySQL (production alternative to SQLite).
-- Mirrors backend/src/db.js so route files need minimal changes when you
-- swap the SQLite client for a MySQL client (e.g. `mysql2`).

CREATE DATABASE IF NOT EXISTS urbansensor CHARACTER SET utf8mb4;
USE urbansensor;

CREATE TABLE IF NOT EXISTS buses (
  id VARCHAR(32) PRIMARY KEY,
  route VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'online',
  speed_kmh INT NOT NULL DEFAULT 0,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  camera_status VARCHAR(20) NOT NULL DEFAULT 'active',
  gps_status VARCHAR(20) NOT NULL DEFAULT 'locked',
  edge_temp_c INT NOT NULL DEFAULT 35,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  bus_id VARCHAR(32) NOT NULL,
  type VARCHAR(80) NOT NULL,
  severity ENUM('critical','moderate','low') NOT NULL,
  confidence TINYINT UNSIGNED NOT NULL,
  road VARCHAR(160) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id)
);

CREATE TABLE IF NOT EXISTS incidents (
  id VARCHAR(20) PRIMARY KEY,
  issue VARCHAR(160) NOT NULL,
  road VARCHAR(160) NOT NULL,
  severity ENUM('critical','moderate','low') NOT NULL,
  department VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Reported',
  source VARCHAR(40) NOT NULL DEFAULT 'bus-detection',
  map_x INT NOT NULL,
  map_y INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(60) NOT NULL,
  road VARCHAR(160) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL DEFAULT 'Moderate',
  stage TINYINT UNSIGNED NOT NULL DEFAULT 0, -- 0 Reported .. 4 Resolved
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(20) PRIMARY KEY,
  bus_id VARCHAR(32) NOT NULL,
  category VARCHAR(120) NOT NULL,
  road VARCHAR(160) NOT NULL,
  confidence TINYINT UNSIGNED NOT NULL,
  state ENUM('open','contacted','escalated','false') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id)
);
