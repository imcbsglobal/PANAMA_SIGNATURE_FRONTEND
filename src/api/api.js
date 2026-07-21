import { BASE_URL } from "./config";

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}, requiresAuth = false, isRetry = false) {
  const token = getAccessToken();
  const headers = {
    ...(options.headers || {}),
    ...(requiresAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && requiresAuth) {
    if (!isRetry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return request(endpoint, options, requiresAuth, true);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/admin-login";
    throw new Error("Session expired. Redirecting to login.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return null;
}

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    return data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  isLoggedIn: () => !!getAccessToken(),

  // Public
  getAgents: () => request("/api/agents/"),
  getProperties: () => request("/api/properties/"),
  getFeaturedProperties: () => request("/api/properties/featured/"),
  getPropertyBySlug: (slug) => request(`/api/properties/${slug}/`),
  getPosts: () => request("/api/blog/"),

  // Public - Rentals
  getRentals: () => request("/api/rentals/"),
  getFeaturedRentals: () => request("/api/rentals/featured/"),
  getRentalBySlug: (slug) => request(`/api/rentals/${slug}/`),

  // Public - Projects
  getProjects: () => request("/api/projects/"),
  getFeaturedProjects: () => request("/api/projects/featured/"),
  getProjectBySlug: (slug) => request(`/api/projects/${slug}/`),

  createLead: (payload) =>
    request("/api/leads/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  // Protected
  createAgent: (formData) =>
    request("/api/agents/create/", { method: "POST", body: formData }, true),

  createProperty: (formData) =>
    request("/api/properties/create/", { method: "POST", body: formData }, true),

  updateProperty: (slug, formData) =>
    request(`/api/properties/${slug}/`, { method: "PATCH", body: formData }, true),

  deleteProperty: (slug) =>
    request(`/api/properties/${slug}/`, { method: "DELETE" }, true),

  // Protected - Rentals
  createRental: (formData) =>
    request("/api/rentals/create/", { method: "POST", body: formData }, true),

  updateRental: (slug, formData) =>
    request(`/api/rentals/${slug}/`, { method: "PATCH", body: formData }, true),

  deleteRental: (slug) =>
    request(`/api/rentals/${slug}/`, { method: "DELETE" }, true),

  // Protected - Projects
  createProject: (formData) =>
    request("/api/projects/create/", { method: "POST", body: formData }, true),

  updateProject: (slug, formData) =>
    request(`/api/projects/${slug}/`, { method: "PATCH", body: formData }, true),

  deleteProject: (slug) =>
    request(`/api/projects/${slug}/`, { method: "DELETE" }, true),

  // Admin: team management
  getAllAgents: () => request("/api/agents/all/", {}, true),

  updateAgent: (id, formData) =>
    request(`/api/agents/${id}/`, { method: "PATCH", body: formData }, true),

  deleteAgent: (id) =>
    request(`/api/agents/${id}/`, { method: "DELETE" }, true),
};

export default api;