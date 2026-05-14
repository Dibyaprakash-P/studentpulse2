"use client";

import GlassCard from "@/components/ui/GlassCard";
import PulseLoader from "@/components/ui/PulseLoader";
import { useDashboard } from "@/hooks/useDashboard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";

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
      <GlassCard delay={0.1} style={{ borderLeft: "4px solid var(--primary-cyan)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ fontSize: "2.25rem", marginTop: 4 }}>🤖</div>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 4 }}>Pulse AI Insight</h3>
            <p style={{ color: "#d1d5db" }}>
              {topRec ? topRec.text : w.days_logged > 0
                ? `You've logged ${w.days_logged} days this week. Your productivity score is ${w.productivity_score || 0}/100.`
                : "Start logging your daily activities to receive AI-powered insights!"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4" style={{ gap: 24 }}>
        <GlassCard delay={0.2}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 8, display: "block" }}>Current Burnout Risk</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span className="text-glow-cyan" style={{ fontSize: "2.25rem", fontWeight: 700 }}>{burnoutPct}%</span>
            <span style={{ fontSize: "0.875rem", color: riskColor, marginBottom: 4, textTransform: "capitalize" }}>{riskLevel}</span>
          </div>
        </GlassCard>
        <GlassCard delay={0.3}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 8, display: "block" }}>Avg Sleep (Week)</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span style={{ fontSize: "2.25rem", fontWeight: 700 }}>{w.avg_sleep || 0}</span>
            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 4 }}>hours</span>
          </div>
        </GlassCard>
        <GlassCard delay={0.4}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 8, display: "block" }}>Avg Study (Week)</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span style={{ fontSize: "2.25rem", fontWeight: 700 }}>{w.avg_study || 0}</span>
            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 4 }}>hours</span>
          </div>
        </GlassCard>
        <GlassCard delay={0.5}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 8, display: "block" }}>Productivity Score</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span className="text-glow-purple" style={{ fontSize: "2.25rem", fontWeight: 700 }}>{Math.round(w.productivity_score || 0)}</span>
            <span style={{ fontSize: "0.875rem", color: "var(--primary-purple)", marginBottom: 4 }}>/ 100</span>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: 24, minHeight: 400 }}>
        <GlassCard delay={0.6} className="lg-col-span-2" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>Productivity Trend</h3>
          <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-purple)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary-purple)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.5)" }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.5)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="score" stroke="var(--primary-purple)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                Log activities to see your productivity trend
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.7} style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, position: "absolute", top: 24, left: 24, fontFamily: "'Outfit',sans-serif" }}>Burnout Meter</h3>
          <div style={{ width: "100%", height: "100%", maxHeight: 250, marginTop: 32, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={burnoutData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} background={{ fill: "rgba(255,255,255,0.05)" }} clockWise dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 32 }}>
              <span style={{ fontSize: "2.25rem", fontWeight: 700 }}>{burnoutPct}%</span>
              <span style={{ fontSize: "0.875rem", color: riskColor, textTransform: "capitalize" }}>{riskLevel} Risk</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
