/**
 * Gradient-pulse skeleton loader for content placeholders.
 * Props: width, height, borderRadius, count (repeats)
 */
export default function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius = 8,
  count = 1,
  gap = 12,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width, height, borderRadius,
            background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease infinite",
          }}
        />
      ))}
    </div>
  );
}
