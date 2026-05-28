/**
 * Student Pulse — API Client (v2)
 * ────────────────────────────────
 * Communicates with the FastAPI backend via HTTP.
 * All user data is stored server-side in PostgreSQL.
 * Only JWT token + cached user profile are kept in localStorage.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const KEYS = {
  TOKEN: "sp_access_token",
  REFRESH: "sp_refresh_token",
  USER: "sp_user",
};

class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(KEYS.TOKEN);
    }
  }

  // ── Token management ─────────────────────────────────────────
  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") localStorage.setItem(KEYS.TOKEN, token);
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(KEYS.TOKEN);
      localStorage.removeItem(KEYS.REFRESH);
      localStorage.removeItem(KEYS.USER);
    }
  }

  // ── Core HTTP helper ─────────────────────────────────────────
  async _fetch(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || `Request failed (${response.status})`);
    }

    return response.json();
  }

  // ── Auth ──────────────────────────────────────────────────────
  async login(email, password, rememberMe = false) {
    const data = await this._fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
    this.setToken(data.access_token);
    localStorage.setItem(KEYS.USER, JSON.stringify(data.user));
    localStorage.setItem(KEYS.REFRESH, data.refresh_token);
    // Save email for remember-me
    if (rememberMe) {
      localStorage.setItem("sp_remember_email", email);
    } else {
      localStorage.removeItem("sp_remember_email");
    }
    return data;
  }

  async register(userData) {
    const data = await this._fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    this.setToken(data.access_token);
    localStorage.setItem(KEYS.USER, JSON.stringify(data.user));
    localStorage.setItem(KEYS.REFRESH, data.refresh_token);
    return data;
  }

  async loginWithGoogle(googleUser, role = "student") {
    const data = await this._fetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({ ...googleUser, role }),
    });
    this.setToken(data.access_token);
    localStorage.setItem(KEYS.USER, JSON.stringify(data.user));
    localStorage.setItem(KEYS.REFRESH, data.refresh_token);
    return data;
  }

  // ── Tracking ──────────────────────────────────────────────────
  async logActivity(activityData) {
    return this._fetch("/tracking/log", {
      method: "POST",
      body: JSON.stringify(activityData),
    });
  }

  async getActivities(limit = 7) {
    return this._fetch(`/tracking/activities?limit=${limit}`);
  }

  // ── Analytics (ML) ────────────────────────────────────────────
  async predictBurnout(activityData) {
    return this._fetch("/analytics/predict", {
      method: "POST",
      body: JSON.stringify(activityData),
    });
  }

  async getLatestPrediction() {
    return this._fetch("/analytics/latest-prediction");
  }

  // ── Gamification ──────────────────────────────────────────────
  async getGamificationProfile() {
    return this._fetch("/gamification/profile");
  }

  // ── Analytics ─────────────────────────────────────────────────
  async getWeeklySummary() {
    return this._fetch("/analytics/weekly-summary");
  }

  // ── Parent/Student Link ───────────────────────────────────────
  async generateLinkCode() {
    return this._fetch("/parent/generate-code", { method: "POST" });
  }

  async approveLinkCode(linkCode) {
    return this._fetch("/parent/approve-code", {
      method: "POST",
      body: JSON.stringify({ link_code: linkCode }),
    });
  }

  async getLinkedStudents() {
    return this._fetch("/parent/linked-students");
  }

  // ── Compatibility wrapper ─────────────────────────────────────
  async fetch(endpoint) {
    if (endpoint === "/auth/me") {
      return this._fetch("/auth/me");
    }
    return {};
  }
}

export const api = new ApiClient();

export function loginWithGoogleCredential(googleUser, role) {
  return api.loginWithGoogle(googleUser, role);
}
