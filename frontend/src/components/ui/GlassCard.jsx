import { motion } from "framer-motion";

/**
 * GlassCard → Panel — Solid dark surface card.
 * Keeps same API for backward compatibility.
 */
export default function GlassCard({
  children,
  className = "",
  delay = 0,
  style = {},
  onClick,
  accentTop = false,
  accentColor = null,
  noPerspective = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(delay, 0.15),
        duration: 0.35,
        ease: [0.25, 1, 0.5, 1],
      }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.998 }}
      className={`glass-panel ${accentTop ? "card-accent-top" : ""} ${className}`}
      style={{
        padding: "clamp(16px, 3vw, 24px)",
        ...(accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}),
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
