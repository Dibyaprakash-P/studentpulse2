import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme";

const FEATURES = [
  { icon: "📊", title: "Smart Dashboard", desc: "Real-time overview of your study habits, energy levels, and wellness metrics — all in one beautiful view.", color: "#FFD700" },
  { icon: "🧠", title: "AI Burnout Detection", desc: "Our intelligent algorithm analyzes your daily inputs and predicts burnout risk before it hits.", color: "#FFC107" },
  { icon: "📝", title: "Daily Tracker", desc: "Log sleep, study hours, stress, mood, hydration and more. Build healthy habits one day at a time.", color: "#FFEB3B" },
  { icon: "📋", title: "Homework Manager", desc: "Track assignments with deadlines, priorities, and completion status. Never miss a due date.", color: "#FF8F00" },
  { icon: "🗒️", title: "Smart Notes", desc: "Color-coded, pinnable notes for lectures, study groups, and exam prep — all organized and searchable.", color: "#FFE082" },
  { icon: "📁", title: "Project Tracker", desc: "Manage academic projects with progress tracking, tags, file attachments, and deadline alerts.", color: "#FFCA28" },
  { icon: "📈", title: "Productivity Analytics", desc: "Weekly insights, productivity scores, and consistency metrics to help you stay on track.", color: "#FFE082" },
  { icon: "🏆", title: "Achievements & XP", desc: "Earn badges, build streaks, and level up as you maintain healthy habits. Gamified motivation!", color: "#FFC107" },
  { icon: "👨‍👩‍👦", title: "Parent Dashboard", desc: "Parents can monitor their child's wellbeing with linked accounts and real-time insights.", color: "#FFD700" },
];

