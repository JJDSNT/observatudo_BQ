// src/components/ThemeApplier.tsx
'use client';

import { useEffect } from 'react';
import { useTema } from '@/store/hooks/useTema';

export function ThemeApplier() {
  const { tema } = useTema();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', tema === 'escuro');
  }, [tema]);

  return null; // componente invisível, só gerencia efeito
}
