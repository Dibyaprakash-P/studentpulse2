import GlassCard from "@/components/ui/GlassCard";
import MetricCard from "@/components/ui/MetricCard";
import ProgressRing from "@/components/ui/ProgressRing";
import PulseLoader from "@/components/ui/PulseLoader";
import { useDashboard } from "@/hooks/useDashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, Tooltip } from "recharts";

const CHART_HEX = ["#FF4D00", "#00E5FF", "#A855F7", "#F59E0B", "#00C48C", "#3B82F6", "#FF6B2B"];

function ScoreLabel({ x, y, width, value }) {
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fill="var(--text-secondary)" fontSize={12} fontWeight={700}
      style={{ fontFamily: "var(--font-display)" }}>
      {value}
    </text>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--border-light)",
      borderRadius: 6, padding: "10px 14px", fontSize: "0.82rem",
    }}>
      <p style={{ color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-display)", fontWeight: 600 }}>{label}</p>
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
  const riskColor = riskLevel === "high" ? "var(--danger)" : riskLevel === "moderate" ? "var(--warning)" : "var(--accent)";
  const riskColorHex = riskLevel === "high" ? "#FF3B3B" : riskLevel === "moderate" ? "#F59E0B" : "#FF4D00";

  const dailyData = (w.daily_data || []).map(d => ({
    day: d.date?.slice(5) || "",
    score: Math.round(d.productivity || 0),
  }));

  const topRec = p.recommendations?.[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* AI Recommendation */}
      <GlassCard delay={0} accentColor="var(--accent)">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 6,
            background: "var(--accent-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: "var(--accent)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12 12 6"/><path d="M12 12 16 14"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 4, fontFamily: "var(--font-display)" }}>Pulse AI Insight</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.85rem" }}>
              {topRec ? topRec.text : w.days_logged > 0
                ? `You've logged ${w.days_logged} days this week. Your productivity score is ${w.productivity_score || 0}/100.`
                : "Start logging your daily activities to receive AI-powered insights!"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4" style={{ gap: 14 }}>
        <MetricCard
          label="Burnout Risk"
          value={burnoutPct}
          suffix="%"
          accentColor={riskColorHex}
          delay={0.02}
          trendLabel={riskLevel !== "unknown" ? riskLevel : ""}
        />
        <MetricCard
          label="Avg Sleep"
          value={w.avg_sleep || 0}
          suffix=""
          accentColor="#00E5FF"
          delay={0.04}
          trendLabel="hours"
          decimals={1}
        />
        <MetricCard
          label="Avg Study"
          value={w.avg_study || 0}
          suffix=""
          accentColor="#A855F7"
          delay={0.06}
          trendLabel="hours"
          decimals={1}
        />
        <MetricCard
          label="Productivity"
          value={Math.round(w.productivity_score || 0)}
          suffix="/100"
          accentColor="#00C48C"
          delay={0.08}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: 14, minHeight: 380 }}>
        <GlassCard delay={0.02} className="lg-col-span-2" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <h3 style={{
            fontSize: "0.85rem", fontWeight: 600, marginBottom: 16,
            fontFamily: "var(--font-display)",
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: "var(--text-muted)", fontSize: "0.72rem",
          }}>Productivity Trend</h3>
          <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 24, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.06)" tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 600 }} tickLine={false} dy={6} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.06)" tick={{ fill: "var(--text-dim)", fontSize: 11 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40} name="Score">
                    <LabelList dataKey="score" content={ScoreLabel} />
                    {dailyData.map((entry, i) => (
                      <Cell key={i} fill={CHART_HEX[i % CHART_HEX.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%", color: "var(--text-muted)", flexDirection: "column", gap: 10,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>
                </svg>
                <span style={{ fontSize: "0.85rem" }}>Log activities to see your trend</span>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.04} style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <h3 style={{
            fontSize: "0.72rem", fontWeight: 600,
            fontFamily: "var(--font-display)",
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: "var(--text-muted)",
            alignSelf: "flex-start", marginBottom: 16,
          }}>Burnout Meter</h3>
          <ProgressRing
            value={burnoutPct}
            size={160}
            strokeWidth={10}
            color={riskColorHex}
            label={`${riskLevel} Risk`}
            sublabel="Based on weekly data"
          />
        </GlassCard>
      </div>
    </div>
  );
}
