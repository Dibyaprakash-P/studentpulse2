import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "sp_notes";
const COLORS = [
  { name: "Cyan", value: "#00d4ff" },
  { name: "Purple", value: "#b026ff" },
  { name: "Green", value: "#33ff99" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Orange", value: "#FFB84D" },
  { name: "Red", value: "#ff3366" },
];

function loadNotes() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveNotes(notes) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function timeAgo(dt) {
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const d = new Date(dt);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", color: COLORS[0].value });

  useEffect(() => { setNotes(loadNotes()); }, []);
  const persist = useCallback((n) => { setNotes(n); saveNotes(n); }, []);

  const addNote = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const note = {
      id: "n_" + Date.now(),
      title: form.title.trim(),
      body: form.body.trim(),
      color: form.color,
      pinned: false,
      updatedAt: new Date().toISOString(),
    };
    persist([note, ...notes]);
    setForm({ title: "", body: "", color: COLORS[0].value });
    setShowAdd(false);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (editIdx === null) return;
    const updated = [...notes];
    updated[editIdx] = { ...updated[editIdx], title: form.title.trim(), body: form.body.trim(), updatedAt: new Date().toISOString() };
    persist(updated);
    setEditIdx(null);
    setForm({ title: "", body: "", color: COLORS[0].value });
  };

  const togglePin = (id) => persist(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const remove = (id) => { persist(notes.filter(n => n.id !== id)); if (editIdx !== null) { setEditIdx(null); } };

  const openEdit = (idx) => {
    setEditIdx(idx);
    setForm({ title: notes[idx].title, body: notes[idx].body, color: notes[idx].color });
    setShowAdd(false);
  };

  // Sort: pinned first
  const sorted = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>Notes</h2>
          <p style={{ color: "var(--text-muted)" }}>{notes.length} note{notes.length === 1 ? "" : "s"}</p>
        </div>
        <NeonButton onClick={() => { setShowAdd(!showAdd); setEditIdx(null); setForm({ title: "", body: "", color: COLORS[0].value }); }}>
          + New Note
        </NeonButton>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {(showAdd || editIdx !== null) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <GlassCard style={{ marginBottom: 24, borderLeft: `4px solid ${form.color}` }}>
              <form onSubmit={editIdx !== null ? saveEdit : addNote} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{editIdx !== null ? "Edit Note" : "New Note"}</h3>
                <input className="form-input" placeholder="Note title" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                <textarea className="form-input" placeholder="Write your note here..." rows={5}
                  value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  style={{ resize: "vertical", fontFamily: "inherit" }} />
                {/* Color picker */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Color:</span>
                  {COLORS.map(c => (
                    <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, color: c.value }))}
                      style={{
                        width: 28, height: 28, borderRadius: 8, border: `2px solid ${form.color === c.value ? "#fff" : "transparent"}`,
                        background: c.value, cursor: "pointer", transition: "all 0.2s",
                        boxShadow: form.color === c.value ? `0 0 12px ${c.value}66` : "none",
                      }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <NeonButton type="button" variant="outline" onClick={() => { setShowAdd(false); setEditIdx(null); }}>Cancel</NeonButton>
                  <NeonButton type="submit">{editIdx !== null ? "Save Changes" : "Create Note"}</NeonButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      {sorted.length === 0 ? (
        <GlassCard style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📝</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>No notes yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Create your first note to get started.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3" style={{ gap: 20 }}>
          {sorted.map((n, idx) => {
            const realIdx = notes.findIndex(x => x.id === n.id);
            return (
              <motion.div key={n.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }} layout>
                <div onClick={() => openEdit(realIdx)} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 20, cursor: "pointer",
                  border: "1px solid var(--border-subtle)", transition: "all 0.3s", position: "relative",
                  minHeight: 200, display: "flex", flexDirection: "column",
                }}>
                  {/* Color strip + title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 4, height: 22, borderRadius: 2, background: n.color, flexShrink: 0 }} />
                    <h4 style={{ fontWeight: 700, fontSize: "1rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</h4>
                    {/* Pin */}
                    <button onClick={(e) => { e.stopPropagation(); togglePin(n.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: n.pinned ? "var(--warning)" : "var(--text-dim)", transition: "color 0.2s" }}
                      title={n.pinned ? "Unpin" : "Pin"}>
                      📌
                    </button>
                    {/* Delete */}
                    <button onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: "var(--text-dim)", transition: "color 0.2s" }}
                      title="Delete">
                      🗑️
                    </button>
                  </div>
                  {/* Body preview */}
                  <p style={{
                    flex: 1, fontSize: "0.875rem", color: "#d1d5db", lineHeight: 1.6,
                    overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical",
                    whiteSpace: "pre-wrap",
                  }}>
                    {n.body || "Empty note"}
                  </p>
                  {/* Timestamp */}
                  <div style={{ marginTop: 12, fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Edited {timeAgo(n.updatedAt)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
