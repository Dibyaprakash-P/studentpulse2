"use client";

import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "sp_reportcards";

function loadReports() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveReports(r) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

const GRADE_COLORS = {
  "A+": "#4ade80", A: "#4ade80", "A-": "#86efac",
  "B+": "#7dd3fc", B: "#7dd3fc", "B-": "#93c5fd",
  "C+": "#fcd34d", C: "#fbbf24", "C-": "#fbbf24",
  "D+": "#fb923c", D: "#f97316", "D-": "#f97316",
  F: "#fb7185",
};

function gradeColor(g) {
  if (!g) return "var(--text-muted)";
  return GRADE_COLORS[g.toUpperCase()] || "var(--primary-green)";
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const FILE_TYPE_ICONS = {
  pdf: "📄", doc: "📃", docx: "📃", ppt: "📊", pptx: "📊",
  xls: "📈", xlsx: "📈", csv: "📈", jpg: "🖼️", jpeg: "🖼️",
  png: "🖼️", gif: "🖼️", svg: "🖼️", webp: "🖼️", mp4: "🎬",
  mov: "🎬", avi: "🎬", zip: "📦", rar: "📦", txt: "📝", md: "📝",
};
function fileTypeIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  return FILE_TYPE_ICONS[ext] || "📎";
}
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

const EMPTY_FORM = { examName: "", subject: "", date: "", grade: "", totalMarks: "", obtainedMarks: "", notes: "" };

