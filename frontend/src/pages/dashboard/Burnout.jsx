import GlassCard from "@/components/ui/GlassCard";
import PulseLoader from "@/components/ui/PulseLoader";
import { useDashboard } from "@/hooks/useDashboard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BurnoutAnalytics() {
  const { weekly, prediction, loading } = useDashboard();

  if (loading) return <PulseLoader text="Analyzing burnout patterns..." />;

  const p = prediction || {};
  const burnoutPct = p.burnout_percentage ?? 0;
  const riskLevel = p.risk_level ?? "unknown";
  const riskColor = riskLevel === "high" ? "var(--danger)" : riskLevel === "moderate" ? "var(--warning)" : "var(--primary-teal)";
  const factors = p.contributing_factors || [];
  const recs = p.recommendations || [];

  const dailyData = (weekly?.daily_data || []).map(d => ({
    time: d.date?.slice(5) || "",
    energy: d.energy || 5,
    stress: d.stress || 5,
    mood: d.mood || 5,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8, letterSpacing: "-0.02em" }}>Burnout Analytics</h2>
        <p style={{ color: "var(--text-muted)" }}>Deep dive into your mental fatigue and stress patterns.</p>
      </div>

      {/* Main Burnout Analysis */}
      <GlassCard delay={0.1} style={{ position: "relative", overflow: "hidden" }}>
        <div className="bg-blur-cyan" style={{ top: 0, right: 0, width: 256, height: 256, opacity: 0.05 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 32, alignItems: "center" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", width: "100%" }}>
            <div style={{
              width: 192, height: 192, borderRadius: "50%", border: `4px solid ${riskColor}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: `0 0 30px ${riskColor}33`,
            }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "3rem", fontWeight: 700, color: riskColor, textShadow: `0 0 10px ${riskColor}80` }}>{burnoutPct}%</span>
                <span style={{ fontSize: "0.875rem", color: riskColor, display: "block", marginTop: 4 }}>Burnout Risk</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 250 }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                Status: <span style={{ color: riskColor, textTransform: "capitalize" }}>{riskLevel} Risk</span>
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {riskLevel === "high" ? "Your burnout indicators are elevated. Consider reducing workload and prioritizing rest."
                  : riskLevel === "moderate" ? "Some stress indicators are above normal. Monitor your habits closely."
                  : burnoutPct > 0 ? "Your current lifestyle balance is healthy. Keep maintaining your routine."
                  : "Log your daily activities to get a burnout analysis."}
              </p>

              {factors.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontWeight: 600, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Contributing Factors</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {factors.map((f, i) => (
                      <span key={i} className={`tag ${f.severity === "high" ? "tag-red" : f.severity === "moderate" ? "tag-yellow" : "tag-green"}`}>
                        {f.severity === "high" ? "⚠" : "✓"} {f.detail || f.factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Charts */}
      <div className="grid grid-cols-1 lg-grid-cols-2" style={{ gap: 24 }}>
        <GlassCard delay={0.2} style={{ height: 350, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 16, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Energy vs. Stress</h3>
          <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="bEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFC107" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FFC107" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="bStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                  <XAxis dataKey="time" stroke="rgba(128,128,128,0.3)" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} dy={6} />
                  <YAxis domain={[0, 10]} stroke="rgba(128,128,128,0.3)" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 13 }} />
                  <Area type="monotone" dataKey="energy" stroke="#FFC107" strokeWidth={2.5} fill="url(#bEnergy)" dot={{ r: 4, fill: "#FFC107", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} name="Energy" />
                  <Area type="monotone" dataKey="stress" stroke="#f97316" strokeWidth={2.5} fill="url(#bStress)" dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} name="Stress" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", flexDirection: "column", gap: 12 }}>
                <span style={{ fontSize: "2.5rem" }}>📈</span>
                <span>Log daily activities to see your energy vs stress chart</span>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.3} style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 16, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>AI Recommendations</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {recs.length > 0 ? recs.map((r, i) => (
              <li key={i} style={{
                display: "flex", gap: 16, alignItems: "flex-start",
                background: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 12,
                border: "1px solid var(--border-subtle)", transition: "border-color 0.3s",
              }}>
                <span style={{ fontSize: "1.5rem", marginTop: 2 }}>{r.icon}</span>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{r.text}</p>
              </li>
            )) : (
              <li style={{ color: "var(--text-muted)", padding: 16, textAlign: "center" }}>
                Log your activities to receive personalized recommendations.
              </li>
            )}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
