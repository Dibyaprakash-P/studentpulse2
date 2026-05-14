"use client";

export default function PulseLoader({ size = 48, text = "Loading..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48 }}>
      <div className="pulse-loader" style={{ width: size, height: size }} />
      <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{text}</span>
    </div>
  );
}