/* Theme toggle button */
function ThemeToggle({ theme, toggle }) {
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        width: 40, height: 40, borderRadius: 12,
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.1rem",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </motion.button>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggle } = useTheme();
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <main style={{ minHeight: "100vh", overflow: "hidden", background: "var(--bg-primary)" }}>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)",
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #FFD700, #FFC107)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(255, 215, 0, 0.3)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.02em" }}>Student Pulse</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <ThemeToggle theme={theme} toggle={toggle} />
            <Link to="/login" className="btn-primary" style={{ fontSize: "0.8rem", padding: "9px 22px" }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        position: "relative", padding: "80px clamp(16px, 5vw, 40px) 40px",
      }}>
        {/* Ambient floating orbs */}
        <div className="bg-blur-teal" style={{ top: "10%", left: "5%", width: 280, height: 280 }} />
        <div className="bg-blur-lavender" style={{ bottom: "15%", right: "5%", width: 320, height: 320 }} />
        <div className="bg-blur-coral" style={{ top: "60%", right: "20%", width: 150, height: 150, opacity: 0.5 }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ zIndex: 10, maxWidth: 680 }}>

          {/* Logo */}
          <div className="animate-float" style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div className="animate-pulse-glow" style={{
              width: 80, height: 80, borderRadius: "50%",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              background: "rgba(255, 215, 0, 0.05)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <motion.div className="animate-heartbeat">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </motion.div>
            </div>
          </div>

          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, marginBottom: 16, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Your AI-Powered<br />
            <span className="text-gradient">Student Wellness</span> Companion
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)", color: "var(--text-secondary)", marginBottom: 36, maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Track daily habits, predict burnout with AI, manage homework & projects, 
            and build a healthier academic life — all in one beautiful platform.
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <Link to="/login" className="btn-primary" style={{ fontSize: "0.9rem", padding: "14px 32px" }}>
              🚀 Get Started Free
            </Link>
            <a href="#features" className="btn-outline" style={{ fontSize: "0.9rem", padding: "14px 32px" }}>
              Explore Features
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          style={{ position: "absolute", bottom: 32, color: "var(--text-dim)", fontSize: "1.2rem" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" style={{
        padding: "80px clamp(16px, 5vw, 40px)",
        maxWidth: 1200, margin: "0 auto",
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Everything You Need to <span className="text-gradient">Thrive</span>
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 500, margin: "0 auto", fontSize: "clamp(0.85rem, 1.5vw, 1rem)", lineHeight: 1.6 }}>
            A complete toolkit designed specifically for students who want to stay healthy, productive, and balanced.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05, ease: [0.34, 1.56, 0.64, 1] }}>
              <div className="glass-panel" style={{
                padding: "clamp(18px, 3vw, 26px)", height: "100%",
                display: "flex", flexDirection: "column", gap: 14,
                borderTop: `3px solid ${f.color}`,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${f.color}12`,
                  border: `1px solid ${f.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{f.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{
        padding: "60px clamp(16px, 5vw, 40px)",
        maxWidth: 900, margin: "0 auto",
      }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
            How It <span className="text-gradient">Works</span>
          </h2>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { step: "1", icon: "📝", title: "Log Your Day", desc: "Track sleep, study, stress, mood, and more in under 60 seconds.", color: "#FFD700" },
            { step: "2", icon: "🧠", title: "AI Analyzes", desc: "Our burnout algorithm processes your data and identifies risk factors.", color: "#FFC107" },
            { step: "3", icon: "💡", title: "Get Insights", desc: "Receive personalized recommendations and track your progress over time.", color: "#FFEB3B" },
            { step: "4", icon: "🏆", title: "Level Up", desc: "Earn badges, build streaks, and gamify your wellness journey.", color: "#FF8F00" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
              whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="glass-panel" style={{
                padding: "clamp(16px, 3vw, 24px)", display: "flex", alignItems: "center", gap: "clamp(14px, 3vw, 22px)",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: "1.1rem",
                  boxShadow: `0 0 20px ${s.color}25`,
                }}>
                  {s.step}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{s.icon} {s.title}</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ ABOUT US ═══ */}
      <section id="about" style={{
        padding: "60px clamp(16px, 5vw, 40px) 40px",
        maxWidth: 900, margin: "0 auto", textAlign: "center",
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
            About <span className="text-gradient">Us</span>
          </h2>
          <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 40px)" }}>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)", maxWidth: 600, margin: "0 auto 32px" }}>
              Student Pulse was born from a simple observation: students are burning out faster than ever, 
              and most don&apos;t even realize it until it&apos;s too late.
              <br /><br />
              We built this platform to give every student a personal wellness companion — one that uses 
              AI to detect burnout patterns, provides actionable insights, and gamifies the journey to 
              better health. Our mission is to help students thrive, not just survive.
            </p>

            {/* Creator Card */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              padding: "28px 32px", borderRadius: 20,
              background: "rgba(255, 215, 0, 0.04)",
              border: "1px solid rgba(255, 215, 0, 0.1)",
            }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary-yellow)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Creator & Developer
              </div>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, #FFD700, #FFC107)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", fontWeight: 800, color: "#0a0a0a",
                boxShadow: "0 0 24px rgba(255, 215, 0, 0.25), 0 0 48px rgba(255, 193, 7, 0.1)",
              }}>
                DP
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Dibyaprakash Patnaik
                </h3>

                <a href="mailto:dibyaprakashpatnaik@gmail.com" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 20px", borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--primary-yellow)", fontSize: "0.82rem", fontWeight: 600,
                  textDecoration: "none", transition: "all 0.2s",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  dibyaprakashpatnaik@gmail.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{
        padding: "40px clamp(16px, 5vw, 40px) 80px",
        textAlign: "center",
      }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Ready to take control of your wellness?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}>
            Join now — it&apos;s free, private, and works entirely in your browser.
          </p>
          <Link to="/login" className="btn-primary" style={{ fontSize: "1rem", padding: "16px 40px" }}>
            🚀 Start Tracking Now
          </Link>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)", padding: "28px clamp(16px, 4vw, 32px)",
        textAlign: "center", color: "var(--text-dim)", fontSize: "0.8rem",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      }}>
        <p>© {new Date().getFullYear()} Student Pulse · Created by <strong>Dibyaprakash Patnaik</strong> · All data stays in your browser</p>
      </footer>
    </main>
  );
}
