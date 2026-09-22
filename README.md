# sih26_124
AI-powered smart bus infrastructure monitoring system that uses computer vision, GPS, and GIS mapping to detect and visualize road and urban infrastructure issues through public bus networks.
# UrbanSensor — AI-Powered Mobile Urban Intelligence Platform

Reference implementation for **SIH26124**: public buses as moving urban
sensors, feeding a shared platform that authorities and citizens both use to
detect, prioritize, resolve and verify road/urban issues.

This is a full-stack, runnable prototype:

- **`backend/`** — Node.js + Express API, backed by a local SQLite database
  (zero external services required to run it). A MySQL schema is included for
  when you're ready to move off SQLite (see `backend/schema.mysql.sql`).
- **`frontend/`** — React + Vite single-page app with four screens: the
  Bus/Edge interface, the Authority Control Room, the Citizen app, and the
  Safety Desk.

Nothing in this project depends on claude.ai or any Claude product — it's a
plain Node/React app you run locally, in VS Code, or deploy anywhere that
runs Node.

---

## 1. Prerequisites

- **Node.js 18+** and npm 9+ (`node -v`, `npm -v`)
- No database server needed for local dev — SQLite is a single file created
  automatically on first run.

## 2. Install

From the project root (this uses npm workspaces to install both apps in one
step):

```bash
npm install
```

If you'd rather install each app separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Defaults work out of the box for local dev:
- Backend runs on `http://localhost:4000`
- Frontend runs on `http://localhost:5173` and talks to the backend via
  `VITE_API_URL=http://localhost:4000/api`

## 4. Run it

From the project root, run both apps together:

```bash
npm run dev
```

This starts the backend (with nodemon, auto-reload) and the frontend (Vite
dev server) concurrently. Open **http://localhost:5173**.

Or run them separately in two terminals:

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

The backend seeds itself with mock buses, incidents, reports and safety
alerts on first launch (see `backend/src/seed.js`) so the UI has real data to
call immediately — no manual setup needed.

## 5. Project structure

```
UrbanSensor/
├── package.json                 # root workspace + `npm run dev`
├── backend/
│   ├── package.json
│   ├── server.js                # Express app entry point
│   ├── .env.example
│   ├── schema.mysql.sql         # reference schema for production MySQL
│   └── src/
│       ├── db.js                # SQLite connection + table creation
│       ├── seed.js              # seeds demo data on first run
│       └── routes/
│           ├── buses.js         # GET /api/buses, GET/POST detections
│           ├── incidents.js     # GET /api/incidents, PATCH status
│           ├── reports.js       # citizen reports CRUD + workflow
│           └── alerts.js        # safety alert queue + actions
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js               # fetch wrapper around the backend API
        ├── styles.css
        └── components/
            ├── Nav.jsx
            ├── Overview.jsx
            ├── BusEdge.jsx
            ├── ControlRoom.jsx
            ├── CitizenApp.jsx
            └── SafetyDesk.jsx
```

## 6. API reference

All endpoints are prefixed with `/api`.

| Method | Path                        | Purpose                                      |
|--------|------------------------------|-----------------------------------------------|
| GET    | `/health`                   | Liveness check                                |
| GET    | `/buses`                    | List buses + last known telemetry             |
| GET    | `/buses/:id/detections`     | Recent AI detections for a bus (polling adds a new simulated detection each call, capped) |
| GET    | `/incidents?severity=`      | Incident/action queue, optional severity filter (`critical`\|`moderate`\|`low`) |
| PATCH  | `/incidents/:id`            | Update incident `status` / `department`       |
| GET    | `/reports`                  | All citizen reports                           |
| POST   | `/reports`                  | Create a citizen report                       |
| PATCH  | `/reports/:id/advance`      | Move a report to the next workflow stage (demo helper — represents authority-side progress) |
| PATCH  | `/reports/:id/confirm`      | Citizen confirms a "Repairing" report is fixed → Resolved |
| GET    | `/alerts`                   | Safety alert queue                            |
| PATCH  | `/alerts/:id`               | Set alert `state`: `contacted` \| `escalated` \| `false` |

## 7. Swapping SQLite for MySQL

`backend/schema.mysql.sql` mirrors the SQLite schema for production use. To
switch:
1. Provision a MySQL database and run `schema.mysql.sql` against it.
2. Replace `backend/src/db.js` with a MySQL client (e.g. `mysql2`), using the
   same table/column names so the route files in `backend/src/routes/`
   continue to work with minimal changes.
3. Set connection details via `backend/.env` (host/user/password/database).

## 8. Deploying

- **Backend**: any Node host (Render, Railway, Fly.io, a VPS). Set `PORT` and
  point `DATABASE_FILE` somewhere persistent, or switch to MySQL per §7.
- **Frontend**: `npm run build` in `frontend/` produces a static `dist/`
  folder you can deploy to Vercel, Netlify, GitHub Pages, or serve behind
  the backend with a static file middleware. Set `VITE_API_URL` to your
  deployed backend's URL before building.

## 9. What's real vs. simulated in this prototype

- Real: the client/server split, the database schema, the API contract, the
  full citizen-report workflow, and the control-room/safety-desk state
  transitions.
- Simulated (by design, for a hackathon demo): actual computer-vision
  detection, GPS hardware, and on-device audio classification. The
  `/buses/:id/detections` endpoint generates plausible mock detections so the
  UI and workflow can be demonstrated end-to-end; swap in a real edge-AI
  pipeline by having your detection service call
  `POST /api/buses/:id/detections` with real payloads (see `backend/src/routes/buses.js`).
