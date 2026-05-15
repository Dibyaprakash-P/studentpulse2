"use client";

import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "sp_projects";

function load() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function save(p) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function timeUntil(dateStr) {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { diffMs, diffDays, diffHours };
}

function deadlineLabel(dateStr) {
  if (!dateStr || isNaN(new Date(dateStr).getTime())) return { text: "No deadline", color: "var(--text-muted)", urgent: false };
  const { diffMs, diffDays, diffHours } = timeUntil(dateStr);
  if (diffMs < 0) return { text: `Overdue (${Math.abs(diffDays)}d ago)`, color: "var(--danger)", urgent: true };
  if (diffDays === 0) return { text: `Due today (${diffHours}h left)`, color: "var(--danger)", urgent: true };
  if (diffDays <= 2) return { text: `${diffDays}d ${diffHours}h left`, color: "var(--warning)", urgent: true };
  return { text: `${diffDays} days left`, color: "var(--text-muted)", urgent: false };
}

function formatDatetime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const FILE_ICONS = {
  pdf: "📄", doc: "📃", docx: "📃", ppt: "📊", pptx: "📊",
  xls: "📈", xlsx: "📈", csv: "📈", jpg: "🖼️", png: "🖼️",
  gif: "🖼️", svg: "🖼️", mp4: "🎬", mov: "🎬", zip: "📦",
  rar: "📦", py: "💻", js: "💻", dart: "💻", cpp: "💻",
  java: "💻", fig: "🎨", sketch: "🎨", md: "📝",
};
function fileIcon(name) { const ext = name.split(".").pop().toLowerCase(); return FILE_ICONS[ext] || "📎"; }

const STATUS_OPTIONS = ["Planning", "In Progress", "Completed"];
const STATUS_COLORS = { Planning: "var(--warning)", "In Progress": "var(--primary-cyan)", Completed: "var(--success)" };

