// Empty in local dev (Vite proxies /api); your Render URL in production.
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export async function api(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Only allow normal web links in hrefs that come from the database.
export function safeUrl(url) {
  const u = String(url || "").trim();
  return /^(https?:|mailto:|tel:|\/|#)/i.test(u) ? u : "";
}
