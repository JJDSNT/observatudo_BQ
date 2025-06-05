// src/components/ThemeToggle.tsx
'use client';

import { useUserPreferences } from '@/store/useUserPreferences';

export function ThemeToggle() {
  const { preferences, setPreferences } = useUserPreferences();
  const temaAtual = preferences.tema ?? 'claro';

  const toggleTheme = () => {
    const novoTema = temaAtual === 'escuro' ? 'claro' : 'escuro';
    setPreferences({ tema: novoTema });
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
