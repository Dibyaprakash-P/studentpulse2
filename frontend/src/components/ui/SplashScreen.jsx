import { useState, useEffect } from "react";

/**
 * SplashScreen — Quick fade from black with SP logo mark.
 * Simplified: no pulsing, no loading bar. Fast 0.6s transition.
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 300);
    const removeTimer = setTimeout(() => setVisible(false), 700);
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
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 8,
        background: "var(--accent, #FF4D00)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700, fontSize: "1.1rem",
        color: "#000",
      }}>
        SP
      </div>
    </div>
  );
}
