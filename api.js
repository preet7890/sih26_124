const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request to ${path} failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  health: () => request('/health'),

  getBuses: () => request('/buses'),
  getDetections: (busId, { simulate = true } = {}) =>
    request(`/buses/${encodeURIComponent(busId)}/detections?simulate=${simulate}`),

  getIncidents: (severity = 'all') => request(`/incidents?severity=${severity}`),
  getIncidentSummary: () => request('/incidents/summary'),
  patchIncident: (id, data) =>
    request(`/incidents/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getReports: () => request('/reports'),
  createReport: (data) => request('/reports', { method: 'POST', body: JSON.stringify(data) }),
  advanceReport: (id) => request(`/reports/${id}/advance`, { method: 'PATCH' }),
  confirmReport: (id) => request(`/reports/${id}/confirm`, { method: 'PATCH' }),

  getAlerts: () => request('/alerts'),
  patchAlert: (id, state) =>
    request(`/alerts/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ state }) }),
};
