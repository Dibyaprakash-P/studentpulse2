import { useState, useEffect } from "react";

function loadItems(key) {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

function timeUntil(dateStr) {
  if (!dateStr) return { diffMs: 0, diffDays: 0, diffHours: 0 };
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { diffMs, diffDays, diffHours };
}

function formatDatetime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function ParentHomeworkMonitor() {
  const [homework, setHomework] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => { setHomework(loadItems("sp_homework")); }, []);

  const pending = homework.filter(h => !h.completed);
  const completed = homework.filter(h => h.completed);
  const overdue = pending.filter(h => timeUntil(h.deadline).diffMs < 0);
  const filtered = filter === "Pending" ? pending : filter === "Completed" ? completed : filter === "Overdue" ? overdue : homework;

  const priorityColor = (p) => p === "High" ? "var(--danger)" : p === "Medium" ? "var(--warning)" : "var(--success)";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 6, letterSpacing: "-0.02em" }}>📋 Homework Monitor</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {pending.length} pending · {completed.length} completed
          {overdue.length > 0 && <span style={{ color: "var(--danger)", fontWeight: 600 }}> · {overdue.length} overdue ⚠️</span>}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4" style={{ gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total", value: homework.length, color: "var(--text-main)", icon: "📚" },
          { label: "Pending", value: pending.length, color: "var(--warning)", icon: "⏳" },
          { label: "Overdue", value: overdue.length, color: "var(--danger)", icon: "🚨" },
          { label: "Completed", value: completed.length, color: "var(--success)", icon: "✅" },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: "16px 20px", textAlign: "center" }}>
            <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["All", "Pending", "Overdue", "Completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 18px", borderRadius: 20, fontSize: "0.82rem", cursor: "pointer",
            border: `1px solid ${filter === f ? "var(--primary-yellow)" : "var(--border-subtle)"}`,
            background: filter === f ? "rgba(255,215,0,0.08)" : "transparent",
            color: filter === f ? "var(--primary-yellow)" : "var(--text-muted)", fontWeight: filter === f ? 600 : 400,
          }}>{f}</button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--text-muted)" }}>No homework in this category.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(h => {
            const { diffMs, diffDays, diffHours } = timeUntil(h.deadline);
            const isOverdue = diffMs < 0 && !h.completed;
            return (
              <div key={h.id} className="glass-panel" style={{
                padding: "14px 20px",
                borderLeft: `3px solid ${h.completed ? "var(--success)" : isOverdue ? "var(--danger)" : priorityColor(h.priority)}`,
                opacity: h.completed ? 0.65 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: "1.2rem" }}>{h.completed ? "✅" : isOverdue ? "🚨" : "📝"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.92rem", textDecoration: h.completed ? "line-through" : "none" }}>{h.title}</div>
                    <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: "0.75rem", color: "var(--text-dim)", flexWrap: "wrap" }}>
                      <span>🎓 {h.subject}</span>
                      <span style={{ color: isOverdue ? "var(--danger)" : diffDays < 3 ? "var(--warning)" : "inherit", fontWeight: isOverdue || diffDays < 3 ? 600 : 400 }}>
                        📅 {h.completed ? "Done" : isOverdue ? `Overdue (${Math.abs(diffDays)}d)` : `${diffDays}d ${diffHours}h left`}
                      </span>
                      {formatDatetime(h.deadline) && <span>({formatDatetime(h.deadline)})</span>}
                    </div>
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: 6, fontSize: "0.68rem", fontWeight: 700,
                    background: `${priorityColor(h.priority)}15`, color: priorityColor(h.priority),
                  }}>{h.priority}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
