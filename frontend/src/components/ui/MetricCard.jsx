import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

/**
 * MetricCard — 3D perspective card with animated counter for dashboard stats.
 * Props:
 *   label, value, suffix, icon, accentColor, delay, trend, trendLabel
 */
export default function MetricCard({
  label = "",
  value = 0,
  suffix = "",
  icon = null,
  accentColor = "var(--primary-teal)",
  delay = 0,
  trend = null,    // "up" | "down" | null
  trendLabel = "",
  decimals = 0,
  className = "",
  style = {},
}) {
  const trendColor = trend === "up" ? "var(--success)" : trend === "down" ? "var(--danger)" : "var(--text-muted)";
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(delay, 0.2), duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className={`glass-panel card-3d ${className}`}
      style={{
        padding: "clamp(16px, 3vw, 24px)",
        perspective: "1000px",
        cursor: "default",
        ...style,
      }}
      whileHover={{
        y: -4,
        rotateY: 2,
        rotateX: 1,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
    >
      {/* Accent top line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        borderRadius: "20px 20px 0 0",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{
          color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 500,
          lineHeight: 1.3,
        }}>
          {label}
        </span>
        {icon && (
          <span style={{
            fontSize: "1.3rem",
            filter: `drop-shadow(0 2px 4px ${accentColor}33)`,
          }}>
            {icon}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <AnimatedCounter
          value={value}
          suffix={suffix}
          decimals={decimals}
          style={{
            fontSize: "2.25rem", fontWeight: 800,
            color: accentColor,
            textShadow: `0 0 20px ${accentColor}33`,
            lineHeight: 1,
          }}
        />
      </div>

      {(trend || trendLabel) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 4, marginTop: 8,
          fontSize: "0.78rem", fontWeight: 600, color: trendColor,
        }}>
          {trendIcon && <span>{trendIcon}</span>}
          <span>{trendLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
