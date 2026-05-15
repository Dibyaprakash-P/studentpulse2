/**
 * Student Pulse — Fully Client-Side API (localStorage)
 * No backend required. All data lives in the browser.
 */

const KEYS = {
  USERS: "sp_users",
  CURRENT: "sp_current_user",
  TOKEN: "sp_access_token",
  USER: "sp_user",
  ACTIVITIES: "sp_activities",
  PREDICTIONS: "sp_predictions",
  LINK_CODES: "sp_link_codes",
};

function store(key) {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function save(key, val) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(val));
}

// ── Simple burnout prediction algorithm (replaces ML backend) ──────────
function predictBurnoutLocal(d) {
  let risk = 0;
  const factors = [];
  const recs = [];

  // Sleep analysis
  if (d.sleep_hours < 5) { risk += 25; factors.push({ factor: "Very low sleep", severity: "high", detail: `Only ${d.sleep_hours}h sleep` }); recs.push({ icon: "😴", text: "You're severely sleep-deprived. Aim for at least 7 hours tonight." }); }
  else if (d.sleep_hours < 7) { risk += 12; factors.push({ factor: "Low sleep", severity: "moderate", detail: `${d.sleep_hours}h sleep` }); recs.push({ icon: "🛏️", text: "Try to get 7-8 hours of sleep for optimal recovery." }); }

  // Stress analysis
  if (d.stress_level >= 8) { risk += 20; factors.push({ factor: "High stress", severity: "high", detail: `Stress: ${d.stress_level}/10` }); recs.push({ icon: "🧘", text: "Your stress is very high. Try 10 minutes of deep breathing or meditation." }); }
  else if (d.stress_level >= 6) { risk += 10; factors.push({ factor: "Moderate stress", severity: "moderate", detail: `Stress: ${d.stress_level}/10` }); }

  // Study overload
  if (d.study_hours > 10) { risk += 15; factors.push({ factor: "Study overload", severity: "high", detail: `${d.study_hours}h studying` }); recs.push({ icon: "📚", text: "You're studying excessively. Take regular breaks using the Pomodoro technique." }); }
  else if (d.study_hours > 7) { risk += 8; factors.push({ factor: "Heavy study", severity: "moderate", detail: `${d.study_hours}h studying` }); }

  // Screen time
  if (d.screen_time_hours > 10) { risk += 10; factors.push({ factor: "Excessive screen time", severity: "high", detail: `${d.screen_time_hours}h screen time` }); recs.push({ icon: "📱", text: "Reduce screen time. Take a 5-min break every 30 minutes." }); }

  // Low energy
  if (d.energy_level <= 3) { risk += 12; factors.push({ factor: "Low energy", severity: "high", detail: `Energy: ${d.energy_level}/10` }); recs.push({ icon: "⚡", text: "Your energy is critically low. Eat well, hydrate, and rest." }); }

  // Low mood
  if (d.mood_level <= 3) { risk += 10; factors.push({ factor: "Low mood", severity: "high", detail: `Mood: ${d.mood_level}/10` }); recs.push({ icon: "💛", text: "Your mood is low. Reach out to a friend or do something you enjoy." }); }

  // Physical activity
  if (d.physical_activity_mins < 10) { risk += 8; factors.push({ factor: "Sedentary", severity: "moderate", detail: `Only ${d.physical_activity_mins}min activity` }); recs.push({ icon: "🏃", text: "Try a short 15-minute walk to boost mood and energy." }); }

  // Hydration
  if (d.water_intake_glasses < 4) { risk += 5; factors.push({ factor: "Dehydrated", severity: "moderate", detail: `${d.water_intake_glasses} glasses of water` }); recs.push({ icon: "💧", text: "Drink at least 8 glasses of water throughout the day." }); }

  // Gaming balance
  if (d.gaming_hours > d.study_hours && d.gaming_hours > 3) { risk += 8; factors.push({ factor: "Gaming > Study", severity: "moderate", detail: `Gaming ${d.gaming_hours}h vs Study ${d.study_hours}h` }); recs.push({ icon: "🎮", text: "Balance gaming with study. Set a study-first rule." }); }

  // Low social
  if (d.social_interaction <= 2) { risk += 5; factors.push({ factor: "Social isolation", severity: "moderate", detail: `Social: ${d.social_interaction}/10` }); recs.push({ icon: "👥", text: "Social connections reduce burnout. Chat with a friend or classmate." }); }

  // Good indicators (reduce risk)
  if (d.sleep_hours >= 8 && d.energy_level >= 7) risk = Math.max(0, risk - 10);
  if (d.mood_level >= 8 && d.stress_level <= 3) risk = Math.max(0, risk - 10);
  if (d.physical_activity_mins >= 60) risk = Math.max(0, risk - 5);

  risk = Math.min(100, Math.max(0, risk));

  if (recs.length === 0) {
    recs.push({ icon: "✅", text: "Great job! Your habits look healthy. Keep it up!" });
  }

  const riskLevel = risk >= 60 ? "high" : risk >= 35 ? "moderate" : "low";
  return { burnout_percentage: risk, risk_level: riskLevel, contributing_factors: factors, recommendations: recs };
}

