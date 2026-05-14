"use client";
import { motion } from "framer-motion";

export default function NeonButton({ children, variant = "primary", onClick, type = "button", disabled = false, style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "12px 32px", borderRadius: "30px", fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer", border: "none",
    fontFamily: "'Inter', sans-serif", fontSize: "0.875rem",
    opacity: disabled ? 0.5 : 1, transition: "all 0.3s",
  };

  const variants = {
    primary: {
      background: "var(--primary-blue)", color: "#000",
      boxShadow: "0 0 15px rgba(0,212,255,0.4)",
    },
    purple: {
      background: "var(--primary-purple)", color: "#fff",
      boxShadow: "0 0 15px rgba(176,38,255,0.4)",
    },
    success: {
      background: "var(--success)", color: "#000",
      boxShadow: "0 0 20px rgba(51,255,153,0.5)",
    },
    outline: {
      background: "transparent", color: "var(--primary-cyan)",
      border: "1px solid var(--primary-cyan)",
    },
    danger: {
      background: "transparent", color: "var(--danger)",
      border: "1px solid var(--danger)",
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </motion.button>
  );
}
