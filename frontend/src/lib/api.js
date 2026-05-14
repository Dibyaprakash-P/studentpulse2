/**
 * API Client Library to connect Next.js frontend with FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("sp_access_token");
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("sp_access_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("sp_access_token");
      localStorage.removeItem("sp_refresh_token");
      localStorage.removeItem("sp_user");
    }
  }

  async fetch(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.clearToken();
          if (typeof window !== "undefined") {
             window.location.href = '/login';
          }
        }
        throw new Error(data.detail || "API Error");
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  // --- Auth ---
  async login(email, password) {
    const data = await this.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    if (typeof window !== "undefined") {
      localStorage.setItem("sp_refresh_token", data.refresh_token);
      localStorage.setItem("sp_user", JSON.stringify(data.user));
    }
    return data;
  }

  async register(userData) {
    const data = await this.fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    this.setToken(data.access_token);
    return data;
  }

  // --- Tracking ---
  async logActivity(activityData) {
    return this.fetch("/tracking/activities", {
      method: "POST",
      body: JSON.stringify(activityData),
    });
  }

  async getActivities(limit = 7) {
    return this.fetch(`/tracking/activities?limit=${limit}`);
  }

  // --- Machine Learning ---
  async predictBurnout(activityData) {
    return this.fetch("/ml/predict-burnout", {
      method: "POST",
      body: JSON.stringify(activityData),
    });
  }

  async getLatestPrediction() {
    return this.fetch("/ml/predict-latest");
  }

  // --- Gamification ---
  async getGamificationProfile() {
    return this.fetch("/gamification/profile");
  }

  // --- Analytics ---
  async getWeeklySummary() {
    return this.fetch("/analytics/weekly-summary");
  }

  // --- Parent/Student Link ---
  async generateLinkCode() {
    return this.fetch("/auth/generate-link-code", { method: "POST" });
  }

  async approveLinkCode(link_code) {
    return this.fetch("/auth/approve-link", {
      method: "POST",
      body: JSON.stringify({ link_code }),
    });
  }

  async getLinkedStudents() {
    return this.fetch("/auth/linked-students");
  }
}

export const api = new ApiClient();
