// src/components/debug/PwaDebugPanel.tsx
"use client";

import { useEffect, useState } from "react";

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
};

export default function PwaDebugPanel() {
  const [metrics, setMetrics] = useState<Metrics>({
    splashTime: 0,
    latency: null,
    swStatus: "verificando...",
    isStandalone: false,
  });

  useEffect(() => {
    const medirLatencia = async () => {
      const start = performance.now();
      const res = await fetch("/api/healthz", { cache: "no-store" });
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

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (typeof navigator !== "undefined" &&
        "standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true);

    setMetrics((prev) => ({ ...prev, isStandalone: standalone }));

    const splashTime =
      (window as unknown as { __splashTime?: number }).__splashTime ?? 0;
    setMetrics((prev) => ({ ...prev, splashTime }));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg)
          return setMetrics((p) => ({ ...p, swStatus: "não registrado" }));
        if (reg.waiting)
          return setMetrics((p) => ({
            ...p,
            swStatus: "atualização pendente",
          }));
        if (reg.active) return setMetrics((p) => ({ ...p, swStatus: "ativo" }));
        setMetrics((p) => ({
          ...p,
          swStatus: "registrado (estado desconhecido)",
        }));
      });
    } else {
      setMetrics((p) => ({ ...p, swStatus: "não suportado" }));
    }
  }, []);

  const atualizarSW = async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 max-h-[60vh] overflow-auto rounded-lg border bg-white dark:bg-zinc-900 p-4 text-xs shadow-lg space-y-2 text-zinc-600 dark:text-zinc-300">
      <h2 className="font-semibold text-sm">🔧 Painel de Debug PWA</h2>
      <p>📱 Modo: {metrics.isStandalone ? "PWA Instalado" : "Navegador"}</p>
      <p>⏱ Splash: {metrics.splashTime} ms</p>
      <p>
        🧩 Service Worker: {metrics.swStatus}
        {metrics.swStatus === "atualização pendente" && (
          <button
            onClick={atualizarSW}
            className="ml-2 underline text-blue-600 hover:text-blue-800"
          >
            🔄 Atualizar agora
          </button>
        )}
      </p>
      {metrics.latency && (
        <>
          <p>📡 Total: {metrics.latency.total} ms</p>
          <p>🧠 Backend: {metrics.latency.backend} ms</p>
          <p>🌐 Rede: {metrics.latency.rede} ms</p>
          <p className="text-[10px] text-zinc-400">
            ⏱ {metrics.latency.timestamp}
          </p>
        </>
      )}
    </div>
  );
}