export default function ReportCardsPage() {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("All");
  const fileInputRef = useRef(null);

  useEffect(() => { setReports(loadReports()); }, []);
  const persist = useCallback((r) => { setReports(r); saveReports(r); }, []);

  const openAddForm = () => { setEditingId(null); setForm(EMPTY_FORM); setFiles([]); setShowForm(true); };

  const openEditForm = (r) => {
    setEditingId(r.id);
    setForm({
      examName: r.examName, subject: r.subject || "", date: r.date || "",
      grade: r.grade || "", totalMarks: r.totalMarks || "", obtainedMarks: r.obtainedMarks || "",
      notes: r.notes || "",
    });
    setFiles(r.files || []);
    setShowForm(true);
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    newFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" exceeds 5MB limit and was skipped.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result,
          uploadedAt: new Date().toISOString(),
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const downloadFile = (file) => {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.examName.trim()) return;

    const pct = form.totalMarks && form.obtainedMarks
      ? Math.round((Number(form.obtainedMarks) / Number(form.totalMarks)) * 100)
      : null;

    if (editingId) {
      persist(reports.map(r => r.id === editingId ? {
        ...r, ...form, examName: form.examName.trim(), subject: form.subject.trim(),
        notes: form.notes.trim(), files, percentage: pct, updated: new Date().toISOString(),
      } : r));
    } else {
      const report = {
        id: "rc_" + Date.now(),
        ...form, examName: form.examName.trim(), subject: form.subject.trim(),
        notes: form.notes.trim(), files, percentage: pct,
        created: new Date().toISOString(),
      };
      persist([report, ...reports]);
    }
    setForm(EMPTY_FORM); setFiles([]); setShowForm(false); setEditingId(null);
  };

  const remove = (id) => {
    persist(reports.filter(r => r.id !== id));
    if (editingId === id) { setShowForm(false); setEditingId(null); }
    if (expandedId === id) setExpandedId(null);
  };

  const subjects = [...new Set(reports.map(r => r.subject).filter(Boolean))];
  const filtered = filter === "All" ? reports : reports.filter(r => r.subject === filter);

  const labelStyle = { fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 5 };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4, letterSpacing: "-0.02em" }}>
            Report Cards
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {reports.length} report{reports.length !== 1 ? "s" : ""} uploaded
            {subjects.length > 0 && ` · ${subjects.length} subject${subjects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <NeonButton onClick={openAddForm}>+ Add Report</NeonButton>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}>
            <div className="glass-panel" style={{
              marginBottom: 24, padding: "clamp(18px, 3vw, 26px)",
              borderLeft: `3px solid ${editingId ? "var(--primary-green)" : "var(--primary-green)"}`,
            }}>
              <h3 style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 16, fontSize: "1rem" }}>
                {editingId ? "✏️ Edit Report Card" : "📄 New Report Card"}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Exam Name *</label>
                    <input className="form-input" placeholder="Midterm Exam 2026" value={form.examName}
                      onChange={e => setForm(f => ({ ...f, examName: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Subject</label>
                    <input className="form-input" placeholder="Mathematics" value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>📅 Exam Date</label>
                    <input className="form-input" type="date" value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Grade (optional)</label>
                    <input className="form-input" placeholder="A+, B, C..." value={form.grade}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Total Marks</label>
                    <input className="form-input" type="number" placeholder="100" min="0" value={form.totalMarks}
                      onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Obtained Marks</label>
                    <input className="form-input" type="number" placeholder="85" min="0" value={form.obtainedMarks}
                      onChange={e => setForm(f => ({ ...f, obtainedMarks: e.target.value }))} />
                  </div>
                </div>

                {/* Notes / Remarks */}
                <div>
                  <label style={labelStyle}>📝 Notes / Remarks</label>
                  <textarea className="form-input" placeholder="Write any notes, teacher feedback, or remarks about this exam..."
                    rows={4} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
                </div>

                {/* File Upload */}
                <div>
                  <label style={labelStyle}>📎 Attach Files (PDF, Images, Docs — max 5MB each)</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <input ref={fileInputRef} type="file" multiple accept="*/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }} id="report-file-upload" />
                    <label htmlFor="report-file-upload" className="glass-panel" style={{
                      padding: "12px 24px", cursor: "pointer", display: "inline-flex",
                      alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 600,
                      color: "var(--primary-green)", borderStyle: "dashed",
                      transition: "all 0.2s",
                    }}>
                      📤 Choose Files
                    </label>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                      {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} attached` : "No files selected"}
                    </span>
                  </div>

                  {/* File previews */}
                  {files.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                      {files.map((f, idx) => (
                        <div key={idx} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 14px", borderRadius: 12,
                          background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)",
                        }}>
                          <span style={{ fontSize: "1.3rem" }}>{fileTypeIcon(f.name)}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>{formatFileSize(f.size)}</div>
                          </div>
                          {/* Preview thumbnail for images */}
                          {f.type?.startsWith("image/") && (
                            <img src={f.data} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid var(--border-subtle)" }} />
                          )}
                          <button type="button" onClick={() => removeFile(idx)} style={{
                            background: "none", border: "none", color: "var(--danger)",
                            cursor: "pointer", fontSize: "0.9rem", padding: 4,
                          }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <NeonButton type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setFiles([]); }}>Cancel</NeonButton>
                  <NeonButton type="submit">{editingId ? "Save Changes" : "Upload Report"}</NeonButton>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter by subject */}
      {subjects.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => setFilter("All")} style={{
            padding: "7px 18px", borderRadius: 20, fontSize: "0.82rem", cursor: "pointer",
            border: `1px solid ${filter === "All" ? "var(--primary-green)" : "var(--border-subtle)"}`,
            background: filter === "All" ? "rgba(57,255,20,0.08)" : "transparent",
            color: filter === "All" ? "var(--primary-green)" : "var(--text-muted)", fontWeight: filter === "All" ? 600 : 400,
          }}>All</button>
          {subjects.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "7px 18px", borderRadius: 20, fontSize: "0.82rem", cursor: "pointer",
              border: `1px solid ${filter === s ? "var(--primary-green)" : "var(--border-subtle)"}`,
              background: filter === s ? "rgba(57,255,20,0.08)" : "transparent",
              color: filter === s ? "var(--primary-green)" : "var(--text-muted)", fontWeight: filter === s ? 600 : 400,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Report Cards List */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📄</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>No report cards yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Upload your first report card with the button above.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(r => {
            const expanded = expandedId === r.id;
            const pctColor = r.percentage >= 80 ? "var(--success)" : r.percentage >= 60 ? "var(--warning)" : r.percentage >= 40 ? "#fb923c" : "var(--danger)";
            return (
              <motion.div key={r.id} layout transition={{ duration: 0.2 }}>
                <div className="glass-panel" style={{ padding: "clamp(16px, 3vw, 22px)", cursor: "pointer" }}
                  onClick={() => setExpandedId(expanded ? null : r.id)}>

                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Grade badge */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: `${gradeColor(r.grade)}15`,
                      border: `1px solid ${gradeColor(r.grade)}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: r.grade ? "1.1rem" : "0.8rem",
                      color: gradeColor(r.grade),
                    }}>
                      {r.grade || (r.percentage != null ? `${r.percentage}%` : "—")}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{r.examName}</h4>
                      <div style={{ display: "flex", gap: 14, marginTop: 3, fontSize: "0.78rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                        {r.subject && <span>🎓 {r.subject}</span>}
                        {r.date && <span>📅 {formatDate(r.date)}</span>}
                        {r.obtainedMarks && r.totalMarks && (
                          <span style={{ color: pctColor, fontWeight: 600 }}>📊 {r.obtainedMarks}/{r.totalMarks}</span>
                        )}
                        {r.files?.length > 0 && <span>📎 {r.files.length} file{r.files.length > 1 ? "s" : ""}</span>}
                      </div>
                    </div>

                    {/* Percentage bar */}
                    {r.percentage != null && (
                      <div style={{ width: 80, flexShrink: 0 }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: pctColor, textAlign: "right", marginBottom: 4 }}>{r.percentage}%</div>
                        <div style={{ height: 5, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${r.percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ height: "100%", borderRadius: 5, background: pctColor }} />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <button onClick={(e) => { e.stopPropagation(); openEditForm(r); }} title="Edit" style={{
                      background: "none", border: "none", color: "var(--text-dim)",
                      cursor: "pointer", fontSize: "0.95rem", padding: 4,
                    }}>✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); remove(r.id); }} title="Delete" style={{
                      background: "none", border: "none", color: "var(--text-dim)",
                      cursor: "pointer", fontSize: "0.95rem", padding: 4,
                    }}>🗑️</button>

                    {/* Expand chevron */}
                    <span style={{
                      fontSize: "0.9rem", color: "var(--text-dim)",
                      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}>▼</span>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}>
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>

                          {/* Notes */}
                          {r.notes && (
                            <div style={{ marginBottom: 16 }}>
                              <h5 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>📝 Notes & Remarks</h5>
                              <div style={{
                                padding: "14px 18px", borderRadius: 14,
                                background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)",
                                fontSize: "0.88rem", lineHeight: 1.7, color: "var(--text-secondary)",
                                whiteSpace: "pre-wrap",
                              }}>
                                {r.notes}
                              </div>
                            </div>
                          )}

                          {/* Attached files */}
                          {r.files?.length > 0 && (
                            <div>
                              <h5 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>📎 Attached Files</h5>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {r.files.map((f, idx) => (
                                  <div key={idx} style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "10px 16px", borderRadius: 12,
                                    background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)",
                                  }}>
                                    <span style={{ fontSize: "1.3rem" }}>{fileTypeIcon(f.name)}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                                      <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>{formatFileSize(f.size)}</div>
                                    </div>
                                    {/* Image preview */}
                                    {f.type?.startsWith("image/") && (
                                      <img src={f.data} alt={f.name} style={{
                                        width: 56, height: 56, borderRadius: 10, objectFit: "cover",
                                        border: "1px solid var(--border-subtle)",
                                      }} />
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); downloadFile(f); }} style={{
                                      padding: "6px 14px", borderRadius: 10, fontSize: "0.78rem", fontWeight: 600,
                                      background: "rgba(57,255,20,0.08)", border: "1px solid rgba(57,255,20,0.2)",
                                      color: "var(--primary-green)", cursor: "pointer",
                                    }}>⬇ Download</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {!r.notes && (!r.files || r.files.length === 0) && (
                            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>No notes or files attached to this report.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
