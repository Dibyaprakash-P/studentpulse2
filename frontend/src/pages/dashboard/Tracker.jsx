import NeonButton from "@/components/ui/NeonButton";
import GlassCard from "@/components/ui/GlassCard";
import { useState, useCallback, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const today = new Date().toISOString().slice(0, 10);

/* ─── Slider Component ─── */
const TrackerSlider = memo(function TrackerSlider({ label, icon, value, min, max, step, color, unit, name, onUpdate, readOnly, readOnlyText }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="glass-panel" style={{ padding: "18px 22px", borderLeft: `3px solid ${color}`, position: "relative" }}>
      {readOnly && (
        <div style={{
          position: "absolute", top: 8, right: 12, fontSize: "0.65rem", fontWeight: 600,
          color, background: `${color}15`, padding: "2px 8px", borderRadius: 8,
        }}>
          {readOnlyText || "AUTO"}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <label style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
          <span style={{ fontSize: "1.15rem" }}>{icon}</span> {label}
        </label>
        <span style={{
          color, fontWeight: 700, fontSize: "0.95rem",
          fontVariantNumeric: "tabular-nums",
          minWidth: 56, textAlign: "right",
        }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => !readOnly && onUpdate(name, e.target.value)}
        disabled={readOnly}
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, var(--border-light) ${pct}%)`,
          borderRadius: 6,
          opacity: readOnly ? 0.6 : 1,
          cursor: readOnly ? "not-allowed" : "pointer",
        }}
      />
    </div>
  );
});

/* ─── Time budget bar ─── */
function TimeBudgetBar({ used, total }) {
  const pct = Math.min((used / total) * 100, 100);
  const remaining = Math.max(total - used, 0);
  const overBudget = used > total;
  const barColor = overBudget ? "var(--danger)" : pct > 90 ? "var(--warning)" : "var(--success)";

  return (
    <div className="glass-panel" style={{ padding: "14px 20px", borderLeft: `3px solid ${barColor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.1rem" }}>⏰</span> Daily Time Budget
        </span>
        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: barColor }}>
          {used}h / {total}h {overBudget ? "⚠️ Over!" : `(${remaining}h free)`}
        </span>
      </div>
      <div style={{
        width: "100%", height: 8, background: "var(--border-light)", borderRadius: 8, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 8,
          background: overBudget
            ? "linear-gradient(90deg, var(--danger), #ff4466)"
            : "linear-gradient(90deg, var(--success), var(--primary-yellow))",
          transition: "width 0.4s ease",
        }} />
      </div>
      {overBudget && (
        <p style={{ color: "var(--danger)", fontSize: "0.78rem", marginTop: 6, fontWeight: 500 }}>
          Total exceeds 24 hours! Please reduce some activities.
        </p>
      )}
    </div>
  );
}

/* ─── Slider configs with distinct colors ─── */
const TIME_SLIDERS = [
  { label: "Sleep Hours", icon: "😴", name: "sleep_hours", min: 0, max: 14, step: 0.5, color: "#3b82f6", unit: "h" },
  { label: "Study Hours", icon: "📚", name: "study_hours", min: 0, max: 14, step: 0.5, color: "#8b5cf6", unit: "h" },
  { label: "Game & Fun Time", icon: "🎮", name: "gaming_hours", min: 0, max: 14, step: 0.5, color: "#f43f5e", unit: "h" },
  { label: "Screen Time", icon: "📱", name: "screen_time_hours", min: 0, max: 16, step: 0.5, color: "#f59e0b", unit: "h" },
  { label: "Physical Activity", icon: "🏃", name: "physical_activity_hrs", min: 0, max: 6, step: 0.5, color: "#FFCA28", unit: "h" },
];

const OTHER_SLIDERS = [
  { label: "Stress Level", icon: "😰", name: "stress_level", min: 1, max: 10, step: 1, color: "#ef4444", unit: "/10" },
  { label: "Energy Level", icon: "⚡", name: "energy_level", min: 1, max: 10, step: 1, color: "#f97316", unit: "/10" },
  { label: "Water Intake", icon: "💧", name: "water_intake_glasses", min: 0, max: 15, step: 1, color: "#FFD700", unit: " glasses" },
  { label: "Social Interaction", icon: "👥", name: "social_interaction", min: 1, max: 10, step: 1, color: "#FFC107", unit: "/10" },
];

const STORAGE_KEY_HW = "sp_homework";
const STORAGE_KEY_ATT = "sp_attendance";

function getAssignmentLoad() {
  if (typeof window === "undefined") return 0;
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY_HW)) || [];
    return items.filter(h => !h.completed).length;
  } catch { return 0; }
}

function getAttendancePct() {
  if (typeof window === "undefined") return 0;
  try {
    const subjects = JSON.parse(localStorage.getItem(STORAGE_KEY_ATT)) || [];
    if (subjects.length === 0) return 0;
    const totalPct = subjects.reduce((sum, s) => {
      if (s.totalClasses === 0) return sum;
      return sum + (s.attendedClasses / s.totalClasses) * 100;
    }, 0);
    return Math.round(totalPct / subjects.length);
  } catch { return 0; }
}

