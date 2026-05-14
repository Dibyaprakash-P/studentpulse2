"use client";

import GlassCard from "@/components/ui/GlassCard";
import PulseLoader from "@/components/ui/PulseLoader";
import NeonButton from "@/components/ui/NeonButton";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

export default function ParentDashboardHome() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkCode, setLinkCode] = useState("");
  const [genMsg, setGenMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getLinkedStudents();
        setStudents(s || []);
      } catch { /* no linked students */ }
      setLoading(false);
    })();
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>Student Wellness Overview</h2>
          <p style={{ color: "var(--text-muted)" }}>Monitor your student's lifestyle balance and burnout risk.</p>
        </div>
      </div>

      {/* Link Code Generator */}
      <GlassCard delay={0.1} style={{ borderLeft: "4px solid var(--primary-purple)" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 8 }}>🔗 Link a Student</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 16 }}>
          Generate a code and share it with your student to link accounts.
        </p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <NeonButton variant="purple" onClick={handleGenCode}>Generate Link Code</NeonButton>
          {linkCode && (
            <div style={{ padding: "8px 20px", background: "rgba(176,38,255,0.1)", border: "1px solid rgba(176,38,255,0.3)", borderRadius: 12, fontFamily: "monospace", fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-purple)", letterSpacing: "0.1em" }}>
              {linkCode}
            </div>
          )}
        </div>
        {genMsg && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 8 }}>{genMsg}</p>}
      </GlassCard>

      {students.length === 0 ? (
        <GlassCard delay={0.2} style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>👨‍🎓</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>No Students Linked Yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Generate a link code above and share it with your student to start monitoring.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: 24 }}>
          {students.map((student, idx) => (
            <GlassCard key={student.id} delay={0.2 + idx * 0.1}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {student.full_name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700 }}>{student.full_name}</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Level {student.level} · {student.xp_points} XP</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Streak</div>
                  <div style={{ fontWeight: 700, color: "var(--warning)" }}>🔥 {student.current_streak || 0}</div>
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Level</div>
                  <div style={{ fontWeight: 700, color: "var(--primary-cyan)" }}>{student.level || 1}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
