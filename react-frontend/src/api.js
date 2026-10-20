//src/api.js
export const API_URL = import.meta.env.VITE_API_URL;

// fetch wrapper: always sends the auth cookie, throws Error(message) on non-2xx
export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}
