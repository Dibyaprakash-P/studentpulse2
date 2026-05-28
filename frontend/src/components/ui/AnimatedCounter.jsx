import { useEffect, useRef, useState } from "react";

/** Animates from 0 to `value` with a number tween effect */
export default function AnimatedCounter({
  value = 0,
  duration = 1200,
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
  style = {},
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const startTime = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    startTime.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * target);
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [value, duration]);

  return (
    <span className={className} style={style} ref={ref}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}
