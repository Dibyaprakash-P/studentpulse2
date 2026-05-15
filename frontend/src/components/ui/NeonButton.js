"use client";
import { motion } from "framer-motion";

export default function NeonButton({ children, variant = "primary", onClick, type = "button", disabled = false, style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "12px 32px", borderRadius: "32px", fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer", border: "none",
    fontFamily: "'Inter', sans-serif", fontSize: "0.875rem",
    opacity: disabled ? 0.45 : 1, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative", overflow: "hidden",
    letterSpacing: "0.01em",
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg, var(--primary-blue), var(--primary-cyan))",
      color: "#000",
      boxShadow: "0 0 20px rgba(125, 211, 252, 0.2), 0 4px 16px rgba(96, 165, 250, 0.15)",
    },
    purple: {
      background: "linear-gradient(135deg, var(--primary-purple), #a78bfa)",
      color: "#fff",
      boxShadow: "0 0 20px rgba(192, 132, 252, 0.2), 0 4px 16px rgba(192, 132, 252, 0.15)",
    },
    success: {
      background: "linear-gradient(135deg, var(--success), #34d399)",
      color: "#000",
      boxShadow: "0 0 20px rgba(110, 231, 183, 0.2)",
    },
    outline: {
      background: "rgba(255, 255, 255, 0.04)",
      color: "var(--primary-cyan)",
      border: "1px solid rgba(125, 211, 252, 0.3)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    },
    danger: {
      background: "rgba(251, 113, 133, 0.06)",
      color: "var(--danger)",
      border: "1px solid rgba(251, 113, 133, 0.3)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </motion.button>
  );
}
