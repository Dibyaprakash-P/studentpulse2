"use client";

import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", delay = 0, style = {}, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{
        scale: 1.02, y: -5,
        boxShadow: "0 15px 35px 0 rgba(0, 212, 255, 0.15)",
        borderColor: "rgba(0, 212, 255, 0.3)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`glass-panel p-6 relative overflow-hidden ${className}`}
      style={style}
      onClick={onClick}
    >
      {/* Hover glow overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "inherit",
        background: "linear-gradient(to bottom right, rgba(0,212,255,0), rgba(176,38,255,0))",
        transition: "background 0.5s", pointerEvents: "none",
      }} className="glass-hover-overlay" />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}
