import { useEffect, useState } from 'react';

export function useHealthLatency() {
  const [latencias, setLatencias] = useState<{
    total: number;
    backend: number;
    rede: number;
    timestamp: string;
    error?: string;
  } | null>(null);

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

        setLatencias({
          total: Math.round(total),
          backend,
          rede: Math.max(0, Math.round(rede)),
          timestamp: json.timestamp,
        });
      } catch (err) {
        setLatencias({
          total: 0,
          backend: 0,
          rede: 0,
          timestamp: new Date().toISOString(),
          error: 'Erro ao medir latência',
        });
      }
    };

    medir();
  }, []);

  return latencias;
}
