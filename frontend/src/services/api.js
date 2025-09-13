// src/services/api.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// A small helper for all API calls
export async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { message: "Unexpected server response" };
    }

    if (!res.ok) {
      throw new Error(data.message || `Error ${res.status}`);
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

// Example auth helpers
export function signup(data) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