// ── Compute weekly summary from stored activities ──────────────────────
function computeWeekly(userId) {
  const all = store(KEYS.ACTIVITIES) || [];
  const mine = all.filter(a => a.user_id === userId);
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const week = mine.filter(a => new Date(a.activity_date) >= weekAgo).sort((a, b) => a.activity_date.localeCompare(b.activity_date));

  if (week.length === 0) return { days_logged: 0, avg_sleep: 0, avg_study: 0, avg_gaming: 0, productivity_score: 0, consistency_score: 0, daily_data: [] };

  const sum = (arr, k) => arr.reduce((s, a) => s + (a[k] || 0), 0);
  const avg = (arr, k) => +(sum(arr, k) / arr.length).toFixed(1);

  const dailyData = week.map(a => {
    const prod = Math.min(100, Math.round(
      (a.study_hours / 10) * 30 +
      (a.sleep_hours / 8) * 20 +
      (a.energy_level / 10) * 15 +
      ((10 - a.stress_level) / 10) * 15 +
      (a.mood_level / 10) * 10 +
      (a.attendance_pct / 100) * 10
    ));
    return { date: a.activity_date, productivity: prod, study: a.study_hours, gaming: a.gaming_hours, energy: a.energy_level, stress: a.stress_level, mood: a.mood_level };
  });

  const prodScores = dailyData.map(d => d.productivity);

  return {
    days_logged: week.length,
    avg_sleep: avg(week, "sleep_hours"),
    avg_study: avg(week, "study_hours"),
    avg_gaming: avg(week, "gaming_hours"),
    productivity_score: +(prodScores.reduce((s, v) => s + v, 0) / prodScores.length).toFixed(0),
    consistency_score: Math.round((week.length / 7) * 100),
    daily_data: dailyData,
  };
}

// ── Gamification engine ────────────────────────────────────────────────
const ALL_BADGES = [
  { name: "First Log", description: "Log your first daily activity", icon: "🎯", category: "milestone", xp_reward: 50 },
  { name: "3-Day Streak", description: "Log 3 days in a row", icon: "🔥", category: "streak", xp_reward: 100 },
  { name: "7-Day Streak", description: "Log 7 days in a row", icon: "💪", category: "streak", xp_reward: 250 },
  { name: "30-Day Streak", description: "Log 30 days in a row", icon: "🏅", category: "streak", xp_reward: 1000 },
  { name: "Focus Master", description: "Study 6+ hours in a single day", icon: "🧠", category: "productivity", xp_reward: 150 },
  { name: "Healthy Sleep", description: "Get 8+ hours of sleep", icon: "😴", category: "wellness", xp_reward: 100 },
  { name: "Zen Mode", description: "Achieve stress level ≤ 2", icon: "🧘", category: "wellness", xp_reward: 150 },
  { name: "Active Life", description: "Exercise 60+ minutes", icon: "🏃", category: "fitness", xp_reward: 100 },
  { name: "Hydration Hero", description: "Drink 10+ glasses of water", icon: "💧", category: "wellness", xp_reward: 75 },
  { name: "Social Butterfly", description: "Social interaction ≥ 8", icon: "🦋", category: "social", xp_reward: 100 },
  { name: "Perfect Attendance", description: "100% attendance", icon: "📋", category: "academic", xp_reward: 200 },
  { name: "Low Burnout Pro", description: "Burnout risk below 15%", icon: "🛡️", category: "wellness", xp_reward: 200 },
];

