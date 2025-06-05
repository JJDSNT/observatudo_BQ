//src//hooks/useLatencyInit.ts
'use client';
import { useEffect } from 'react';
import { useLatencyStore } from '@/store/useLatencyStore';

export function useLatencyInit(intervalMs = 10000) {
  const registrar = useLatencyStore((s) => s.registrar);

  useEffect(() => {
    const medir = async () => {
      const inicio = performance.now();
      try {
        const res = await fetch('/api/healthz', { cache: 'no-store' });
        const fim = performance.now();
        const total = fim - inicio;

        const json = await res.json();
        const backend = json.latencyMs ?? 0;
        const rede = total - backend;

        registrar({
          total: Math.round(total),
          backend,
          rede: Math.max(0, Math.round(rede)),
          timestamp: json.timestamp,
        });
      } catch {
        registrar({
          total: 0,
          backend: 0,
          rede: 0,
          timestamp: new Date().toISOString(),
        });
      }
    };

    medir();
    const id = setInterval(medir, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, registrar]);
}
