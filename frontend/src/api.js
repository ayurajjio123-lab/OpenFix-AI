const API = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8002"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to OpenFix AI. Check that the backend is running on port 8002."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || `Request failed with status ${response.status}.`
    );
  }

  return data;
}

export const api = {
  // Authentication
  me: () => request("/auth/me"),

  register: (body) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  // GitHub issues
  issues: (params = {}) =>
    request(`/api/issues?${new URLSearchParams(params)}`),

  // AI issue analysis
  analyze: (body) =>
    request("/api/analyze", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // AI chatbot
  chat: (body) =>
    request("/api/chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const API_BASE = API;