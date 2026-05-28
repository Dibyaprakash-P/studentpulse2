"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function loadReports() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("sp_reportcards")) || []; } catch { return []; }
}

const GRADE_COLORS = {
  "A+": "#4ade80", A: "#4ade80", "A-": "#86efac",
  "B+": "#7dd3fc", B: "#7dd3fc", "B-": "#93c5fd",
  "C+": "#fcd34d", C: "#fbbf24", "C-": "#fbbf24",
  "D+": "#fb923c", D: "#f97316", "D-": "#f97316",
  F: "#fb7185",
};
function gradeColor(g) { return (g && GRADE_COLORS[g.toUpperCase()]) || "var(--primary-green)"; }

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const FILE_TYPE_ICONS = {
  pdf: "📄", doc: "📃", docx: "📃", ppt: "📊", pptx: "📊",
  xls: "📈", xlsx: "📈", jpg: "🖼️", jpeg: "🖼️", png: "🖼️",
  gif: "🖼️", webp: "🖼️", mp4: "🎬", zip: "📦", txt: "📝",
};
function fileTypeIcon(name) { return FILE_TYPE_ICONS[name.split(".").pop().toLowerCase()] || "📎"; }
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function ParentReportCardsMonitor() {
  const [reports, setReports] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => { setReports(loadReports()); }, []);

  const subjects = [...new Set(reports.map(r => r.subject).filter(Boolean))];
  const filtered = filter === "All" ? reports : reports.filter(r => r.subject === filter);

  const avgPct = reports.filter(r => r.percentage != null).length > 0
    ? Math.round(reports.filter(r => r.percentage != null).reduce((a, r) => a + r.percentage, 0) / reports.filter(r => r.percentage != null).length)
    : null;

  const downloadFile = (file) => {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 6, letterSpacing: "-0.02em" }}>
          📄 Report Cards Monitor
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Review your student's exam reports, grades, and attached files.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4" style={{ gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Reports", value: reports.length, icon: "📄", color: "var(--text-main)" },
          { label: "Subjects", value: subjects.length, icon: "🎓", color: "var(--primary-green)" },
          { label: "Avg Score", value: avgPct != null ? `${avgPct}%` : "—", icon: "📊", color: avgPct >= 70 ? "var(--success)" : avgPct >= 50 ? "var(--warning)" : avgPct ? "var(--danger)" : "var(--text-muted)" },
          { label: "Files Uploaded", value: reports.reduce((a, r) => a + (r.files?.length || 0), 0), icon: "📎", color: "var(--primary-green)" },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: "16px 20px", textAlign: "center" }}>
            <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Subject filters */}
      {subjects.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => setFilter("All")} style={{
            padding: "7px 18px", borderRadius: 20, fontSize: "0.82rem", cursor: "pointer",
            border: `1px solid ${filter === "All" ? "var(--primary-green)" : "var(--border-subtle)"}`,
            background: filter === "All" ? "rgba(57,255,20,0.08)" : "transparent",
            color: filter === "All" ? "var(--primary-green)" : "var(--text-muted)",
            fontWeight: filter === "All" ? 600 : 400,
          }}>All</button>
          {subjects.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "7px 18px", borderRadius: 20, fontSize: "0.82rem", cursor: "pointer",
              border: `1px solid ${filter === s ? "var(--primary-green)" : "var(--border-subtle)"}`,
              background: filter === s ? "rgba(57,255,20,0.08)" : "transparent",
              color: filter === s ? "var(--primary-green)" : "var(--text-muted)",
              fontWeight: filter === s ? 600 : 400,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Report Cards */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📄</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>No report cards available</h3>
          <p style={{ color: "var(--text-muted)" }}>Your student hasn't uploaded any report cards yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(r => {
            const expanded = expandedId === r.id;
            const pctColor = r.percentage >= 80 ? "var(--success)" : r.percentage >= 60 ? "var(--warning)" : r.percentage >= 40 ? "#fb923c" : "var(--danger)";

            return (
              <motion.div key={r.id} layout transition={{ duration: 0.2 }}>
                <div className="glass-panel" style={{ padding: "18px 22px", cursor: "pointer" }}
                  onClick={() => setExpandedId(expanded ? null : r.id)}>

                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                      background: `${gradeColor(r.grade)}15`,
                      border: `1px solid ${gradeColor(r.grade)}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: r.grade ? "1.15rem" : "0.85rem",
                      color: gradeColor(r.grade),
                    }}>
                      {r.grade || (r.percentage != null ? `${r.percentage}%` : "—")}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{r.examName}</h4>
                      <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: "0.78rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                        {r.subject && <span>🎓 {r.subject}</span>}
                        {r.date && <span>📅 {formatDate(r.date)}</span>}
                        {r.obtainedMarks && r.totalMarks && (
                          <span style={{ color: pctColor, fontWeight: 600 }}>📊 {r.obtainedMarks}/{r.totalMarks}</span>
                        )}
                        {r.files?.length > 0 && <span>📎 {r.files.length} file{r.files.length > 1 ? "s" : ""}</span>}
                        {r.notes && <span>📝 Has notes</span>}
                      </div>
                    </div>

                    {/* Percentage */}
                    {r.percentage != null && (
                      <div style={{ width: 80, flexShrink: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: pctColor, textAlign: "right", marginBottom: 4 }}>{r.percentage}%</div>
                        <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${r.percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ height: "100%", borderRadius: 6, background: pctColor }} />
                        </div>
                      </div>
                    )}

                    <span style={{
                      fontSize: "0.9rem", color: "var(--text-dim)",
                      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}>▼</span>
                  </div>

                  {/* Expanded view */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}>
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>

                          {/* Marks breakdown */}
                          {r.obtainedMarks && r.totalMarks && (
                            <div style={{
                              display: "inline-flex", alignItems: "center", gap: 16,
                              padding: "12px 20px", borderRadius: 14,
                              background: `${pctColor}08`, border: `1px solid ${pctColor}22`,
                              marginBottom: 16,
                            }}>
                              <div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: 2 }}>Obtained</div>
                                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: pctColor }}>{r.obtainedMarks}</div>
                              </div>
                              <div style={{ fontSize: "1.5rem", color: "var(--text-dim)", fontWeight: 300 }}>/</div>
                              <div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: 2 }}>Total</div>
                                <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>{r.totalMarks}</div>
                              </div>
                              {r.grade && (
                                <>
                                  <div style={{ width: 1, height: 36, background: "var(--border-subtle)" }} />
                                  <div>
                                    <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: 2 }}>Grade</div>
                                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: gradeColor(r.grade) }}>{r.grade}</div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

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

                          {/* Files */}
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
                                    {f.type?.startsWith("image/") && (
                                      <img src={f.data} alt={f.name} style={{
                                        width: 60, height: 60, borderRadius: 10, objectFit: "cover",
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
                            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>
                              No additional details for this report.
                            </p>
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
