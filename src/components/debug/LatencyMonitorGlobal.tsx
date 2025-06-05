//src/components/debug/LatencyMonitorGlobal.tsx
'use client';

import { useLatencyStore } from '@/store/useLatencyStore';

function classificar(ms: number) {
  if (ms < 1000) return '🟢';
  if (ms < 3000) return '🟡';
  return '🔴';
}

export default function LatencyMonitorGlobal() {
  const historico = useLatencyStore((s) => s.historico);

  if (!historico.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 max-h-[50vh] overflow-auto rounded-lg border bg-white dark:bg-zinc-900 p-4 text-xs shadow-lg space-y-3 text-zinc-600 dark:text-zinc-300">
      <h3 className="font-semibold text-sm">⏱ Latência de Sistema</h3>

      {historico.map((lat, idx) => (
        <div key={idx} className="border-b border-dashed pb-1 mb-1">
          <p className="text-[10px] text-zinc-400">{lat.timestamp}</p>
          <p>
            📡 Total: {lat.total} ms {classificar(lat.total)}
          </p>
          <p>🧠 Backend: {lat.backend} ms</p>
          <p>🌐 Rede: {lat.rede} ms</p>
        </div>
      ))}
    </div>
  );
}
