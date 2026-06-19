// src/components/ThemeToggle.tsx
'use client';

import { usePreferencesStore } from '@/store/preferencesStore';

export function ThemeToggle() {
  const temaAtual = usePreferencesStore((state) => state.tema) ?? 'claro';
  const setTema = usePreferencesStore((state) => state.setTema);

  const toggleTheme = () => {
    const novoTema = temaAtual === 'escuro' ? 'claro' : 'escuro';
    setTema(novoTema);
  };

  return (
    <span
      onClick={toggleTheme}
      title={`Alternar para tema ${temaAtual === 'escuro' ? 'claro' : 'escuro'}`}
      className="text-2xl cursor-pointer select-none transition hover:scale-110 hover:opacity-80"
    >
      {temaAtual === 'escuro' ? '🌙' : '☀️'}
    </span>
  );
}
