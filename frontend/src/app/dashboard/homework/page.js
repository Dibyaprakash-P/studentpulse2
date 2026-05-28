"use client";

import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { schedulePush } from "@/lib/cloudSync";

const STORAGE_KEY = "sp_homework";

function loadItems() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveItems(items) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    const user = JSON.parse(localStorage.getItem("sp_user") || "null");
    if (user?.email) schedulePush(user.email);
  }
}

function timeUntil(dateStr) {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { diffMs, diffDays, diffHours, diffMins };
}

function formatDeadlineDisplay(dateStr) {
  if (!dateStr || isNaN(new Date(dateStr).getTime())) return { text: "No deadline", overdue: false, urgent: false };
  const { diffMs, diffDays, diffHours, diffMins } = timeUntil(dateStr);
  if (diffMs < 0) {
    const ago = Math.abs(diffDays);
    return { text: `Overdue (${ago > 0 ? ago + "d " : ""}${Math.abs(diffHours)}h ago)`, overdue: true, urgent: true };
  }
  if (diffDays === 0 && diffHours < 6) return { text: `${diffHours}h ${diffMins}m left`, overdue: false, urgent: true };
  if (diffDays === 0) return { text: `Due today (${diffHours}h left)`, overdue: false, urgent: true };
  if (diffDays === 1) return { text: `Tomorrow (${diffHours}h left)`, overdue: false, urgent: true };
  return { text: `${diffDays} day${diffDays === 1 ? "" : "s"} left`, overdue: false, urgent: diffDays < 3 };
}

function formatDatetime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const EMPTY_FORM = { title: "", subject: "", deadline: "", deadlineTime: "", priority: "Medium" };

const PRIORITY_COLORS = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#22c55e",
};

