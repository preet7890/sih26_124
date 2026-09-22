const db = require('./db');

function seed() {
  const busCount = db.prepare('SELECT COUNT(*) AS n FROM buses').get().n;
  if (busCount > 0) return; // already seeded

  const insertBus = db.prepare(`
    INSERT INTO buses (id, route, status, speed_kmh, lat, lng, camera_status, gps_status, edge_temp_c)
    VALUES (@id, @route, @status, @speed_kmh, @lat, @lng, @camera_status, @gps_status, @edge_temp_c)
  `);

  const buses = [
    { id: 'PB-10 GJ 4471', route: 'Route 23 · Ferozepur Rd ⇄ Sherpur Chowk', status: 'online', speed_kmh: 27, lat: 30.9010, lng: 75.8573, camera_status: 'active', gps_status: 'locked', edge_temp_c: 38 },
    { id: 'PB-10 AB 2290', route: 'Route 07 · Gill Rd ⇄ Chandigarh Rd', status: 'online', speed_kmh: 19, lat: 30.9110, lng: 75.8321, camera_status: 'active', gps_status: 'locked', edge_temp_c: 36 },
    { id: 'PB-10 CK 7743', route: 'Route 14 · Malhar Rd ⇄ Pakhowal Rd', status: 'online', speed_kmh: 33, lat: 30.8890, lng: 75.8460, camera_status: 'active', gps_status: 'locked', edge_temp_c: 34 },
  ];
  buses.forEach((b) => insertBus.run(b));

  const insertIncident = db.prepare(`
    INSERT INTO incidents (id, issue, road, severity, department, status, source, map_x, map_y)
    VALUES (@id, @issue, @road, @severity, @department, @status, @source, @map_x, @map_y)
  `);

  const incidents = [
    { id: 'INC-1042', issue: 'Deep pothole cluster', road: 'Ferozepur Rd, KM 4.2', severity: 'critical', department: 'PWD — Roads', status: 'Assigned', source: 'multi-bus verified', map_x: 34, map_y: 28 },
    { id: 'INC-1041', issue: 'Waterlogging', road: 'Pakhowal Rd', severity: 'moderate', department: 'MC — Drainage', status: 'Verified', source: 'bus-detection', map_x: 58, map_y: 44 },
    { id: 'INC-1039', issue: 'Flyover surface crack', road: 'Gill Rd flyover', severity: 'critical', department: 'PWD — Roads', status: 'In progress', source: 'bus-detection', map_x: 71, map_y: 22 },
    { id: 'INC-1037', issue: 'Obstruction — fallen debris', road: 'Malhar Rd junction', severity: 'moderate', department: 'MC — Sanitation', status: 'Reported', source: 'citizen-report', map_x: 22, map_y: 63 },
    { id: 'INC-1035', issue: 'Faded lane markings', road: 'Chandigarh Rd', severity: 'low', department: 'PWD — Roads', status: 'Queued', source: 'bus-detection', map_x: 82, map_y: 58 },
    { id: 'INC-1033', issue: 'Minor surface crack', road: 'Sherpur Chowk underpass', severity: 'low', department: 'PWD — Roads', status: 'Queued', source: 'bus-detection', map_x: 46, map_y: 76 },
    { id: 'INC-1030', issue: 'Pothole, single', road: 'Gill Rd, near market', severity: 'moderate', department: 'PWD — Roads', status: 'Resolved', source: 'citizen-report', map_x: 64, map_y: 80 },
    { id: 'INC-1028', issue: 'Streetlight outage cluster', road: 'Malhar Rd', severity: 'low', department: 'MC — Electrical', status: 'Resolved', source: 'citizen-report', map_x: 13, map_y: 40 },
  ];
  incidents.forEach((i) => insertIncident.run(i));

  const insertReport = db.prepare(`
    INSERT INTO reports (category, road, description, severity, stage)
    VALUES (@category, @road, @description, @severity, @stage)
  `);

  const reports = [
    { category: 'Pothole', road: 'Ferozepur Rd, KM 4.2', description: 'Large pothole near the bus stop, hard to see at night.', severity: 'Critical', stage: 3 },
    { category: 'Waterlogging', road: 'Pakhowal Rd', description: 'Standing water after last night\u2019s rain.', severity: 'Moderate', stage: 1 },
  ];
  reports.forEach((r) => insertReport.run(r));

  const insertAlert = db.prepare(`
    INSERT INTO alerts (id, bus_id, category, road, confidence, state)
    VALUES (@id, @bus_id, @category, @road, @confidence, @state)
  `);

  const alerts = [
    { id: 'SA-118', bus_id: 'PB-10 GJ 4471', category: 'Raised-voice / distress pattern', road: 'Ferozepur Rd, KM 4.2', confidence: 81, state: 'open' },
    { id: 'SA-117', bus_id: 'PB-10 AB 2290', category: 'Sudden impact sound', road: 'Gill Rd flyover', confidence: 64, state: 'open' },
    { id: 'SA-116', bus_id: 'PB-10 CK 7743', category: 'Prolonged unattended stop', road: 'Malhar Rd junction', confidence: 57, state: 'open' },
  ];
  alerts.forEach((a) => insertAlert.run(a));

  console.log('Seeded UrbanSensor demo data.');
}

module.exports = seed;
