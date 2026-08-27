import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "AI Burnout Detection",
    desc: "Our algorithm analyzes your daily inputs and predicts burnout risk before it hits. Get real-time alerts and personalized recovery plans.",
    color: "#FF4D00",
    tag: "Core Feature",
    span: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12 12 6"/><path d="M12 12 16 14"/>
      </svg>
    ),
  },
  {
    title: "Smart Dashboard",
    desc: "Real-time overview of study habits, energy levels, and wellness metrics — all in one view.",
    color: "#00E5FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    title: "Daily Tracker",
    desc: "Log sleep, study hours, stress, mood, hydration and more in under 60 seconds.",
    color: "#A855F7",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>
      </svg>
    ),
  },
  {
    title: "Homework Manager",
    desc: "Track assignments with deadlines, priorities, and completion status. Never miss a due date.",
    color: "#F59E0B",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/>
        <path d="M15 3v4a2 2 0 0 0 2 2h4"/>
      </svg>
    ),
  },
  {
    title: "Achievements & XP",
    desc: "Earn badges, build streaks, and level up as you maintain healthy habits. Gamified motivation that keeps you going.",
    color: "#00C48C",
    tag: "Gamification",
    span: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/>
        <circle cx="12" cy="8" r="6"/>
      </svg>
    ),
  },
  {
    title: "Parent Dashboard",
    desc: "Parents can monitor their child's wellbeing with linked accounts and real-time insights.",
    color: "#3B82F6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: "Smart Notes",
    desc: "Color-coded, pinnable notes for lectures, study groups, and exam prep.",
    color: "#FF4D00",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
      </svg>
    ),
  },
  {
    title: "Project Tracker",
    desc: "Manage academic projects with progress tracking, tags, and deadline alerts.",
    color: "#00E5FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
      </svg>
    ),
  },
  {
    title: "Productivity Analytics",
    desc: "Weekly insights, productivity scores, and consistency metrics to stay on track.",
    color: "#A855F7",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
  },
];

