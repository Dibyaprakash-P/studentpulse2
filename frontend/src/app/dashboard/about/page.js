"use client";

import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";


const FEATURES = [
  { icon: "📊", title: "Smart Dashboard", desc: "Real-time overview of study habits, energy, and wellness metrics." },
  { icon: "🧠", title: "AI Burnout Detection", desc: "Intelligent algorithm predicts burnout risk before it hits." },
  { icon: "📝", title: "Daily Tracker", desc: "Log sleep, study, stress, mood, hydration and more daily." },
  { icon: "📋", title: "Homework Manager", desc: "Track assignments with deadlines, priorities, and status." },
  { icon: "🗒️", title: "Smart Notes", desc: "Color-coded, pinnable notes for lectures and study prep." },
  { icon: "📁", title: "Project Tracker", desc: "Manage projects with progress, tags, and file attachments." },
  { icon: "📈", title: "Productivity Analytics", desc: "Weekly insights, scores, and consistency metrics." },
  { icon: "🏆", title: "Achievements & XP", desc: "Earn badges, build streaks, and level up your wellness." },
  { icon: "👨‍👩‍👦", title: "Parent Dashboard", desc: "Parents can monitor their child's wellbeing in real-time." },
  { icon: "☁️", title: "Cloud Sync", desc: "Data syncs across devices via Firebase Firestore." },
  { icon: "✅", title: "Attendance Tracker", desc: "Track class attendance with visual calendar heatmaps." },
  { icon: "📄", title: "Report Cards", desc: "Upload and manage exam results with file attachments." },
];

const TECH_STACK = [
  { name: "Next.js 16", icon: "▲", color: "#fff" },
  { name: "React 19", icon: "⚛️", color: "#61dafb" },
  { name: "Firebase", icon: "🔥", color: "#ffca28" },
  { name: "Framer Motion", icon: "🎬", color: "#39FF14" },
  { name: "Recharts", icon: "📊", color: "#38bdf8" },
  { name: "Netlify", icon: "🌐", color: "#4ade80" },
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: "1.875rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8, letterSpacing: "-0.02em" }}
        >
          About <span className="text-gradient">Student Pulse</span>
        </motion.h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: 500, margin: "0 auto" }}>
          Your AI-powered student wellness companion
        </p>
      </div>

      {/* Mission */}
      <GlassCard delay={0.1} style={{ padding: "clamp(24px, 4vw, 36px)", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div className="bg-blur-cyan" style={{ top: -50, right: -50, width: 200, height: 200, opacity: 0.08 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, var(--primary-green-deep), var(--primary-green))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(96, 165, 250, 0.2)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Our Mission</h3>
          </div>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.92rem" }}>
            Student Pulse was born from a simple observation: <strong style={{ color: "var(--text-main)" }}>students are burning out faster than ever</strong>, 
            and most don&apos;t even realize it until it&apos;s too late.
          </p>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.92rem", marginTop: 12 }}>
            We built this platform to give every student a personal wellness companion — one that uses 
            AI to detect burnout patterns, provides actionable insights, and gamifies the journey to 
            better health. <strong style={{ color: "var(--primary-green)" }}>Our mission is to help students thrive, not just survive.</strong>
          </p>
        </div>
      </GlassCard>

      {/* Features Grid */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.3rem" }}>✨</span> Features
        </h3>
        <div className="grid grid-cols-1 md-grid-cols-3" style={{ gap: 12 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.03 }}>
              <div className="glass-panel" style={{
                padding: "16px 18px", height: "100%",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: "1.3rem", flexShrink: 0, marginTop: 2 }}>{f.icon}</span>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 3 }}>{f.title}</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <GlassCard delay={0.3} style={{ padding: "clamp(20px, 3vw, 28px)", marginBottom: 24 }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.3rem" }}>🛠️</span> Built With
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {TECH_STACK.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
              style={{
                padding: "10px 18px", borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
                display: "flex", alignItems: "center", gap: 8,
                fontSize: "0.85rem", fontWeight: 600,
              }}>
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Creator Card */}
      <GlassCard delay={0.4} style={{ padding: "clamp(24px, 4vw, 36px)", marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary-green)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          Creator & Developer
        </div>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
          background: "linear-gradient(135deg, var(--primary-green-deep), var(--primary-green))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", fontWeight: 800, color: "#fff",
          boxShadow: "0 0 24px rgba(57, 255, 20, 0.25), 0 0 48px rgba(0, 230, 118, 0.1)",
        }}>
          DP
        </div>
        <h3 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Dibyaprakash Patnaik
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 20, lineHeight: 1.6 }}>
          Built with ❤️ by a student, for students.
        </p>
        <a href="mailto:dibyaprakashpatnaik@gmail.com" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 24px", borderRadius: 14,
          background: "rgba(57,255,20,0.06)",
          border: "1px solid rgba(57,255,20,0.15)",
          color: "var(--primary-green)", fontSize: "0.85rem", fontWeight: 600,
          textDecoration: "none", transition: "all 0.2s",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          dibyaprakashpatnaik@gmail.com
        </a>
      </GlassCard>

      {/* Version & Data Info */}
      <GlassCard delay={0.5} style={{ padding: "clamp(18px, 3vw, 24px)", marginBottom: 24 }}>
        <div className="grid grid-cols-1 md-grid-cols-3" style={{ gap: 16 }}>
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Version</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-green)" }}>2.0.0</div>
          </div>
          <div style={{ textAlign: "center", padding: "12px 0", borderLeft: "1px solid var(--border-subtle)", borderRight: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Data Storage</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--success)" }}>🔒 Private</div>
          </div>
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Platform</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-green)" }}>Web + Mobile</div>
          </div>
        </div>
      </GlassCard>

      <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.78rem", marginBottom: 16 }}>
        © {new Date().getFullYear()} Student Pulse · All data stays in your browser & syncs via Firebase
      </p>
    </div>
  );
}
