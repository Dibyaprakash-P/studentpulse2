import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

/**
 * MetricCard — Dashboard stat card with left accent bar.
 * Clean, bold numbers in Space Grotesk, no 3D perspective.
 */
export default function MetricCard({
  label = "",
  value = 0,
  suffix = "",
  icon = null,
  accentColor = "var(--accent)",
  delay = 0,
  trend = null,
  trendLabel = "",
  decimals = 0,
  className = "",
  style = {},
}) {
  const trendColor = trend === "up" ? "var(--success)" : trend === "down" ? "var(--danger)" : "var(--text-muted)";
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(delay, 0.15), duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className={`glass-panel ${className}`}
      style={{
        padding: "clamp(16px, 3vw, 22px)",
        cursor: "default",
        borderLeft: `3px solid ${accentColor}`,
        ...style,
      }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{
          color: "var(--text-muted)",
          fontSize: "0.72rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: "var(--font-display)",
          lineHeight: 1.3,
        }}>
          {label}
        </span>
        {icon && (
          <span style={{ fontSize: "1.2rem", opacity: 0.6 }}>
            {icon}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
        <AnimatedCounter
          value={value}
          suffix={suffix}
          decimals={decimals}
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: accentColor,
            lineHeight: 1,
            fontFamily: "var(--font-display)",
          }}
        />
      </div>

      {(trend || trendLabel) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 4, marginTop: 8,
          fontSize: "0.75rem", fontWeight: 600, color: trendColor,
        }}>
          {trendIcon && <span>{trendIcon}</span>}
          <span>{trendLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
