"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {/* Background blurs */}
      <div className="bg-blur-cyan" style={{ top: "20%", left: "15%", width: 128, height: 128 }} />
      <div className="bg-blur-purple" style={{ bottom: "20%", right: "15%", width: 192, height: 192 }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{ zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
      >
        {/* Heartbeat Logo */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          <div className="animate-pulse-glow" style={{
            width: 96, height: 96, borderRadius: "50%", border: "2px solid var(--primary-blue)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <motion.div className="animate-heartbeat">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </motion.div>
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}
        >
          Student <span className="text-gradient">Pulse</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "var(--text-muted)", marginBottom: 48, maxWidth: 420, padding: "0 16px" }}
        >
          Track. Analyze. Improve.<br />
          Your AI-powered wellness & productivity companion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}
        >
          <Link href="/login" className="btn-primary">Get Started</Link>
          <Link href="/dashboard" className="btn-outline">Demo Dashboard</Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