function computeGamification(userId) {
  const all = store(KEYS.ACTIVITIES) || [];
  const mine = all.filter(a => a.user_id === userId).sort((a, b) => a.activity_date.localeCompare(b.activity_date));
  const preds = store(KEYS.PREDICTIONS) || [];
  const myPreds = preds.filter(p => p.user_id === userId);

  const totalLogs = mine.length;
  const earned = [];

  // Check badges
  if (totalLogs >= 1) earned.push("First Log");
  if (mine.some(a => a.study_hours >= 6)) earned.push("Focus Master");
  if (mine.some(a => a.sleep_hours >= 8)) earned.push("Healthy Sleep");
  if (mine.some(a => a.stress_level <= 2)) earned.push("Zen Mode");
  if (mine.some(a => a.physical_activity_mins >= 60)) earned.push("Active Life");
  if (mine.some(a => a.water_intake_glasses >= 10)) earned.push("Hydration Hero");
  if (mine.some(a => a.social_interaction >= 8)) earned.push("Social Butterfly");
  if (mine.some(a => a.attendance_pct >= 100)) earned.push("Perfect Attendance");
  if (myPreds.some(p => p.burnout_percentage < 15)) earned.push("Low Burnout Pro");

  // Streak calculation
  let streak = 0, longestStreak = 0, tempStreak = 0;
  const dates = [...new Set(mine.map(a => a.activity_date))].sort();
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) { tempStreak = 1; }
    else {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }
  // Check if latest date is today or yesterday for current streak
  if (dates.length > 0) {
    const latest = new Date(dates[dates.length - 1]);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = (today - latest) / (1000 * 60 * 60 * 24);
    if (diff <= 1) {
      streak = tempStreak;
      if (streak >= 3) earned.push("3-Day Streak");
      if (streak >= 7) earned.push("7-Day Streak");
      if (streak >= 30) earned.push("30-Day Streak");
    }
  }

  const earnedBadges = ALL_BADGES.filter(b => earned.includes(b.name));
  const xp = earnedBadges.reduce((s, b) => s + b.xp_reward, 0) + totalLogs * 25;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const progressPct = (xpInLevel / 500) * 100;

  return {
    xp_points: xp, level, level_progress_pct: Math.round(progressPct),
    xp_to_next_level: 500 - xpInLevel,
    current_streak: streak, longest_streak: longestStreak,
    total_badges_earned: earnedBadges.length, total_badges_available: ALL_BADGES.length,
    earned_badges: earnedBadges, all_badges: ALL_BADGES,
  };
}

