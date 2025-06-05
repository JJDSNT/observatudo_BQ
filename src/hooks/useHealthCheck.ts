import { useEffect, useState, useRef } from "react";

export function useHealthCheck(pollInterval = 30000) {
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  const isChecking = useRef(false); // impede sobreposição de requisições

  useEffect(() => {
    const checkHealth = async () => {
      if (isOffline || isChecking.current) return;

      isChecking.current = true;
      try {
        const res = await fetch("/api/healthz", { cache: "no-store" });
        setBackendHealthy(res.ok);
      } catch {
        setBackendHealthy(false);
      } finally {
        isChecking.current = false;
      }
    };

    checkHealth(); // primeira verificação imediata
    const interval = setInterval(checkHealth, pollInterval);

    const handleOnline = () => {
      setIsOffline(false);
      checkHealth(); // força checagem ao voltar online
    };

    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOffline, pollInterval]);

  return { backendHealthy, isOffline };
}
