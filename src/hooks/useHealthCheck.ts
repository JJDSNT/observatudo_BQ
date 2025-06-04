// src/hooks/useHealthCheck.ts
import { useEffect, useState } from "react";

export function useHealthCheck(pollInterval = 30000) {
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator !== "undefined") {
      return !navigator.onLine;
    }
    return false; // assume online durante SSR
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/healthz");
        setBackendHealthy(res.ok);
      } catch {
        setBackendHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, pollInterval);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pollInterval]);

  return { backendHealthy, isOffline };
}
