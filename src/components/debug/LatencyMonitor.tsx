// src/components/debug/LatencyMonitor.tsx

"use client";
import { useEffect, useState } from "react";

type LatenciaItem = {
  total: number;
  backend: number;
  rede: number;
  timestamp: string;
};

function classificarLatencia(ms: number) {
  if (ms < 1000) return "🟢";
  if (ms < 3000) return "🟡";
  return "🔴";
}

export default function LatencyMonitor() {
  const [historico, setHistorico] = useState<LatenciaItem[]>([]);

  const medir = async () => {
    const inicio = performance.now();
    const res = await fetch("/api/healthz", { cache: "no-store" });
    const fim = performance.now();
    const total = fim - inicio;
    const json = await res.json();
    const backend = json.latencyMs ?? 0;
    const rede = total - backend;

    const nova = {
      total: Math.round(total),
      backend,
      rede: Math.max(0, Math.round(rede)),
      timestamp: json.timestamp,
    };

    setHistorico((prev) => [...prev.slice(-4), nova]);
  };

  useEffect(() => {
    medir(); // mede ao montar
    const id = setInterval(medir, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-sm space-y-2 text-zinc-500 dark:text-zinc-400">
      <h3 className="font-semibold">⏱ Latência de Sistema</h3>
      {historico.map((lat, i) => (
        <div key={i} className="text-xs border-b border-dashed pb-1 mb-1">
          <p className="text-[10px] text-zinc-400">{lat.timestamp}</p>
          <p>
            📡 Total: {lat.total} ms {classificarLatencia(lat.total)}
          </p>
          <p>🧠 Backend: {lat.backend} ms</p>
          <p>🌐 Rede: {lat.rede} ms</p>
        </div>
      ))}
    </div>
  );
}
