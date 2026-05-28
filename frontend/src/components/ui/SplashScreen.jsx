import { useState, useEffect } from "react";

/**
 * SplashScreen — A fullscreen loading overlay that fades out
 * after the app has mounted. Uses React state, no DOM manipulation.
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out after a short delay
    const fadeTimer = setTimeout(() => setFading(true), 400);
    // Remove completely after fade animation
    const removeTimer = setTimeout(() => setVisible(false), 900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Pulsing logo */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "linear-gradient(135deg, #FFD700, #FFC107)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(255, 215, 0, 0.3), 0 0 80px rgba(255, 215, 0, 0.1)",
          animation: "sp-logo-pulse 1.5s ease-in-out infinite",
        }}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0a0a0a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>

      {/* Brand text */}
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.85rem",
          color: "rgba(245, 245, 245, 0.5)",
          letterSpacing: "0.08em",
          fontWeight: 500,
        }}
      >
        STUDENT PULSE
      </div>

      {/* Animated loading bar */}
      <div
        style={{
          width: 120,
          height: 3,
          borderRadius: 3,
          background: "rgba(255, 215, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "40%",
            height: "100%",
            borderRadius: 3,
            background: "linear-gradient(90deg, #FFD700, #FFC107)",
            animation: "sp-bar-slide 1s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes sp-logo-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255,215,0,0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(255,215,0,0.45); }
        }
        @keyframes sp-bar-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}
