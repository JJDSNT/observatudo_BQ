//src/components/GlobalHealthNotifier.tsx
'use client';

import { useHealthCheck } from '@/hooks/useHealthCheck';

export default function GlobalHealthNotifier() {
  const { backendHealthy, isOffline } = useHealthCheck();

  if (isOffline) {
    return (
      <div className="w-full bg-yellow-500 text-white text-center p-2">
        📴 Você está offline. Os dados exibidos podem estar desatualizados.
      </div>
    );
  }

  if (!backendHealthy) {
    return (
      <div className="w-full bg-red-600 text-white text-center p-2">
        🔴 O serviço está temporariamente indisponível. Tentando reconectar…
      </div>
    );
  }

  return null;
}