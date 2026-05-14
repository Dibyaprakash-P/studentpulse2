"use client";

import GlassCard from "@/components/ui/GlassCard";
import PulseLoader from "@/components/ui/PulseLoader";
import { useDashboard } from "@/hooks/useDashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ProductivityInsights() {
  const { weekly, loading } = useDashboard();

  if (loading) return <PulseLoader text="Loading productivity data..." />;

  const w = weekly || {};
  const dailyData = (w.daily_data || []).map(d => ({
    day: d.date?.slice(5) || "",
    productivity: Math.round(d.productivity || 0),
    study: d.study || 0,
    gaming: d.gaming || 0,
  }));

  const avgStudy = w.avg_study || 0;
  const avgGaming = w.avg_gaming || 0;
  const prodScore = Math.round(w.productivity_score || 0);
  const consistency = Math.round(w.consistency_score || 0);

  const grade = prodScore >= 90 ? "A+" : prodScore >= 80 ? "A" : prodScore >= 70 ? "B+" : prodScore >= 60 ? "B" : prodScore >= 50 ? "C" : "D";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>Productivity Intelligence</h2>
        <p style={{ color: "var(--text-muted)" }}>Analyze your study efficiency and focus patterns.</p>
      </div>

      <div className="grid grid-cols-1 md-grid-cols-3" style={{ gap: 24 }}>
        <GlassCard delay={0.1} style={{ background: "linear-gradient(135deg, rgba(176,38,255,0.1), transparent)", borderColor: "rgba(176,38,255,0.2)" }}>
          <div style={{ color: "var(--primary-purple)", marginBottom: 8, fontSize: "0.875rem" }}>Avg Study Time</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: 4 }}>{avgStudy}h</div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>per day this week</div>
        </GlassCard>
        <GlassCard delay={0.2} style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.1), transparent)", borderColor: "rgba(0,212,255,0.2)" }}>
          <div style={{ color: "var(--primary-cyan)", marginBottom: 8, fontSize: "0.875rem" }}>Productivity Score</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: 4 }}>{prodScore}/100</div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Grade: {grade}</div>
        </GlassCard>
        <GlassCard delay={0.3} style={{ background: "linear-gradient(135deg, rgba(51,255,153,0.1), transparent)", borderColor: "rgba(51,255,153,0.2)" }}>
          <div style={{ color: "var(--success)", marginBottom: 8, fontSize: "0.875rem" }}>Consistency</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: 4 }}>{consistency}%</div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{w.days_logged || 0}/7 days logged</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: 24 }}>
        <GlassCard delay={0.4} className="lg-col-span-2" style={{ height: 400, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>Daily Productivity Score</h3>
          <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.5)" }} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.5)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                  <Bar dataKey="productivity" radius={[4, 4, 0, 0]}>
                    {dailyData.map((entry, i) => (
                      <Cell key={i} fill={entry.productivity > 70 ? "var(--primary-cyan)" : "var(--primary-purple)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>No data yet</div>
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.5} style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>Time Distribution</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <li style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: "1.25rem" }}>📚</span> Study</span>
              <span style={{ color: "var(--primary-cyan)", fontWeight: 700 }}>{avgStudy}h/day</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: "1.25rem" }}>🎮</span> Gaming</span>
              <span style={{ color: "var(--warning)", fontWeight: 700 }}>{avgGaming}h/day</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 8, border: avgStudy > avgGaming ? "1px solid rgba(0,255,229,0.3)" : "1px solid rgba(255,51,102,0.3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: "1.25rem" }}>⚖️</span> Ratio</span>
              <span style={{ color: avgStudy > avgGaming ? "var(--success)" : "var(--danger)", fontWeight: 700 }}>
                {avgGaming > 0 ? (avgStudy / avgGaming).toFixed(1) : "∞"}x
              </span>
            </li>
          </ul>
          <div style={{ marginTop: "auto", paddingTop: 16, fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center" }}>
            {avgStudy > avgGaming ? `Great! You study ${(avgStudy / Math.max(avgGaming, 0.1)).toFixed(1)}x more than you game.` : "Try to increase study time relative to gaming."}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