export default function DailyTracker() {
  const [formData, setFormData] = useState({
    activity_date: today, sleep_hours: 7, study_hours: 4, gaming_hours: 2,
    assignment_workload: 0, attendance_pct: 0, screen_time_hours: 5,
    water_intake_glasses: 6, social_interaction: 5, mood_level: 7,
    stress_level: 4, energy_level: 6, physical_activity_hrs: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");

  /* Load assignment load + attendance from their dashboards */
  useEffect(() => {
    const load = getAssignmentLoad();
    const att = getAttendancePct();
    setFormData(p => ({ ...p, assignment_workload: Math.min(load, 10), attendance_pct: att }));
  }, []);

  /* 24-hour time budget */
  const timeUsed = formData.sleep_hours + formData.study_hours + formData.gaming_hours +
    formData.screen_time_hours + formData.physical_activity_hrs;

  /* Stable callback with 24h enforcement */
  const onUpdate = useCallback((key, val) => {
    const numVal = Number(val);
    setFormData(p => {
      const updated = { ...p, [key]: numVal };
      /* For time sliders, enforce 24h cap */
      const timeKeys = ["sleep_hours", "study_hours", "gaming_hours", "screen_time_hours", "physical_activity_hrs"];
      if (timeKeys.includes(key)) {
        const totalTime = timeKeys.reduce((sum, k) => sum + (k === key ? numVal : updated[k]), 0);
        if (totalTime > 24) {
          const excess = totalTime - 24;
          updated[key] = Math.max(0, numVal - excess);
        }
      }
      return updated;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timeUsed > 24) {
      setError("Total time exceeds 24 hours! Adjust your activities.");
      return;
    }
    setSubmitting(true); setError(""); setPrediction(null);
    try {
      /* Convert physical activity back to mins for API */
      const apiData = {
        ...formData,
        physical_activity_mins: Math.round(formData.physical_activity_hrs * 60),
      };
      delete apiData.physical_activity_hrs;
      await api.logActivity(apiData);
      const pred = await api.predictBurnout(apiData);
      setPrediction(pred);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 6, letterSpacing: "-0.02em" }}>Daily Tracker</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Log your activities to get personalized AI insights.</p>
      </div>

      {error && (
        <div style={{
          background: "rgba(251,113,133,0.06)", border: "1px solid rgba(251,113,133,0.2)",
          borderRadius: 14, padding: "10px 16px", marginBottom: 16,
          color: "var(--danger)", fontSize: "0.875rem",
          backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 8,
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Time Budget Bar */}
        <TimeBudgetBar used={timeUsed} total={24} />

        {/* Time-based sliders (24h budget) */}
        <div style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 12, color: "var(--text-secondary)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            ⏱️ Time Activities <span style={{ fontWeight: 400, fontSize: "0.8rem", color: "var(--text-muted)" }}>(must total ≤ 24h)</span>
          </h3>
          <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: 14 }}>
            {TIME_SLIDERS.map(s => (
              <TrackerSlider key={s.name} {...s} value={formData[s.name]} onUpdate={onUpdate} />
            ))}
          </div>
        </div>

        {/* Auto-synced read-only sliders */}
        <div style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 12, color: "var(--text-secondary)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            📊 Auto-Synced Metrics
          </h3>
          <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: 14 }}>
            <TrackerSlider
              label="Assignment Load" icon="📋" name="assignment_workload"
              min={0} max={10} step={1} color="#e879f9" unit="/10"
              value={formData.assignment_workload} onUpdate={onUpdate}
              readOnly readOnlyText="From Assignments"
            />
            <TrackerSlider
              label="Attendance" icon="✅" name="attendance_pct"
              min={0} max={100} step={1} color="#FFB300" unit="%"
              value={formData.attendance_pct} onUpdate={onUpdate}
              readOnly readOnlyText="From Attendance"
            />
          </div>
        </div>

        {/* Other sliders */}
        <div style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 12, color: "var(--text-secondary)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            🎯 Wellness Metrics
          </h3>
          <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: 14 }}>
            {OTHER_SLIDERS.map(s => (
              <TrackerSlider key={s.name} {...s} value={formData[s.name]} onUpdate={onUpdate} />
            ))}
          </div>
        </div>

        {/* Mood Selector */}
        <div className="glass-panel" style={{ padding: "clamp(18px, 3vw, 26px)", borderLeft: "3px solid #ec4899" }}>
          <label style={{ fontWeight: 700, display: "block", marginBottom: 20, fontSize: "0.95rem" }}>How are you feeling today?</label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" }}>
            {[
              { val: 2, emoji: "😫", label: "Exhausted" },
              { val: 4, emoji: "😔", label: "Down" },
              { val: 6, emoji: "😐", label: "Okay" },
              { val: 8, emoji: "🙂", label: "Good" },
              { val: 10, emoji: "🤩", label: "Awesome" },
            ].map(m => (
              <button key={m.val} type="button" onClick={() => onUpdate("mood_level", m.val)}
                className={`mood-btn ${formData.mood_level >= m.val - 1 && formData.mood_level <= m.val + 1 ? "active" : ""}`}>
                <span style={{ fontSize: "2.25rem" }}>{m.emoji}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Result */}
        {prediction && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <GlassCard style={{ borderLeft: `3px solid ${prediction.risk_level === "high" ? "var(--danger)" : prediction.risk_level === "moderate" ? "var(--warning)" : "var(--success)"}` }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 12 }}>
                🧠 Burnout Prediction: <span style={{ color: prediction.risk_level === "high" ? "var(--danger)" : prediction.risk_level === "moderate" ? "var(--warning)" : "var(--success)", textTransform: "capitalize" }}>{prediction.risk_level} Risk ({prediction.burnout_percentage}%)</span>
              </h3>
              {prediction.recommendations?.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  <span>{r.icon}</span> <span>{r.text}</span>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
          <NeonButton type="submit" variant={submitted ? "success" : "primary"} disabled={submitting || timeUsed > 24}>
            {submitting ? "Analyzing..." : submitted ? "Logged Successfully! ✓" : timeUsed > 24 ? "Fix Time Budget First" : "Analyze & Save"}
          </NeonButton>
        </div>
      </form>
    </div>
  );
}
