"use client";

import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const today = new Date().toISOString().slice(0, 10);

export default function DailyTracker() {
  const [formData, setFormData] = useState({
    activity_date: today, sleep_hours: 7, study_hours: 4, gaming_hours: 2,
    assignment_workload: 5, attendance_pct: 85, screen_time_hours: 5,
    water_intake_glasses: 6, social_interaction: 5, mood_level: 7,
    stress_level: 4, energy_level: 6, physical_activity_mins: 30,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");

  const set = (key, val) => setFormData(p => ({ ...p, [key]: Number(val) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(""); setPrediction(null);
    try {
      await api.logActivity(formData);
      const pred = await api.predictBurnout(formData);
      setPrediction(pred);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally { setSubmitting(false); }
  };

  const Slider = ({ label, icon, name, min, max, step, color, unit }) => (
    <GlassCard delay={0.1}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <label style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          <span>{icon}</span> {label}
        </label>
        <span style={{ color, fontWeight: 700 }}>{formData[name]}{unit}</span>
      </div>
      <input type="range" name={name} min={min} max={max} step={step}
        value={formData[name]} onChange={e => set(name, e.target.value)} />
    </GlassCard>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>Daily Tracker</h2>
        <p style={{ color: "var(--text-muted)" }}>Log your activities to get personalized AI insights.</p>
      </div>

      {error && <div style={{ background: "rgba(255,51,102,0.1)", border: "1px solid rgba(255,51,102,0.3)", borderRadius: 12, padding: "10px 16px", marginBottom: 16, color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: 24 }}>
          <Slider label="Sleep Hours" icon="😴" name="sleep_hours" min={0} max={14} step={0.5} color="var(--primary-cyan)" unit="h" />
          <Slider label="Study Hours" icon="📚" name="study_hours" min={0} max={14} step={0.5} color="var(--primary-purple)" unit="h" />
          <Slider label="Gaming Hours" icon="🎮" name="gaming_hours" min={0} max={14} step={0.5} color="#60a5fa" unit="h" />
          <Slider label="Screen Time" icon="📱" name="screen_time_hours" min={0} max={16} step={0.5} color="var(--warning)" unit="h" />
          <Slider label="Assignment Load" icon="📋" name="assignment_workload" min={1} max={10} step={1} color="var(--danger)" unit="/10" />
          <Slider label="Attendance" icon="✅" name="attendance_pct" min={0} max={100} step={5} color="var(--success)" unit="%" />
          <Slider label="Stress Level" icon="😰" name="stress_level" min={1} max={10} step={1} color="var(--danger)" unit="/10" />
          <Slider label="Energy Level" icon="⚡" name="energy_level" min={1} max={10} step={1} color="var(--warning)" unit="/10" />
          <Slider label="Physical Activity" icon="🏃" name="physical_activity_mins" min={0} max={180} step={5} color="var(--success)" unit="m" />
          <Slider label="Water Intake" icon="💧" name="water_intake_glasses" min={0} max={15} step={1} color="#60a5fa" unit=" glasses" />
          <Slider label="Social Interaction" icon="👥" name="social_interaction" min={1} max={10} step={1} color="var(--primary-purple)" unit="/10" />
        </div>

        {/* Mood Selector */}
        <GlassCard delay={0.2}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 24 }}>How are you feeling today?</label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px" }}>
            {[
              { val: 2, emoji: "😫", label: "Exhausted" },
              { val: 4, emoji: "😔", label: "Down" },
              { val: 6, emoji: "😐", label: "Okay" },
              { val: 8, emoji: "🙂", label: "Good" },
              { val: 10, emoji: "🤩", label: "Awesome" },
            ].map(m => (
              <button key={m.val} type="button" onClick={() => set("mood_level", m.val)}
                className={`mood-btn ${formData.mood_level >= m.val - 1 && formData.mood_level <= m.val + 1 ? "active" : ""}`}>
                <span style={{ fontSize: "2.25rem" }}>{m.emoji}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Prediction Result */}
        {prediction && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard style={{ borderLeft: `4px solid ${prediction.risk_level === "high" ? "var(--danger)" : prediction.risk_level === "moderate" ? "var(--warning)" : "var(--success)"}` }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 12 }}>
                🧠 Burnout Prediction: <span style={{ color: prediction.risk_level === "high" ? "var(--danger)" : prediction.risk_level === "moderate" ? "var(--warning)" : "var(--success)", textTransform: "capitalize" }}>{prediction.risk_level} Risk ({prediction.burnout_percentage}%)</span>
              </h3>
              {prediction.recommendations?.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", color: "#d1d5db", fontSize: "0.875rem" }}>
                  <span>{r.icon}</span> <span>{r.text}</span>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16 }}>
          <NeonButton type="submit" variant={submitted ? "success" : "primary"} disabled={submitting}>
            {submitting ? "Analyzing..." : submitted ? "Logged Successfully! ✓" : "Analyze & Save"}
          </NeonButton>
        </div>
      </form>
    </div>
  );
}
