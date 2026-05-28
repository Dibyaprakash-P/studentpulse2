"use client";

import GlassCard from "@/components/ui/GlassCard";
import PulseLoader from "@/components/ui/PulseLoader";
import NeonButton from "@/components/ui/NeonButton";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

function loadStudentData(key) {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

function timeUntil(dateStr) {
  if (!dateStr) return { diffMs: 0, diffDays: 0 };
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return { diffMs, diffDays };
}

export default function ParentDashboardHome() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkCode, setLinkCode] = useState("");
  const [genMsg, setGenMsg] = useState("");
  const [homework, setHomework] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getLinkedStudents();
        setStudents(s || []);
      } catch { /* no linked students */ }
      setLoading(false);
    })();
    /* Load student's local homework & projects for monitoring */
    setHomework(loadStudentData("sp_homework"));
    setProjects(loadStudentData("sp_projects"));
  }, []);

  const handleGenCode = async () => {
    try {
      const data = await api.generateLinkCode();
      setLinkCode(data.link_code);
      setGenMsg(data.message);
    } catch (err) {
      setGenMsg(err.message || "Failed to generate code");
    }
  };

  if (loading) return <PulseLoader text="Loading parent dashboard..." />;

  const pendingHw = homework.filter(h => !h.completed);
  const overdueHw = pendingHw.filter(h => timeUntil(h.deadline).diffMs < 0);
  const completedHw = homework.filter(h => h.completed);

  const activeProjects = projects.filter(p => p.status !== "Completed");
  const completedProjects = projects.filter(p => p.status === "Completed");
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / projects.length) : 0;

  const priorityColor = (p) => p === "High" ? "var(--danger)" : p === "Medium" ? "var(--warning)" : "var(--success)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 6, letterSpacing: "-0.02em" }}>Student Wellness Overview</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Monitor your student's lifestyle balance, assignments and burnout risk.</p>
      </div>

      {/* Link Code Generator */}
      <div className="glass-panel" style={{ padding: "clamp(18px, 3vw, 24px)", borderLeft: "3px solid var(--primary-lavender)" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>🔗 Link a Student</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 14 }}>
          Generate a code and share it with your student to link accounts.
        </p>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <NeonButton variant="purple" onClick={handleGenCode}>Generate Link Code</NeonButton>
          {linkCode && (
            <div style={{ padding: "8px 20px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 12, fontFamily: "monospace", fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-lavender)", letterSpacing: "0.1em" }}>
              {linkCode}
            </div>
          )}
        </div>
        {genMsg && <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: 8 }}>{genMsg}</p>}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4" style={{ gap: 16 }}>
        <GlassCard>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: 8, display: "block", fontWeight: 500 }}>Pending Homework</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: pendingHw.length > 0 ? "var(--warning)" : "var(--success)" }}>{pendingHw.length}</span>
            {overdueHw.length > 0 && <span style={{ fontSize: "0.78rem", color: "var(--danger)", fontWeight: 600, marginBottom: 4 }}>{overdueHw.length} overdue</span>}
          </div>
        </GlassCard>
        <GlassCard>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: 8, display: "block", fontWeight: 500 }}>Completed Homework</span>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--success)" }}>{completedHw.length}</span>
        </GlassCard>
        <GlassCard>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: 8, display: "block", fontWeight: 500 }}>Active Projects</span>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary-teal)" }}>{activeProjects.length}</span>
        </GlassCard>
        <GlassCard>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: 8, display: "block", fontWeight: 500 }}>Avg Project Progress</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <span style={{ fontSize: "2rem", fontWeight: 800 }}>{avgProgress}%</span>
          </div>
        </GlassCard>
      </div>

      {/* Homework Monitoring */}
      <div className="glass-panel" style={{ padding: "clamp(18px, 3vw, 24px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>📋 Homework Status</h3>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{homework.length} total</span>
        </div>
        {homework.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 24 }}>No homework data available yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {homework.slice(0, 8).map(h => {
              const { diffMs, diffDays } = timeUntil(h.deadline);
              const overdue = diffMs < 0 && !h.completed;
              return (
                <div key={h.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                  borderRadius: 14, background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${overdue ? "rgba(251,113,133,0.2)" : "var(--border-subtle)"}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: h.completed ? "var(--success)" : overdue ? "var(--danger)" : "var(--warning)",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", textDecoration: h.completed ? "line-through" : "none", color: h.completed ? "var(--text-dim)" : "inherit" }}>
                      {h.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 2 }}>
                      {h.subject} · {h.completed ? "Completed ✓" : overdue ? `Overdue (${Math.abs(diffDays)}d)` : `${diffDays}d left`}
                    </div>
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: 6, fontSize: "0.68rem", fontWeight: 700,
                    background: `${priorityColor(h.priority)}15`, color: priorityColor(h.priority),
                  }}>{h.priority}</span>
                  <span style={{ fontSize: "0.78rem", color: h.completed ? "var(--success)" : "var(--text-dim)" }}>
                    {h.completed ? "✅" : "⏳"}
                  </span>
                </div>
              );
            })}
            {homework.length > 8 && (
              <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.78rem", paddingTop: 4 }}>
                + {homework.length - 8} more items
              </p>
            )}
          </div>
        )}
      </div>

      {/* Projects Monitoring */}
      <div className="glass-panel" style={{ padding: "clamp(18px, 3vw, 24px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>📁 Projects Status</h3>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{projects.length} total</span>
        </div>
        {projects.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 24 }}>No project data available yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {projects.map(p => {
              const { diffMs, diffDays } = timeUntil(p.deadline);
              const statusCol = p.status === "Completed" ? "var(--success)" : p.status === "In Progress" ? "var(--primary-green)" : "var(--warning)";
              return (
                <div key={p.id} style={{
                  padding: "14px 16px", borderRadius: 14,
                  background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: "1.15rem" }}>📁</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 700, fontSize: "0.92rem" }}>{p.title}</h4>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 2 }}>
                        {p.status} · {diffMs < 0 ? "Overdue" : `${diffDays}d left`}
                        {p.tags?.length > 0 && ` · ${p.tags.join(", ")}`}
                      </div>
                    </div>
                    <span style={{
                      padding: "4px 12px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 700,
                      background: `${statusCol}15`, color: statusCol,
                    }}>{p.status}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 5, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ width: `${p.progress || 0}%`, height: "100%", borderRadius: 5, background: "linear-gradient(90deg, var(--primary-teal), var(--primary-lavender))", transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--primary-teal)", minWidth: 40, textAlign: "right" }}>{p.progress || 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Linked Students */}
      {students.length > 0 && (
        <div className="glass-panel" style={{ padding: "clamp(18px, 3vw, 24px)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 16 }}>👨‍🎓 Linked Students</h3>
          <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: 14 }}>
            {students.map((student) => (
              <div key={student.id} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                borderRadius: 14, background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-subtle)",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "linear-gradient(135deg, var(--primary-teal), var(--primary-lavender))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: "white", fontSize: "0.8rem",
                }}>
                  {student.full_name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 700, fontSize: "0.92rem" }}>{student.full_name}</h4>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Level {student.level} · {student.xp_points} XP · 🔥 {student.current_streak || 0} streak</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
