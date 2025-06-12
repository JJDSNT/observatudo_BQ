//src/components/appShell.tsx
"use client";

import { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import SplashScreen from "@/components/SplashScreen";
import GlobalHealthNotifier from "@/components/GlobalHealthNotifier";
import { useSyncPreferencesWithFirebase } from "@/hooks/useSyncPreferencesWithFirebase";
import DebugZustandPanel from "@/components/debug/DebugZustandPanel";
import PwaDebugPanel from "@/components/debug/PwaDebugPanel";
import LatencyMonitorGlobal from "@/components/debug/LatencyMonitorGlobal";
import { useLatencyInit } from "@/hooks/useLatencyInit";
import { useDebug } from "@/store/hooks/useDebug";

export default function AppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Usa debug encapsulado
  const [debug] = useDebug();

  // 🔄 Sincroniza com Firebase
  useSyncPreferencesWithFirebase();

  // 🕵️‍♂️ Inicia medição contínua de latência
  useLatencyInit();

  useEffect(() => {
    const checkHealth = async () => {
      const start = performance.now();
      try {
        const res = await fetch("/api/healthz", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const duration = performance.now() - start;
        if (duration > 1500) {
          setMessage("Iniciando servidor... Aguarde alguns segundos.");
        }
      } catch {
        setMessage("Servidor indisponível. Tentando novamente...");
      } finally {
        const elapsed = performance.now();
        window.__splashTime = Math.round(elapsed);
        setTimeout(() => setReady(true), 500);
      }
    };

    checkHealth();
  }, []);

  if (!ready) return <SplashScreen message={message} />;

  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((res) => res.json()),
        revalidateOnFocus: false,
        dedupingInterval: 6 * 60 * 60 * 1000, // 6 horas
      }}
    >
      <GlobalHealthNotifier />
      {children}
      {debug.zustand && <DebugZustandPanel />}
      {debug.pwa && <PwaDebugPanel />}
      {debug.latency && <LatencyMonitorGlobal />}
    </SWRConfig>
  );
}
