"use client";

import GlassCard from "@/components/ui/GlassCard";
import PulseLoader from "@/components/ui/PulseLoader";
import { useDashboard } from "@/hooks/useDashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadialBarChart, RadialBar, Cell, LabelList } from "recharts";

const BAR_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#f97316"];

function ScoreLabel({ x, y, width, value }) {
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fill="#334155" fontSize={12} fontWeight={700}>
      {value}
    </text>
  );
}

export default function DashboardHome() {
  const { weekly, prediction, gamification, loading } = useDashboard();

  if (loading) return <PulseLoader text="Loading your dashboard..." />;

  const w = weekly || {};
  const p = prediction || {};
  const burnoutPct = p.burnout_percentage ?? 0;
  const riskLevel = p.risk_level ?? "unknown";
  const riskColor = riskLevel === "high" ? "var(--danger)" : riskLevel === "moderate" ? "var(--warning)" : "var(--primary-cyan)";

  const dailyData = (w.daily_data || []).map(d => ({
    day: d.date?.slice(5) || "",
    score: Math.round(d.productivity || 0),
  }));

  const burnoutData = [{ name: "Risk", value: burnoutPct, fill: riskColor }];

  const topRec = p.recommendations?.[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* AI Recommendation */}
      <GlassCard delay={0} style={{ borderLeft: "3px solid var(--primary-cyan)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ fontSize: "2.25rem", marginTop: 4 }}>🤖</div>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 6 }}>Pulse AI Insight</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {topRec ? topRec.text : w.days_logged > 0
                ? `You've logged ${w.days_logged} days this week. Your productivity score is ${w.productivity_score || 0}/100.`
                : "Start logging your daily activities to receive AI-powered insights!"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4" style={{ gap: 24 }}>
        <GlassCard delay={0.02}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 10, display: "block", fontWeight: 500 }}>Current Burnout Risk</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span className="text-glow-cyan" style={{ fontSize: "2.25rem", fontWeight: 800 }}>{burnoutPct}%</span>
            <span style={{ fontSize: "0.82rem", color: riskColor, marginBottom: 5, textTransform: "capitalize", fontWeight: 600 }}>{riskLevel}</span>
          </div>
        </GlassCard>
        <GlassCard delay={0.04}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 10, display: "block", fontWeight: 500 }}>Avg Sleep (Week)</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span style={{ fontSize: "2.25rem", fontWeight: 800 }}>{w.avg_sleep || 0}</span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 5 }}>hours</span>
          </div>
        </GlassCard>
        <GlassCard delay={0.06}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 10, display: "block", fontWeight: 500 }}>Avg Study (Week)</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span style={{ fontSize: "2.25rem", fontWeight: 800 }}>{w.avg_study || 0}</span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 5 }}>hours</span>
          </div>
        </GlassCard>
        <GlassCard delay={0.08}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 10, display: "block", fontWeight: 500 }}>Productivity Score</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span className="text-glow-purple" style={{ fontSize: "2.25rem", fontWeight: 800 }}>{Math.round(w.productivity_score || 0)}</span>
            <span style={{ fontSize: "0.82rem", color: "var(--primary-purple)", marginBottom: 5, fontWeight: 600 }}>/ 100</span>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: 24, minHeight: 400 }}>
        <GlassCard delay={0.02} className="lg-col-span-2" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 18, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Productivity Trend</h3>
          <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 24, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    {BAR_COLORS.map((color, i) => (
                      <linearGradient key={i} id={`ovBarGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="day" stroke="rgba(128,128,128,0.3)" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }} tickLine={false} dy={6} />
                  <YAxis domain={[0, 100]} stroke="rgba(128,128,128,0.3)" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    <LabelList dataKey="score" content={ScoreLabel} />
                    {dailyData.map((entry, i) => (
                      <Cell key={i} fill={`url(#ovBarGrad${i % BAR_COLORS.length})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                Log activities to see your productivity trend
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.04} style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, position: "absolute", top: 24, left: 24, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Burnout Meter</h3>
          <div style={{ width: "100%", height: "100%", maxHeight: 250, marginTop: 32, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={burnoutData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} background={{ fill: "rgba(255,255,255,0.04)" }} clockWise dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 32 }}>
              <span style={{ fontSize: "2.25rem", fontWeight: 800 }}>{burnoutPct}%</span>
              <span style={{ fontSize: "0.82rem", color: riskColor, textTransform: "capitalize", fontWeight: 600 }}>{riskLevel} Risk</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
