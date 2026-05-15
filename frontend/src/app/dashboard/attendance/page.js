"use client";

import NeonButton from "@/components/ui/NeonButton";
import GlassCard from "@/components/ui/GlassCard";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "sp_attendance";

function loadSubjects() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveSubjects(subjects) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
}

const SUBJECT_COLORS = [
  "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#10b981",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
  "#a855f7", "#e11d48", "#0ea5e9", "#84cc16",
];

export default function AttendancePage() {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { setSubjects(loadSubjects()); }, []);
  const persist = useCallback((items) => { setSubjects(items); saveSubjects(items); }, []);

  const overallPct = subjects.length > 0
    ? Math.round(subjects.reduce((s, sub) => s + (sub.totalClasses > 0 ? (sub.attendedClasses / sub.totalClasses) * 100 : 0), 0) / subjects.length)
    : 0;

  const totalClasses = subjects.reduce((s, sub) => s + sub.totalClasses, 0);
  const totalAttended = subjects.reduce((s, sub) => s + sub.attendedClasses, 0);

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingId) {
      persist(subjects.map(s => s.id === editingId ? { ...s, name: formName.trim() } : s));
    } else {
      const colorIdx = subjects.length % SUBJECT_COLORS.length;
      const sub = {
        id: "att_" + Date.now(),
        name: formName.trim(),
        totalClasses: 0,
        attendedClasses: 0,
        color: SUBJECT_COLORS[colorIdx],
        created: new Date().toISOString(),
      };
      persist([...subjects, sub]);
    }
    setFormName("");
    setShowForm(false);
    setEditingId(null);
  };

  const markPresent = (id) => {
    persist(subjects.map(s => s.id === id
      ? { ...s, totalClasses: s.totalClasses + 1, attendedClasses: s.attendedClasses + 1 }
      : s
    ));
  };

  const markAbsent = (id) => {
    persist(subjects.map(s => s.id === id
      ? { ...s, totalClasses: s.totalClasses + 1 }
      : s
    ));
  };

  const undoLast = (id) => {
    persist(subjects.map(s => {
      if (s.id !== id || s.totalClasses === 0) return s;
      /* We can't know if last was present or absent, so just remove one total class.
         If attended > total after undo, clamp it. */
      const newTotal = s.totalClasses - 1;
      const newAttended = Math.min(s.attendedClasses, newTotal);
      return { ...s, totalClasses: newTotal, attendedClasses: newAttended };
    }));
  };

  const resetSubject = (id) => {
    persist(subjects.map(s => s.id === id ? { ...s, totalClasses: 0, attendedClasses: 0 } : s));
  };

  const removeSubject = (id) => {
    persist(subjects.filter(s => s.id !== id));
  };

  const editSubject = (s) => {
    setEditingId(s.id);
    setFormName(s.name);
    setShowForm(true);
  };

  const getPctColor = (pct) => {
    if (pct >= 75) return "#22c55e";
    if (pct >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4, letterSpacing: "-0.02em" }}>
            Attendance Tracker
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Track attendance for each subject. This auto-syncs to the Daily Tracker.
          </p>
        </div>
        <NeonButton onClick={() => { setEditingId(null); setFormName(""); setShowForm(true); }}>+ Add Subject</NeonButton>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md-grid-cols-3" style={{ gap: 14, marginBottom: 24 }}>
        <div className="glass-panel" style={{ padding: "16px 20px", borderLeft: "3px solid #3b82f6" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Subjects</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#3b82f6" }}>{subjects.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: "16px 20px", borderLeft: `3px solid ${getPctColor(overallPct)}` }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Overall Attendance</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: getPctColor(overallPct) }}>{overallPct}%</div>
        </div>
        <div className="glass-panel" style={{ padding: "16px 20px", borderLeft: "3px solid #8b5cf6" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Classes Attended</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#8b5cf6" }}>{totalAttended} / {totalClasses}</div>
        </div>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="glass-panel" style={{ marginBottom: 24, padding: "clamp(18px, 3vw, 26px)", borderLeft: `3px solid ${editingId ? "#a855f7" : "#3b82f6"}` }}>
              <h3 style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 16, fontSize: "1rem" }}>
                {editingId ? "✏️ Edit Subject" : "📚 Add New Subject"}
              </h3>
              <form onSubmit={handleAddSubject} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Subject Name *</label>
                  <input className="form-input" placeholder="e.g. Mathematics, Physics, English..." value={formName} onChange={e => setFormName(e.target.value)} required />
                </div>
                <NeonButton type="submit">{editingId ? "Save" : "Add"}</NeonButton>
                <NeonButton type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</NeonButton>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subjects list */}
      {subjects.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📚</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>No subjects added yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Add your subjects to start tracking attendance.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <AnimatePresence>
            {subjects.map(sub => {
              const pct = sub.totalClasses > 0 ? Math.round((sub.attendedClasses / sub.totalClasses) * 100) : 0;
              const pctColor = getPctColor(pct);
              const missed = sub.totalClasses - sub.attendedClasses;

              return (
                <motion.div key={sub.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -80 }} layout transition={{ duration: 0.25 }}>
                  <div className="glass-panel" style={{ padding: "20px 24px", borderLeft: `3px solid ${sub.color}` }}>
                    {/* Subject header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: "50%", background: sub.color,
                          boxShadow: `0 0 8px ${sub.color}50`,
                        }} />
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{sub.name}</h3>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700,
                          background: `${pctColor}15`, color: pctColor,
                        }}>
                          {pct}%
                        </span>
                        <button onClick={() => editSubject(sub)} title="Edit" style={{
                          background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", padding: 4, color: "var(--text-dim)", transition: "color 0.2s",
                        }}>✏️</button>
                        <button onClick={() => removeSubject(sub.id)} title="Delete" style={{
                          background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", padding: 4, color: "var(--text-dim)", transition: "color 0.2s",
                        }}>🗑️</button>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "flex", gap: 20, marginBottom: 14, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      <span>📊 Total: <strong style={{ color: "var(--text-main)" }}>{sub.totalClasses}</strong></span>
                      <span>✅ Present: <strong style={{ color: "#22c55e" }}>{sub.attendedClasses}</strong></span>
                      <span>❌ Absent: <strong style={{ color: "#ef4444" }}>{missed}</strong></span>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      width: "100%", height: 8, background: "var(--border-light)",
                      borderRadius: 8, overflow: "hidden", marginBottom: 14,
                    }}>
                      <div style={{
                        width: `${pct}%`, height: "100%", borderRadius: 8,
                        background: `linear-gradient(90deg, ${sub.color}, ${pctColor})`,
                        transition: "width 0.4s ease",
                      }} />
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => markPresent(sub.id)} style={{
                        padding: "8px 16px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600,
                        background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)",
                        color: "#22c55e", cursor: "pointer", transition: "all 0.2s",
                      }}>
                        ✅ Present
                      </button>
                      <button onClick={() => markAbsent(sub.id)} style={{
                        padding: "8px 16px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600,
                        background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444", cursor: "pointer", transition: "all 0.2s",
                      }}>
                        ❌ Absent
                      </button>
                      {sub.totalClasses > 0 && (
                        <button onClick={() => undoLast(sub.id)} style={{
                          padding: "8px 16px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600,
                          background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)",
                          color: "#f59e0b", cursor: "pointer", transition: "all 0.2s",
                        }}>
                          ↩️ Undo Last
                        </button>
                      )}
                      {sub.totalClasses > 0 && (
                        <button onClick={() => resetSubject(sub.id)} style={{
                          padding: "8px 12px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600,
                          background: "rgba(148, 163, 184, 0.1)", border: "1px solid rgba(148, 163, 184, 0.2)",
                          color: "var(--text-muted)", cursor: "pointer", transition: "all 0.2s",
                        }}>
                          🔄 Reset
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
