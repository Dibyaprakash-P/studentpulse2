import GlassCard from "@/components/ui/GlassCard";
import PulseLoader from "@/components/ui/PulseLoader";
import { useDashboard } from "@/hooks/useDashboard";
import { motion } from "framer-motion";

const GLOW_COLORS = {
  milestone: "rgba(0,212,255,0.6)", streak: "rgba(255,184,77,0.6)",
  productivity: "rgba(176,38,255,0.6)", wellness: "rgba(51,255,153,0.6)",
  fitness: "rgba(255,51,102,0.6)", social: "rgba(96,165,250,0.6)",
  academic: "rgba(255,204,0,0.6)",
};

export default function Achievements() {
  const { gamification, loading } = useDashboard();

  if (loading) return <PulseLoader text="Loading achievements..." />;

  const g = gamification || {};
  const earnedNames = new Set((g.earned_badges || []).map(b => b.name));
  const allBadges = (g.all_badges || []).map(b => ({
    ...b, earned: earnedNames.has(b.name),
    glow: earnedNames.has(b.name) ? (GLOW_COLORS[b.category] || "rgba(0,212,255,0.6)") : "transparent",
  }));

  const xp = g.xp_points || 0;
  const level = g.level || 1;
  const progressPct = g.level_progress_pct || 0;
  const xpToNext = g.xp_to_next_level || 100;
  const streak = g.current_streak || 0;
  const longestStreak = g.longest_streak || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>Your Achievements</h2>
        <p style={{ color: "var(--text-muted)" }}>Level up your wellness and unlock rewards.</p>
      </div>

      {/* Level Banner */}
      <GlassCard delay={0.1} style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(176,38,255,0.1))", borderTop: "2px solid rgba(0,212,255,0.5)", overflow: "hidden", position: "relative" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%", background: "#000",
              border: "4px solid var(--primary-yellow)", display: "flex", alignItems: "center",
              justifyContent: "center", boxShadow: "0 0 20px rgba(0,255,229,0.5)",
            }}>
              <span className="text-glow-cyan" style={{ fontSize: "2.25rem", fontWeight: 700 }}>L{level}</span>
            </div>
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Level {level}</h3>
              <p style={{ color: "var(--text-muted)", marginTop: 4 }}>{xp} XP total · {xpToNext} XP to Level {level + 1}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
                🔥 {streak} day streak · Best: {longestStreak} days
              </p>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 400, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: 8, fontWeight: 700 }}>
              <span style={{ color: "var(--primary-yellow)" }}>LVL {level}</span>
              <span style={{ color: "var(--primary-yellow)" }}>LVL {level + 1}</span>
            </div>
            <div className="progress-bar-track">
              <motion.div className="progress-bar-fill"
                initial={{ width: 0 }} animate={{ width: `${Math.min(progressPct, 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }} />
            </div>
            <p style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 8 }}>
              {xpToNext > 0 ? `Just ${xpToNext} XP to rank up!` : "Max level reached!"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Badges Grid */}
      <div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 24 }}>
          Badges Collection ({g.total_badges_earned || 0}/{g.total_badges_available || 0})
        </h3>
        <div className="grid grid-cols-1 md-grid-cols-3 lg-grid-cols-4" style={{ gap: 24 }}>
          {allBadges.map((badge, idx) => (
            <GlassCard key={idx} delay={0.2 + idx * 0.05}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                opacity: badge.earned ? 1 : 0.5, filter: badge.earned ? "none" : "grayscale(1)",
                boxShadow: badge.earned ? `0 8px 32px ${badge.glow}` : "none",
                transition: "all 0.3s",
              }}>
              <div style={{ fontSize: "3rem", marginBottom: 16, filter: badge.earned ? "drop-shadow(0 0 10px rgba(255,255,255,0.5))" : "none" }}>
                {badge.icon}
              </div>
              <h4 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: 4 }}>{badge.name}</h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{badge.description}</p>
              {!badge.earned && (
                <div style={{ marginTop: 16, padding: "4px 12px", borderRadius: 9999, background: "rgba(255,255,255,0.1)", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)" }}>
                  Locked · {badge.xp_reward} XP
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
