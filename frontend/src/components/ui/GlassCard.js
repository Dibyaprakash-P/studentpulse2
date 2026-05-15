"use client";

import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", delay = 0, style = {}, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(delay, 0.15), duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{
        y: -3,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.99 }}
      className={`glass-panel ${className}`}
      style={{ padding: "clamp(16px, 3vw, 24px)", ...style }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
