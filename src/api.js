// Tiny API client + session storage.
const TOKEN_KEY = "tabboush_token";
const USER_KEY = "tabboush_user";
const ADMIN_TOKEN_KEY = "tabboush_admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setSession = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
export const setAdminToken = (t) => (t ? localStorage.setItem(ADMIN_TOKEN_KEY, t) : localStorage.removeItem(ADMIN_TOKEN_KEY));

async function req(path, { method = "GET", body, token } = {}) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "حصل خطأ — جرّب تاني");
  return data;
}

export const api = {
  signup: (body) => req("/api/auth/signup", { method: "POST", body }),
  login: (body) => req("/api/auth/login", { method: "POST", body }),
  restaurant: (slug) => req(`/api/restaurants/${encodeURIComponent(slug)}`),
  placeOrder: (body) => req("/api/orders", { method: "POST", body, token: getToken() }),
  myOrders: (slug) => req(`/api/orders?slug=${encodeURIComponent(slug)}`, { token: getToken() }),
  adminLogin: (body) => req("/api/admin/login", { method: "POST", body }),
  adminRestaurant: () => req("/api/admin/restaurant", { token: getAdminToken() }),
  adminSaveSettings: (body) => req("/api/admin/restaurant", { method: "PATCH", body, token: getAdminToken() }),
  adminSaveMenu: (body) => req("/api/admin/menu", { method: "PUT", body, token: getAdminToken() }),
  adminOrders: () => req("/api/admin/orders", { token: getAdminToken() }),
  adminSetStatus: (id, status) => req(`/api/admin/orders/${id}`, { method: "PATCH", body: { status }, token: getAdminToken() }),
};
