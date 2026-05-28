import { useEffect } from "react";

/**
 * SplashDismiss — Fades out the #sp-splash loading screen
 * once the React app has fully hydrated.
 */
export default function SplashDismiss() {
  useEffect(() => {
    // Small delay to ensure everything is painted
    const timer = setTimeout(() => {
      const splash = document.getElementById("sp-splash");
      if (splash) splash.classList.add("loaded");
      // Remove from DOM after fade-out animation
      setTimeout(() => splash?.remove(), 600);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
