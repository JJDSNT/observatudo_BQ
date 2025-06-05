// src/components/ThemeToggle.tsx
'use client';

import { useUserPreferences } from '@/store/useUserPreferences';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { preferences, setPreferences } = useUserPreferences();
  const temaAtual = preferences.tema ?? 'claro';

  const toggleTheme = () => {
    const novoTema = temaAtual === 'escuro' ? 'claro' : 'escuro';
    setPreferences({ tema: novoTema });
  };

  const Icon = temaAtual === 'escuro' ? Sun : Moon;

  return (
    <button
      onClick={toggleTheme}
      title={`Alternar para tema ${temaAtual === 'escuro' ? 'claro' : 'escuro'}`}
      className="p-2 rounded-full border hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <Icon size={18} />
    </button>
  );
}
