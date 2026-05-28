import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useDashboard() {
  const [weekly, setWeekly] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, g] = await Promise.all([
        api.getWeeklySummary().catch(() => null),
        api.getGamificationProfile().catch(() => null),
      ]);
      setWeekly(w);
      setGamification(g);
      // Try prediction
      try { const p = await api.getLatestPrediction(); setPrediction(p); }
      catch { setPrediction(null); }
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { weekly, prediction, gamification, loading, error, refetch: fetchAll };
}
