import { motion } from "framer-motion";

/**
 * Redesigned GlassCard with 3D perspective hover, gradient top border option,
 * and staggered entry animation.
 */
export default function GlassCard({
  children,
  className = "",
  delay = 0,
  style = {},
  onClick,
  accentTop = false,    // gradient top border
  accentColor = null,   // custom left border color
  noPerspective = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(delay, 0.2),
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={noPerspective ? {
        y: -3,
        transition: { duration: 0.2, ease: "easeOut" },
      } : {
        y: -4,
        rotateY: 1.5,
        rotateX: 0.5,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.995 }}
      className={`glass-panel ${accentTop ? "card-accent-top" : ""} ${className}`}
      style={{
        padding: "clamp(16px, 3vw, 24px)",
        perspective: noPerspective ? "none" : "1000px",
        ...(accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}),
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