export default function AssignmentPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { setItems(loadItems()); }, []);
  const persist = useCallback((newItems) => { setItems(newItems); saveItems(newItems); }, []);

  const filtered = filter === "Pending" ? items.filter(h => !h.completed)
    : filter === "Completed" ? items.filter(h => h.completed) : items;

  const pending = items.filter(h => !h.completed).length;
  const overdue = items.filter(h => !h.completed && timeUntil(h.deadline).diffMs < 0).length;

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (h) => {
    const deadlineDate = h.deadline ? h.deadline.slice(0, 10) : "";
    const deadlineTime = h.deadline && h.deadline.includes("T") ? h.deadline.slice(11, 16) : "";
    setEditingId(h.id);
    setForm({ title: h.title, subject: h.subject, deadline: deadlineDate, deadlineTime: deadlineTime, priority: h.priority });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const deadlineStr = form.deadline
      ? (form.deadlineTime ? `${form.deadline}T${form.deadlineTime}` : `${form.deadline}T23:59`)
      : new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16);

    if (editingId) {
      persist(items.map(h => h.id === editingId ? {
        ...h, title: form.title.trim(), subject: form.subject.trim() || "General",
        deadline: deadlineStr, priority: form.priority, updated: new Date().toISOString(),
      } : h));
    } else {
      const hw = {
        id: "hw_" + Date.now(), title: form.title.trim(),
        subject: form.subject.trim() || "General", deadline: deadlineStr,
        priority: form.priority, completed: false, created: new Date().toISOString(),
      };
      persist([hw, ...items]);
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  };

  const toggle = (id) => persist(items.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  const remove = (id) => { persist(items.filter(h => h.id !== id)); if (editingId === id) { setShowForm(false); setEditingId(null); } };

  const priorityColor = (p) => PRIORITY_COLORS[p] || "var(--text-muted)";
  const labelStyle = { fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 5 };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4, letterSpacing: "-0.02em" }}>Assignment Tracker</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {pending} pending · {items.length - pending} completed
            {overdue > 0 && <span style={{ color: "var(--danger)", fontWeight: 600 }}> · {overdue} overdue</span>}
          </p>
        </div>
        <NeonButton onClick={openAddForm}>+ Add Assignment</NeonButton>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md-grid-cols-3" style={{ gap: 14, marginBottom: 24 }}>
        <div className="glass-panel" style={{ padding: "16px 20px", borderLeft: "3px solid #3b82f6" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Total</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#3b82f6" }}>{items.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: "16px 20px", borderLeft: "3px solid #f59e0b" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Pending</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b" }}>{pending}</div>
        </div>
        <div className="glass-panel" style={{ padding: "16px 20px", borderLeft: "3px solid #22c55e" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Completed</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e" }}>{items.length - pending}</div>
        </div>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="glass-panel" style={{ marginBottom: 24, padding: "clamp(18px, 3vw, 26px)", borderLeft: `3px solid ${editingId ? "#39FF14" : "#3b82f6"}` }}>
              <h3 style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 16, fontSize: "1rem" }}>
                {editingId ? "✏️ Edit Assignment" : "📋 New Assignment"}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Title *</label>
                    <input className="form-input" placeholder="Linear Algebra Assignment" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Subject</label>
                    <input className="form-input" placeholder="Mathematics" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>📅 Deadline Date</label>
                    <input className="form-input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={{ colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>⏰ Deadline Time</label>
                    <input className="form-input" type="time" value={form.deadlineTime} onChange={e => setForm(f => ({ ...f, deadlineTime: e.target.value }))} style={{ colorScheme: "dark" }} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Priority</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Low", "Medium", "High"].map(p => (
                        <button key={p} type="button" onClick={() => setForm(f => ({ ...f, priority: p }))}
                          style={{
                            flex: 1, padding: "9px 12px", borderRadius: 12,
                            border: `1px solid ${form.priority === p ? priorityColor(p) : "var(--border-subtle)"}`,
                            background: form.priority === p ? `${priorityColor(p)}15` : "transparent",
                            color: form.priority === p ? priorityColor(p) : "var(--text-muted)",
                            fontWeight: form.priority === p ? 700 : 500, fontSize: "0.875rem",
                            cursor: "pointer", transition: "all 0.2s",
                          }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <NeonButton type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</NeonButton>
                  <NeonButton type="submit">{editingId ? "Save Changes" : "Add Assignment"}</NeonButton>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["All", "Pending", "Completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: "8px 20px", borderRadius: 20, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.2s",
              border: `1px solid ${filter === f ? "var(--primary-green)" : "var(--border-subtle)"}`,
              background: filter === f ? "rgba(57,255,20,0.08)" : "transparent",
              color: filter === f ? "var(--primary-green)" : "var(--text-muted)", fontWeight: filter === f ? 600 : 400,
            }}>
            {f} {f === "Pending" && pending > 0 ? `(${pending})` : ""}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>
            {filter === "Completed" ? "No completed assignments yet" : filter === "Pending" ? "All caught up!" : "No assignments yet"}
          </h3>
          <p style={{ color: "var(--text-muted)" }}>Add assignments with the button above.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence>
            {filtered.map(h => {
              const dl = formatDeadlineDisplay(h.deadline);
              const dtDisplay = formatDatetime(h.deadline);
              return (
                <motion.div key={h.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -80 }} layout
                  transition={{ duration: 0.25 }}>
                  <div className="glass-panel" style={{
                    padding: "16px 20px",
                    borderLeft: `3px solid ${h.completed ? "#22c55e" : dl.overdue ? "#ef4444" : priorityColor(h.priority)}`,
                    opacity: h.completed ? 0.65 : 1,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Checkbox */}
                      <button onClick={() => toggle(h.id)} style={{
                        width: 26, height: 26, borderRadius: 8, flexShrink: 0, cursor: "pointer",
                        border: `2px solid ${h.completed ? "#22c55e" : "var(--border-light)"}`,
                        background: h.completed ? "#22c55e" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s", color: "white", fontSize: "0.8rem",
                      }}>
                        {h.completed && "✓"}
                      </button>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600, fontSize: "0.95rem",
                          textDecoration: h.completed ? "line-through" : "none",
                          color: h.completed ? "var(--text-dim)" : "inherit",
                        }}>
                          {h.title}
                        </div>
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 5, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          <span>🎓 {h.subject}</span>
                          <span style={{ color: dl.overdue ? "var(--danger)" : dl.urgent ? "var(--warning)" : "inherit", fontWeight: dl.urgent ? 600 : 400 }}>
                            📅 {dl.text}
                          </span>
                          {dtDisplay && <span style={{ color: "var(--text-dim)" }}>({dtDisplay})</span>}
                        </div>
                      </div>

                      {/* Priority badge */}
                      <span style={{
                        padding: "4px 10px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 700,
                        background: `${priorityColor(h.priority)}15`, color: priorityColor(h.priority),
                        flexShrink: 0,
                      }}>
                        {h.priority}
                      </span>

                      {/* Edit */}
                      <button onClick={() => openEditForm(h)} title="Edit" style={{
                        background: "none", border: "none", color: "var(--text-dim)",
                        cursor: "pointer", fontSize: "0.95rem", padding: 4, transition: "color 0.2s",
                      }}>✏️</button>

                      {/* Delete */}
                      <button onClick={() => remove(h.id)} title="Delete" style={{
                        background: "none", border: "none", color: "var(--text-dim)",
                        cursor: "pointer", fontSize: "0.95rem", padding: 4, transition: "color 0.2s",
                      }}>🗑️</button>
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
