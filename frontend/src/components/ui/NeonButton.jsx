import { motion } from "framer-motion";

/**
 * Redesigned NeonButton with purple gradient system.
 * Variants: primary, purple, outline, ghost, success, danger, coral
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
    gap: 8, padding: "12px 28px", borderRadius: "12px", fontWeight: 700,
    cursor: isDisabled ? "not-allowed" : "pointer", border: "none",
    fontFamily: "'Inter', sans-serif", fontSize: "0.875rem",
    opacity: isDisabled ? 0.45 : 1,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative", overflow: "hidden",
    letterSpacing: "0.01em",
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg, #FFD700, #FFC107)",
      color: "#0a0a0a",
      boxShadow: "0 0 20px rgba(255, 215, 0, 0.2), 0 4px 16px rgba(255, 215, 0, 0.15)",
      textShadow: "none",
    },
    purple: {
      background: "linear-gradient(135deg, #FFC107, #FFD700)",
      color: "#0a0a0a",
      boxShadow: "0 0 20px rgba(255, 193, 7, 0.2), 0 4px 16px rgba(255, 193, 7, 0.15)",
      textShadow: "none",
    },
    coral: {
      background: "linear-gradient(135deg, #f97316, #fb923c)",
      color: "#fff",
      boxShadow: "0 0 20px rgba(249, 115, 22, 0.2), 0 4px 16px rgba(249, 115, 22, 0.15)",
      textShadow: "0 1px 2px rgba(0,0,0,0.15)",
    },
    success: {
      background: "linear-gradient(135deg, #FFCA28, #FFD700)",
      color: "#0a0a0a",
      boxShadow: "0 0 20px rgba(255, 202, 40, 0.2)",
      textShadow: "none",
    },
    outline: {
      background: "transparent",
      color: "var(--primary-yellow)",
      border: "1px solid rgba(255, 215, 0, 0.3)",
    },
    danger: {
      background: "rgba(239, 68, 68, 0.06)",
      color: "#ef4444",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid var(--border-light)",
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.03, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {loading && (
        <span style={{
          width: 16, height: 16, borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.3)",
          borderTopColor: "#fff",
          animation: "spin 0.8s linear infinite",
          flexShrink: 0,
        }} />
      )}
      {children}
    </motion.button>
  );
}