const STEPS = [
  { num: "01", title: "Log Your Day", desc: "Track sleep, study, stress, mood, and more in under 60 seconds." },
  { num: "02", title: "AI Analyzes", desc: "Our burnout algorithm processes your data and identifies risk factors." },
  { num: "03", title: "Get Insights", desc: "Receive personalized recommendations and track your progress over time." },
  { num: "04", title: "Level Up", desc: "Earn badges, build streaks, and gamify your wellness journey." },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <main style={{ minHeight: "100vh", overflow: "hidden", background: "var(--bg-primary)" }}>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 60,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px)",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#000", fontWeight: 700, fontSize: "0.8rem",
              fontFamily: "var(--font-display)",
            }}>
              SP
            </div>
            <span style={{ fontWeight: 700, fontSize: "1rem", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              Student Pulse
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#features" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500, transition: "color 0.2s" }}>Features</a>
            <a href="#how" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500, transition: "color 0.2s" }}>How It Works</a>
            <a href="#about" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500, transition: "color 0.2s" }}>About</a>
          </div>
          <Link to="/login" className="btn-primary" style={{ fontSize: "0.78rem", padding: "8px 20px" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        position: "relative", padding: "0 clamp(16px, 6vw, 80px)",
        overflow: "hidden",
      }}>
        {/* Watermark text */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(100px, 18vw, 300px)",
          fontWeight: 700,
          color: "transparent",
          WebkitTextStroke: "1px rgba(255, 255, 255, 0.03)",
          textTransform: "uppercase",
          letterSpacing: "-0.04em",
          userSelect: "none", pointerEvents: "none",
          whiteSpace: "nowrap",
        }}>
          STUDENT
        </div>

        {/* Subtle ambient shapes */}
        <div style={{
          position: "absolute", right: "10%", top: "30%",
          width: "clamp(200px, 30vw, 400px)", height: "clamp(200px, 30vw, 400px)",
          background: "radial-gradient(circle, rgba(255, 77, 0, 0.04) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", left: "5%", bottom: "20%",
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(0, 229, 255, 0.03) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          style={{ zIndex: 2, maxWidth: 640 }}
        >
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px",
            background: "rgba(255, 77, 0, 0.08)",
            border: "1px solid rgba(255, 77, 0, 0.15)",
            borderRadius: 6,
            fontSize: "0.72rem", fontWeight: 600,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 28,
            fontFamily: "var(--font-display)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            AI-Powered Wellness
          </div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 700, marginBottom: 24,
              lineHeight: 1.05, letterSpacing: "-0.04em",
            }}
          >
            Your Wellness,<br />
            <span style={{ color: "var(--accent)" }}>Amplified.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            style={{
              fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
              color: "var(--text-secondary)", marginBottom: 40,
              maxWidth: 480, lineHeight: 1.7,
            }}
          >
            Track daily habits, predict burnout with AI, manage homework & projects, 
            and build a healthier academic life — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 14 }}
          >
            <Link to="/login" className="btn-primary" style={{ fontSize: "0.85rem", padding: "14px 32px" }}>
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <a href="#features" className="btn-outline" style={{ fontSize: "0.85rem", padding: "14px 32px" }}>
              Explore Features
            </a>
          </motion.div>
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            position: "absolute", bottom: 48,
            left: "clamp(16px, 6vw, 80px)",
            display: "flex", gap: 48, zIndex: 2,
          }}
        >
          {[
            { num: "10K+", label: "Students" },
            { num: "98%", label: "Accuracy" },
            { num: "4.9", label: "Rating" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>{s.num}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", color: "var(--text-dim)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ═══ FEATURES — BENTO GRID ═══ */}
      <section id="features" style={{
        padding: "80px clamp(16px, 6vw, 80px)",
        maxWidth: 1200, margin: "0 auto",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 56 }}
        >
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 12,
          }}>
            Everything you need<br />to <span style={{ color: "var(--accent)" }}>thrive.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 480, lineHeight: 1.6 }}>
            A complete toolkit for students who want to stay healthy, productive, and balanced.
          </p>
        </motion.div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, ease: [0.25, 1, 0.5, 1] }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                padding: "clamp(20px, 3vw, 28px)",
                display: "flex", flexDirection: "column",
                justifyContent: "space-between",
                transition: "border-color 0.25s, transform 0.25s",
                position: "relative",
                overflow: "hidden",
                ...(f.span ? { gridColumn: "span 2" } : {}),
              }}
            >
              {/* Left accent bar */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 3, background: f.color,
              }} />

              <div>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${f.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, color: f.color,
                }}>
                  <div style={{ width: 18, height: 18 }}>{f.icon}</div>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 600, marginBottom: 6 }}>
                  {f.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>

              {f.tag && (
                <span style={{
                  marginTop: 14, display: "inline-block",
                  padding: "4px 10px", borderRadius: 4,
                  fontSize: "0.65rem", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  background: `${f.color}12`, color: f.color,
                  fontFamily: "var(--font-display)",
                }}>
                  {f.tag}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" style={{
        padding: "60px clamp(16px, 6vw, 80px)",
        maxWidth: 900, margin: "0 auto",
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ marginBottom: 48 }}
        >
          <h2 style={{
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8,
          }}>
            How it <span style={{ color: "var(--accent)" }}>works.</span>
          </h2>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                padding: "clamp(16px, 3vw, 22px)",
                display: "flex", alignItems: "center", gap: "clamp(14px, 3vw, 24px)",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                background: i === 0 ? "var(--accent)" : "var(--bg-elevated)",
                border: i === 0 ? "none" : "1px solid var(--border-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: i === 0 ? "#000" : "var(--text-secondary)",
                fontWeight: 700, fontSize: "0.85rem",
                fontFamily: "var(--font-display)",
              }}>
                {s.num}
              </div>
              <div>
                <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, marginBottom: 2, fontSize: "0.95rem" }}>{s.title}</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ ABOUT US ═══ */}
      <section id="about" style={{
        padding: "60px clamp(16px, 5vw, 40px) 40px",
        maxWidth: 900, margin: "0 auto",
      }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, marginBottom: 20, letterSpacing: "-0.03em" }}>
            About <span style={{ color: "var(--accent)" }}>us.</span>
          </h2>
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: 8,
            padding: "clamp(24px, 4vw, 40px)",
          }}>
            <p style={{
              color: "var(--text-secondary)", lineHeight: 1.8,
              fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)",
              maxWidth: 600, margin: "0 auto 32px",
              textAlign: "center",
            }}>
              Student Pulse was born from a simple observation: students are burning out faster than ever, 
              and most don&apos;t even realize it until it&apos;s too late.
              <br /><br />
              We built this platform to give every student a personal wellness companion — one that uses 
              AI to detect burnout patterns, provides actionable insights, and gamifies the journey to 
              better health.
            </p>

            {/* Creator Card */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
              padding: "24px 28px", borderRadius: 8,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-light)",
            }}>
              <div style={{
                fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)",
                textTransform: "uppercase", letterSpacing: "0.1em",
                fontFamily: "var(--font-display)",
              }}>
                Creator & Developer
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 8,
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem", fontWeight: 700, color: "#000",
                fontFamily: "var(--font-display)",
              }}>
                DP
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>
                  Dibyaprakash Patnaik
                </h3>
                <a href="mailto:dibyaprakashpatnaik@gmail.com" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 6,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600,
                  textDecoration: "none", transition: "border-color 0.2s",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{
            fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 700,
            marginBottom: 12, letterSpacing: "-0.03em",
          }}>
            Ready to take control?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}>
            Join now — it&apos;s free, private, and works in your browser.
          </p>
          <Link to="/login" className="btn-primary" style={{ fontSize: "0.9rem", padding: "14px 36px" }}>
            Start Tracking Now
          </Link>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "24px clamp(16px, 4vw, 32px)",
        textAlign: "center",
        color: "var(--text-dim)",
        fontSize: "0.78rem",
      }}>
        <p>© {new Date().getFullYear()} Student Pulse · Created by <strong style={{ color: "var(--text-muted)" }}>Dibyaprakash Patnaik</strong></p>
      </footer>

      {/* ═══ RESPONSIVE OVERRIDES ═══ */}
      <style>{`
        @media (max-width: 768px) {
          #features > div:last-child {
            grid-template-columns: 1fr !important;
          }
          #features > div:last-child > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </main>
  );
}
