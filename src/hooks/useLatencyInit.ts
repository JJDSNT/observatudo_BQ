// src/hooks/useLatencyInit.ts
'use client';

import { useEffect, useRef } from 'react';
import { useLatencyStore } from '@/store/latencyStore';
import { usePreferencesStore } from '@/store/preferencesStore';

interface HealthzResponse {
  latencyMs?: number;
  timestamp?: string;
}

export function useLatencyInit(intervalMs = 10000) {
  const registrar = useLatencyStore((s) => s.registrar);
  const debugAtivo = usePreferencesStore((s) => s.debug?.modules?.latency ?? false);
  const isRunning = useRef(false);

  useEffect(() => {
    if (!debugAtivo) return;

    const medir = async () => {
      if (isRunning.current) return;
      isRunning.current = true;

      const inicio = performance.now();
      try {
        const res = await fetch('/api/healthz', { cache: 'no-store' });
        const fim = performance.now();
        const total = fim - inicio;

        let json: HealthzResponse = {};
        try {
          json = await res.json();
        } catch {}

        const backend = json.latencyMs ?? 0;
        const timestamp = json.timestamp ?? new Date().toISOString();
        const rede = total - backend;

        registrar({
          total: Math.round(total),
          backend,
          rede: Math.max(0, Math.round(rede)),
          timestamp,
        });
      } catch {
        registrar({
          total: 0,
          backend: 0,
          rede: 0,
          timestamp: new Date().toISOString(),
        });
      } finally {
        isRunning.current = false;
      }
    };

    medir();
    const id = setInterval(medir, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, registrar, debugAtivo]);
}
