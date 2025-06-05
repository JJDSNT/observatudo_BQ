'use client';

import { useEffect, useState } from 'react';

type Metrics = {
  splashTime: number;
  latency: {
    total: number;
    backend: number;
    rede: number;
    timestamp: string;
  } | null;
  swStatus: string;
  isStandalone: boolean;
  swrKeys: number;
  version?: string;
};

export default function PwaDebugPanel() {
  const [metrics, setMetrics] = useState<Metrics>({
    splashTime: 0,
    latency: null,
    swStatus: 'verificando...',
    isStandalone: false,
    swrKeys: 0,
    version: undefined,
  });

  useEffect(() => {
    const medirLatencia = async () => {
      const start = performance.now();
      const res = await fetch('/api/healthz', { cache: 'no-store' });
      const total = performance.now() - start;
      const json = await res.json();
      const backend = json.latencyMs ?? 0;
      const rede = total - backend;

      setMetrics((prev) => ({
        ...prev,
        latency: {
          total: Math.round(total),
          backend,
          rede: Math.max(0, Math.round(rede)),
          timestamp: json.timestamp,
        },
      }));
    };

    medirLatencia();

    // Detecta modo PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    // SWR debug (devtools ou __SWR_BROADCAST_CHANNEL__)
    const swrKeys = Object.keys((window as any).__SWR_DEVTOOLS__?.cache || {}).length;

    // Splash
    const splashTime = (window as any).__splashTime ?? 0;

    setMetrics((prev) => ({
      ...prev,
      isStandalone: standalone,
      splashTime,
      swrKeys,
      version: (window as any).__APP_VERSION__, // defina isso no seu app se quiser exibir
    }));

    // Verifica status do SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return setMetrics((p) => ({ ...p, swStatus: 'não registrado' }));
        if (reg.waiting) return setMetrics((p) => ({ ...p, swStatus: 'atualização pendente' }));
        if (reg.active) return setMetrics((p) => ({ ...p, swStatus: 'ativo' }));
        setMetrics((p) => ({ ...p, swStatus: 'registrado (estado desconhecido)' }));
      });
    } else {
      setMetrics((p) => ({ ...p, swStatus: 'não suportado' }));
    }
  }, []);

  return (
    <section className="text-xs p-4 border-t border-zinc-300 dark:border-zinc-700 mt-12 text-zinc-600 dark:text-zinc-400 space-y-2">
      <h2 className="font-semibold text-sm">🔧 Painel de Debug PWA</h2>
      <p>📱 Modo: {metrics.isStandalone ? 'PWA Instalado' : 'Navegador'}</p>
      <p>⏱ Splash: {metrics.splashTime} ms</p>
      <p>🧩 Service Worker: {metrics.swStatus}</p>
      <p>📦 SWR Ativos: {metrics.swrKeys}</p>
      {metrics.version && <p>🧾 Versão: {metrics.version}</p>}
      {metrics.latency && (
        <>
          <p>📡 Total: {metrics.latency.total} ms</p>
          <p>🧠 Backend: {metrics.latency.backend} ms</p>
          <p>🌐 Rede: {metrics.latency.rede} ms</p>
          <p className="text-[10px] text-zinc-400">⏱ {metrics.latency.timestamp}</p>
        </>
      )}
    </section>
  );
}