const EMPTY_FORM = { title: "", description: "", deadline: "", deadlineTime: "", tags: [], files: [] };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [fileInput, setFileInput] = useState("");

  useEffect(() => { setProjects(load()); }, []);
  const persist = useCallback((p) => { setProjects(p); save(p); }, []);

  const openAddForm = () => { setEditingId(null); setForm(EMPTY_FORM); setTagInput(""); setFileInput(""); setShowForm(true); };

  const openEditForm = (p) => {
    const dlDate = p.deadline ? p.deadline.slice(0, 10) : "";
    const dlTime = p.deadline && p.deadline.includes("T") ? p.deadline.slice(11, 16) : "";
    setEditingId(p.id);
    setForm({ title: p.title, description: p.description || "", deadline: dlDate, deadlineTime: dlTime, tags: [...(p.tags || [])], files: [...(p.files || [])] });
    setTagInput(""); setFileInput("");
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const deadlineStr = form.deadline
      ? (form.deadlineTime ? `${form.deadline}T${form.deadlineTime}` : `${form.deadline}T23:59`)
      : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16);

    if (editingId) {
      persist(projects.map(p => p.id === editingId ? {
        ...p, title: form.title.trim(), description: form.description.trim(),
        deadline: deadlineStr, tags: form.tags, files: form.files,
        updated: new Date().toISOString(),
      } : p));
    } else {
      const proj = {
        id: "p_" + Date.now(), title: form.title.trim(), description: form.description.trim(),
        deadline: deadlineStr, status: "Planning", progress: 0,
        tags: form.tags, files: form.files, created: new Date().toISOString(),
      };
      persist([proj, ...projects]);
    }
    setForm(EMPTY_FORM); setShowForm(false); setEditingId(null);
  };

  const addTag = () => { if (tagInput.trim() && !form.tags.includes(tagInput.trim())) { setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] })); setTagInput(""); } };
  const removeTag = (t) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));
  const addFile = () => { if (fileInput.trim() && !form.files.includes(fileInput.trim())) { setForm(f => ({ ...f, files: [...f.files, fileInput.trim()] })); setFileInput(""); } };
  const removeFile = (f) => setForm(fm => ({ ...fm, files: fm.files.filter(x => x !== f) }));

  const setStatus = (id, status) => persist(projects.map(p => p.id === id ? { ...p, status, progress: status === "Completed" ? 100 : p.progress } : p));
  const setProgress = (id, progress) => persist(projects.map(p => p.id === id ? { ...p, progress: Number(progress) } : p));
  const remove = (id) => { persist(projects.filter(p => p.id !== id)); if (editingId === id) { setShowForm(false); setEditingId(null); } };

  const labelStyle = { fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 5 };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4, letterSpacing: "-0.02em" }}>Projects</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{projects.length} project{projects.length === 1 ? "" : "s"}</p>
        </div>
        <NeonButton onClick={openAddForm}>+ New Project</NeonButton>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="glass-panel" style={{ marginBottom: 24, padding: "clamp(18px, 3vw, 26px)", borderLeft: `3px solid ${editingId ? "var(--primary-purple)" : "var(--primary-cyan)"}` }}>
              <h3 style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 16, fontSize: "1rem" }}>
                {editingId ? "✏️ Edit Project" : "📁 New Project"}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Project Title *</label>
                    <input className="form-input" placeholder="Student Pulse App" value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>📅 Deadline Date</label>
                      <input className="form-input" type="date" value={form.deadline}
                        onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={{ colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={labelStyle}>⏰ Deadline Time</label>
                      <input className="form-input" type="time" value={form.deadlineTime}
                        onChange={e => setForm(f => ({ ...f, deadlineTime: e.target.value }))} style={{ colorScheme: "dark" }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea className="form-input" placeholder="Project description..." rows={3}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ resize: "vertical", fontFamily: "inherit" }} />
                </div>
                {/* Tags */}
                <div>
                  <label style={labelStyle}>Tags</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="form-input" placeholder="Add tag (e.g. Flutter)" value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                    <NeonButton type="button" variant="outline" onClick={addTag}>+</NeonButton>
                  </div>
                  {form.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {form.tags.map(t => (
                        <span key={t} style={{
                          padding: "4px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600,
                          background: "rgba(125,211,252,0.08)", color: "var(--primary-cyan)",
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          {t}
                          <button onClick={() => removeTag(t)} style={{ background: "none", border: "none", color: "var(--primary-cyan)", cursor: "pointer", fontSize: "0.9rem" }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Files */}
                <div>
                  <label style={labelStyle}>Files</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="form-input" placeholder="Add file (e.g. report.pdf)" value={fileInput}
                      onChange={e => setFileInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFile(); } }} />
                    <NeonButton type="button" variant="outline" onClick={addFile}>📎</NeonButton>
                  </div>
                  {form.files.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {form.files.map(f => (
                        <span key={f} style={{
                          padding: "4px 12px", borderRadius: 8, fontSize: "0.8rem",
                          background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)",
                          color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6,
                        }}>
                          {fileIcon(f)} {f}
                          <button onClick={() => removeFile(f)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.9rem" }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <NeonButton type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</NeonButton>
                  <NeonButton type="submit">{editingId ? "Save Changes" : "Create Project"}</NeonButton>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📁</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>No projects yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Create a project to start tracking your work.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {projects.map((p) => {
            const dl = deadlineLabel(p.deadline);
            const dtDisplay = formatDatetime(p.deadline);
            const statusCol = STATUS_COLORS[p.status] || "var(--text-muted)";
            const pct = ((p.progress - 0) / 100) * 100;

            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}>
                <div className="glass-panel" style={{ padding: "clamp(18px, 3vw, 24px)" }}>
                  {/* Title row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: "linear-gradient(135deg, rgba(125,211,252,0.15), rgba(192,132,252,0.1))",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                    }}>📁</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{p.title}</h4>
                      {p.description && (
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</p>
                      )}
                    </div>
                    {/* Status selector */}
                    <select value={p.status} onChange={e => setStatus(p.id, e.target.value)}
                      style={{
                        padding: "5px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700,
                        background: `${statusCol}15`, color: statusCol,
                        border: `1px solid ${statusCol}33`, cursor: "pointer", appearance: "auto",
                      }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => openEditForm(p)} title="Edit" style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "1rem" }}>✏️</button>
                    <button onClick={() => remove(p.id)} title="Delete" style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "1rem" }}>🗑️</button>
                  </div>

                  {/* Progress + Deadline row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 6 }}>
                        <span style={{ color: "var(--text-dim)" }}>Progress</span>
                        <span style={{ color: "var(--primary-cyan)", fontWeight: 700 }}>{p.progress}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg, var(--primary-cyan), var(--primary-purple))" }} />
                      </div>
                      <input type="range" min={0} max={100} step={5} value={p.progress}
                        onChange={e => setProgress(p.id, e.target.value)}
                        style={{
                          width: "100%", marginTop: 6,
                          background: `linear-gradient(to right, var(--primary-cyan) ${pct}%, var(--border-light) ${pct}%)`,
                        }} />
                    </div>
                    {/* Deadline badge */}
                    <div style={{
                      padding: "10px 14px", borderRadius: 12, flexShrink: 0,
                      background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: dl.color }}>
                        ⏰ {dl.text}
                      </span>
                      {dtDisplay && <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>{dtDisplay}</span>}
                    </div>
                  </div>

                  {/* Tags and files */}
                  {(p.tags?.length > 0 || p.files?.length > 0) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {p.tags?.map(t => (
                        <span key={t} style={{
                          padding: "3px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 600,
                          background: "rgba(125,211,252,0.08)", color: "var(--primary-cyan)",
                        }}>{t}</span>
                      ))}
                      {p.files?.map(f => (
                        <span key={f} style={{
                          padding: "3px 10px", borderRadius: 6, fontSize: "0.7rem",
                          background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)",
                          color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4,
                        }}>
                          {fileIcon(f)} {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
