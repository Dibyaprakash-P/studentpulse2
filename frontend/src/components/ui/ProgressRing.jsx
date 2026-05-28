import { useEffect, useState } from "react";

/**
 * SVG animated circular progress ring.
 * Props: value (0-100), size, strokeWidth, color, bgColor, label, sublabel
 */
export default function ProgressRing({
  value = 0,
  size = 120,
  strokeWidth = 8,
  color = "var(--primary-teal)",
  bgColor = "rgba(255,255,255,0.06)",
  label = "",
  sublabel = "",
  animated = true,
}) {
  const [animValue, setAnimValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animValue / 100) * circumference;

  useEffect(() => {
    if (!animated) { setAnimValue(value); return; }
    const timer = setTimeout(() => setAnimValue(value), 100);
    return () => clearTimeout(timer);
  }, [value, animated]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={bgColor} strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: size * 0.22, fontWeight: 800, lineHeight: 1 }}>
            {Math.round(animValue)}%
          </span>
        </div>
      </div>
      {label && <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>{label}</span>}
      {sublabel && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{sublabel}</span>}
    </div>
  );
}