// ── ApiClient (localStorage) ───────────────────────────────────────────
class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(KEYS.TOKEN);
    }
  }

  _currentUserId() {
    const u = store(KEYS.USER);
    return u?.id || null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") localStorage.setItem(KEYS.TOKEN, token);
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(KEYS.TOKEN);
      localStorage.removeItem("sp_refresh_token");
      localStorage.removeItem(KEYS.USER);
    }
  }

  // ── Auth ──────────────────────────────────────────────────
  async login(email, password) {
    const users = store(KEYS.USERS) || [];
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("No account found with this email. Please sign up first.");
    if (user.password !== password) throw new Error("Incorrect password. Please try again.");

    // Refresh gamification stats
    const gam = computeGamification(user.id);
    user.level = gam.level;
    user.xp_points = gam.xp_points;
    user.current_streak = gam.current_streak;
    user.longest_streak = gam.longest_streak;
    save(KEYS.USERS, users);

    const token = "local_" + Math.random().toString(36).slice(2);
    this.setToken(token);
    const safeUser = { ...user }; delete safeUser.password;
    localStorage.setItem(KEYS.USER, JSON.stringify(safeUser));
    localStorage.setItem("sp_refresh_token", token);
    return { access_token: token, refresh_token: token, user: safeUser };
  }

  async register(userData) {
    const users = store(KEYS.USERS) || [];
    if (users.find(u => u.email === userData.email)) throw new Error("An account with this email already exists.");
    if (!userData.password || userData.password.length < 6) throw new Error("Password must be at least 6 characters.");

    const newUser = {
      id: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      email: userData.email,
      full_name: userData.full_name || "Student",
      role: userData.role || "student",
      password: userData.password,
      level: 1, xp_points: 0, current_streak: 0, longest_streak: 0,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    save(KEYS.USERS, users);

    const token = "local_" + Math.random().toString(36).slice(2);
    this.setToken(token);
    const safeUser = { ...newUser }; delete safeUser.password;
    localStorage.setItem(KEYS.USER, JSON.stringify(safeUser));
    localStorage.setItem("sp_refresh_token", token);
    return { access_token: token, refresh_token: token, user: safeUser };
  }

  // ── Google OAuth Login/Register ──────────────────────────
  loginWithGoogle(googleUser, role = "student") {
    const users = store(KEYS.USERS) || [];
    let user = users.find(u => u.email === googleUser.email);

    if (user) {
      // Existing user — update google info
      user.google_id = googleUser.google_id;
      if (googleUser.picture) user.picture = googleUser.picture;
      const gam = computeGamification(user.id);
      user.level = gam.level;
      user.xp_points = gam.xp_points;
      user.current_streak = gam.current_streak;
      user.longest_streak = gam.longest_streak;
      save(KEYS.USERS, users);
    } else {
      // New user via Google
      user = {
        id: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        email: googleUser.email,
        full_name: googleUser.full_name,
        role: role,
        google_id: googleUser.google_id,
        picture: googleUser.picture,
        level: 1, xp_points: 0, current_streak: 0, longest_streak: 0,
        created_at: new Date().toISOString(),
      };
      users.push(user);
      save(KEYS.USERS, users);
    }

    const token = "local_" + Math.random().toString(36).slice(2);
    this.setToken(token);
    const safeUser = { ...user }; delete safeUser.password;
    localStorage.setItem(KEYS.USER, JSON.stringify(safeUser));
    localStorage.setItem("sp_refresh_token", token);
    return { access_token: token, refresh_token: token, user: safeUser };
  }

  // ── Tracking ──────────────────────────────────────────────
  async logActivity(activityData) {
    const userId = this._currentUserId();
    if (!userId) throw new Error("Not logged in");
    const activities = store(KEYS.ACTIVITIES) || [];

    // Remove existing entry for same date
    const filtered = activities.filter(a => !(a.user_id === userId && a.activity_date === activityData.activity_date));
    const entry = { ...activityData, user_id: userId, id: "a_" + Date.now(), logged_at: new Date().toISOString() };
    filtered.push(entry);
    save(KEYS.ACTIVITIES, filtered);
    return entry;
  }

  async getActivities(limit = 7) {
    const userId = this._currentUserId();
    const all = store(KEYS.ACTIVITIES) || [];
    return all.filter(a => a.user_id === userId).sort((a, b) => b.activity_date.localeCompare(a.activity_date)).slice(0, limit);
  }

  // ── ML (local algorithm) ──────────────────────────────────
  async predictBurnout(activityData) {
    const userId = this._currentUserId();
    const result = predictBurnoutLocal(activityData);
    const predictions = store(KEYS.PREDICTIONS) || [];
    predictions.push({ ...result, user_id: userId, date: activityData.activity_date || new Date().toISOString().slice(0, 10) });
    // Keep last 100
    save(KEYS.PREDICTIONS, predictions.slice(-100));
    return result;
  }

  async getLatestPrediction() {
    const userId = this._currentUserId();
    const preds = store(KEYS.PREDICTIONS) || [];
    const mine = preds.filter(p => p.user_id === userId);
    if (mine.length === 0) return { burnout_percentage: 0, risk_level: "unknown", contributing_factors: [], recommendations: [] };
    return mine[mine.length - 1];
  }

  // ── Gamification ──────────────────────────────────────────
  async getGamificationProfile() {
    const userId = this._currentUserId();
    if (!userId) return { xp_points: 0, level: 1, earned_badges: [], all_badges: ALL_BADGES, current_streak: 0, longest_streak: 0, total_badges_earned: 0, total_badges_available: ALL_BADGES.length };
    return computeGamification(userId);
  }

  // ── Analytics ─────────────────────────────────────────────
  async getWeeklySummary() {
    const userId = this._currentUserId();
    if (!userId) return { days_logged: 0, avg_sleep: 0, avg_study: 0, productivity_score: 0, daily_data: [] };
    return computeWeekly(userId);
  }

  // ── Parent/Student Link ───────────────────────────────────
  async generateLinkCode() {
    const userId = this._currentUserId();
    if (!userId) throw new Error("Not logged in");
    const code = Math.random().toString(36).slice(2, 10).toUpperCase();
    const codes = store(KEYS.LINK_CODES) || [];
    codes.push({ code, parent_id: userId, created_at: new Date().toISOString() });
    save(KEYS.LINK_CODES, codes);
    return { link_code: code, message: "Share this code with your student." };
  }

  async approveLinkCode(linkCode) {
    const userId = this._currentUserId();
    const codes = store(KEYS.LINK_CODES) || [];
    const entry = codes.find(c => c.code === linkCode.toUpperCase());
    if (!entry) throw new Error("Invalid link code.");
    entry.student_id = userId;
    save(KEYS.LINK_CODES, codes);
    return { message: "Successfully linked!" };
  }

  async getLinkedStudents() {
    const userId = this._currentUserId();
    const codes = store(KEYS.LINK_CODES) || [];
    const linked = codes.filter(c => c.parent_id === userId && c.student_id);
    const users = store(KEYS.USERS) || [];
    return linked.map(c => {
      const student = users.find(u => u.id === c.student_id);
      if (!student) return null;
      const gam = computeGamification(student.id);
      return { id: student.id, full_name: student.full_name, level: gam.level, xp_points: gam.xp_points, current_streak: gam.current_streak };
    }).filter(Boolean);
  }

  // ── Unused (compatibility) ────────────────────────────────
  async fetch(endpoint) {
    if (endpoint === "/auth/me") {
      const u = store(KEYS.USER);
      if (!u) throw new Error("Not logged in");
      return u;
    }
    return {};
  }
}

export const api = new ApiClient();

export function loginWithGoogleCredential(googleUser, role) {
  return api.loginWithGoogle(googleUser, role);
}
