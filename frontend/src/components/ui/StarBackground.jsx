import { useEffect, useRef, useMemo } from "react";

/**
 * 3D Star Field Background — Canvas-based for 60fps performance.
 * Creates depth perception with 3 layers of stars moving at different speeds.
 * Stars twinkle with opacity animation and include purple-tinted stars.
 * Respects prefers-reduced-motion.
 */
export default function StarBackground({ starCount = 200, className = "" }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const starsRef = useRef([]);

  const colors = useMemo(() => [
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#FFD700",
    "#FFC107",
    "#FFE082",
  ], []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Adjust star count based on viewport
    const adjustedCount = Math.min(
      starCount,
      Math.floor((window.innerWidth * window.innerHeight) / 5000)
    );

    // Initialize stars with 3D depth layers
    const initStars = () => {
      starsRef.current = Array.from({ length: adjustedCount }, () => {
        const layer = Math.random(); // 0-0.33 = far, 0.33-0.66 = mid, 0.66-1 = close
        const depth = layer < 0.5 ? 0.3 + layer : 0.5 + layer * 0.5;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: depth < 0.5 ? 0.5 + Math.random() * 0.8 : depth < 0.75 ? 1 + Math.random() * 1.2 : 1.5 + Math.random() * 2,
          speedX: (Math.random() - 0.5) * depth * 0.15,
          speedY: -0.05 - Math.random() * depth * 0.2,
          opacity: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinklePhase: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          depth,
        };
      });
    };
    initStars();

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016; // ~60fps

      for (const star of starsRef.current) {
        // Twinkle
        const twinkle = prefersReducedMotion
          ? star.opacity
          : star.opacity * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));

        // Move
        if (!prefersReducedMotion) {
          star.x += star.speedX;
          star.y += star.speedY;

          // Wrap around
          if (star.y < -5) { star.y = canvas.height + 5; star.x = Math.random() * canvas.width; }
          if (star.x < -5) star.x = canvas.width + 5;
          if (star.x > canvas.width + 5) star.x = -5;
        }

        // Draw
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = twinkle;
        ctx.fill();

        // Glow effect for larger/closer stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 2.5
          );
          grad.addColorStop(0, star.color);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.globalAlpha = twinkle * 0.15;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [starCount, colors]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
