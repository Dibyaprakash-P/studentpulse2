"use client";

import GlassCard from "@/components/ui/GlassCard";
import PulseLoader from "@/components/ui/PulseLoader";
import { useDashboard } from "@/hooks/useDashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from "recharts";

const BAR_COLORS = ["#14b8a6", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6", "#10b981"];

/* Custom label rendered on top of each bar */
function ScoreLabel({ x, y, width, value }) {
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fill="var(--text-secondary)" fontSize={13} fontWeight={700}>
      {value}
    </text>
  );
}

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
        <h2 style={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8, letterSpacing: "-0.02em" }}>Productivity Intelligence</h2>
        <p style={{ color: "var(--text-muted)" }}>Analyze your study efficiency and focus patterns.</p>
      </div>

      <div className="grid grid-cols-1 md-grid-cols-3" style={{ gap: 24 }}>
        <GlassCard delay={0.1} accentColor="#14b8a6">
          <div style={{ color: "#14b8a6", marginBottom: 8, fontSize: "0.875rem", fontWeight: 600 }}>Avg Study Time</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: 4 }}>{avgStudy}h</div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>per day this week</div>
        </GlassCard>
        <GlassCard delay={0.2} accentColor="#6366f1">
          <div style={{ color: "#6366f1", marginBottom: 8, fontSize: "0.875rem", fontWeight: 600 }}>Productivity Score</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: 4 }}>{prodScore}/100</div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Grade: {grade}</div>
        </GlassCard>
        <GlassCard delay={0.3} accentColor="#10b981">
          <div style={{ color: "#10b981", marginBottom: 8, fontSize: "0.875rem", fontWeight: 600 }}>Consistency</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: 4 }}>{consistency}%</div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{w.days_logged || 0}/7 days logged</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: 24 }}>
        <GlassCard delay={0.4} className="lg-col-span-2" style={{ height: 400, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 16, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Daily Productivity Score</h3>
          <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 24, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    {BAR_COLORS.map((color, i) => (
                      <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="day" stroke="rgba(128,128,128,0.3)" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }} tickLine={false} dy={6} />
                  <YAxis domain={[0, 100]} stroke="rgba(128,128,128,0.3)" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
                  <Bar dataKey="productivity" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    <LabelList dataKey="productivity" content={ScoreLabel} />
                    {dailyData.map((entry, i) => (
                      <Cell key={i} fill={`url(#barGrad${i % BAR_COLORS.length})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", flexDirection: "column", gap: 12 }}>
                <span style={{ fontSize: "2.5rem" }}>📊</span>
                <span>Log daily activities to see your productivity chart</span>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.5} style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 16, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Time Distribution</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <li style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, borderLeft: "3px solid #14b8a6" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: "1.25rem" }}>📚</span> Study</span>
              <span style={{ color: "#14b8a6", fontWeight: 700 }}>{avgStudy}h/day</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "rgba(244,63,94,0.08)", borderRadius: 8, borderLeft: "3px solid #f43f5e" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: "1.25rem" }}>🎮</span> Game & Fun</span>
              <span style={{ color: "#f43f5e", fontWeight: 700 }}>{avgGaming}h/day</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: avgStudy > avgGaming ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 8, borderLeft: `3px solid ${avgStudy > avgGaming ? "#22c55e" : "#ef4444"}` }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: "1.25rem" }}>⚖️</span> Ratio</span>
              <span style={{ color: avgStudy > avgGaming ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
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
