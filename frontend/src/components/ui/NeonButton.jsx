import { motion } from "framer-motion";

/**
 * NeonButton → Solid button with Dark Forge styling.
 * Bold, uppercase, sharp radius. Same API as before.
 */
export default function NeonButton({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  style = {},
}) {
  const isDisabled = disabled || loading;

  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "12px 24px", borderRadius: 6, fontWeight: 700,
    cursor: isDisabled ? "not-allowed" : "pointer", border: "none",
    fontFamily: "var(--font-display)", fontSize: "0.85rem",
    opacity: isDisabled ? 0.4 : 1,
    transition: "all 0.2s ease",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const variants = {
    primary: {
      background: "var(--accent)",
      color: "#000",
    },
    purple: {
      background: "var(--purple)",
      color: "#fff",
    },
    coral: {
      background: "var(--accent)",
      color: "#000",
    },
    success: {
      background: "var(--success)",
      color: "#000",
    },
    outline: {
      background: "transparent",
      color: "var(--accent)",
      border: "1px solid var(--accent)",
    },
    danger: {
      background: "rgba(255, 59, 59, 0.08)",
      color: "var(--danger)",
      border: "1px solid rgba(255, 59, 59, 0.2)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid var(--border-medium)",
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {loading && (
        <span style={{
          width: 14, height: 14, borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.2)",
          borderTopColor: "#fff",
          animation: "spin 0.8s linear infinite",
          flexShrink: 0,
        }} />
      )}
      {children}
    </motion.button>
  );
}
