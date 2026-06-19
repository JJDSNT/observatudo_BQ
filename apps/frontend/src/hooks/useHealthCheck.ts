// src/hooks/useHealthCheck.ts
'use client';

import { useEffect, useState, useRef } from 'react';
import { usePreferencesStore } from '@/store/preferencesStore';

export function useHealthCheck(pollInterval = 30000) {
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const isChecking = useRef(false);
  const debugAtivo = usePreferencesStore((s) => s.debug?.pwa ?? false);

  useEffect(() => {
    if (!debugAtivo) return;

    const checkHealth = async () => {
      if (isOffline || isChecking.current) return;
      isChecking.current = true;

      try {
        const res = await fetch('/api/healthz', { cache: 'no-store' });
        setBackendHealthy(res.ok);
      } catch {
        setBackendHealthy(false);
      } finally {
        isChecking.current = false;
      }
    };

    checkHealth();
    const intervalId = setInterval(checkHealth, pollInterval);

    const handleOnline = () => {
      setIsOffline(false);
      checkHealth();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [debugAtivo, isOffline, pollInterval]);

  return { backendHealthy, isOffline };
}
