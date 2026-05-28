"use client";

import GlassCard from "@/components/ui/GlassCard";
import MetricCard from "@/components/ui/MetricCard";
import ProgressRing from "@/components/ui/ProgressRing";
import PulseLoader from "@/components/ui/PulseLoader";
import { useDashboard } from "@/hooks/useDashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, Tooltip } from "recharts";

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)"];
const CHART_HEX = ["#39FF14", "#00E676", "#76FF03", "#00C853", "#B2FF59", "#69F0AE", "#A7FFEB"];

function ScoreLabel({ x, y, width, value }) {
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fill="var(--text-secondary)" fontSize={12} fontWeight={700}>
      {value}
    </text>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10, 20, 40, 0.95)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12, padding: "10px 14px", fontSize: "0.82rem",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }}>
      <p style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function DashboardHome() {
  const { weekly, prediction, gamification, loading } = useDashboard();

  if (loading) return <PulseLoader text="Loading your dashboard..." />;

  const w = weekly || {};
  const p = prediction || {};
  const burnoutPct = p.burnout_percentage ?? 0;
  const riskLevel = p.risk_level ?? "unknown";
  const riskColor = riskLevel === "high" ? "var(--danger)" : riskLevel === "moderate" ? "var(--warning)" : "var(--primary-green)";
  const riskColorHex = riskLevel === "high" ? "#fb7185" : riskLevel === "moderate" ? "#fbbf24" : "#39FF14";

  const dailyData = (w.daily_data || []).map(d => ({
    day: d.date?.slice(5) || "",
    score: Math.round(d.productivity || 0),
  }));

  const topRec = p.recommendations?.[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* AI Recommendation */}
      <GlassCard delay={0} accentColor="var(--primary-teal)" accentTop>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{
            fontSize: "2rem", marginTop: 4,
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(57, 255, 20, 0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>🤖</div>
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

      {/* Stats Row — MetricCards with animated counters */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4" style={{ gap: 20 }}>
        <MetricCard
          label="Current Burnout Risk"
          value={burnoutPct}
          suffix="%"
          icon="🧠"
          accentColor={riskColorHex}
          delay={0.02}
          trendLabel={riskLevel !== "unknown" ? riskLevel : ""}
        />
        <MetricCard
          label="Avg Sleep (Week)"
          value={w.avg_sleep || 0}
          suffix=""
          icon="😴"
          accentColor="#39FF14"
          delay={0.04}
          trendLabel="hours"
          decimals={1}
        />
        <MetricCard
          label="Avg Study (Week)"
          value={w.avg_study || 0}
          suffix=""
          icon="📚"
          accentColor="#39FF14"
          delay={0.06}
          trendLabel="hours"
          decimals={1}
        />
        <MetricCard
          label="Productivity Score"
          value={Math.round(w.productivity_score || 0)}
          suffix="/100"
          icon="⚡"
          accentColor="#00E676"
          delay={0.08}
        />
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
                    {CHART_HEX.map((color, i) => (
                      <linearGradient key={i} id={`ovBarGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(128,128,128,0.2)" tick={{ fill: "var(--text-muted)", fontSize: 12, fontWeight: 600 }} tickLine={false} dy={6} />
                  <YAxis domain={[0, 100]} stroke="rgba(128,128,128,0.2)" tick={{ fill: "var(--text-dim)", fontSize: 11 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={48} name="Score">
                    <LabelList dataKey="score" content={ScoreLabel} />
                    {dailyData.map((entry, i) => (
                      <Cell key={i} fill={`url(#ovBarGrad${i % CHART_HEX.length})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", flexDirection: "column", gap: 12 }}>
                <span style={{ fontSize: "2.5rem" }}>📊</span>
                <span>Log activities to see your productivity trend</span>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.04} style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", alignSelf: "flex-start", marginBottom: 16 }}>Burnout Meter</h3>
          <ProgressRing
            value={burnoutPct}
            size={180}
            strokeWidth={14}
            color={riskColorHex}
            label={`${riskLevel} Risk`}
            sublabel="Based on weekly data"
          />
        </GlassCard>
      </div>
    </div>
  );
}
