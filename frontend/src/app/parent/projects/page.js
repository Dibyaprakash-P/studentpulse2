"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function loadItems(key) {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

function timeUntil(dateStr) {
  if (!dateStr) return { diffMs: 0, diffDays: 0 };
  const d = new Date(dateStr);
  const diffMs = d - new Date();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return { diffMs, diffDays };
}

function formatDatetime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const STATUS_COLORS = { Planning: "var(--warning)", "In Progress": "var(--primary-cyan)", Completed: "var(--success)" };

export default function ParentProjectsMonitor() {
  const [projects, setProjects] = useState([]);

  useEffect(() => { setProjects(loadItems("sp_projects")); }, []);

  const active = projects.filter(p => p.status !== "Completed");
  const completed = projects.filter(p => p.status === "Completed");
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / projects.length) : 0;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 6, letterSpacing: "-0.02em" }}>📁 Projects Monitor</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {active.length} active · {completed.length} completed · Avg progress: {avgProgress}%
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3" style={{ gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Projects", value: projects.length, icon: "📁", color: "var(--text-main)" },
          { label: "Active", value: active.length, icon: "🔧", color: "var(--primary-cyan)" },
          { label: "Avg Progress", value: `${avgProgress}%`, icon: "📊", color: "var(--primary-purple)" },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: "16px 20px", textAlign: "center" }}>
            <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Project cards */}
      {projects.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--text-muted)" }}>No project data available yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {projects.map(p => {
            const { diffMs, diffDays } = timeUntil(p.deadline);
            const isOverdue = diffMs < 0 && p.status !== "Completed";
            const statusCol = STATUS_COLORS[p.status] || "var(--text-muted)";

            return (
              <div key={p.id} className="glass-panel" style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(125,211,252,0.15), rgba(192,132,252,0.1))",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                  }}>📁</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{p.title}</h4>
                    {p.description && <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</p>}
                  </div>
                  <span style={{
                    padding: "4px 12px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 700,
                    background: `${statusCol}15`, color: statusCol,
                  }}>{p.status}</span>
                </div>

                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress || 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg, var(--primary-cyan), var(--primary-purple))" }} />
                    </div>
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary-cyan)", minWidth: 42, textAlign: "right" }}>{p.progress || 0}%</span>
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", color: "var(--text-dim)", flexWrap: "wrap" }}>
                  <span style={{ color: isOverdue ? "var(--danger)" : diffDays < 3 ? "var(--warning)" : "inherit", fontWeight: isOverdue || diffDays < 3 ? 600 : 400 }}>
                    ⏰ {p.status === "Completed" ? "Done" : isOverdue ? `Overdue (${Math.abs(diffDays)}d)` : `${diffDays}d left`}
                  </span>
                  {formatDatetime(p.deadline) && <span>({formatDatetime(p.deadline)})</span>}
                  {p.tags?.length > 0 && <span>🏷️ {p.tags.join(", ")}</span>}
                  {p.files?.length > 0 && <span>📎 {p.files.length} file{p.files.length > 1 ? "s" : ""}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
