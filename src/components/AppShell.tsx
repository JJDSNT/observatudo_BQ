'use client';

import { useEffect, useState } from 'react';
import SplashScreen from '@/components/SplashScreen';
import GlobalHealthNotifier from '@/components/GlobalHealthNotifier';

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      const start = performance.now();
      try {
        const res = await fetch('/api/healthz', { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const duration = performance.now() - start;
        if (duration > 1500) {
          setMessage('Iniciando servidor... Aguarde alguns segundos.');
        }
      } catch {
        setMessage('Servidor indisponível. Tentando novamente...');
      } finally {
        setTimeout(() => setReady(true), 500);
      }
    };

    checkHealth();
  }, []);

  if (!ready) return <SplashScreen message={message} />;

  return (
    <>
      <GlobalHealthNotifier />
      {children}
    </>
  );
}
